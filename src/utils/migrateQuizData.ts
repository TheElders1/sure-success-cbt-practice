import { supabase } from '../lib/supabase';

interface LegacyQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface LegacyQuizData {
  title: string;
  questions: LegacyQuestion[];
}

export async function migrateQuizData(
  courseCode: string,
  segmentNumber: number,
  quizData: LegacyQuizData
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const question of quizData.questions) {
    try {
      const { error } = await supabase.from('quiz_questions').insert({
        course_code: courseCode,
        segment_number: segmentNumber,
        question_text: question.question,
        question_type: 'multiple_choice',
        options: question.options,
        correct_answer: question.answer,
        explanation: question.explanation || null,
        difficulty: null,
        topic: null,
      });

      if (error) {
        console.error(`Failed to migrate question: ${question.question}`, error);
        failed++;
      } else {
        success++;
      }
    } catch (err) {
      console.error(`Error migrating question: ${question.question}`, err);
      failed++;
    }
  }

  return { success, failed };
}

export async function checkExistingQuestions(
  courseCode: string,
  segmentNumber: number
): Promise<number> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id', { count: 'exact' })
    .eq('course_code', courseCode)
    .eq('segment_number', segmentNumber);

  if (error) {
    console.error('Error checking existing questions:', error);
    return 0;
  }

  return data?.length || 0;
}

export async function deleteExistingQuestions(
  courseCode: string,
  segmentNumber: number
): Promise<void> {
  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('course_code', courseCode)
    .eq('segment_number', segmentNumber);

  if (error) {
    throw new Error(`Failed to delete existing questions: ${error.message}`);
  }
}
