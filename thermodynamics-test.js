// Thermodynamics Test Questions
const testQuestions = [
    {
        id: 1,
        category: 'First Law',
        question: 'According to the first law of thermodynamics, if a system receives 500 J of heat and does 200 J of work, what is the change in internal energy?',
        options: ['300 J', '700 J', '-300 J', '200 J'],
        correct: 0,
        explanation: 'ΔU = Q - W = 500 - 200 = 300 J'
    },
    {
        id: 2,
        category: 'Ideal Gas Law',
        question: 'If the pressure of an ideal gas doubles while temperature remains constant, what happens to the volume?',
        options: ['Doubles', 'Halves', 'Stays the same', 'Quadruples'],
        correct: 1,
        explanation: 'From PV = nRT, if P doubles and T is constant, V must halve'
    },
    {
        id: 3,
        category: 'Heat Transfer',
        question: 'The rate of heat conduction through a material is directly proportional to:',
        options: ['Temperature difference only', 'Area and temperature difference', 'Thickness only', 'Thermal conductivity only'],
        correct: 1,
        explanation: 'Q = kAΔT/L, so it depends on area, temperature difference, and inversely on thickness'
    }
];

const studyTips = {
    'First Law': 'Review energy conservation, work done by/on systems, and heat transfer sign conventions.',
    'Ideal Gas Law': 'Practice problems with PV = nRT, understand isothermal, isobaric, and isochoric processes.',
    'Heat Transfer': 'Study conduction, convection, and radiation. Understand Fourier\'s law and thermal resistance.'
};

document.addEventListener('DOMContentLoaded', () => {
    initTest(testQuestions);
});

function submitTest() {
    const results = calculateResults();
    displayResults(results, studyTips);
}

