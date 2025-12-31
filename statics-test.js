// Statics & Dynamics Test Questions
// Organized by subcategories for detailed performance tracking

const testQuestions = [
    // FORCE ANALYSIS (5 questions)
    {
        id: 1,
        category: 'Force Analysis',
        question: 'A force of 100 N is applied at an angle of 30° above the horizontal. What is the horizontal component of this force?',
        options: [
            '50 N',
            '86.6 N',
            '100 N',
            '115.5 N'
        ],
        correct: 1,
        explanation: 'Fx = F × cos(θ) = 100 × cos(30°) = 100 × 0.866 = 86.6 N'
    },
    {
        id: 2,
        category: 'Force Analysis',
        question: 'Two forces of 50 N each act on a point at right angles to each other. What is the magnitude of the resultant force?',
        options: [
            '50 N',
            '70.7 N',
            '100 N',
            '141.4 N'
        ],
        correct: 1,
        explanation: 'For perpendicular forces: R = √(F₁² + F₂²) = √(50² + 50²) = √5000 = 70.7 N'
    },
    {
        id: 3,
        category: 'Force Analysis',
        question: 'A force vector has components Fx = 60 N and Fy = 80 N. What is the angle this force makes with the positive x-axis?',
        options: [
            '36.9°',
            '45°',
            '53.1°',
            '60°'
        ],
        correct: 2,
        explanation: 'θ = tan⁻¹(Fy/Fx) = tan⁻¹(80/60) = tan⁻¹(1.333) = 53.1°'
    },
    {
        id: 4,
        category: 'Force Analysis',
        question: 'Three concurrent forces are in equilibrium. If two forces are 100 N at 0° and 100 N at 120°, what is the magnitude of the third force?',
        options: [
            '100 N',
            '141.4 N',
            '173.2 N',
            '200 N'
        ],
        correct: 0,
        explanation: 'For equilibrium, the third force must balance the resultant of the first two. Using vector addition, the third force equals 100 N at 240°.'
    },
    {
        id: 5,
        category: 'Force Analysis',
        question: 'A force of 200 N is resolved into two perpendicular components. If one component is 120 N, what is the other component?',
        options: [
            '80 N',
            '160 N',
            '233.3 N',
            '280 N'
        ],
        correct: 1,
        explanation: 'F₂ = √(F² - F₁²) = √(200² - 120²) = √(40000 - 14400) = √25600 = 160 N'
    },

    // EQUILIBRIUM (5 questions)
    {
        id: 6,
        category: 'Equilibrium',
        question: 'For a rigid body to be in static equilibrium, which conditions must be satisfied?',
        options: [
            'ΣFx = 0 only',
            'ΣFy = 0 only',
            'ΣFx = 0, ΣFy = 0, and ΣM = 0',
            'ΣM = 0 only'
        ],
        correct: 2,
        explanation: 'Static equilibrium requires all forces and moments to sum to zero: ΣFx = 0, ΣFy = 0, and ΣM = 0'
    },
    {
        id: 7,
        category: 'Equilibrium',
        question: 'A 10 kg mass hangs from a rope. If the system is in equilibrium, what is the tension in the rope? (g = 9.81 m/s²)',
        options: [
            '9.81 N',
            '98.1 N',
            '100 N',
            '981 N'
        ],
        correct: 1,
        explanation: 'T = mg = 10 × 9.81 = 98.1 N'
    },
    {
        id: 8,
        category: 'Equilibrium',
        question: 'A beam is supported at both ends and has a point load at its center. If the load is 500 N, what is the reaction at each support?',
        options: [
            '125 N at each',
            '250 N at each',
            '500 N at each',
            '1000 N at each'
        ],
        correct: 1,
        explanation: 'For a simply supported beam with central load, reactions are equal: R = P/2 = 500/2 = 250 N at each support'
    },
    {
        id: 9,
        category: 'Equilibrium',
        question: 'A ladder leans against a wall at 60° to the horizontal. If the ladder weighs 200 N and a person weighing 800 N stands at the midpoint, what is the normal force from the wall? (Assume frictionless surfaces)',
        options: [
            '250 N',
            '289 N',
            '500 N',
            '1000 N'
        ],
        correct: 1,
        explanation: 'Taking moments about the base: N_wall × L × sin(60°) = (200 × L/2 × cos(60°)) + (800 × L/2 × cos(60°)). Solving: N_wall = 289 N'
    },
    {
        id: 10,
        category: 'Equilibrium',
        question: 'In a three-force system in equilibrium, the forces must:',
        options: [
            'All be parallel',
            'All be concurrent or parallel',
            'All be equal in magnitude',
            'All act in the same direction'
        ],
        correct: 1,
        explanation: 'For three forces to be in equilibrium, they must either be concurrent (meet at a point) or parallel'
    },

    // MOMENTS & TORQUE (5 questions)
    {
        id: 11,
        category: 'Moments & Torque',
        question: 'A force of 50 N is applied perpendicular to a lever arm of 2 m. What is the moment about the pivot point?',
        options: [
            '25 N·m',
            '50 N·m',
            '100 N·m',
            '200 N·m'
        ],
        correct: 2,
        explanation: 'M = F × d = 50 × 2 = 100 N·m'
    },
    {
        id: 12,
        category: 'Moments & Torque',
        question: 'A force of 100 N is applied at an angle of 30° to a lever arm of 1.5 m. What is the moment about the pivot?',
        options: [
            '75 N·m',
            '112.5 N·m',
            '130 N·m',
            '150 N·m'
        ],
        correct: 0,
        explanation: 'M = F × d × sin(θ) = 100 × 1.5 × sin(30°) = 100 × 1.5 × 0.5 = 75 N·m'
    },
    {
        id: 13,
        category: 'Moments & Torque',
        question: 'The principle of moments states that for equilibrium:',
        options: [
            'Clockwise moments = Counterclockwise moments',
            'All moments must be zero',
            'Sum of forces equals sum of moments',
            'Moments are always positive'
        ],
        correct: 0,
        explanation: 'For rotational equilibrium, the sum of clockwise moments equals the sum of counterclockwise moments'
    },
    {
        id: 14,
        category: 'Moments & Torque',
        question: 'A force couple consists of:',
        options: [
            'Two equal and opposite forces',
            'Two equal forces acting at different points',
            'Two equal, parallel, and opposite forces not in the same line',
            'A single force and a moment'
        ],
        correct: 2,
        explanation: 'A force couple consists of two equal, parallel, and opposite forces that are not collinear, producing pure rotation'
    },
    {
        id: 15,
        category: 'Moments & Torque',
        question: 'A wrench applies a torque of 25 N·m to a bolt. If the force is applied 0.2 m from the center, what force is required?',
        options: [
            '50 N',
            '100 N',
            '125 N',
            '250 N'
        ],
        correct: 2,
        explanation: 'τ = F × r, so F = τ/r = 25/0.2 = 125 N'
    },

    // FREE BODY DIAGRAMS (5 questions)
    {
        id: 16,
        category: 'Free Body Diagrams',
        question: 'A free body diagram shows:',
        options: [
            'Only external forces',
            'Only internal forces',
            'All forces acting on the isolated body',
            'Only gravitational forces'
        ],
        correct: 2,
        explanation: 'A free body diagram isolates a body and shows all forces (external) acting on it'
    },
    {
        id: 17,
        category: 'Free Body Diagrams',
        question: 'When drawing a free body diagram for a beam, reaction forces at a pin support include:',
        options: [
            'Only vertical force',
            'Only horizontal force',
            'Both horizontal and vertical forces',
            'Only a moment'
        ],
        correct: 2,
        explanation: 'A pin support resists both horizontal and vertical translation but allows rotation, so it has both Rx and Ry components'
    },
    {
        id: 18,
        category: 'Free Body Diagrams',
        question: 'A roller support in a free body diagram provides:',
        options: [
            'Two force components and a moment',
            'One force component perpendicular to the surface',
            'One force component parallel to the surface',
            'Only a moment'
        ],
        correct: 1,
        explanation: 'A roller support resists motion perpendicular to the surface but allows motion parallel to it and rotation'
    },
    {
        id: 19,
        category: 'Free Body Diagrams',
        question: 'For a fixed support (cantilever), the free body diagram shows:',
        options: [
            'Two force components',
            'Two force components and one moment',
            'One force component',
            'Only a moment'
        ],
        correct: 1,
        explanation: 'A fixed support resists translation in both directions and rotation, providing Rx, Ry, and M'
    },
    {
        id: 20,
        category: 'Free Body Diagrams',
        question: 'When analyzing a pulley system, the tension in an ideal (massless, frictionless) rope is:',
        options: [
            'Zero',
            'Constant throughout',
            'Variable along the rope',
            'Equal to the weight'
        ],
        correct: 1,
        explanation: 'In an ideal rope (massless, frictionless), tension is constant throughout the rope'
    },

    // NEWTON\'S LAWS & DYNAMICS (5 questions)
    {
        id: 21,
        category: 'Newton\'s Laws & Dynamics',
        question: 'According to Newton\'s second law, if a 10 kg object experiences a net force of 50 N, what is its acceleration?',
        options: [
            '0.2 m/s²',
            '5 m/s²',
            '50 m/s²',
            '500 m/s²'
        ],
        correct: 1,
        explanation: 'F = ma, so a = F/m = 50/10 = 5 m/s²'
    },
    {
        id: 22,
        category: 'Newton\'s Laws & Dynamics',
        question: 'A 5 kg block slides down a frictionless 30° incline. What is its acceleration? (g = 9.81 m/s²)',
        options: [
            '2.45 m/s²',
            '4.9 m/s²',
            '9.81 m/s²',
            '19.62 m/s²'
        ],
        correct: 1,
        explanation: 'a = g × sin(θ) = 9.81 × sin(30°) = 9.81 × 0.5 = 4.9 m/s²'
    },
    {
        id: 23,
        category: 'Newton\'s Laws & Dynamics',
        question: 'Two blocks of mass 2 kg and 3 kg are connected by a string. If a force of 20 N is applied to the 2 kg block, what is the acceleration of the system? (Assume frictionless surface)',
        options: [
            '2 m/s²',
            '4 m/s²',
            '6.67 m/s²',
            '10 m/s²'
        ],
        correct: 1,
        explanation: 'a = F/(m₁ + m₂) = 20/(2 + 3) = 20/5 = 4 m/s²'
    },
    {
        id: 24,
        category: 'Newton\'s Laws & Dynamics',
        question: 'A car of mass 1000 kg accelerates from rest to 20 m/s in 5 seconds. What is the average force applied?',
        options: [
            '2000 N',
            '4000 N',
            '10000 N',
            '20000 N'
        ],
        correct: 1,
        explanation: 'a = Δv/Δt = 20/5 = 4 m/s², F = ma = 1000 × 4 = 4000 N'
    },
    {
        id: 25,
        category: 'Newton\'s Laws & Dynamics',
        question: 'In circular motion, the centripetal force is always directed:',
        options: [
            'Tangentially',
            'Radially outward',
            'Radially inward',
            'Perpendicular to velocity'
        ],
        correct: 2,
        explanation: 'Centripetal force is always directed radially inward toward the center of the circular path'
    },

    // FRICTION (5 questions)
    {
        id: 26,
        category: 'Friction',
        question: 'The coefficient of static friction between two surfaces is 0.5. If the normal force is 100 N, what is the maximum static friction force?',
        options: [
            '50 N',
            '100 N',
            '150 N',
            '200 N'
        ],
        correct: 0,
        explanation: 'f_max = μ_s × N = 0.5 × 100 = 50 N'
    },
    {
        id: 27,
        category: 'Friction',
        question: 'Kinetic friction is typically:',
        options: [
            'Greater than static friction',
            'Equal to static friction',
            'Less than static friction',
            'Independent of normal force'
        ],
        correct: 2,
        explanation: 'Kinetic friction is typically less than the maximum static friction for the same surfaces'
    },
    {
        id: 28,
        category: 'Friction',
        question: 'A 20 kg block is pulled horizontally with a force of 80 N. If the coefficient of kinetic friction is 0.3, what is the acceleration? (g = 9.81 m/s²)',
        options: [
            '0.5 m/s²',
            '1.06 m/s²',
            '2.0 m/s²',
            '4.0 m/s²'
        ],
        correct: 1,
        explanation: 'f_k = μ_k × N = 0.3 × 20 × 9.81 = 58.86 N. Net force = 80 - 58.86 = 21.14 N. a = F_net/m = 21.14/20 = 1.06 m/s²'
    },
    {
        id: 29,
        category: 'Friction',
        question: 'The angle of repose is the angle at which:',
        options: [
            'An object starts sliding',
            'An object stops sliding',
            'Friction becomes zero',
            'Normal force equals weight'
        ],
        correct: 0,
        explanation: 'The angle of repose is the maximum angle at which an object on an inclined plane will start to slide'
    },
    {
        id: 30,
        category: 'Friction',
        question: 'For a block on an inclined plane, if the angle is increased beyond the angle of repose, the block will:',
        options: [
            'Remain stationary',
            'Accelerate down the plane',
            'Move at constant velocity',
            'Accelerate up the plane'
        ],
        correct: 1,
        explanation: 'Beyond the angle of repose, the component of weight parallel to the plane exceeds maximum static friction, causing acceleration down the plane'
    }
];

// Statics test uses shared test utilities
const studyTips = {
    'Force Analysis': 'Review vector addition, force resolution, and component calculations. Practice with force triangles and parallelogram law.',
    'Equilibrium': 'Focus on equilibrium conditions (ΣF = 0, ΣM = 0). Practice drawing free body diagrams and solving equilibrium equations.',
    'Moments & Torque': 'Study moment calculations, right-hand rule, and principle of moments. Practice finding moments about different points.',
    'Free Body Diagrams': 'Practice isolating bodies and identifying all forces. Review different support types and their reactions.',
    'Newton\'s Laws & Dynamics': 'Review F = ma, kinematics relationships, and acceleration calculations. Practice problems with multiple bodies.',
    'Friction': 'Study static vs kinetic friction, friction force calculations, and angle of repose. Practice problems on inclined planes.'
};

document.addEventListener('DOMContentLoaded', () => {
    initTest(testQuestions);
});

function submitTest() {
    const results = calculateResults();
    displayResults(results, studyTips);
}

