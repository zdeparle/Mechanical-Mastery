// Fluid Mechanics Test Questions
const testQuestions = [
    {
        id: 1,
        category: 'Pressure',
        question: 'The pressure at a depth of 10 m in water (ρ = 1000 kg/m³) is approximately:',
        options: ['98.1 kPa', '100 kPa', '10 kPa', '981 kPa'],
        correct: 0,
        explanation: 'P = ρgh = 1000 × 9.81 × 10 = 98,100 Pa = 98.1 kPa'
    },
    {
        id: 2,
        category: 'Continuity',
        question: 'According to the continuity equation, if pipe area decreases by half, velocity:',
        options: ['Doubles', 'Halves', 'Stays the same', 'Quadruples'],
        correct: 0,
        explanation: 'Q = Av = constant, so if A halves, v must double'
    },
    {
        id: 3,
        category: 'Bernoulli',
        question: 'In Bernoulli\'s equation, when velocity increases, pressure:',
        options: ['Increases', 'Decreases', 'Stays the same', 'Depends on density'],
        correct: 1,
        explanation: 'From Bernoulli: P + ½ρv² = constant, so increasing v decreases P'
    }
];

const studyTips = {
    'Pressure': 'Review hydrostatic pressure (P = P₀ + ρgh), Pascal\'s principle, and pressure measurement.',
    'Continuity': 'Understand Q = Av = constant, mass conservation, and flow rate calculations.',
    'Bernoulli': 'Study Bernoulli\'s equation, energy conservation in fluids, and applications like venturi meters.'
};

document.addEventListener('DOMContentLoaded', () => {
    initTest(testQuestions);
});

function submitTest() {
    const results = calculateResults();
    displayResults(results, studyTips);
}

