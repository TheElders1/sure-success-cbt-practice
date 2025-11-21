document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard only if we're on the dashboard page
    const dashboardPage = document.getElementById('dashboard-page');
    if (!dashboardPage) return;

    // Safe localStorage getter
    function safeGetLocalStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            if (data === null) return defaultValue;
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    }

    // Safe DOM element getter
    function safeGetElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id "${id}" not found`);
        }
        return element;
    }

    // Safe text content setter
    function setTextContent(element, text) {
        if (!element) return;
        element.textContent = text || '';
    }

    // Get user data manager from main.js
    const userData = safeGetLocalStorage('sureSuccessUserData', { users: {}, currentUser: null });
    const currentUser = userData.currentUser && userData.users ? userData.users[userData.currentUser] : null;

    if (!currentUser) {
        // Redirect to home if no user data
        window.location.href = 'index.html';
        return;
    }

    // Initialize dashboard
    initializeDashboard(currentUser);

    function initializeDashboard(user) {
        // Update welcome message
        const userWelcome = safeGetElement('user-welcome');
        if (userWelcome) {
            setTextContent(userWelcome, `Welcome back, ${user.name || 'User'}!`);
        }

        // Update stats
        const totalQuizzesEl = safeGetElement('total-quizzes');
        const averageScoreEl = safeGetElement('average-score');
        const perfectScoresEl = safeGetElement('perfect-scores');
        const studyStreakEl = safeGetElement('study-streak');
        const userLevelEl = safeGetElement('user-level');
        const totalXpEl = safeGetElement('total-xp');

        if (totalQuizzesEl) setTextContent(totalQuizzesEl, user.totalQuizzesTaken || 0);
        if (averageScoreEl) setTextContent(averageScoreEl, `${user.averageScore || 0}%`);
        if (perfectScoresEl) setTextContent(perfectScoresEl, user.perfectScores || 0);
        if (studyStreakEl) setTextContent(studyStreakEl, user.studyStreak || 0);
        if (userLevelEl) setTextContent(userLevelEl, user.level || 1);
        if (totalXpEl) setTextContent(totalXpEl, user.totalXP || 0);

        // Create performance chart
        const quizHistory = Array.isArray(user.quizHistory) ? user.quizHistory : [];
        createPerformanceChart(quizHistory);

        // Display achievements
        const achievements = Array.isArray(user.achievements) ? user.achievements : [];
        displayAchievements(achievements);

        // Display weak areas
        displayWeakAreas(user.weakAreas || {});

        // Display course progress
        displayCourseProgress(user.courseProgress || {});

        // Display recent activity
        displayRecentActivity(quizHistory.slice(-10));

        // Setup reset data button
        setupResetDataButton();
    }

    function createPerformanceChart(quizHistory) {
        const chartCanvas = safeGetElement('performance-chart');
        if (!chartCanvas) {
            console.error('Performance chart canvas not found');
            return;
        }

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js library not loaded');
            const ctx = chartCanvas.getContext('2d');
            if (ctx) {
                ctx.font = '16px Inter';
                ctx.fillStyle = '#666';
                ctx.textAlign = 'center';
                ctx.fillText('Chart library not available', chartCanvas.width / 2, chartCanvas.height / 2);
            }
            return;
        }

        if (!Array.isArray(quizHistory) || quizHistory.length === 0) {
            const ctx = chartCanvas.getContext('2d');
            if (ctx) {
                ctx.font = '16px Inter';
                ctx.fillStyle = '#666';
                ctx.textAlign = 'center';
                ctx.fillText('No quiz data available yet', chartCanvas.width / 2, chartCanvas.height / 2);
            }
            return;
        }

        try {
            // Prepare data for the last 20 quizzes
            const recentQuizzes = quizHistory.slice(-20);
            const labels = recentQuizzes.map((quiz, index) => `Quiz ${index + 1}`);
            const scores = recentQuizzes.map(quiz => {
                const percentage = quiz && typeof quiz.percentage === 'number' ? quiz.percentage : 0;
                return Math.max(0, Math.min(100, percentage)); // Clamp between 0-100
            });

            new Chart(chartCanvas.getContext('2d'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Score (%)',
                        data: scores,
                        borderColor: '#510F64',
                        backgroundColor: 'rgba(81, 15, 100, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#510F64',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    },
                    elements: {
                        point: {
                            hoverRadius: 8
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating performance chart:', error);
            const ctx = chartCanvas.getContext('2d');
            if (ctx) {
                ctx.font = '16px Inter';
                ctx.fillStyle = '#dc3545';
                ctx.textAlign = 'center';
                ctx.fillText('Error loading chart', chartCanvas.width / 2, chartCanvas.height / 2);
            }
        }
    }

    function displayAchievements(userAchievements) {
        const container = safeGetElement('achievements-container');
        if (!container) return;
        
        const allAchievements = [
            { id: 'first_quiz', name: 'Getting Started', description: 'Complete your first quiz', icon: '🎯' },
            { id: 'perfect_score', name: 'Perfect Score', description: 'Score 100% on a quiz', icon: '💯' },
            { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a quiz in under 15 minutes', icon: '⚡' },
            { id: 'streak_3', name: '3-Day Streak', description: 'Study for 3 consecutive days', icon: '🔥' },
            { id: 'streak_7', name: 'Week Warrior', description: 'Study for 7 consecutive days', icon: '📅' },
            { id: 'streak_30', name: 'Monthly Master', description: 'Study for 30 consecutive days', icon: '🗓️' },
            { id: 'quiz_master_10', name: 'Quiz Master', description: 'Complete 10 quizzes', icon: '🎓' },
            { id: 'quiz_master_50', name: 'Quiz Legend', description: 'Complete 50 quizzes', icon: '👑' },
            { id: 'perfectionist', name: 'Perfectionist', description: 'Score 100% on 5 quizzes', icon: '🏆' },
            { id: 'level_5', name: 'Level 5 Achiever', description: 'Reach Level 5', icon: '⭐' },
            { id: 'level_10', name: 'Level 10 Master', description: 'Reach Level 10', icon: '🌟' }
        ];

        const achievements = Array.isArray(userAchievements) ? userAchievements : [];
        container.innerHTML = '';
        
        allAchievements.forEach(achievement => {
            const isUnlocked = achievements.includes(achievement.id);
            const achievementEl = document.createElement('div');
            achievementEl.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            
            const iconDiv = document.createElement('div');
            iconDiv.className = 'achievement-icon';
            iconDiv.textContent = achievement.icon;
            achievementEl.appendChild(iconDiv);
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'achievement-content';
            
            const h4 = document.createElement('h4');
            h4.textContent = achievement.name;
            contentDiv.appendChild(h4);
            
            const p = document.createElement('p');
            p.textContent = achievement.description;
            contentDiv.appendChild(p);
            
            achievementEl.appendChild(contentDiv);
            
            const statusDiv = document.createElement('div');
            statusDiv.className = 'achievement-status';
            statusDiv.textContent = isUnlocked ? '✓' : '🔒';
            achievementEl.appendChild(statusDiv);
            
            container.appendChild(achievementEl);
        });
    }

    function displayWeakAreas(weakAreas) {
        const container = safeGetElement('weak-areas-container');
        if (!container) return;
        
        container.innerHTML = '';

        const allWeakQuestions = [];
        if (weakAreas && typeof weakAreas === 'object') {
            Object.keys(weakAreas).forEach(courseCode => {
                const courseWeakAreas = weakAreas[courseCode];
                if (courseWeakAreas && typeof courseWeakAreas === 'object') {
                    Object.values(courseWeakAreas).forEach(weakQuestion => {
                        if (weakQuestion && typeof weakQuestion === 'object') {
                            allWeakQuestions.push({
                                ...weakQuestion,
                                courseCode
                            });
                        }
                    });
                }
            });
        }

        if (allWeakQuestions.length === 0) {
            const noDataP = document.createElement('p');
            noDataP.className = 'no-data';
            noDataP.textContent = '🎉 Great job! No weak areas identified yet.';
            container.appendChild(noDataP);
            return;
        }

        // Sort by wrong count and show top 10
        allWeakQuestions.sort((a, b) => (b.wrongCount || 0) - (a.wrongCount || 0));
        const topWeakQuestions = allWeakQuestions.slice(0, 10);

        topWeakQuestions.forEach(weakQuestion => {
            const weakAreaEl = document.createElement('div');
            weakAreaEl.className = 'weak-area-card';
            
            const header = document.createElement('div');
            header.className = 'weak-area-header';
            
            const courseBadge = document.createElement('span');
            courseBadge.className = 'course-badge';
            courseBadge.textContent = weakQuestion.courseCode || 'Unknown';
            header.appendChild(courseBadge);
            
            const wrongCount = document.createElement('span');
            wrongCount.className = 'wrong-count';
            const count = weakQuestion.wrongCount || 0;
            wrongCount.textContent = `❌ ${count} time${count > 1 ? 's' : ''}`;
            header.appendChild(wrongCount);
            
            weakAreaEl.appendChild(header);
            
            const content = document.createElement('div');
            content.className = 'weak-area-content';
            
            const questionP = document.createElement('p');
            questionP.className = 'weak-question';
            questionP.textContent = weakQuestion.question || 'No question text';
            content.appendChild(questionP);
            
            const answerP = document.createElement('p');
            answerP.className = 'correct-answer';
            const strong = document.createElement('strong');
            strong.textContent = 'Correct Answer: ';
            answerP.appendChild(strong);
            answerP.appendChild(document.createTextNode(weakQuestion.correctAnswer || 'N/A'));
            content.appendChild(answerP);
            
            weakAreaEl.appendChild(content);
            container.appendChild(weakAreaEl);
        });
    }

    function displayCourseProgress(courseProgress) {
        const container = safeGetElement('course-progress-container');
        if (!container) return;
        
        container.innerHTML = '';

        if (!courseProgress || typeof courseProgress !== 'object' || Object.keys(courseProgress).length === 0) {
            const noDataP = document.createElement('p');
            noDataP.className = 'no-data';
            noDataP.textContent = '📚 Start taking quizzes to see your course progress!';
            container.appendChild(noDataP);
            return;
        }

        Object.keys(courseProgress).forEach(courseKey => {
            const scores = courseProgress[courseKey];
            if (!Array.isArray(scores) || scores.length === 0) return;
            
            const [courseCode, segmentNumber] = courseKey.split('_');
            const averageScore = Math.round(scores.reduce((sum, score) => sum + (score || 0), 0) / scores.length);
            const bestScore = Math.max(...scores.map(s => s || 0));
            const trend = calculateTrend(scores);

            const progressEl = document.createElement('div');
            progressEl.className = 'course-progress-card';
            
            const header = document.createElement('div');
            header.className = 'course-progress-header';
            
            const h4 = document.createElement('h4');
            h4.textContent = `${courseCode || 'Unknown'} - Segment ${segmentNumber || 'N/A'}`;
            header.appendChild(h4);
            
            const trendIndicator = document.createElement('span');
            trendIndicator.className = `trend-indicator ${trend}`;
            trendIndicator.textContent = getTrendIcon(trend);
            header.appendChild(trendIndicator);
            
            progressEl.appendChild(header);
            
            const stats = document.createElement('div');
            stats.className = 'course-progress-stats';
            
            ['Attempts', 'Average', 'Best'].forEach((label, index) => {
                const stat = document.createElement('div');
                stat.className = 'progress-stat';
                
                const statLabel = document.createElement('span');
                statLabel.className = 'stat-label';
                statLabel.textContent = label;
                stat.appendChild(statLabel);
                
                const statValue = document.createElement('span');
                statValue.className = 'stat-value';
                if (index === 0) {
                    statValue.textContent = scores.length;
                } else if (index === 1) {
                    statValue.textContent = `${averageScore}%`;
                } else {
                    statValue.textContent = `${bestScore}%`;
                }
                stat.appendChild(statValue);
                
                stats.appendChild(stat);
            });
            
            progressEl.appendChild(stats);
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            
            const progressFill = document.createElement('div');
            progressFill.className = 'progress-fill';
            progressFill.style.width = `${Math.max(0, Math.min(100, averageScore))}%`;
            progressBar.appendChild(progressFill);
            
            progressEl.appendChild(progressBar);
            container.appendChild(progressEl);
        });
    }

    function displayRecentActivity(recentQuizzes) {
        const container = safeGetElement('recent-activity-container');
        if (!container) return;
        
        container.innerHTML = '';

        if (!Array.isArray(recentQuizzes) || recentQuizzes.length === 0) {
            const noDataP = document.createElement('p');
            noDataP.className = 'no-data';
            noDataP.textContent = '📋 No recent activity to display.';
            container.appendChild(noDataP);
            return;
        }

        recentQuizzes.reverse().forEach(quiz => {
            if (!quiz) return;
            
            const date = quiz.date ? new Date(quiz.date) : new Date();
            const timeAgo = getTimeAgo(date);
            const percentage = quiz.percentage || 0;
            
            const activityEl = document.createElement('div');
            activityEl.className = 'activity-card';
            
            const iconDiv = document.createElement('div');
            iconDiv.className = 'activity-icon';
            iconDiv.textContent = percentage === 100 ? '🏆' : percentage >= 80 ? '🎯' : '📝';
            activityEl.appendChild(iconDiv);
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'activity-content';
            
            const h4 = document.createElement('h4');
            h4.textContent = `${quiz.courseCode || 'Unknown'} - Segment ${quiz.segmentNumber || 'N/A'}`;
            contentDiv.appendChild(h4);
            
            const p = document.createElement('p');
            p.textContent = `Scored ${quiz.score || 0}/${quiz.totalQuestions || 0} (${percentage}%)`;
            contentDiv.appendChild(p);
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'activity-time';
            timeSpan.textContent = timeAgo;
            contentDiv.appendChild(timeSpan);
            
            activityEl.appendChild(contentDiv);
            
            const scoreDiv = document.createElement('div');
            scoreDiv.className = `activity-score ${percentage >= 80 ? 'good-score' : percentage >= 50 ? 'ok-score' : 'poor-score'}`;
            scoreDiv.textContent = `${percentage}%`;
            activityEl.appendChild(scoreDiv);
            
            container.appendChild(activityEl);
        });
    }

    function calculateTrend(scores) {
        if (scores.length < 2) return 'stable';
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 5) return 'improving';
        if (secondAvg < firstAvg - 5) return 'declining';
        return 'stable';
    }

    function getTrendIcon(trend) {
        switch (trend) {
            case 'improving': return '📈';
            case 'declining': return '📉';
            default: return '➡️';
        }
    }

    function getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return date.toLocaleDateString();
    }

    function setupResetDataButton() {
        const resetBtn = safeGetElement('reset-data-btn');
        if (!resetBtn) return;
        
        resetBtn.addEventListener('click', () => {
            if (confirm('⚠️ Are you sure you want to reset all your data? This action cannot be undone!')) {
                if (confirm('🚨 This will permanently delete all your progress, achievements, and quiz history. Are you absolutely sure?')) {
                    try {
                        localStorage.removeItem('sureSuccessUserData');
                        alert('✅ All data has been reset successfully!');
                        window.location.href = 'index.html';
                    } catch (error) {
                        console.error('Error resetting data:', error);
                        alert('❌ Error resetting data. Please try again.');
                    }
                }
            }
        });
    }
});