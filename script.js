// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Calculator Tab Switching
const tabButtons = document.querySelectorAll('.tab-btn');
const calculatorPanels = document.querySelectorAll('.calculator-panel');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Remove active class from all buttons and panels
        tabButtons.forEach(btn => btn.classList.remove('active'));
        calculatorPanels.forEach(panel => panel.classList.remove('active'));
        
        // Add active class to clicked button and corresponding panel
        button.classList.add('active');
        const targetPanel = document.getElementById(`${targetTab}-calc`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    });
});

// Stress & Strain Calculator
function calculateStress() {
    const force = parseFloat(document.getElementById('force-input').value);
    const area = parseFloat(document.getElementById('area-input').value);
    const length = parseFloat(document.getElementById('length-input').value);
    const deformation = parseFloat(document.getElementById('deformation-input').value);
    
    if (!force || !area) {
        alert('Please enter force and area values');
        return;
    }
    
    // Calculate stress: σ = F / A
    const stress = force / area;
    document.getElementById('stress-result').textContent = `${stress.toFixed(2)} Pa`;
    
    // Calculate strain if length and deformation are provided
    if (length && deformation) {
        const strain = deformation / length;
        document.getElementById('strain-result').textContent = `${strain.toFixed(6)}`;
        
        // Calculate Young's modulus: E = σ / ε
        if (strain !== 0) {
            const modulus = stress / strain;
            document.getElementById('modulus-result').textContent = `${modulus.toFixed(2)} Pa`;
        } else {
            document.getElementById('modulus-result').textContent = 'N/A';
        }
    } else {
        document.getElementById('strain-result').textContent = 'Enter length and deformation';
        document.getElementById('modulus-result').textContent = 'N/A';
    }
}

// Force Vector Analysis Calculator
function calculateForce() {
    const magnitude = parseFloat(document.getElementById('force-magnitude').value);
    const angle = parseFloat(document.getElementById('force-angle').value);
    
    if (!magnitude || angle === undefined) {
        alert('Please enter force magnitude and angle');
        return;
    }
    
    // Convert angle to radians
    const angleRad = (angle * Math.PI) / 180;
    
    // Calculate components
    const fx = magnitude * Math.cos(angleRad);
    const fy = magnitude * Math.sin(angleRad);
    
    // Display results
    document.getElementById('fx-result').textContent = `${fx.toFixed(2)} N`;
    document.getElementById('fy-result').textContent = `${fy.toFixed(2)} N`;
    document.getElementById('resultant-result').textContent = `${magnitude.toFixed(2)} N`;
    
    // Update visualization
    updateForceVisualization(magnitude, angle);
}

function updateForceVisualization(magnitude, angle) {
    const svg = document.querySelector('#force-visual svg');
    const arrow = document.getElementById('force-arrow');
    const label = document.getElementById('force-label');
    
    // Calculate arrow endpoint
    const centerX = 150;
    const centerY = 150;
    const length = Math.min(magnitude / 2, 80); // Scale for visualization
    const angleRad = (angle * Math.PI) / 180;
    
    const endX = centerX + length * Math.cos(angleRad);
    const endY = centerY - length * Math.sin(angleRad);
    
    arrow.setAttribute('x1', centerX);
    arrow.setAttribute('y1', centerY);
    arrow.setAttribute('x2', endX);
    arrow.setAttribute('y2', endY);
    
    label.setAttribute('x', endX);
    label.setAttribute('y', endY - 10);
    label.textContent = `${magnitude.toFixed(0)}N`;
}

// Heat Transfer Calculator
function calculateHeat() {
    const k = parseFloat(document.getElementById('thermal-conductivity').value);
    const A = parseFloat(document.getElementById('surface-area').value);
    const deltaT = parseFloat(document.getElementById('temp-diff').value);
    const L = parseFloat(document.getElementById('thickness').value);
    
    if (!k || !A || !deltaT || !L) {
        alert('Please enter all values');
        return;
    }
    
    // Q = k * A * ΔT / L
    const Q = (k * A * deltaT) / L;
    document.getElementById('heat-result').textContent = `${Q.toFixed(2)} W`;
}

// Fluid Flow Calculator
function calculateFluid() {
    const Q = parseFloat(document.getElementById('flow-rate').value);
    const D = parseFloat(document.getElementById('pipe-diameter').value);
    
    if (!Q || !D) {
        alert('Please enter flow rate and pipe diameter');
        return;
    }
    
    // Calculate area: A = π * (D/2)²
    const A = Math.PI * Math.pow(D / 2, 2);
    
    // Calculate velocity: v = Q / A
    const v = Q / A;
    
    document.getElementById('velocity-result').textContent = `${v.toFixed(2)} m/s`;
    document.getElementById('pipe-area-result').textContent = `${A.toFixed(6)} m²`;
}

// Force Vector Visualization Simulation
let vectorCanvas, vectorCtx;
let vectorMagnitude = 50;
let vectorAngle = 45;

function initVectorSimulation() {
    vectorCanvas = document.getElementById('vector-canvas');
    if (!vectorCanvas) return;
    
    vectorCtx = vectorCanvas.getContext('2d');
    
    // Set up controls
    const magSlider = document.getElementById('vec-magnitude');
    const angleSlider = document.getElementById('vec-angle');
    const magDisplay = document.getElementById('vec-mag-display');
    const angleDisplay = document.getElementById('vec-angle-display');
    
    if (magSlider) {
        magSlider.addEventListener('input', (e) => {
            vectorMagnitude = parseFloat(e.target.value);
            magDisplay.textContent = vectorMagnitude;
            drawVector();
        });
    }
    
    if (angleSlider) {
        angleSlider.addEventListener('input', (e) => {
            vectorAngle = parseFloat(e.target.value);
            angleDisplay.textContent = vectorAngle;
            drawVector();
        });
    }
    
    drawVector();
}

function drawVector() {
    if (!vectorCtx) return;
    
    const width = vectorCanvas.width;
    const height = vectorCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Clear canvas
    vectorCtx.clearRect(0, 0, width, height);
    
    // Draw grid
    vectorCtx.strokeStyle = '#e5e7eb';
    vectorCtx.lineWidth = 1;
    for (let i = 0; i <= width; i += 20) {
        vectorCtx.beginPath();
        vectorCtx.moveTo(i, 0);
        vectorCtx.lineTo(i, height);
        vectorCtx.stroke();
    }
    for (let i = 0; i <= height; i += 20) {
        vectorCtx.beginPath();
        vectorCtx.moveTo(0, i);
        vectorCtx.lineTo(width, i);
        vectorCtx.stroke();
    }
    
    // Draw axes
    vectorCtx.strokeStyle = '#333';
    vectorCtx.lineWidth = 2;
    vectorCtx.beginPath();
    vectorCtx.moveTo(centerX, 0);
    vectorCtx.lineTo(centerX, height);
    vectorCtx.moveTo(0, centerY);
    vectorCtx.lineTo(width, centerY);
    vectorCtx.stroke();
    
    // Draw vector
    const angleRad = (vectorAngle * Math.PI) / 180;
    const length = Math.min(vectorMagnitude * 2, 120);
    const endX = centerX + length * Math.cos(angleRad);
    const endY = centerY - length * Math.sin(angleRad);
    
    // Draw arrow
    vectorCtx.strokeStyle = '#6366f1';
    vectorCtx.fillStyle = '#6366f1';
    vectorCtx.lineWidth = 3;
    vectorCtx.beginPath();
    vectorCtx.moveTo(centerX, centerY);
    vectorCtx.lineTo(endX, endY);
    vectorCtx.stroke();
    
    // Draw arrowhead
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6;
    const dx = endX - centerX;
    const dy = endY - centerY;
    const angle = Math.atan2(dy, dx);
    
    vectorCtx.beginPath();
    vectorCtx.moveTo(endX, endY);
    vectorCtx.lineTo(
        endX - arrowLength * Math.cos(angle - arrowAngle),
        endY - arrowLength * Math.sin(angle - arrowAngle)
    );
    vectorCtx.lineTo(
        endX - arrowLength * Math.cos(angle + arrowAngle),
        endY - arrowLength * Math.sin(angle + arrowAngle)
    );
    vectorCtx.closePath();
    vectorCtx.fill();
    
    // Draw components
    vectorCtx.strokeStyle = '#10b981';
    vectorCtx.lineWidth = 2;
    vectorCtx.setLineDash([5, 5]);
    vectorCtx.beginPath();
    vectorCtx.moveTo(centerX, centerY);
    vectorCtx.lineTo(endX, centerY);
    vectorCtx.stroke();
    
    vectorCtx.beginPath();
    vectorCtx.moveTo(endX, centerY);
    vectorCtx.lineTo(endX, endY);
    vectorCtx.stroke();
    vectorCtx.setLineDash([]);
    
    // Draw labels
    vectorCtx.fillStyle = '#6366f1';
    vectorCtx.font = 'bold 14px Inter';
    vectorCtx.fillText(`F = ${vectorMagnitude}N`, endX + 10, endY - 10);
    
    vectorCtx.fillStyle = '#10b981';
    vectorCtx.fillText(`Fx = ${(vectorMagnitude * Math.cos(angleRad)).toFixed(1)}N`, centerX + 10, centerY - 10);
    vectorCtx.fillText(`Fy = ${(vectorMagnitude * Math.sin(angleRad)).toFixed(1)}N`, endX + 10, centerY + 20);
}

function resetVector() {
    document.getElementById('vec-magnitude').value = 50;
    document.getElementById('vec-angle').value = 45;
    document.getElementById('vec-mag-display').textContent = '50';
    document.getElementById('vec-angle-display').textContent = '45';
    vectorMagnitude = 50;
    vectorAngle = 45;
    drawVector();
}

// Simple Harmonic Motion Simulation
let shmCanvas, shmCtx;
let shmAnimationId = null;
let shmRunning = false;
let shmTime = 0;
let shmAmplitude = 50;
let shmFrequency = 1;

function initSHMSimulation() {
    shmCanvas = document.getElementById('shm-canvas');
    if (!shmCanvas) return;
    
    shmCtx = shmCanvas.getContext('2d');
    
    const ampSlider = document.getElementById('shm-amplitude');
    const freqSlider = document.getElementById('shm-frequency');
    const ampDisplay = document.getElementById('shm-amp-display');
    const freqDisplay = document.getElementById('shm-freq-display');
    
    if (ampSlider) {
        ampSlider.addEventListener('input', (e) => {
            shmAmplitude = parseFloat(e.target.value);
            ampDisplay.textContent = shmAmplitude;
        });
    }
    
    if (freqSlider) {
        freqSlider.addEventListener('input', (e) => {
            shmFrequency = parseFloat(e.target.value);
            freqDisplay.textContent = shmFrequency;
        });
    }
    
    drawSHM();
}

function drawSHM() {
    if (!shmCtx) return;
    
    const width = shmCanvas.width;
    const height = shmCanvas.height;
    const centerY = height / 2;
    
    // Clear canvas
    shmCtx.clearRect(0, 0, width, height);
    
    // Draw equilibrium line
    shmCtx.strokeStyle = '#e5e7eb';
    shmCtx.lineWidth = 2;
    shmCtx.beginPath();
    shmCtx.moveTo(0, centerY);
    shmCtx.lineTo(width, centerY);
    shmCtx.stroke();
    
    // Draw sine wave
    shmCtx.strokeStyle = '#6366f1';
    shmCtx.lineWidth = 3;
    shmCtx.beginPath();
    
    for (let x = 0; x < width; x++) {
        const t = (x / width) * 4 * Math.PI + shmTime;
        const y = centerY - shmAmplitude * Math.sin(shmFrequency * t);
        if (x === 0) {
            shmCtx.moveTo(x, y);
        } else {
            shmCtx.lineTo(x, y);
        }
    }
    shmCtx.stroke();
    
    // Draw current position marker
    const currentX = width / 2;
    const currentY = centerY - shmAmplitude * Math.sin(shmFrequency * (2 * Math.PI + shmTime));
    
    shmCtx.fillStyle = '#ec4899';
    shmCtx.beginPath();
    shmCtx.arc(currentX, currentY, 8, 0, 2 * Math.PI);
    shmCtx.fill();
    
    // Draw labels
    shmCtx.fillStyle = '#333';
    shmCtx.font = '12px Inter';
    shmCtx.fillText('Equilibrium', 10, centerY - 5);
    shmCtx.fillText(`A = ${shmAmplitude}`, 10, 20);
    shmCtx.fillText(`f = ${shmFrequency} Hz`, 10, 40);
}

function toggleSHM() {
    const button = document.getElementById('shm-toggle');
    
    if (shmRunning) {
        cancelAnimationFrame(shmAnimationId);
        shmRunning = false;
        button.textContent = 'Start';
    } else {
        shmRunning = true;
        button.textContent = 'Stop';
        animateSHM();
    }
}

function animateSHM() {
    if (!shmRunning) return;
    
    shmTime += 0.05;
    drawSHM();
    shmAnimationId = requestAnimationFrame(animateSHM);
}

// Beam Deflection Simulation
let beamCanvas, beamCtx;
let beamLoad = 100;
let beamPosition = 50;

function initBeamSimulation() {
    beamCanvas = document.getElementById('beam-canvas');
    if (!beamCanvas) return;
    
    beamCtx = beamCanvas.getContext('2d');
    
    const loadSlider = document.getElementById('beam-load');
    const posSlider = document.getElementById('beam-position');
    const loadDisplay = document.getElementById('beam-load-display');
    const posDisplay = document.getElementById('beam-pos-display');
    
    if (loadSlider) {
        loadSlider.addEventListener('input', (e) => {
            beamLoad = parseFloat(e.target.value);
            loadDisplay.textContent = beamLoad;
            drawBeam();
        });
    }
    
    if (posSlider) {
        posSlider.addEventListener('input', (e) => {
            beamPosition = parseFloat(e.target.value);
            posDisplay.textContent = beamPosition;
            drawBeam();
        });
    }
    
    drawBeam();
}

function drawBeam() {
    if (!beamCtx) return;
    
    const width = beamCanvas.width;
    const height = beamCanvas.height;
    const beamY = height / 2;
    const beamLength = width * 0.8;
    const beamStartX = width * 0.1;
    const beamEndX = beamStartX + beamLength;
    
    // Clear canvas
    beamCtx.clearRect(0, 0, width, height);
    
    // Draw supports
    beamCtx.fillStyle = '#333';
    // Left support (pin)
    beamCtx.beginPath();
    beamCtx.moveTo(beamStartX - 10, beamY + 20);
    beamCtx.lineTo(beamStartX, beamY);
    beamCtx.lineTo(beamStartX + 10, beamY + 20);
    beamCtx.closePath();
    beamCtx.fill();
    
    // Right support (roller)
    beamCtx.beginPath();
    beamCtx.arc(beamEndX, beamY + 20, 10, 0, Math.PI);
    beamCtx.fill();
    beamCtx.beginPath();
    beamCtx.moveTo(beamEndX - 10, beamY + 20);
    beamCtx.lineTo(beamEndX + 10, beamY + 20);
    beamCtx.lineWidth = 2;
    beamCtx.stroke();
    
    // Draw beam (undeflected)
    beamCtx.strokeStyle = '#ccc';
    beamCtx.lineWidth = 2;
    beamCtx.beginPath();
    beamCtx.moveTo(beamStartX, beamY);
    beamCtx.lineTo(beamEndX, beamY);
    beamCtx.stroke();
    
    // Calculate deflection (simplified)
    const loadX = beamStartX + (beamLength * beamPosition / 100);
    const maxDeflection = (beamLoad / 100) * 30; // Simplified calculation
    const deflection = maxDeflection * Math.sin((Math.PI * (loadX - beamStartX)) / beamLength);
    
    // Draw deflected beam
    beamCtx.strokeStyle = '#6366f1';
    beamCtx.lineWidth = 3;
    beamCtx.beginPath();
    for (let x = beamStartX; x <= beamEndX; x += 2) {
        const localDeflection = maxDeflection * Math.sin((Math.PI * (x - beamStartX)) / beamLength);
        const y = beamY - localDeflection;
        if (x === beamStartX) {
            beamCtx.moveTo(x, y);
        } else {
            beamCtx.lineTo(x, y);
        }
    }
    beamCtx.stroke();
    
    // Draw load
    const loadY = beamY - deflection;
    beamCtx.fillStyle = '#ec4899';
    beamCtx.beginPath();
    beamCtx.moveTo(loadX - 5, loadY);
    beamCtx.lineTo(loadX + 5, loadY);
    beamCtx.lineTo(loadX, loadY - 15);
    beamCtx.closePath();
    beamCtx.fill();
    
    // Draw load label
    beamCtx.fillStyle = '#333';
    beamCtx.font = 'bold 12px Inter';
    beamCtx.fillText(`${beamLoad}N`, loadX - 15, loadY - 20);
    
    // Draw deflection label
    beamCtx.fillStyle = '#6366f1';
    beamCtx.fillText(`Max Deflection: ${maxDeflection.toFixed(1)}px`, 10, 20);
}

function updateBeam() {
    drawBeam();
}

// Unit Converter
const converterData = {
    length: {
        units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
        toBase: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
        base: 'm'
    },
    mass: {
        units: ['g', 'kg', 'lb', 'oz', 'slug', 't'],
        toBase: { g: 0.001, kg: 1, lb: 0.453592, oz: 0.0283495, slug: 14.5939, t: 1000 },
        base: 'kg'
    },
    force: {
        units: ['N', 'kN', 'MN', 'lbf', 'kip', 'dyn'],
        toBase: { N: 1, kN: 1000, MN: 1e6, lbf: 4.44822, kip: 4448.22, dyn: 1e-5 },
        base: 'N'
    },
    pressure: {
        units: ['Pa', 'kPa', 'MPa', 'GPa', 'psi', 'ksi', 'bar', 'atm', 'mmHg'],
        toBase: { Pa: 1, kPa: 1000, MPa: 1e6, GPa: 1e9, psi: 6894.76, ksi: 6894760, bar: 1e5, atm: 101325, mmHg: 133.322 },
        base: 'Pa'
    },
    temperature: {
        units: ['°C', '°F', 'K', '°R'],
        special: true
    },
    energy: {
        units: ['J', 'kJ', 'MJ', 'cal', 'kcal', 'BTU', 'kWh', 'ft·lbf'],
        toBase: { J: 1, kJ: 1000, MJ: 1e6, cal: 4.184, kcal: 4184, BTU: 1055.06, kWh: 3.6e6, 'ft·lbf': 1.35582 },
        base: 'J'
    },
    power: {
        units: ['W', 'kW', 'MW', 'hp', 'BTU/hr', 'ft·lbf/s'],
        toBase: { W: 1, kW: 1000, MW: 1e6, hp: 745.7, 'BTU/hr': 0.293071, 'ft·lbf/s': 1.35582 },
        base: 'W'
    },
    torque: {
        units: ['N·m', 'kN·m', 'N·cm', 'lbf·in', 'ft·lbf', 'kgf·m'],
        toBase: { 'N·m': 1, 'kN·m': 1000, 'N·cm': 0.01, 'lbf·in': 0.112985, 'ft·lbf': 1.35582, 'kgf·m': 9.80665 },
        base: 'N·m'
    }
};

function updateConverterUnits() {
    const category = document.getElementById('converter-category').value;
    const fromSelect = document.getElementById('converter-from');
    const toSelect = document.getElementById('converter-to');
    const data = converterData[category];

    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    data.units.forEach((unit, i) => {
        fromSelect.innerHTML += `<option value="${unit}">${unit}</option>`;
        toSelect.innerHTML += `<option value="${unit}" ${i === 1 ? 'selected' : ''}>${unit}</option>`;
    });

    document.getElementById('converter-result').textContent = '-';
    document.getElementById('converter-formula').textContent = '-';
    convertUnits();
}

function convertTemperature(value, from, to) {
    // Convert to Celsius first
    let celsius;
    switch (from) {
        case '°C': celsius = value; break;
        case '°F': celsius = (value - 32) * 5 / 9; break;
        case 'K':  celsius = value - 273.15; break;
        case '°R': celsius = (value - 491.67) * 5 / 9; break;
    }
    // Convert from Celsius to target
    switch (to) {
        case '°C': return celsius;
        case '°F': return celsius * 9 / 5 + 32;
        case 'K':  return celsius + 273.15;
        case '°R': return (celsius + 273.15) * 9 / 5;
    }
}

function convertUnits() {
    const value = parseFloat(document.getElementById('converter-value').value);
    const category = document.getElementById('converter-category').value;
    const from = document.getElementById('converter-from').value;
    const to = document.getElementById('converter-to').value;
    const resultEl = document.getElementById('converter-result');
    const formulaEl = document.getElementById('converter-formula');

    if (isNaN(value)) {
        resultEl.textContent = '-';
        formulaEl.textContent = '-';
        return;
    }

    const data = converterData[category];
    let result;

    if (data.special) {
        result = convertTemperature(value, from, to);
    } else {
        const inBase = value * data.toBase[from];
        result = inBase / data.toBase[to];
    }

    const formatted = Math.abs(result) < 0.001 || Math.abs(result) >= 1e6
        ? result.toExponential(4)
        : parseFloat(result.toPrecision(6)).toString();

    resultEl.textContent = `${formatted} ${to}`;
    formulaEl.textContent = `${value} ${from} = ${formatted} ${to}`;
}

function swapConverterUnits() {
    const fromSelect = document.getElementById('converter-from');
    const toSelect = document.getElementById('converter-to');
    const tmp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tmp;
    convertUnits();
}

// Concept Card Interactions - Learn More button handlers
document.querySelectorAll('.learn-more-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent card click event
        const card = this.closest('.concept-card');
        const concept = card.getAttribute('data-concept');
        if (concept) {
            navigateToConcept(concept);
        }
    });
});

function navigateToConcept(concept) {
    const conceptPages = {
        statics: 'statics.html',
        thermodynamics: 'statics.html', // Placeholder - using statics for now
        materials: 'statics.html', // Placeholder - using statics for now
        fluids: 'statics.html', // Placeholder - using statics for now
        design: 'statics.html', // Placeholder - using statics for now
        vibrations: 'statics.html' // Placeholder - using statics for now
    };
    
    const page = conceptPages[concept];
    if (page) {
        window.location.href = page;
    }
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Observe sections for fade-in animation
    const sections = document.querySelectorAll('.concepts, .calculators, .simulations');
    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
    
    // Initialize unit converter
    updateConverterUnits();

    // Initialize simulations
    initVectorSimulation();
    initSHMSimulation();
    initBeamSimulation();
    
    // Add enter key support for calculator inputs
    document.querySelectorAll('.input-group input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const panel = input.closest('.calculator-panel');
                const calcBtn = panel.querySelector('.calculate-btn');
                if (calcBtn) calcBtn.click();
            }
        });
    });
});
