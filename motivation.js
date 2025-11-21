// Motivation & Retention System
// Handles celebrations, achievements, streaks, and motivational elements

class MotivationSystem {
    constructor() {
        this.motivationalQuotes = [
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
            { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
            { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
            { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
            { text: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.", author: "Richard Feynman" },
            { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" }
        ];

        this.successStories = [
            { text: "I went from failing my first quiz to scoring 95% consistently. The adaptive learning really helped me focus on my weak areas!", author: "Anonymous Student" },
            { text: "The study streak feature kept me motivated. I maintained a 30-day streak and saw my scores improve dramatically.", author: "CS Student" },
            { text: "Setting daily goals and tracking my progress made all the difference. I passed my final exam with flying colors!", author: "Engineering Student" },
            { text: "The flashcard system helped me memorize complex concepts. I couldn't have done it without this platform.", author: "IT Student" }
        ];

        this.studySessionStartTime = null;
        this.studySessionTimer = null;
        this.init();
    }

    init() {
        this.startStudySession();
        this.showDailyMotivation();
        this.checkMilestones();
    }

    // Progress Celebrations
    celebrateAchievement(achievementData) {
        this.showConfetti();
        this.showAchievementUnlock(achievementData);
        this.playSuccessSound();
    }

    celebratePerfectScore() {
        this.showCelebrationAnimation('🎉 PERFECT SCORE! 🎉');
        this.showConfetti();
        this.showNotification('🏆 Amazing! You got a perfect score!', 'success');
    }

    celebrateNewRecord(recordType, value) {
        this.showCelebrationAnimation(`🏆 NEW RECORD! 🏆`);
        this.showNotification(`🎯 New ${recordType} record: ${value}!`, 'success');
        this.highlightPersonalRecord(recordType);
    }

    celebrateLevelUp(newLevel) {
        this.showLevelUpAnimation(newLevel);
        this.showConfetti();
        this.showNotification(`🌟 Level Up! You're now Level ${newLevel}!`, 'success');
    }

    celebrateStreak(streakDays) {
        if (streakDays % 7 === 0) { // Weekly milestones
            this.showCelebrationAnimation(`🔥 ${streakDays} DAY STREAK! 🔥`);
            this.showNotification(`🔥 Incredible! ${streakDays} days in a row!`, 'success');
        } else if (streakDays === 3 || streakDays === 5) {
            this.showNotification(`🔥 ${streakDays} day streak! Keep it up!`, 'success');
        }
    }

    // Visual Celebrations
    showCelebrationAnimation(text) {
        const celebration = document.createElement('div');
        celebration.className = 'celebration-animation';
        celebration.textContent = text;
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
        }, 3000);
    }

    showLevelUpAnimation(level) {
        const levelUp = document.createElement('div');
        levelUp.className = 'level-up-animation';
        levelUp.innerHTML = `<div class="level-up-text">LEVEL ${level}!</div>`;
        document.body.appendChild(levelUp);
        
        setTimeout(() => {
            levelUp.remove();
        }, 3000);
    }

    showConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti';
        document.body.appendChild(confettiContainer);

        for (let i = 0; i < 50; i++) {
            const confettiPiece = document.createElement('div');
            confettiPiece.className = 'confetti-piece';
            confettiPiece.style.left = Math.random() * 100 + 'vw';
            confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confettiPiece.style.animationDelay = Math.random() * 2 + 's';
            confettiPiece.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confettiContainer.appendChild(confettiPiece);
        }

        setTimeout(() => {
            confettiContainer.remove();
        }, 4000);
    }

    showAchievementUnlock(achievement) {
        const achievementEl = document.createElement('div');
        achievementEl.className = 'achievement-unlock';
        achievementEl.innerHTML = `
            <div class="achievement-unlock-header">
                <div class="achievement-unlock-icon">🏆</div>
                <div class="achievement-unlock-title">Achievement Unlocked!</div>
            </div>
            <div class="achievement-unlock-description">${achievement.name}: ${achievement.description}</div>
        `;
        document.body.appendChild(achievementEl);

        setTimeout(() => {
            achievementEl.style.animation = 'achievement-slide-in 0.5s ease-out reverse';
            setTimeout(() => achievementEl.remove(), 500);
        }, 4000);
    }

    showMilestonePopup(milestone) {
        const popup = document.createElement('div');
        popup.className = 'milestone-popup';
        popup.innerHTML = `
            <div class="milestone-icon">${milestone.icon}</div>
            <div class="milestone-title">${milestone.title}</div>
            <div class="milestone-description">${milestone.description}</div>
            <button class="milestone-close" onclick="this.parentElement.remove()">Awesome!</button>
        `;
        document.body.appendChild(popup);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (popup.parentElement) {
                popup.remove();
            }
        }, 10000);
    }

    // Study Streak Visualization
    displayStudyStreak(streakDays) {
        const streakContainer = document.querySelector('.streak-display') || this.createStreakDisplay();
        const streakNumber = streakContainer.querySelector('.streak-number');
        const streakFire = streakContainer.querySelector('.streak-fire');
        
        streakNumber.textContent = streakDays;
        
        // Add fire intensity based on streak length
        if (streakDays >= 30) {
            streakFire.textContent = '🔥🔥🔥';
        } else if (streakDays >= 14) {
            streakFire.textContent = '🔥🔥';
        } else if (streakDays >= 7) {
            streakFire.textContent = '🔥';
        } else {
            streakFire.textContent = '✨';
        }
    }

    createStreakDisplay() {
        const streakDisplay = document.createElement('div');
        streakDisplay.className = 'streak-display';
        streakDisplay.innerHTML = `
            <div class="streak-fire">🔥</div>
            <span class="streak-number">0</span>
            <div class="streak-label">Day Study Streak</div>
        `;
        
        // Insert into dashboard if available
        const dashboard = document.querySelector('.stats-summary') || document.querySelector('main');
        if (dashboard) {
            dashboard.appendChild(streakDisplay);
        }
        
        return streakDisplay;
    }

    // Personal Records
    displayPersonalRecords(userData) {
        const records = this.calculatePersonalRecords(userData);
        const recordsContainer = this.getOrCreateRecordsContainer();
        
        recordsContainer.innerHTML = '';
        records.forEach(record => {
            const recordCard = document.createElement('div');
            recordCard.className = `record-card ${record.isNew ? 'new-record' : ''}`;
            recordCard.innerHTML = `
                <div class="record-icon">${record.icon}</div>
                <div class="record-value">${record.value}</div>
                <div class="record-label">${record.label}</div>
            `;
            recordsContainer.appendChild(recordCard);
        });
    }

    calculatePersonalRecords(userData) {
        const quizHistory = userData.quizHistory || [];
        const records = [];

        if (quizHistory.length > 0) {
            // Best Score
            const bestScore = Math.max(...quizHistory.map(q => q.percentage));
            records.push({
                icon: '🎯',
                value: `${bestScore}%`,
                label: 'Best Score',
                isNew: this.isNewRecord('bestScore', bestScore)
            });

            // Fastest Quiz
            const fastestTime = Math.min(...quizHistory.map(q => q.timeSpent));
            const minutes = Math.floor(fastestTime / 60);
            const seconds = fastestTime % 60;
            records.push({
                icon: '⚡',
                value: `${minutes}:${seconds.toString().padStart(2, '0')}`,
                label: 'Fastest Quiz',
                isNew: this.isNewRecord('fastestTime', fastestTime)
            });

            // Most Improved
            if (quizHistory.length >= 5) {
                const recent5 = quizHistory.slice(-5);
                const first5 = quizHistory.slice(0, 5);
                const recentAvg = recent5.reduce((sum, q) => sum + q.percentage, 0) / 5;
                const firstAvg = first5.reduce((sum, q) => sum + q.percentage, 0) / 5;
                const improvement = Math.round(recentAvg - firstAvg);
                
                if (improvement > 0) {
                    records.push({
                        icon: '📈',
                        value: `+${improvement}%`,
                        label: 'Improvement',
                        isNew: false
                    });
                }
            }
        }

        // Study Streak
        records.push({
            icon: '🔥',
            value: userData.studyStreak || 0,
            label: 'Current Streak',
            isNew: this.isNewRecord('studyStreak', userData.studyStreak)
        });

        return records;
    }

    getOrCreateRecordsContainer() {
        let container = document.querySelector('.personal-records');
        if (!container) {
            container = document.createElement('div');
            container.className = 'personal-records';
            
            // Add to dashboard
            const dashboard = document.querySelector('#home-dashboard') || document.querySelector('main');
            if (dashboard) {
                const section = document.createElement('section');
                section.className = 'dashboard-section';
                section.innerHTML = '<h2>🏆 Personal Records</h2>';
                section.appendChild(container);
                dashboard.appendChild(section);
            }
        }
        return container;
    }

    isNewRecord(recordType, value) {
        const lastRecords = JSON.parse(localStorage.getItem('personalRecords') || '{}');
        const isNew = !lastRecords[recordType] || value > lastRecords[recordType];
        
        if (isNew) {
            lastRecords[recordType] = value;
            localStorage.setItem('personalRecords', JSON.stringify(lastRecords));
        }
        
        return isNew;
    }

    highlightPersonalRecord(recordType) {
        const recordCards = document.querySelectorAll('.record-card');
        recordCards.forEach(card => {
            if (card.querySelector('.record-label').textContent.toLowerCase().includes(recordType.toLowerCase())) {
                card.classList.add('new-record');
                setTimeout(() => {
                    card.classList.remove('new-record');
                }, 5000);
            }
        });
    }

    // Motivational Content
    showDailyMotivation() {
        const today = new Date().toDateString();
        const lastShown = localStorage.getItem('lastMotivationShown');
        
        if (lastShown !== today) {
            setTimeout(() => {
                this.showMotivationalQuote();
                localStorage.setItem('lastMotivationShown', today);
            }, 2000);
        }
    }

    showMotivationalQuote() {
        const quote = this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
        const quoteEl = document.createElement('div');
        quoteEl.className = 'motivational-quote';
        quoteEl.innerHTML = `
            <div class="quote-text">"${quote.text}"</div>
            <div class="quote-author">— ${quote.author}</div>
        `;
        
        // Add to page
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(quoteEl, main.firstChild);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                quoteEl.style.opacity = '0';
                setTimeout(() => quoteEl.remove(), 500);
            }, 10000);
        }
    }

    showSuccessStory() {
        const story = this.successStories[Math.floor(Math.random() * this.successStories.length)];
        const storyEl = document.createElement('div');
        storyEl.className = 'success-story';
        storyEl.innerHTML = `
            <div class="success-story-text">${story.text}</div>
            <div class="success-story-author">— ${story.author}</div>
        `;
        
        return storyEl;
    }

    // Study Session Tracking
    startStudySession() {
        this.studySessionStartTime = Date.now();
        this.showStudyTimer();
    }

    showStudyTimer() {
        const timer = document.createElement('div');
        timer.className = 'study-session-timer';
        timer.innerHTML = `
            <div class="timer-icon">⏱️</div>
            <div class="timer-text">00:00</div>
        `;
        document.body.appendChild(timer);

        this.studySessionTimer = setInterval(() => {
            const elapsed = Date.now() - this.studySessionStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            timer.querySelector('.timer-text').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    endStudySession() {
        if (this.studySessionTimer) {
            clearInterval(this.studySessionTimer);
            const timer = document.querySelector('.study-session-timer');
            if (timer) timer.remove();
        }
        
        const sessionLength = Math.floor((Date.now() - this.studySessionStartTime) / 60000);
        if (sessionLength >= 5) { // At least 5 minutes
            this.showNotification(`📚 Great session! You studied for ${sessionLength} minutes.`, 'success');
        }
    }

    // Milestone Checking
    checkMilestones() {
        const userData = JSON.parse(localStorage.getItem('sureSuccessUserData') || '{}');
        const currentUser = userData.currentUser ? userData.users[userData.currentUser] : null;
        
        if (!currentUser) return;

        const milestones = [
            {
                id: 'first_week',
                title: 'First Week Complete!',
                description: 'You\'ve been studying for a week. Great start!',
                icon: '📅',
                condition: () => {
                    const joinDate = new Date(currentUser.joinDate);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return joinDate <= weekAgo;
                }
            },
            {
                id: 'quiz_master',
                title: 'Quiz Master!',
                description: 'You\'ve completed 25 quizzes. You\'re becoming an expert!',
                icon: '🎓',
                condition: () => currentUser.totalQuizzesTaken >= 25
            },
            {
                id: 'streak_legend',
                title: 'Streak Legend!',
                description: 'A 14-day study streak! Your dedication is inspiring!',
                icon: '🔥',
                condition: () => currentUser.studyStreak >= 14
            }
        ];

        const shownMilestones = JSON.parse(localStorage.getItem('shownMilestones') || '[]');
        
        milestones.forEach(milestone => {
            if (milestone.condition() && !shownMilestones.includes(milestone.id)) {
                this.showMilestonePopup(milestone);
                shownMilestones.push(milestone.id);
                localStorage.setItem('shownMilestones', JSON.stringify(shownMilestones));
            }
        });
    }

    // Progress Ring Animation
    createProgressRing(percentage, container) {
        const circumference = 2 * Math.PI * 60; // radius = 60
        const progressValue = (percentage / 100) * circumference;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.className = 'progress-ring';
        svg.innerHTML = `
            <circle class="progress-ring-circle" cx="60" cy="60" r="60"></circle>
            <circle class="progress-ring-progress" cx="60" cy="60" r="60" 
                    style="--progress-value: ${progressValue}"></circle>
            <div class="progress-ring-text">${percentage}%</div>
        `;
        
        container.appendChild(svg);
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Sound Effects (optional)
    playSuccessSound() {
        // Create a simple success sound using Web Audio API
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const audioContext = new (AudioContext || webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    }
}

// Initialize motivation system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.motivationSystem = new MotivationSystem();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MotivationSystem;
}