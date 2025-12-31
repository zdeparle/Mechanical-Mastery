// Materials Science Test Questions
const testQuestions = [
    {
        id: 1,
        category: 'Stress & Strain',
        question: 'A force of 10,000 N is applied to a rod with cross-sectional area of 0.01 m². What is the stress?',
        options: ['1 MPa', '10 MPa', '100 MPa', '1000 MPa'],
        correct: 0,
        explanation: 'σ = F/A = 10,000/0.01 = 1,000,000 Pa = 1 MPa'
    },
    {
        id: 2,
        category: 'Young\'s Modulus',
        question: 'Young\'s modulus represents:',
        options: ['The ratio of stress to strain', 'The maximum stress before failure', 'The strain at yield point', 'The energy stored in material'],
        correct: 0,
        explanation: 'E = σ/ε, so it\'s the ratio of stress to strain in the elastic region'
    },
    {
        id: 3,
        category: 'Shear Stress',
        question: 'Shear stress acts:',
        options: ['Perpendicular to the surface', 'Parallel to the surface', 'At 45 degrees', 'Only in tension'],
        correct: 1,
        explanation: 'Shear stress acts parallel to the surface, unlike normal stress which acts perpendicular'
    }
];

const studyTips = {
    'Stress & Strain': 'Review normal stress (σ = F/A), strain (ε = ΔL/L₀), and their relationship.',
    'Young\'s Modulus': 'Understand E = σ/ε, elastic vs plastic deformation, and stress-strain curves.',
    'Shear Stress': 'Study shear stress (τ = V/A), shear modulus (G), and Poisson\'s ratio.'
};

document.addEventListener('DOMContentLoaded', () => {
    initTest(testQuestions);
});

function submitTest() {
    const results = calculateResults();
    displayResults(results, studyTips);
}

