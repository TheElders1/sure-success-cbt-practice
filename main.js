document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 0. UTILITY FUNCTIONS
    // =========================================================================
    
    // Safe DOM element getter with null check
    function safeGetElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id "${id}" not found`);
        }
        return element;
    }

    // Safe localStorage getter with error handling
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

    // Safe localStorage setter with error handling
    function safeSetLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
            // Try to clear some space if quota exceeded
            if (error.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded, attempting cleanup');
                try {
                    // Clear old quiz history if available
                    const userData = safeGetLocalStorage('sureSuccessUserData', { users: {} });
                    Object.keys(userData.users || {}).forEach(userId => {
                        const user = userData.users[userId];
                        if (user && user.quizHistory && user.quizHistory.length > 50) {
                            user.quizHistory = user.quizHistory.slice(-50);
                        }
                    });
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (retryError) {
                    console.error('Failed to free localStorage space:', retryError);
                }
            }
            return false;
        }
    }

    // Sanitize HTML to prevent XSS
    function sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Safe text content setter (prevents XSS)
    function setTextContent(element, text) {
        if (!element) return;
        element.textContent = text || '';
    }

    // Safe innerHTML setter with sanitization
    function setSafeHTML(element, html) {
        if (!element) return;
        // Only allow safe HTML for specific cases, otherwise use textContent
        element.innerHTML = html;
    }

    // =========================================================================
    // 0. USER DATA MANAGEMENT & PERFORMANCE TRACKING
    // =========================================================================
    
    class UserDataManager {
        constructor() {
            this.userData = this.loadUserData();
        }

        loadUserData() {
            return safeGetLocalStorage('sureSuccessUserData', {
                users: {},
                currentUser: null
            });
        }

        saveUserData() {
            return safeSetLocalStorage('sureSuccessUserData', this.userData);
        }

        createOrGetUser(name) {
            const userId = name.toLowerCase().replace(/\s+/g, '_');
            if (!this.userData.users[userId]) {
                this.userData.users[userId] = {
                    id: userId,
                    name: name,
                    department: null, // Will be set during login
                    joinDate: new Date().toISOString(),
                    lastVisit: new Date().toISOString(),
                    totalXP: 0,
                    level: 1,
                    studyStreak: 0,
                    longestStreak: 0,
                    lastStudyDate: null,
                    achievements: [],
                    quizHistory: [],
                    weakAreas: {},
                    courseProgress: {},
                    totalQuizzesTaken: 0,
                    perfectScores: 0,
                    averageScore: 0
                };
                console.log('Created new user:', this.userData.users[userId]);
            } else {
                // Update last visit
                this.userData.users[userId].lastVisit = new Date().toISOString();
                this.updateStudyStreak(userId);
                console.log('Updated existing user:', this.userData.users[userId]);
            }
            this.userData.currentUser = userId;
            this.saveUserData();
            return this.userData.users[userId];
        }

        getCurrentUser() {
            if (this.userData.currentUser) {
                return this.userData.users[this.userData.currentUser];
            }
            return null;
        }

        updateStudyStreak(userId) {
            const user = this.userData.users[userId];
            const today = new Date().toDateString();
            const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate).toDateString() : null;
            
            if (lastStudy === today) {
                // Already studied today
                return;
            }
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            if (lastStudy === yesterdayStr) {
                // Continuing streak
                user.studyStreak += 1;
            } else if (lastStudy !== today) {
                // Streak broken or first time
                user.studyStreak = 1;
            }
            
            user.longestStreak = Math.max(user.longestStreak, user.studyStreak);
            user.lastStudyDate = new Date().toISOString();
        }

        recordQuizResult(courseCode, segmentNumber, score, totalQuestions, timeSpent, markedQuestions, wrongAnswers) {
            const user = this.getCurrentUser();
            if (!user) return;

            const quizResult = {
                id: Date.now(),
                date: new Date().toISOString(),
                courseCode,
                segmentNumber,
                score,
                totalQuestions,
                percentage: Math.round((score / totalQuestions) * 100),
                timeSpent,
                markedQuestions: markedQuestions.length,
                wrongAnswers
            };

            user.quizHistory.push(quizResult);
            user.totalQuizzesTaken += 1;
            
            // Update XP and level
            const xpGained = this.calculateXP(score, totalQuestions, timeSpent);
            user.totalXP += xpGained;
            user.level = Math.floor(user.totalXP / 1000) + 1;

            // Update perfect scores
            if (score === totalQuestions) {
                user.perfectScores += 1;
            }

            // Update average score
            const totalScore = user.quizHistory.reduce((sum, quiz) => sum + quiz.percentage, 0);
            user.averageScore = Math.round(totalScore / user.quizHistory.length);

            // Update course progress
            const courseKey = `${courseCode}_${segmentNumber}`;
            if (!user.courseProgress[courseKey]) {
                user.courseProgress[courseKey] = [];
            }
            user.courseProgress[courseKey].push(quizResult.percentage);

            // Update weak areas
            this.updateWeakAreas(user, courseCode, wrongAnswers);

            // Check for achievements
            this.checkAchievements(user, quizResult);

            this.saveUserData();
            return { xpGained, newAchievements: this.getNewAchievements(user) };
        }

        calculateXP(score, totalQuestions, timeSpent) {
            const baseXP = score * 10;
            const perfectBonus = score === totalQuestions ? 100 : 0;
            const speedBonus = timeSpent < 900 ? 50 : 0; // Bonus for completing in under 15 minutes
            return baseXP + perfectBonus + speedBonus;
        }

        updateWeakAreas(user, courseCode, wrongAnswers) {
            if (!user.weakAreas[courseCode]) {
                user.weakAreas[courseCode] = {};
            }
            
            wrongAnswers.forEach(qa => {
                const questionHash = this.hashQuestion(qa.question);
                if (!user.weakAreas[courseCode][questionHash]) {
                    user.weakAreas[courseCode][questionHash] = {
                        question: qa.question,
                        correctAnswer: qa.correctAnswer,
                        wrongCount: 0,
                        lastWrong: null
                    };
                }
                user.weakAreas[courseCode][questionHash].wrongCount += 1;
                user.weakAreas[courseCode][questionHash].lastWrong = new Date().toISOString();
            });
        }

        hashQuestion(question) {
            // Simple hash function for question identification
            let hash = 0;
            for (let i = 0; i < question.length; i++) {
                const char = question.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return hash.toString();
        }

        checkAchievements(user, quizResult) {
            const achievements = [
                { id: 'first_quiz', name: 'Getting Started', description: 'Complete your first quiz', condition: () => user.totalQuizzesTaken === 1 },
                { id: 'perfect_score', name: 'Perfect Score', description: 'Score 100% on a quiz', condition: () => quizResult.percentage === 100 },
                { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a quiz in under 15 minutes', condition: () => quizResult.timeSpent < 900 },
                { id: 'streak_3', name: '3-Day Streak', description: 'Study for 3 consecutive days', condition: () => user.studyStreak >= 3 },
                { id: 'streak_7', name: 'Week Warrior', description: 'Study for 7 consecutive days', condition: () => user.studyStreak >= 7 },
                { id: 'streak_30', name: 'Monthly Master', description: 'Study for 30 consecutive days', condition: () => user.studyStreak >= 30 },
                { id: 'quiz_master_10', name: 'Quiz Master', description: 'Complete 10 quizzes', condition: () => user.totalQuizzesTaken >= 10 },
                { id: 'quiz_master_50', name: 'Quiz Legend', description: 'Complete 50 quizzes', condition: () => user.totalQuizzesTaken >= 50 },
                { id: 'perfectionist', name: 'Perfectionist', description: 'Score 100% on 5 quizzes', condition: () => user.perfectScores >= 5 },
                { id: 'level_5', name: 'Level 5 Achiever', description: 'Reach Level 5', condition: () => user.level >= 5 },
                { id: 'level_10', name: 'Level 10 Master', description: 'Reach Level 10', condition: () => user.level >= 10 }
            ];

            achievements.forEach(achievement => {
                if (!user.achievements.includes(achievement.id) && achievement.condition()) {
                    user.achievements.push(achievement.id);
                }
            });
        }

        getNewAchievements(user) {
            // This would be called to get achievements earned in the last session
            // For now, return empty array - could be enhanced to track new achievements
            return [];
        }

        getWeakQuestions(courseCode, limit = 10) {
            const user = this.getCurrentUser();
            if (!user || !user.weakAreas[courseCode]) return [];

            return Object.values(user.weakAreas[courseCode])
                .sort((a, b) => b.wrongCount - a.wrongCount)
                .slice(0, limit);
        }

        getPerformanceData(courseCode = null) {
            const user = this.getCurrentUser();
            if (!user) return null;

            let quizzes = user.quizHistory;
            if (courseCode) {
                quizzes = quizzes.filter(quiz => quiz.courseCode === courseCode);
            }

            return {
                user,
                quizzes,
                totalQuizzes: quizzes.length,
                averageScore: quizzes.length > 0 ? Math.round(quizzes.reduce((sum, quiz) => sum + quiz.percentage, 0) / quizzes.length) : 0,
                bestScore: quizzes.length > 0 ? Math.max(...quizzes.map(quiz => quiz.percentage)) : 0,
                recentTrend: this.calculateTrend(quizzes.slice(-5))
            };
        }

        calculateTrend(recentQuizzes) {
            if (recentQuizzes.length < 2) return 'stable';
            const firstHalf = recentQuizzes.slice(0, Math.floor(recentQuizzes.length / 2));
            const secondHalf = recentQuizzes.slice(Math.floor(recentQuizzes.length / 2));
            
            const firstAvg = firstHalf.reduce((sum, quiz) => sum + quiz.percentage, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, quiz) => sum + quiz.percentage, 0) / secondHalf.length;
            
            if (secondAvg > firstAvg + 5) return 'improving';
            if (secondAvg < firstAvg - 5) return 'declining';
            return 'stable';
        }
    }

    // Initialize User Data Manager
    const userDataManager = new UserDataManager();

    // =========================================================================
    // 1. UNIVERSAL LOGIC (Runs on every page)
    // =========================================================================
    
    // --- Theme Toggler (Updated for sidebar) ---
    const themeToggleBtn = safeGetElement('theme-toggle');
    if (themeToggleBtn) {
        const applyTheme = () => {
            try {
                const currentTheme = localStorage.getItem('theme');
                if (currentTheme === 'dark') {
                    document.body.classList.add('dark-mode');
                    const toggleText = themeToggleBtn.querySelector('span:last-child');
                    if (toggleText) {
                        toggleText.textContent = 'Light Mode';
                    }
                    // Update icon if it's the first span
                    const iconSpan = themeToggleBtn.querySelector('span:first-child');
                    if (iconSpan) {
                        iconSpan.textContent = '☀️';
                    }
                } else {
                    document.body.classList.remove('dark-mode');
                    const toggleText = themeToggleBtn.querySelector('span:last-child');
                    if (toggleText) {
                        toggleText.textContent = 'Dark Mode';
                    }
                    const iconSpan = themeToggleBtn.querySelector('span:first-child');
                    if (iconSpan) {
                        iconSpan.textContent = '🌙';
                    }
                }
            } catch (error) {
                console.error('Error applying theme:', error);
            }
        };
        themeToggleBtn.addEventListener('click', () => {
            try {
                let newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
                localStorage.setItem('theme', newTheme);
                applyTheme();
            } catch (error) {
                console.error('Error toggling theme:', error);
            }
        });
        applyTheme();
    }

    // --- Mobile Menu Toggle ---
    const mobileMenuToggle = safeGetElement('mobile-menu-toggle');
    const sidebar = safeGetElement('sidebar');
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // --- FAQ Accordion (if not already handled) ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length > 0) {
        // Check if FAQ functionality is already set up
        let faqHandled = false;
        faqQuestions.forEach(q => {
            if (q.hasAttribute('data-faq-handled')) {
                faqHandled = true;
            }
        });
        
        if (!faqHandled) {
            faqQuestions.forEach(question => {
                question.setAttribute('data-faq-handled', 'true');
                question.addEventListener('click', () => {
                    const faqItem = question.closest('.faq-item');
                    const answer = faqItem.querySelector('.faq-answer');
                    const isActive = question.classList.contains('active');
                    
                    // Close all other FAQs
                    faqQuestions.forEach(q => {
                        if (q !== question) {
                            q.classList.remove('active');
                            const otherAnswer = q.closest('.faq-item').querySelector('.faq-answer');
                            if (otherAnswer) {
                                otherAnswer.style.maxHeight = '0';
                            }
                        }
                    });
                    
                    // Toggle current FAQ
                    if (isActive) {
                        question.classList.remove('active');
                        answer.style.maxHeight = '0';
                    } else {
                        question.classList.add('active');
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    }
                });
            });
        }
    }

    // --- Secure Notification Helper ---
    async function sendNotification(message) {
        if (!navigator.onLine) { return; }
        try {
            fetch('/.netlify/functions/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });
        } catch (error) {
            console.error("Failed to send notification request:", error);
        }
    }

    // =========================================================================
    // 2. LOGIN PAGE LOGIC (index.html)
    // =========================================================================
    const loginForm = safeGetElement('login-form');
    if (loginForm) {
        console.log('Login page loaded');
        
        // 🔒 PERSISTENT LOGIN CHECK - Auto-redirect if already logged in
        const currentUser = userDataManager.getCurrentUser();
        
        if (currentUser) {
            // User already exists and is logged in - skip login page
            console.log('User already logged in:', currentUser.name);
            // Add loading indicator before redirect
            const loadingDiv = document.createElement('div');
            loadingDiv.style.cssText = 'display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; gap: 20px;';
            loadingDiv.innerHTML = '<div style="font-size: 2em;">⏳</div><p>Redirecting to your dashboard...</p>';
            document.body.innerHTML = '';
            document.body.appendChild(loadingDiv);
            window.location.href = 'home.html';
            return;
        }

        const nameInput = safeGetElement('name-input');
        const departmentSelect = safeGetElement('department-select');
        
        if (!nameInput || !departmentSelect) {
            console.error('Required form elements not found');
            return;
        }
        
        // Add real-time validation feedback
        nameInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value.length >= 6) {
                showFormFeedback('name', '✓ Looks good!', 'success');
            } else if (value.length > 0) {
                const remaining = 6 - value.length;
                showFormFeedback('name', `${remaining} more character${remaining > 1 ? 's' : ''} needed`, 'error');
            } else {
                showFormFeedback('name', '', '');
            }
        });

        const showFormFeedback = (fieldId, message, type = 'error') => {
            const feedbackEl = safeGetElement(`${fieldId}-feedback`);
            if (feedbackEl) {
                setTextContent(feedbackEl, message);
                feedbackEl.className = `form-feedback ${type}`;
            }
        };

        // Update form input styling for floating labels
        nameInput.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        nameInput.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });

        const validateForm = () => {
            let isValid = true;
            const nameValue = nameInput.value.trim();
            if (nameValue.length < 6) {
                showFormFeedback('name', 'Name must be at least 6 characters.');
                isValid = false;
            } else { 
                showFormFeedback('name', '✓ Looks good!', 'success'); 
            }

            if (!departmentSelect.value) {
                showFormFeedback('department', 'Please select a department.');
                isValid = false;
            } else { 
                showFormFeedback('department', '', 'success'); 
            }
            
            return isValid;
        };
        
        departmentSelect.addEventListener('change', function() {
            showFormFeedback('department', '✓ Department selected', 'success');
        });

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if (!validateForm()) return;
            
            const name = nameInput.value.trim();
            const department = departmentSelect.value;
            
            const submitButton = this.querySelector('button[type="submit"]');
            if (!submitButton) {
                console.error('Submit button not found');
                return;
            }
            
            submitButton.disabled = true;
            const btnText = submitButton.querySelector('.btn-text');
            const btnIcon = submitButton.querySelector('.btn-icon');
            if (btnText) setTextContent(btnText, 'Logging in...');
            if (btnIcon) setTextContent(btnIcon, '⏳');

            const notificationMessage = `🔔 User Login 🔔\n\nName: ${sanitizeHTML(name)}\nDept: ${sanitizeHTML(department)}`;
            sendNotification(notificationMessage);

            try {
                // Create or update user data
                const user = userDataManager.createOrGetUser(name);
                user.department = department; // Store department with user
                if (!userDataManager.saveUserData()) {
                    console.warn('Failed to save user data to localStorage');
                }
                
                // Small delay to ensure data is saved before redirect
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 100);
            } catch (error) {
                console.error('Error during login:', error);
                submitButton.disabled = false;
                if (btnText) setTextContent(btnText, 'Login to Dashboard');
                if (btnIcon) setTextContent(btnIcon, '🚀');
                showFormFeedback('name', 'An error occurred. Please try again.', 'error');
            }
        });
    }

    // =========================================================================
    // 3. QUIZ PAGE LOGIC (quiz.html)
    // =========================================================================
    const quizHost = safeGetElement('quiz-host');
    if (quizHost) {
        // --- DOM Elements ---
        const loadingQuizEl = safeGetElement('loading-quiz');
        const segmentSelectionEl = safeGetElement('segment-selection-quiz');
        const startSegment1Btn = safeGetElement('start-segment-1-btn');
        const startSegment2Btn = safeGetElement('start-segment-2-btn');
        const quizContainer = safeGetElement('quiz-container');
        const resultsContainer = safeGetElement('results-container');
        const questionNumberEl = safeGetElement('question-number');
        const totalQuestionsEl = safeGetElement('total-questions');
        const questionTextEl = safeGetElement('question-text');
        const optionsContainerEl = safeGetElement('options-container');
        const prevBtn = safeGetElement('prev-btn');
        const nextBtn = safeGetElement('next-btn');
        const submitBtn = safeGetElement('submit-btn');
        const markQuestionBtn = safeGetElement('mark-question-btn');
        const scoreTextEl = safeGetElement('score-text');
        const feedbackTextEl = safeGetElement('feedback-text');
        const restartBtn = safeGetElement('restart-btn');
        const reviewBtn = safeGetElement('review-btn');
        const filterMarkedBtn = safeGetElement('filter-marked-btn');
        const timerEl = safeGetElement('timer');
        const detailedResultsEl = safeGetElement('detailed-results');
        const quizProgressFill = safeGetElement('quiz-progress-fill');
        const answeredCountEl = safeGetElement('answered-count');
        const totalCountEl = safeGetElement('total-count');
        const scorePercentageEl = safeGetElement('score-percentage');
        const progressPercentageEl = safeGetElement('progress-percentage');

        // Validate all required elements exist
        if (!loadingQuizEl || !segmentSelectionEl || !quizContainer || !resultsContainer ||
            !questionNumberEl || !totalQuestionsEl || !questionTextEl || !optionsContainerEl ||
            !prevBtn || !nextBtn || !submitBtn || !markQuestionBtn || !scoreTextEl ||
            !feedbackTextEl || !restartBtn || !reviewBtn || !filterMarkedBtn || !timerEl ||
            !detailedResultsEl || !quizProgressFill || !answeredCountEl || !totalCountEl ||
            !scorePercentageEl || !progressPercentageEl) {
            console.error('Required quiz elements not found');
            if (loadingQuizEl) {
                loadingQuizEl.innerHTML = '<div class="error-message-container"><div class="error-icon">!</div><h3 class="error-title">Error Loading Quiz</h3><p class="error-subtitle">Some required elements are missing. Please refresh the page.</p></div>';
                loadingQuizEl.style.display = 'block';
            }
            return;
        }
        
        // --- State Variables ---
        let fullCourseQuestions = [];
        let currentQuizQuestions = [];
        let userAnswers = [];
        let markedQuestions = [];
        let score = 0;
        let timerInterval = null;
        let currentSegmentNumber = 0;
        let currentQuestionIndex = 0;
        let isReviewFiltered = false;
        const QUIZ_LENGTH = 50;
        const SEGMENT_POOL_SIZE = 100;
        const TIME_LIMIT_SECONDS = 25 * 60;
        let quizStartTime = null;
        let explanationsEnabled = false;

        // --- Core Quiz Functions ---
        const showScreen = (screen) => {
            if (!screen) return;
            [loadingQuizEl, segmentSelectionEl, quizContainer, resultsContainer].forEach(el => {
                if (el) el.style.display = 'none';
            });
            screen.style.display = 'block';
        };

        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        };

        const startQuizForSegment = (segmentNumber) => {
            // Clear any existing timer
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            currentSegmentNumber = segmentNumber;
            quizStartTime = Date.now();
            const startIndex = (segmentNumber - 1) * SEGMENT_POOL_SIZE;
            const endIndex = startIndex + SEGMENT_POOL_SIZE;

            if (!fullCourseQuestions || fullCourseQuestions.length < startIndex + 1) {
                alert(`Error: Not enough questions in the course file for Segment ${segmentNumber}.`);
                if (segmentSelectionEl) showScreen(segmentSelectionEl);
                return;
            }

            let segmentPool = [...fullCourseQuestions].slice(startIndex, endIndex);
            
            // Add adaptive learning - prioritize weak areas
            const params = new URLSearchParams(window.location.search);
            const courseCode = params.get('course');
            const weakQuestions = userDataManager.getWeakQuestions(courseCode, 20);
            
            if (weakQuestions.length > 0) {
                // Find matching questions in the pool and prioritize them
                const weakHashes = weakQuestions.map(wq => userDataManager.hashQuestion(wq.question));
                const priorityQuestions = [];
                const regularQuestions = [];
                
                segmentPool.forEach(q => {
                    const hash = userDataManager.hashQuestion(q.question);
                    if (weakHashes.includes(hash)) {
                        priorityQuestions.push(q);
                    } else {
                        regularQuestions.push(q);
                    }
                });
                
                // Shuffle both arrays
                shuffleArray(priorityQuestions);
                shuffleArray(regularQuestions);
                
                // Combine with priority questions first (up to 30% of quiz)
                const priorityCount = Math.min(priorityQuestions.length, Math.floor(QUIZ_LENGTH * 0.3));
                segmentPool = [...priorityQuestions.slice(0, priorityCount), ...regularQuestions];
            }
            
            shuffleArray(segmentPool);
            currentQuizQuestions = segmentPool.slice(0, QUIZ_LENGTH);
            
            if (currentQuizQuestions.length < QUIZ_LENGTH) {
                alert(`Warning: Segment ${segmentNumber} only has ${currentQuizQuestions.length} questions available.`);
            }

            userAnswers = new Array(currentQuizQuestions.length).fill(null);
            markedQuestions = new Array(currentQuizQuestions.length).fill(false);
            score = 0;
            currentQuestionIndex = 0;
            
            setTextContent(totalQuestionsEl, currentQuizQuestions.length);
            setTextContent(totalCountEl, currentQuizQuestions.length);

            loadQuestion(0);
            startTimer();
            updateQuizProgress();
            showScreen(quizContainer);
        };
        
        const loadQuestion = (index) => {
            if (!currentQuizQuestions || !currentQuizQuestions[index]) return;
            const question = currentQuizQuestions[index];
            setTextContent(questionNumberEl, index + 1);
            
            // Use textContent for question text to prevent XSS
            setTextContent(questionTextEl, question.question);
            optionsContainerEl.innerHTML = '';

            if (!question.options || !Array.isArray(question.options)) {
                console.error('Invalid question options');
                return;
            }

            question.options.forEach((optionText) => {
                const optionItem = document.createElement('div');
                optionItem.className = 'option-item';
                
                // Create radio indicator
                const radio = document.createElement('div');
                radio.className = 'option-radio';
                
                const label = document.createElement('div');
                label.className = 'option-label';
                setTextContent(label, optionText);
                
                optionItem.appendChild(radio);
                optionItem.appendChild(label);
                
                if (userAnswers[index] === optionText) {
                    optionItem.classList.add('selected');
                }
                
                optionItem.addEventListener('click', () => {
                    // Remove selected from all options
                    optionsContainerEl.querySelectorAll('.option-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    // Add selected to clicked option
                    optionItem.classList.add('selected');
                    userAnswers[index] = optionText;
                    updateQuizProgress();
                });
                optionsContainerEl.appendChild(optionItem);
            });
            updateNavigationButtons();

            if (markedQuestions[index]) {
                markQuestionBtn.classList.add('active');
                markQuestionBtn.style.background = 'var(--accent-amber)';
                markQuestionBtn.style.color = 'white';
                setTextContent(markQuestionBtn, '🚩 Marked');
            } else {
                markQuestionBtn.classList.remove('active');
                markQuestionBtn.style.background = '';
                markQuestionBtn.style.color = '';
                setTextContent(markQuestionBtn, '🚩 Mark');
            }
        };
        
        const updateNavigationButtons = () => {
            if (!prevBtn || !nextBtn || !submitBtn) return;
            prevBtn.disabled = currentQuestionIndex === 0;
            const isLast = currentQuestionIndex === (currentQuizQuestions.length - 1);
            nextBtn.style.display = isLast ? 'none' : 'inline-flex';
            submitBtn.style.display = isLast ? 'inline-flex' : 'none';
        };

        const updateQuizProgress = () => {
            if (!answeredCountEl || !quizProgressFill || !progressPercentageEl || !currentQuizQuestions.length) return;
            const answeredCount = userAnswers.filter(answer => answer !== null).length;
            setTextContent(answeredCountEl, answeredCount);
            const percentage = Math.round((answeredCount / currentQuizQuestions.length) * 100);
            quizProgressFill.style.width = `${percentage}%`;
            setTextContent(progressPercentageEl, `${percentage}%`);
        };

        const startTimer = () => {
            if (!timerEl) return;
            let timeLeft = TIME_LIMIT_SECONDS;
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            const updateDisplay = () => {
                if (!timerEl) return;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                setTextContent(timerEl, `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            };
            updateDisplay();
            timerInterval = setInterval(() => {
                timeLeft--;
                updateDisplay();
                if (timeLeft <= 0) {
                    if (timerInterval) {
                        clearInterval(timerInterval);
                        timerInterval = null;
                    }
                    submitQuiz();
                }
            }, 1000);
        };

        const submitQuiz = () => {
            // Clear timer
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            if (!quizStartTime || !currentQuizQuestions || currentQuizQuestions.length === 0) {
                console.error('Cannot submit quiz: invalid state');
                return;
            }

            const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
            score = 0;
            const wrongAnswers = [];
            
            userAnswers.forEach((answer, index) => {
                if (!currentQuizQuestions[index]) return;
                if (answer === currentQuizQuestions[index].answer) { 
                    score++; 
                } else {
                    wrongAnswers.push({
                        question: currentQuizQuestions[index].question,
                        userAnswer: answer || 'Not Answered',
                        correctAnswer: currentQuizQuestions[index].answer
                    });
                }
            });
            
            if (submitBtn) {
                submitBtn.disabled = true;
                const btnText = submitBtn.querySelector('.btn-text');
                if (btnText) {
                    setTextContent(btnText, 'Submitting...');
                } else {
                    setTextContent(submitBtn, 'Submitting...');
                }
            }

            const params = new URLSearchParams(window.location.search);
            const userName = params.get('name') || 'Unknown';
            const courseCode = params.get('course') || '';
            const department = params.get('department') || '';
            
            try {
                // Record quiz result in user data
                const result = userDataManager.recordQuizResult(
                    courseCode, 
                    currentSegmentNumber, 
                    score, 
                    currentQuizQuestions.length, 
                    timeSpent, 
                    markedQuestions.filter(marked => marked), 
                    wrongAnswers
                );
                
                let resultsMessage = `✅ Quiz Result: ${sanitizeHTML(userName)} ✅\n\n`;
                resultsMessage += `Dept: ${sanitizeHTML(department)}\nCourse: ${sanitizeHTML(courseCode)}\n`;
                resultsMessage += `Segment: ${currentSegmentNumber}\n`;
                resultsMessage += `Score: ${score} out of ${currentQuizQuestions.length}`;
                if (result && result.xpGained) {
                    resultsMessage += `\nXP Gained: ${result.xpGained}`;
                }
                sendNotification(resultsMessage);

                displayResultsOnScreen(result);
            } catch (error) {
                console.error('Error submitting quiz:', error);
                displayResultsOnScreen(null);
            }
        };

        const displayResultsOnScreen = (gameResult = null) => {
            if (!detailedResultsEl || !scoreTextEl || !scorePercentageEl || !feedbackTextEl || !resultsContainer) return;
            
            detailedResultsEl.style.display = 'none';
            setTextContent(scoreTextEl, `Your Score: ${score} / ${currentQuizQuestions.length}`);
            const percentage = Math.round((score / currentQuizQuestions.length) * 100);
            setTextContent(scorePercentageEl, `${percentage}%`);

            if (percentage >= 80) setTextContent(feedbackTextEl, "Excellent work!");
            else if (percentage >= 50) setTextContent(feedbackTextEl, "Good job! Keep practicing.");
            else setTextContent(feedbackTextEl, "Review the material and try again.");
            
            // Show XP and achievements if available
            if (gameResult && gameResult.xpGained) {
                const xpDisplay = document.createElement('div');
                xpDisplay.className = 'xp-display';
                
                const xpGainedDiv = document.createElement('div');
                xpGainedDiv.className = 'xp-gained';
                setTextContent(xpGainedDiv, `+${gameResult.xpGained} XP`);
                xpDisplay.appendChild(xpGainedDiv);
                
                if (gameResult.newAchievements && gameResult.newAchievements.length > 0) {
                    const achievementsDiv = document.createElement('div');
                    achievementsDiv.className = 'new-achievements';
                    const plural = gameResult.newAchievements.length > 1 ? 's' : '';
                    setTextContent(achievementsDiv, `🏆 New Achievement${plural} Unlocked!`);
                    xpDisplay.appendChild(achievementsDiv);
                }
                
                const resultsActions = resultsContainer.querySelector('.results-actions');
                if (resultsActions) {
                    resultsContainer.insertBefore(xpDisplay, resultsActions);
                } else {
                    resultsContainer.appendChild(xpDisplay);
                }
            }
            
            showScreen(resultsContainer);
        };

        const toggleDetailedResults = () => {
            if (!detailedResultsEl || !reviewBtn || !filterMarkedBtn) return;

            if (detailedResultsEl.style.display === 'none' || detailedResultsEl.style.display === '') {
                detailedResultsEl.innerHTML = ''; // Clear previous results
                
                if (!currentQuizQuestions || currentQuizQuestions.length === 0) {
                    console.error('No quiz questions available for review');
                    return;
                }

                currentQuizQuestions.forEach((q, i) => {
                    if (!q) return;
                    const userAnswer = userAnswers[i] || 'Not Answered';
                    const isCorrect = userAnswer === q.answer;
                    const isMarked = markedQuestions[i];

                    const statusIcon = isCorrect ? '✓' : '✗';
                    const statusText = isCorrect ? 'Correct' : 'Incorrect';
                    const statusClass = isCorrect ? 'correct-status' : 'incorrect-status';
                    const markedClass = isMarked ? 'marked-review' : '';
                    
                    // Create review card using DOM methods to prevent XSS
                    const reviewCard = document.createElement('div');
                    reviewCard.className = `review-card ${markedClass}`;
                    
                    const header = document.createElement('div');
                    header.className = 'review-card-header';
                    
                    const questionNum = document.createElement('span');
                    questionNum.className = 'review-question-number';
                    setTextContent(questionNum, `Question ${i + 1}`);
                    header.appendChild(questionNum);
                    
                    if (isMarked) {
                        const markedIcon = document.createElement('span');
                        markedIcon.className = 'review-marked-icon';
                        setTextContent(markedIcon, '🚩 Marked');
                        header.appendChild(markedIcon);
                    }
                    
                    const status = document.createElement('span');
                    status.className = `review-status ${statusClass}`;
                    setTextContent(status, `${statusIcon} ${statusText}`);
                    header.appendChild(status);
                    
                    reviewCard.appendChild(header);
                    
                    const body = document.createElement('div');
                    body.className = 'review-card-body';
                    
                    const questionText = document.createElement('p');
                    questionText.className = 'review-question-text';
                    setTextContent(questionText, q.question);
                    body.appendChild(questionText);
                    
                    const userAnswerP = document.createElement('p');
                    userAnswerP.className = `review-answer user-answer ${isCorrect ? 'correct-answer' : 'incorrect-answer'}`;
                    const userAnswerStrong = document.createElement('strong');
                    setTextContent(userAnswerStrong, 'Your Answer: ');
                    userAnswerP.appendChild(userAnswerStrong);
                    userAnswerP.appendChild(document.createTextNode(userAnswer));
                    body.appendChild(userAnswerP);
                    
                    if (!isCorrect) {
                        const correctAnswerP = document.createElement('p');
                        correctAnswerP.className = 'review-answer correct-answer-reveal';
                        const correctAnswerStrong = document.createElement('strong');
                        setTextContent(correctAnswerStrong, 'Correct Answer: ');
                        correctAnswerP.appendChild(correctAnswerStrong);
                        correctAnswerP.appendChild(document.createTextNode(q.answer || 'N/A'));
                        body.appendChild(correctAnswerP);
                    }
                    
                    // Add explanation if available and explanations are enabled
                    if (explanationsEnabled && q.explanation) {
                        const explanationDiv = document.createElement('div');
                        explanationDiv.className = 'question-explanation';
                        const explanationStrong = document.createElement('strong');
                        setTextContent(explanationStrong, '💡 Explanation: ');
                        explanationDiv.appendChild(explanationStrong);
                        explanationDiv.appendChild(document.createTextNode(q.explanation));
                        body.appendChild(explanationDiv);
                    }
                    
                    reviewCard.appendChild(body);
                    detailedResultsEl.appendChild(reviewCard);
                });

                detailedResultsEl.style.display = 'block';
                setTextContent(reviewBtn, 'Hide Review');
                if (markedQuestions.includes(true)) {
                    filterMarkedBtn.style.display = 'inline-flex';
                }
                
                // Add explanation toggle button
                if (!document.getElementById('explanation-toggle')) {
                    const resultsActions = document.querySelector('.results-actions');
                    if (resultsActions) {
                        const explanationToggle = document.createElement('button');
                        explanationToggle.id = 'explanation-toggle';
                        explanationToggle.className = 'nav-btn';
                        setTextContent(explanationToggle, explanationsEnabled ? 'Hide Explanations' : 'Show Explanations');
                        explanationToggle.addEventListener('click', () => {
                            explanationsEnabled = !explanationsEnabled;
                            setTextContent(explanationToggle, explanationsEnabled ? 'Hide Explanations' : 'Show Explanations');
                            toggleDetailedResults(); // Refresh the view
                            toggleDetailedResults(); // Show again with explanations
                        });
                        resultsActions.appendChild(explanationToggle);
                    }
                }
            } else {
                detailedResultsEl.style.display = 'none';
                setTextContent(reviewBtn, 'Review Answers');
                filterMarkedBtn.style.display = 'none';
                isReviewFiltered = false;
                setTextContent(filterMarkedBtn, 'Show Marked Only');
                
                // Remove explanation toggle
                const explanationToggle = document.getElementById('explanation-toggle');
                if (explanationToggle) {
                    explanationToggle.remove();
                }
            }
        };

        // --- Event Listeners ---
        if (markQuestionBtn) {
            markQuestionBtn.addEventListener('click', () => {
                markedQuestions[currentQuestionIndex] = !markedQuestions[currentQuestionIndex];
                loadQuestion(currentQuestionIndex);
            });
        }

        if (filterMarkedBtn) {
            filterMarkedBtn.addEventListener('click', () => {
                isReviewFiltered = !isReviewFiltered;
                const allResultItems = detailedResultsEl ? detailedResultsEl.querySelectorAll('.review-card') : [];
                if (isReviewFiltered) {
                    allResultItems.forEach(item => {
                        item.style.display = item.classList.contains('marked-review') ? 'block' : 'none';
                    });
                    setTextContent(filterMarkedBtn, 'Show All');
                } else {
                    allResultItems.forEach(item => item.style.display = 'block');
                    setTextContent(filterMarkedBtn, 'Show Marked Only');
                }
            });
        }

        if (startSegment1Btn) {
            startSegment1Btn.addEventListener('click', () => startQuizForSegment(1));
        }
        if (startSegment2Btn) {
            startSegment2Btn.addEventListener('click', () => startQuizForSegment(2));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentQuestionIndex < currentQuizQuestions.length - 1) {
                    currentQuestionIndex++;
                    loadQuestion(currentQuestionIndex);
                }
            });
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentQuestionIndex > 0) {
                    currentQuestionIndex--;
                    loadQuestion(currentQuestionIndex);
                }
            });
        }
        if (submitBtn) {
            submitBtn.addEventListener('click', submitQuiz);
        }
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                if (timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }
                showScreen(segmentSelectionEl);
            });
        }
        if (reviewBtn) {
            reviewBtn.addEventListener('click', toggleDetailedResults);
        }

        // --- Initial Page Load Logic ---
        const params = new URLSearchParams(window.location.search);
        const userName = params.get('name');
        const courseCode = params.get('course');
        
        // Validate course code to prevent path traversal
        const validCourseCodePattern = /^[A-Z0-9]+$/;
        if (!userName || !courseCode || !validCourseCodePattern.test(courseCode)) {
            console.error('Invalid course code or missing parameters');
            window.location.href = 'home.html';
            return;
        }

        const userInfoDisplay = safeGetElement('user-info-display');
        if (userInfoDisplay) {
            setTextContent(userInfoDisplay, `User: ${sanitizeHTML(userName)} | Course: ${sanitizeHTML(courseCode)}`);
        }
        
        const showCourseNotAvailableError = (message = 'This course has not been uploaded yet. Please try another one.') => {
            if (!loadingQuizEl) return;
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-message-container';
            
            const errorIcon = document.createElement('div');
            errorIcon.className = 'error-icon';
            setTextContent(errorIcon, '!');
            errorContainer.appendChild(errorIcon);
            
            const errorTitle = document.createElement('h3');
            errorTitle.className = 'error-title';
            setTextContent(errorTitle, 'Course Not Available');
            errorContainer.appendChild(errorTitle);
            
            const errorSubtitle = document.createElement('p');
            errorSubtitle.className = 'error-subtitle';
            setTextContent(errorSubtitle, message);
            errorContainer.appendChild(errorSubtitle);
            
            const backLink = document.createElement('a');
            backLink.href = 'home.html';
            backLink.className = 'back-link-btn';
            setTextContent(backLink, '← Go Back to Course Selection');
            errorContainer.appendChild(backLink);
            
            loadingQuizEl.innerHTML = '';
            loadingQuizEl.appendChild(errorContainer);
            loadingQuizEl.style.display = 'block';
        };

        const script = document.createElement('script');
        script.src = `courses/${courseCode}.js`;
        
        let scriptLoadTimeout;
        script.onload = () => {
            if (scriptLoadTimeout) clearTimeout(scriptLoadTimeout);
            try {
                if (window.quizData && window.quizData.questions && Array.isArray(window.quizData.questions) && window.quizData.questions.length > 0) {
                    fullCourseQuestions = window.quizData.questions;
                    showScreen(segmentSelectionEl);
                } else {
                    showCourseNotAvailableError();
                }
            } catch (error) {
                console.error('Error processing quiz data:', error);
                showCourseNotAvailableError('Error loading course data. Please try again.');
            }
        };
        
        script.onerror = () => {
            if (scriptLoadTimeout) clearTimeout(scriptLoadTimeout);
            showCourseNotAvailableError();
        };
        
        // Set timeout for script loading (10 seconds)
        scriptLoadTimeout = setTimeout(() => {
            console.error('Script load timeout');
            showCourseNotAvailableError('Course loading timed out. Please check your connection and try again.');
        }, 10000);
        
        document.head.appendChild(script);
    }
    
    // =========================================================================
    // 4. HELP PAGE LOGIC (help.html)
    // =========================================================================
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length > 0) {
        faqQuestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const answer = btn.nextElementSibling;
                const icon = btn.querySelector('.faq-icon');
                if (!answer || !icon) return;
                
                const isActive = btn.classList.toggle('active');

                if (isActive) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    setTextContent(icon, '−');
                } else {
                    answer.style.maxHeight = '0px';
                    setTextContent(icon, '+');
                }
            });
        });
    }
});

// =========================================================================
// GLOBAL FUNCTIONS (Called from HTML onclick attributes)
// =========================================================================

// Placed globally for the onclick attribute in contact.html
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => console.error('Failed to copy: ', err));
}

// Global function to show user dashboard
function showUserDashboard() {
    window.location.href = 'home.html';
}