import { supabase } from '../lib/supabase';
import type { QuizQuestion, QuizAttempt } from '../store/useQuizStore';

export interface QuizAttemptResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  xpEarned: number;
  newLevel?: number;
}

export async function loadQuizQuestions(
  courseCode: string,
  segmentNumber: number
): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('course_code', courseCode)
    .eq('segment_number', segmentNumber)
    .order('created_at');

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No questions found for this segment');
  }

  return data.map((q) => ({
    id: q.id,
    course_code: q.course_code,
    segment_number: q.segment_number,
    question_text: q.question_text,
    question_type: q.question_type,
    options: q.options as string[],
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    topic: q.topic,
  }));
}

export async function createQuizAttempt(
  userId: string,
  courseCode: string,
  segmentNumber: number,
  totalQuestions: number,
  mode: 'practice' | 'exam' | 'quick'
): Promise<string> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      course_code: courseCode,
      segment_number: segmentNumber,
      total_questions: totalQuestions,
      quiz_mode: mode,
      status: 'in_progress',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function saveQuizAnswer(
  attemptId: string,
  questionId: string,
  userAnswer: string | null,
  isCorrect: boolean,
  isMarked: boolean,
  timeSpent: number,
  answerOrder: number
): Promise<void> {
  const { error } = await supabase.from('quiz_answers').upsert({
    attempt_id: attemptId,
    question_id: questionId,
    user_answer: userAnswer,
    is_correct: isCorrect,
    is_marked: isMarked,
    time_spent: timeSpent,
    answer_order: answerOrder,
  });

  if (error) throw error;
}

export async function completeQuizAttempt(
  attemptId: string,
  attempt: QuizAttempt,
  score: number,
  timeSpent: number
): Promise<QuizAttemptResult> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const totalQuestions = attempt.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  await supabase
    .from('quiz_attempts')
    .update({
      status: 'completed',
      end_time: new Date().toISOString(),
      score,
      time_spent: timeSpent,
    })
    .eq('id', attemptId);

  for (const [questionId, answer] of attempt.answers) {
    const question = attempt.questions.find((q) => q.id === questionId);
    if (question) {
      const isCorrect = answer.user_answer === question.correct_answer;
      await saveQuizAnswer(
        attemptId,
        questionId,
        answer.user_answer,
        isCorrect,
        answer.is_marked,
        answer.time_spent,
        attempt.questions.indexOf(question)
      );
    }
  }

  await supabase.from('quiz_results').insert({
    user_id: userId,
    attempt_id: attemptId,
    course_code: attempt.course_code,
    segment_number: attempt.segment_number,
    score,
    total_questions: totalQuestions,
    percentage,
    time_spent: timeSpent,
    marked_questions: Array.from(attempt.answers.values()).filter((a) => a.is_marked).length,
  });

  const xpEarned = calculateXP(score, totalQuestions, percentage, attempt.quiz_mode);
  const newLevel = await updateUserStats(
    userId,
    attempt.course_code,
    attempt.segment_number,
    score,
    totalQuestions,
    percentage,
    xpEarned
  );

  await trackWeakAreas(userId, attempt);

  return {
    attemptId,
    score,
    totalQuestions,
    percentage,
    timeSpent,
    xpEarned,
    newLevel,
  };
}

function calculateXP(
  score: number,
  _totalQuestions: number,
  percentage: number,
  mode: 'practice' | 'exam' | 'quick'
): number {
  let baseXP = score * 10;

  if (percentage === 100) {
    baseXP += 50;
  } else if (percentage >= 90) {
    baseXP += 30;
  } else if (percentage >= 80) {
    baseXP += 20;
  } else if (percentage >= 70) {
    baseXP += 10;
  }

  if (mode === 'exam') {
    baseXP *= 1.5;
  } else if (mode === 'quick') {
    baseXP *= 0.8;
  }

  return Math.round(baseXP);
}

async function updateUserStats(
  userId: string,
  courseCode: string,
  segmentNumber: number,
  _score: number,
  _totalQuestions: number,
  percentage: number,
  xpEarned: number
): Promise<number | undefined> {
  const { data: user } = await supabase
    .from('users')
    .select('total_xp, level, total_quizzes_taken, perfect_scores, average_score, study_streak, longest_streak, last_study_date')
    .eq('id', userId)
    .single();

  if (!user) throw new Error('User not found');

  const newTotalXP = (user.total_xp || 0) + xpEarned;
  const newLevel = calculateLevel(newTotalXP);
  const newQuizzesTaken = (user.total_quizzes_taken || 0) + 1;
  const newPerfectScores = (user.perfect_scores || 0) + (percentage === 100 ? 1 : 0);
  const newAverageScore =
    ((user.average_score || 0) * (user.total_quizzes_taken || 0) + percentage) / newQuizzesTaken;

  const today = new Date().toISOString().split('T')[0];
  const lastStudyDate = user.last_study_date
    ? new Date(user.last_study_date).toISOString().split('T')[0]
    : null;

  let newStreak = user.study_streak || 0;
  if (lastStudyDate === today) {
    newStreak = user.study_streak;
  } else if (
    lastStudyDate &&
    new Date(today).getTime() - new Date(lastStudyDate).getTime() === 86400000
  ) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  await supabase
    .from('users')
    .update({
      total_xp: newTotalXP,
      level: newLevel,
      total_quizzes_taken: newQuizzesTaken,
      perfect_scores: newPerfectScores,
      average_score: newAverageScore,
      study_streak: newStreak,
      longest_streak: Math.max(newStreak, user.longest_streak || 0),
      last_study_date: new Date().toISOString(),
      last_visit: new Date().toISOString(),
    })
    .eq('id', userId);

  await supabase.from('course_progress').upsert(
    {
      user_id: userId,
      course_code: courseCode,
      segment_number: segmentNumber,
      attempts: 1,
      best_score: percentage,
      average_score: percentage,
      last_attempt: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,course_code,segment_number',
      ignoreDuplicates: false,
    }
  );

  const { data: existingProgress } = await supabase
    .from('course_progress')
    .select('attempts, best_score, average_score')
    .eq('user_id', userId)
    .eq('course_code', courseCode)
    .eq('segment_number', segmentNumber)
    .single();

  if (existingProgress) {
    const newAttempts = (existingProgress.attempts || 0) + 1;
    const newBestScore = Math.max(existingProgress.best_score || 0, percentage);
    const newAvgScore =
      ((existingProgress.average_score || 0) * (existingProgress.attempts || 0) + percentage) /
      newAttempts;

    await supabase
      .from('course_progress')
      .update({
        attempts: newAttempts,
        best_score: newBestScore,
        average_score: newAvgScore,
        last_attempt: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('course_code', courseCode)
      .eq('segment_number', segmentNumber);
  }

  return newLevel > (user.level || 1) ? newLevel : undefined;
}

function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 500) + 1;
}

async function trackWeakAreas(userId: string, attempt: QuizAttempt): Promise<void> {
  for (const [questionId, answer] of attempt.answers) {
    const question = attempt.questions.find((q) => q.id === questionId);
    if (!question) continue;

    const isCorrect = answer.user_answer === question.correct_answer;
    if (!isCorrect && answer.user_answer !== null) {
      const questionHash = questionId.substring(0, 8);

      const { data: existing } = await supabase
        .from('weak_areas')
        .select('id, wrong_count')
        .eq('user_id', userId)
        .eq('course_code', attempt.course_code)
        .eq('question_hash', questionHash)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('weak_areas')
          .update({
            wrong_count: existing.wrong_count + 1,
            last_wrong: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('weak_areas').insert({
          user_id: userId,
          course_code: attempt.course_code,
          question_hash: questionHash,
          question_text: question.question_text,
          correct_answer: question.correct_answer,
          wrong_count: 1,
        });
      }
    }
  }
}

export async function getQuizHistory(
  userId: string,
  courseCode?: string
): Promise<any[]> {
  let query = supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (courseCode) {
    query = query.eq('course_code', courseCode);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
}
