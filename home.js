// home.js

// Function to render user information
function renderUserInfo(user) {
    const userInfo = document.getElementById('user-info');
    userInfo.innerHTML = `
        <h2>Welcome, ${user.name}</h2>
        <p>Email: ${user.email}</p>
    `;
}

// Function to display statistics
function displayStatistics(stats) {
    const statsContainer = document.getElementById('statistics');
    statsContainer.innerHTML = `
        <h3>Your Statistics</h3>
        <p>Courses Completed: ${stats.completed}</p>
        <p>Current Progress: ${stats.progress}%</p>
    `;
}

// Function to handle course selection
function handleCourseSelection() {
    const courseSelect = document.getElementById('course-select');
    courseSelect.addEventListener('change', (event) => {
        const selectedCourse = event.target.value;
        // Logic to load the selected course details
        console.log(`Course selected: ${selectedCourse}`);
    });
}

// Main function to initialize the dashboard
function initDashboard() {
    const user = { name: 'John Doe', email: 'johndoe@example.com' }; // Example user data
    const stats = { completed: 5, progress: 80 }; // Example statistics
    
    renderUserInfo(user);
    displayStatistics(stats);
    handleCourseSelection();
}

// Call the init function when the page loads
document.addEventListener('DOMContentLoaded', initDashboard);
