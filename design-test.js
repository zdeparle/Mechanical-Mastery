// Machine Design Test Questions
const testQuestions = [
    {
        id: 1,
        category: 'Factor of Safety',
        question: 'A component has a yield strength of 400 MPa and is subjected to 100 MPa stress. What is the factor of safety?',
        options: ['2', '4', '0.25', '1'],
        correct: 1,
        explanation: 'n = σ_yield/σ_actual = 400/100 = 4'
    },
    {
        id: 2,
        category: 'Bending Stress',
        question: 'Bending stress in a beam is maximum at:',
        options: ['The neutral axis', 'The outer fibers', 'The center of the beam', 'The supports'],
        correct: 1,
        explanation: 'Bending stress σ = Mc/I is maximum at the outer fibers where c is maximum'
    },
    {
        id: 3,
        category: 'Power Transmission',
        question: 'If torque is 100 N·m and angular velocity is 10 rad/s, what is the power?',
        options: ['100 W', '1000 W', '10 W', '10000 W'],
        correct: 1,
        explanation: 'P = Tω = 100 × 10 = 1000 W'
    }
];

const studyTips = {
    'Factor of Safety': 'Review safety factors, allowable stress design, and failure theories.',
    'Bending Stress': 'Study beam bending (σ = Mc/I), section modulus, and beam deflection.',
    'Power Transmission': 'Understand P = Tω, gear ratios, belt drives, and efficiency calculations.'
};

document.addEventListener('DOMContentLoaded', () => {
    initTest(testQuestions);
});

function submitTest() {
    const results = calculateResults();
    displayResults(results, studyTips);
}

