document.addEventListener('DOMContentLoaded', () => {
    // Initialize home dashboard only if we're on the home page
    const homeDashboard = document.getElementById('home-dashboard');
    if (!homeDashboard) return;

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
        // 🔒 NO USER DATA - Redirect back to login
        console.log('No user data found, redirecting to login');
        window.location.href = 'index.html';
        return;
    }

    // Initialize home dashboard
    initializeHomeDashboard(currentUser);

    function initializeHomeDashboard(user) {
        // Update welcome message
        const userWelcome = safeGetElement('user-welcome');
        if (userWelcome) {
            setTextContent(userWelcome, `Welcome back, ${user.name || 'User'}! (${user.department || 'Unknown'})`);
        }

        // Populate course selection based on user's department
        populateCourseSelection(user.department);

        // Update stats
        const totalQuizzesEl = safeGetElement('total-quizzes');
        const averageScoreEl = safeGetElement('average-score');
        const studyStreakEl = safeGetElement('study-streak');
        const userLevelEl = safeGetElement('user-level');

        if (totalQuizzesEl) setTextContent(totalQuizzesEl, user.totalQuizzesTaken || 0);
        if (averageScoreEl) setTextContent(averageScoreEl, `${user.averageScore || 0}%`);
        if (studyStreakEl) setTextContent(studyStreakEl, user.studyStreak || 0);
        if (userLevelEl) setTextContent(userLevelEl, user.level || 1);

        // Create performance chart (last 10 quizzes)
        const quizHistory = Array.isArray(user.quizHistory) ? user.quizHistory : [];
        createPerformanceChart(quizHistory.slice(-10));

        // Display recent achievements
        const achievements = Array.isArray(user.achievements) ? user.achievements : [];
        displayRecentAchievements(achievements);

        // Display recent activity
        displayRecentActivity(quizHistory.slice(-5));

        // Setup event listeners
        setupEventListeners();
        
        // Add welcome animation
        animateWelcome();
    }

    function animateWelcome() {
        const welcomeEl = safeGetElement('user-welcome');
        if (welcomeEl) {
            welcomeEl.style.opacity = '0';
            welcomeEl.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                welcomeEl.style.transition = 'all 0.5s ease';
                welcomeEl.style.opacity = '1';
                welcomeEl.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    function populateCourseSelection(department) {
        const coursesByDepartment = {
            "Computer Science": [
                { code: "MTH121", name: "Elementary Mathematics II" },
                { code: "GST121", name: "General Studies" },
                { code: "COS121", name: "Problem Solving" },
                { code: "PHY121", name: "Electricity & Magnetism" },
                { code: "CSC121", name: "Web Development with Django" },
                { code: "CSC122", name: "Web Technologies" },
                { code: "PHY122", name: "Physics Practicals" }
            ],
            "Cyber Security": [
                { code: "MTH121", name: "Elementary Mathematics II" },
                { code: "GST121", name: "General Studies" },
                { code: "COS121", name: "Problem Solving" },
                { code: "PHY121", name: "Electricity & Magnetism" },
                { code: "CYB121", name: "Ethical Issues In Cyber Security" },
                { code: "CYB122", name: "Critical Thinking" },
                { code: "PHY122", name: "Physics Practicals" }
            ],
            "Data Science": [
                { code: "MTH121", name: "Elementary Mathematics II" },
                { code: "GST121", name: "General Studies" },
                { code: "COS121", name: "Problem Solving" },
                { code: "PHY121", name: "Electricity & Magnetism" },
                { code: "DTS121", name: "Web Development with Django" },
                { code: "DTS122", name: "Web Technologies" },
                { code: "PHY122", name: "Physics Practicals" }
            ],
            "Information Technology": [
                { code: "MTH121", name: "Elementary Mathematics II" },
                { code: "GST121", name: "General Studies" },
                { code: "COS121", name: "Problem Solving" },
                { code: "PHY121", name: "Electricity & Magnetism" },
                { code: "IFT121", name: "Ethical Issues in Cyber Security" },
                { code: "IFT122", name: "Critical Thinking" },
                { code: "PHY122", name: "Physics Practicals" }
            ],
            "Software Engineering": [
                { code: "MTH121", name: "Elementary Mathematics II" },
                { code: "GST121", name: "General Studies" },
                { code: "COS121", name: "Problem Solving" },
                { code: "PHY121", name: "Electricity & Magnetism" },
                { code: "SEN121", name: "Web Development with Django" },
                { code: "SEN122", name: "Web Technologies" },
                { code: "PHY122", name: "Physics Practicals" }
            ]
        };

        const courseSelect = safeGetElement('quick-course-select');
        if (!courseSelect) return;
        
        const courses = coursesByDepartment[department] || [];
        
        // Clear existing options safely
        courseSelect.innerHTML = '<option value="" disabled selected>-- Select Course --</option>';
        
        // Add department-specific courses
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.code;
            option.textContent = `${course.code} - ${course.name}`;
            courseSelect.appendChild(option);
        });
        
        // Add visual indicator of department
        const courseCard = courseSelect.closest('.action-card');
        if (courseCard) {
            const existingIndicator = courseCard.querySelector('.department-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
            
            const departmentIndicator = document.createElement('div');
            departmentIndicator.className = 'department-indicator';
            const indicatorText = document.createTextNode('📚 Showing courses for: ');
            const strong = document.createElement('strong');
            strong.textContent = department || 'Unknown';
            departmentIndicator.appendChild(indicatorText);
            departmentIndicator.appendChild(strong);
            
            const courseSelectionInline = courseCard.querySelector('.course-selection-inline');
            if (courseSelectionInline) {
                courseCard.insertBefore(departmentIndicator, courseSelectionInline);
            }
        }
    }

    function createPerformanceChart(recentQuizzes) {
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

        if (!Array.isArray(recentQuizzes) || recentQuizzes.length === 0) {
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
            const labels = recentQuizzes.map((quiz, index) => `Quiz ${index + 1}`);
            const scores = recentQuizzes.map(quiz => {
                const percentage = quiz && typeof quiz.percentage === 'number' ? quiz.percentage : 0;
                return Math.max(0, Math.min(100, percentage)); // Clamp between 0-100
            });

            // Create gradient for chart
            const ctx = chartCanvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(107, 70, 193, 0.3)');
            gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Score (%)',
                        data: scores,
                        borderColor: '#6B46C1',
                        backgroundColor: gradient,
                        borderWidth: 4,
                        fill: true,
                        tension: 0.5,
                        pointBackgroundColor: '#6B46C1',
                        pointBorderColor: '#FFFFFF',
                        pointBorderWidth: 3,
                        pointRadius: 8,
                        pointHoverRadius: 10,
                        pointHoverBackgroundColor: '#8B5CF6',
                        pointHoverBorderColor: '#FFFFFF',
                        pointHoverBorderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                            padding: 12,
                            titleFont: {
                                family: 'Poppins',
                                size: 14,
                                weight: '600'
                            },
                            bodyFont: {
                                family: 'Poppins',
                                size: 13
                            },
                            borderColor: '#6B46C1',
                            borderWidth: 2,
                            cornerRadius: 8,
                            displayColors: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                color: 'rgba(226, 232, 240, 0.5)',
                                lineWidth: 1
                            },
                            ticks: {
                                font: {
                                    family: 'Poppins',
                                    size: 12,
                                    weight: '500'
                                },
                                color: '#64748B',
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    family: 'Poppins',
                                    size: 12,
                                    weight: '500'
                                },
                                color: '#64748B'
                            }
                        }
                    },
                    elements: {
                        point: {
                            hoverRadius: 10
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

    function displayRecentAchievements(userAchievements) {
        const container = safeGetElement('recent-achievements');
        if (!container) return;
        
        const allAchievements = [
            { id: 'first_quiz', name: 'Getting Started', description: 'Complete your first quiz', icon: '🎯' },
            { id: 'perfect_score', name: 'Perfect Score', description: 'Score 100% on a quiz', icon: '💯' },
            { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a quiz in under 15 minutes', icon: '⚡' },
            { id: 'streak_3', name: '3-Day Streak', description: 'Study for 3 consecutive days', icon: '🔥' },
            { id: 'streak_7', name: 'Week Warrior', description: 'Study for 7 consecutive days', icon: '📅' },
            { id: 'quiz_master_10', name: 'Quiz Master', description: 'Complete 10 quizzes', icon: '🎓' },
            { id: 'perfectionist', name: 'Perfectionist', description: 'Score 100% on 5 quizzes', icon: '🏆' }
        ];

        const achievements = Array.isArray(userAchievements) ? userAchievements : [];
        const recentAchievements = allAchievements
            .filter(achievement => achievements.includes(achievement.id))
            .slice(-3); // Show last 3 achievements

        container.innerHTML = '';
        if (recentAchievements.length === 0) {
            const noDataP = document.createElement('p');
            noDataP.className = 'no-data';
            noDataP.textContent = '🎯 Complete your first quiz to earn achievements!';
            container.appendChild(noDataP);
            return;
        }

        recentAchievements.forEach(achievement => {
            const achievementEl = document.createElement('div');
            achievementEl.className = 'achievement-preview';
            
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
            container.appendChild(achievementEl);
        });
    }

    function displayRecentActivity(recentQuizzes) {
        const container = safeGetElement('recent-activity-home');
        if (!container) return;
        
        if (!Array.isArray(recentQuizzes) || recentQuizzes.length === 0) {
            container.innerHTML = '';
            const noDataP = document.createElement('p');
            noDataP.className = 'no-data';
            noDataP.textContent = '📋 No recent activity to display.';
            container.appendChild(noDataP);
            return;
        }

        container.innerHTML = '';
        recentQuizzes.reverse().forEach(quiz => {
            if (!quiz) return;
            
            const date = quiz.date ? new Date(quiz.date) : new Date();
            const timeAgo = getTimeAgo(date);
            const percentage = quiz.percentage || 0;
            
            const activityEl = document.createElement('div');
            activityEl.className = 'activity-preview';
            
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

    function setupEventListeners() {
        // Course selection change
        const courseSelect = safeGetElement('quick-course-select');
        const startBtn = safeGetElement('quick-start-btn');
        if (courseSelect && startBtn) {
            courseSelect.addEventListener('change', function() {
                startBtn.disabled = !this.value;
            });
        }

        // Quick start quiz
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                if (!courseSelect) return;
                const selectedCourse = courseSelect.value;
                
                if (selectedCourse) {
                    // Add loading state
                    this.disabled = true;
                    const btnText = this.querySelector('.btn-text');
                    const btnIcon = this.querySelector('.btn-icon');
                    if (btnText) setTextContent(btnText, 'Starting Quiz...');
                    if (btnIcon) setTextContent(btnIcon, '⏳');
                    
                    try {
                        const userData = safeGetLocalStorage('sureSuccessUserData', { users: {}, currentUser: null });
                        const currentUser = userData.currentUser && userData.users ? userData.users[userData.currentUser] : null;
                        
                        if (!currentUser) {
                            console.error('Current user not found');
                            this.disabled = false;
                            if (btnText) setTextContent(btnText, 'Start Quiz');
                            if (btnIcon) setTextContent(btnIcon, '🚀');
                            return;
                        }
                        
                        const encodedName = encodeURIComponent(currentUser.name || '');
                        const encodedCourse = encodeURIComponent(selectedCourse);
                        const encodedDepartment = encodeURIComponent(currentUser.department || '');
                        
                        // Small delay for better UX
                        setTimeout(() => {
                            window.location.href = `quiz.html?name=${encodedName}&course=${encodedCourse}&department=${encodedDepartment}`;
                        }, 500);
                    } catch (error) {
                        console.error('Error starting quiz:', error);
                        this.disabled = false;
                        if (btnText) setTextContent(btnText, 'Start Quiz');
                        if (btnIcon) setTextContent(btnIcon, '🚀');
                    }
                }
            });
        }

        // Practice weak areas
        const practiceWeakBtn = safeGetElement('practice-weak-btn');
        if (practiceWeakBtn) {
            practiceWeakBtn.addEventListener('click', function() {
                this.disabled = true;
                const btnText = this.querySelector('.btn-text');
                const btnIcon = this.querySelector('.btn-icon');
                if (btnText) setTextContent(btnText, 'Finding Weak Areas...');
                if (btnIcon) setTextContent(btnIcon, '🔍');
                
                try {
                    const userData = safeGetLocalStorage('sureSuccessUserData', { users: {}, currentUser: null });
                    const currentUser = userData.currentUser && userData.users ? userData.users[userData.currentUser] : null;
                    
                    if (!currentUser) {
                        console.error('Current user not found');
                        this.disabled = false;
                        if (btnText) setTextContent(btnText, 'Practice Weak Areas');
                        if (btnIcon) setTextContent(btnIcon, '🎯');
                        return;
                    }
                    
                    // Find course with most weak areas
                    let maxWeakAreas = 0;
                    let targetCourse = null;
                    
                    const weakAreas = currentUser.weakAreas || {};
                    Object.keys(weakAreas).forEach(courseCode => {
                        const weakCount = Object.keys(weakAreas[courseCode] || {}).length;
                        if (weakCount > maxWeakAreas) {
                            maxWeakAreas = weakCount;
                            targetCourse = courseCode;
                        }
                    });
                    
                    if (targetCourse) {
                        const encodedName = encodeURIComponent(currentUser.name || '');
                        const encodedCourse = encodeURIComponent(targetCourse);
                        const encodedDepartment = encodeURIComponent(currentUser.department || '');
                        
                        setTimeout(() => {
                            window.location.href = `quiz.html?name=${encodedName}&course=${encodedCourse}&department=${encodedDepartment}`;
                        }, 800);
                    } else {
                        // Reset button state
                        this.disabled = false;
                        if (btnText) setTextContent(btnText, 'Practice Weak Areas');
                        if (btnIcon) setTextContent(btnIcon, '🎯');
                        
                        // Show friendly message
                        const messageEl = document.createElement('div');
                        messageEl.className = 'friendly-message';
                        
                        const messageContent = document.createElement('div');
                        messageContent.className = 'message-content';
                        
                        const iconDiv = document.createElement('div');
                        iconDiv.className = 'message-icon';
                        iconDiv.textContent = '🎯';
                        messageContent.appendChild(iconDiv);
                        
                        const h4 = document.createElement('h4');
                        h4.textContent = 'Great News!';
                        messageContent.appendChild(h4);
                        
                        const p = document.createElement('p');
                        p.textContent = 'No weak areas identified yet. Take a few quizzes first to get personalized recommendations!';
                        messageContent.appendChild(p);
                        
                        const closeBtn = document.createElement('button');
                        closeBtn.className = 'message-close';
                        closeBtn.textContent = 'Got it!';
                        closeBtn.addEventListener('click', () => messageEl.remove());
                        messageContent.appendChild(closeBtn);
                        
                        messageEl.appendChild(messageContent);
                        document.body.appendChild(messageEl);
                        
                        // Auto remove after 5 seconds
                        setTimeout(() => {
                            if (messageEl.parentElement) {
                                messageEl.remove();
                            }
                        }, 5000);
                    }
                } catch (error) {
                    console.error('Error finding weak areas:', error);
                    this.disabled = false;
                    if (btnText) setTextContent(btnText, 'Practice Weak Areas');
                    if (btnIcon) setTextContent(btnIcon, '🎯');
                }
            });
        }

        // Logout functionality
        const logoutBtn = safeGetElement('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to logout?')) {
                    try {
                        const userData = safeGetLocalStorage('sureSuccessUserData', {});
                        userData.currentUser = null;
                        localStorage.setItem('sureSuccessUserData', JSON.stringify(userData));
                        window.location.href = 'index.html';
                    } catch (error) {
                        console.error('Error during logout:', error);
                        alert('Error during logout. Please try again.');
                    }
                }
            });
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
});
