// Vibrations Test Questions
const testQuestions = [
    {
        id: 1,
        category: 'Natural Frequency',
        question: 'A spring-mass system has k = 100 N/m and m = 1 kg. What is the natural frequency?',
        options: ['10 rad/s', '100 rad/s', '1 rad/s', '0.1 rad/s'],
        correct: 0,
        explanation: 'ω_n = √(k/m) = √(100/1) = 10 rad/s'
    },
    {
        id: 2,
        category: 'Damping',
        question: 'Critical damping occurs when the damping ratio ζ equals:',
        options: ['0', '0.5', '1', '2'],
        correct: 2,
        explanation: 'Critical damping occurs when ζ = 1, resulting in fastest return to equilibrium without oscillation'
    },
    {
        id: 3,
        category: 'Resonance',
        question: 'Resonance occurs when the forcing frequency:',
        options: ['Is much less than natural frequency', 'Equals the natural frequency', 'Is much greater than natural frequency', 'Is zero'],
        correct: 1,
        explanation: 'Resonance occurs when ω = ω_n, causing maximum amplitude response'
    }
];

const studyTips = {
    'Natural Frequency': 'Review ω_n = √(k/m), simple harmonic motion, and free vibration analysis.',
    'Damping': 'Study damping ratio, critical damping, underdamped/overdamped systems, and logarithmic decrement.',
    'Resonance': 'Understand frequency response, resonance conditions, and vibration isolation techniques.'
};

document.addEventListener('DOMContentLoaded', () => {
    initTest(testQuestions);
});

function submitTest() {
    const results = calculateResults();
    displayResults(results, studyTips);
}

