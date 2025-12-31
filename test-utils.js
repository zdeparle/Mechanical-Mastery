// Shared test utilities for all concept pages

// Test state
let currentQuestionIndex = 0;
let userAnswers = {};
let testQuestions = [];

// Initialize test
function initTest(questions) {
    testQuestions = questions;
    currentQuestionIndex = 0;
    userAnswers = {};
    renderQuestion();
    updateProgress();
    updateNavigationButtons();
}

// Render current question
function renderQuestion() {
    if (!testQuestions || testQuestions.length === 0) return;
    
    const question = testQuestions[currentQuestionIndex];
    const container = document.getElementById('questions-container');
    if (!container) return;
    
    const selectedAnswer = userAnswers[question.id] || null;
    
    container.innerHTML = `
        <div class="question-card">
            <div class="question-header">
                <span class="question-category">${question.category}</span>
                <span class="question-number">#${question.id}</span>
            </div>
            <div class="question-text">${question.question}</div>
            <div class="options-list">
                ${question.options.map((option, index) => `
                    <div class="option-item ${selectedAnswer === index ? 'selected' : ''}" 
                         onclick="selectAnswer(${index})">
                        <label>
                            <input type="radio" name="question-${question.id}" value="${index}" 
                                   ${selectedAnswer === index ? 'checked' : ''} 
                                   onchange="selectAnswer(${index})">
                            ${option}
                        </label>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Select answer
function selectAnswer(answerIndex) {
    const question = testQuestions[currentQuestionIndex];
    userAnswers[question.id] = answerIndex;
    renderQuestion();
    updateNavigationButtons();
}

// Update progress bar
function updateProgress() {
    if (!testQuestions || testQuestions.length === 0) return;
    const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;
    const progressFill = document.getElementById('progress-fill');
    const currentQ = document.getElementById('current-question');
    const totalQ = document.getElementById('total-questions');
    
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (currentQ) currentQ.textContent = currentQuestionIndex + 1;
    if (totalQ) totalQ.textContent = testQuestions.length;
}

// Update navigation buttons
function updateNavigationButtons() {
    if (!testQuestions || testQuestions.length === 0) return;
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === testQuestions.length - 1) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'block';
    } else {
        if (nextBtn) nextBtn.style.display = 'block';
        if (submitBtn) submitBtn.style.display = 'none';
    }
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
        updateProgress();
        updateNavigationButtons();
    }
}

// Navigate to next question
function nextQuestion() {
    if (currentQuestionIndex < testQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
        updateProgress();
        updateNavigationButtons();
    }
}

// Calculate results
function calculateResults() {
    const categoryScores = {};
    const categoryTotals = {};
    let totalCorrect = 0;
    
    testQuestions.forEach(question => {
        const category = question.category;
        if (!categoryScores[category]) {
            categoryScores[category] = 0;
            categoryTotals[category] = 0;
        }
        
        categoryTotals[category]++;
        const userAnswer = userAnswers[question.id];
        
        if (userAnswer === question.correct) {
            categoryScores[category]++;
            totalCorrect++;
        }
    });
    
    const totalQuestions = testQuestions.length;
    const percentage = Math.round((totalCorrect / totalQuestions) * 100);
    
    return {
        totalCorrect,
        totalQuestions,
        percentage,
        categoryScores,
        categoryTotals
    };
}

// Submit test and show results
function submitTest() {
    if (!testQuestions || testQuestions.length === 0) return;
    
    // Check if all questions are answered
    const unanswered = testQuestions.filter(q => userAnswers[q.id] === undefined);
    
    if (unanswered.length > 0) {
        if (!confirm(`You have ${unanswered.length} unanswered question(s). Are you sure you want to submit?`)) {
            return;
        }
    }
    
    const results = calculateResults();
    displayResults(results);
}

// Display results
function displayResults(results, studyTips) {
    const testContent = document.getElementById('test-content');
    const resultsContainer = document.getElementById('results-container');
    
    if (testContent) testContent.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'block';
    
    // Determine performance level for each category
    const categoryPerformance = {};
    Object.keys(results.categoryScores).forEach(category => {
        const score = results.categoryScores[category];
        const total = results.categoryTotals[category];
        const percentage = (score / total) * 100;
        
        let performanceClass = 'needs-improvement';
        if (percentage >= 80) {
            performanceClass = 'excellent';
        } else if (percentage >= 60) {
            performanceClass = 'good';
        }
        
        categoryPerformance[category] = {
            score,
            total,
            percentage,
            class: performanceClass
        };
    });
    
    // Generate study recommendations
    const needsImprovement = Object.keys(categoryPerformance)
        .filter(cat => categoryPerformance[cat].class === 'needs-improvement')
        .map(cat => ({
            category: cat,
            percentage: categoryPerformance[cat].percentage
        }))
        .sort((a, b) => a.percentage - b.percentage);
    
    let recommendations = [];
    if (needsImprovement.length > 0) {
        recommendations = needsImprovement.map(item => {
            return {
                category: item.category,
                tip: studyTips && studyTips[item.category] 
                    ? studyTips[item.category] 
                    : 'Review fundamental concepts and practice more problems in this area.'
            };
        });
    } else {
        recommendations.push({
            category: 'Overall',
            tip: 'Excellent work! Continue practicing advanced problems and consider exploring related topics.'
        });
    }
    
    // Build results HTML
    let categoryHTML = '';
    Object.keys(categoryPerformance).forEach(category => {
        const perf = categoryPerformance[category];
        categoryHTML += `
            <div class="category-item ${perf.class}">
                <div class="category-name">${category}</div>
                <div class="category-score">${perf.score}/${perf.total} (${Math.round(perf.percentage)}%)</div>
            </div>
        `;
    });
    
    let recommendationsHTML = recommendations.map(rec => 
        `<li><strong>${rec.category}:</strong> ${rec.tip}</li>`
    ).join('');
    
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="results-header">
                <h2>Test Results</h2>
                <div class="score-display">${results.totalCorrect}/${results.totalQuestions}</div>
                <div class="score-percentage">${results.percentage}%</div>
            </div>
            
            <div class="category-breakdown">
                <h3 style="margin-bottom: 1.5rem; color: var(--text-color);">Performance by Category</h3>
                ${categoryHTML}
            </div>
            
            <div class="study-recommendations">
                <h3>Study Recommendations</h3>
                <ul class="recommendation-list">
                    ${recommendationsHTML}
                </ul>
            </div>
            
            <a href="index.html" class="back-link">← Back to Home</a>
        `;
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

