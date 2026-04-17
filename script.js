// ============================================================
// Theme toggle
// ============================================================
(function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('mm-theme', next);
        // Redraw any open canvas sims so colors update
        if (typeof drawVector === 'function') drawVector();
        if (typeof drawSHM === 'function' && !shmRunning) drawSHM();
        if (typeof drawBeam === 'function') drawBeam();
        if (typeof drawProjectile === 'function') drawProjectile();
    });
})();

// ============================================================
// Smooth scroll & CTA
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

document.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = document.querySelector(btn.getAttribute('data-scroll-to'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ============================================================
// Mobile menu
// ============================================================
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// ============================================================
// Calculator tabs
// ============================================================
const tabButtons = document.querySelectorAll('.tab-btn');
const calculatorPanels = document.querySelectorAll('.calculator-panel');

function activateTab(targetTab) {
    tabButtons.forEach(btn => {
        const isActive = btn.getAttribute('data-tab') === targetTab;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    calculatorPanels.forEach(panel => {
        const isActive = panel.id === `${targetTab}-calc`;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
    });
}

tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => activateTab(button.getAttribute('data-tab')));
    button.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const next = tabButtons[(index + dir + tabButtons.length) % tabButtons.length];
        next.focus();
        activateTab(next.getAttribute('data-tab'));
    });
});

// ============================================================
// Calculator helpers
// ============================================================
function readNumber(id) {
    const v = parseFloat(document.getElementById(id).value);
    return Number.isFinite(v) ? v : null;
}

function showError(form, message) {
    const errEl = form.querySelector('.calc-error');
    if (errEl) errEl.textContent = message || '';
}

function fmt(n, digits = 4) {
    if (!Number.isFinite(n)) return '—';
    const abs = Math.abs(n);
    if (abs !== 0 && (abs < 1e-3 || abs >= 1e6)) return n.toExponential(digits);
    return parseFloat(n.toPrecision(digits + 2)).toString();
}

// Stress & Strain
function calculateStress(form) {
    const force = readNumber('force-input');
    const area = readNumber('area-input');
    const length = readNumber('length-input');
    const deformation = readNumber('deformation-input');

    if (force === null || area === null) {
        showError(form, 'Please enter force and area.');
        return;
    }
    if (area <= 0) {
        showError(form, 'Area must be greater than zero.');
        return;
    }
    showError(form, '');

    const stress = force / area;
    document.getElementById('stress-result').textContent = `${fmt(stress)} Pa`;

    if (length !== null && deformation !== null && length > 0) {
        const strain = deformation / length;
        document.getElementById('strain-result').textContent = fmt(strain, 6);
        if (strain !== 0) {
            const modulus = stress / strain;
            document.getElementById('modulus-result').textContent = `${fmt(modulus)} Pa`;
        } else {
            document.getElementById('modulus-result').textContent = 'N/A';
        }
    } else {
        document.getElementById('strain-result').textContent = 'Add length & deformation';
        document.getElementById('modulus-result').textContent = '—';
    }
}

// Force Vector Analysis
function calculateForce(form) {
    const magnitude = readNumber('force-magnitude');
    const angle = readNumber('force-angle');

    if (magnitude === null || angle === null) {
        showError(form, 'Please enter magnitude and angle.');
        return;
    }
    showError(form, '');

    const angleRad = (angle * Math.PI) / 180;
    const fx = magnitude * Math.cos(angleRad);
    const fy = magnitude * Math.sin(angleRad);

    document.getElementById('fx-result').textContent = `${fmt(fx)} N`;
    document.getElementById('fy-result').textContent = `${fmt(fy)} N`;
    document.getElementById('resultant-result').textContent = `${fmt(magnitude)} N`;

    updateForceVisualization(magnitude, angle);
}

function updateForceVisualization(magnitude, angle) {
    const arrow = document.getElementById('force-arrow');
    const label = document.getElementById('force-label');
    if (!arrow || !label) return;

    const centerX = 150;
    const centerY = 150;
    const length = Math.min(magnitude / 2, 80);
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

// Heat Transfer
function calculateHeat(form) {
    const k = readNumber('thermal-conductivity');
    const A = readNumber('surface-area');
    const deltaT = readNumber('temp-diff');
    const L = readNumber('thickness');

    if (k === null || A === null || deltaT === null || L === null) {
        showError(form, 'Please enter all four values.');
        return;
    }
    if (L <= 0) {
        showError(form, 'Thickness must be greater than zero.');
        return;
    }
    showError(form, '');

    const Q = (k * A * deltaT) / L;
    document.getElementById('heat-result').textContent = `${fmt(Q)} W`;
}

// Fluid Flow
function calculateFluid(form) {
    const Q = readNumber('flow-rate');
    const D = readNumber('pipe-diameter');

    if (Q === null || D === null) {
        showError(form, 'Please enter flow rate and pipe diameter.');
        return;
    }
    if (D <= 0) {
        showError(form, 'Pipe diameter must be greater than zero.');
        return;
    }
    showError(form, '');

    const A = Math.PI * Math.pow(D / 2, 2);
    const v = Q / A;

    document.getElementById('velocity-result').textContent = `${fmt(v)} m/s`;
    document.getElementById('pipe-area-result').textContent = `${fmt(A, 6)} m²`;
}

const calcHandlers = {
    stress: calculateStress,
    force: calculateForce,
    heat: calculateHeat,
    fluid: calculateFluid
};

document.querySelectorAll('form[data-calc]').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const handler = calcHandlers[form.getAttribute('data-calc')];
        if (handler) handler(form);
    });
});

// ============================================================
// Force Vector Visualization Simulation
// ============================================================
let vectorCanvas, vectorCtx;
let vectorMagnitude = 50;
let vectorAngle = 45;

function initVectorSimulation() {
    vectorCanvas = document.getElementById('vector-canvas');
    if (!vectorCanvas) return;
    vectorCtx = vectorCanvas.getContext('2d');

    const magSlider = document.getElementById('vec-magnitude');
    const angleSlider = document.getElementById('vec-angle');
    const magDisplay = document.getElementById('vec-mag-display');
    const angleDisplay = document.getElementById('vec-angle-display');

    magSlider?.addEventListener('input', (e) => {
        vectorMagnitude = parseFloat(e.target.value);
        magDisplay.textContent = vectorMagnitude;
        drawVector();
    });
    angleSlider?.addEventListener('input', (e) => {
        vectorAngle = parseFloat(e.target.value);
        angleDisplay.textContent = vectorAngle;
        drawVector();
    });

    drawVector();
}

function getThemeColors() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        grid: dark ? '#374151' : '#e5e7eb',
        axis: dark ? '#9ca3af' : '#333',
        primary: dark ? '#818cf8' : '#6366f1',
        accent: dark ? '#f472b6' : '#ec4899',
        success: dark ? '#34d399' : '#10b981',
        text: dark ? '#f3f4f6' : '#333'
    };
}

function drawVector() {
    if (!vectorCtx) return;
    const colors = getThemeColors();
    const width = vectorCanvas.width;
    const height = vectorCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    vectorCtx.clearRect(0, 0, width, height);

    vectorCtx.strokeStyle = colors.grid;
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

    vectorCtx.strokeStyle = colors.axis;
    vectorCtx.lineWidth = 2;
    vectorCtx.beginPath();
    vectorCtx.moveTo(centerX, 0);
    vectorCtx.lineTo(centerX, height);
    vectorCtx.moveTo(0, centerY);
    vectorCtx.lineTo(width, centerY);
    vectorCtx.stroke();

    const angleRad = (vectorAngle * Math.PI) / 180;
    const length = Math.min(vectorMagnitude * 2, 120);
    const endX = centerX + length * Math.cos(angleRad);
    const endY = centerY - length * Math.sin(angleRad);

    vectorCtx.strokeStyle = colors.primary;
    vectorCtx.fillStyle = colors.primary;
    vectorCtx.lineWidth = 3;
    vectorCtx.beginPath();
    vectorCtx.moveTo(centerX, centerY);
    vectorCtx.lineTo(endX, endY);
    vectorCtx.stroke();

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

    vectorCtx.strokeStyle = colors.success;
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

    vectorCtx.fillStyle = colors.primary;
    vectorCtx.font = 'bold 14px Inter, sans-serif';
    vectorCtx.fillText(`F = ${vectorMagnitude}N`, endX + 10, endY - 10);

    vectorCtx.fillStyle = colors.success;
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

// ============================================================
// Simple Harmonic Motion Simulation
// ============================================================
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

    ampSlider?.addEventListener('input', (e) => {
        shmAmplitude = parseFloat(e.target.value);
        ampDisplay.textContent = shmAmplitude;
        if (!shmRunning) drawSHM();
    });
    freqSlider?.addEventListener('input', (e) => {
        shmFrequency = parseFloat(e.target.value);
        freqDisplay.textContent = shmFrequency;
        if (!shmRunning) drawSHM();
    });

    drawSHM();
}

function drawSHM() {
    if (!shmCtx) return;
    const colors = getThemeColors();
    const width = shmCanvas.width;
    const height = shmCanvas.height;
    const centerY = height / 2;

    shmCtx.clearRect(0, 0, width, height);

    shmCtx.strokeStyle = colors.grid;
    shmCtx.lineWidth = 2;
    shmCtx.beginPath();
    shmCtx.moveTo(0, centerY);
    shmCtx.lineTo(width, centerY);
    shmCtx.stroke();

    shmCtx.strokeStyle = colors.primary;
    shmCtx.lineWidth = 3;
    shmCtx.beginPath();
    for (let x = 0; x < width; x++) {
        const t = (x / width) * 4 * Math.PI + shmTime;
        const y = centerY - shmAmplitude * Math.sin(shmFrequency * t);
        if (x === 0) shmCtx.moveTo(x, y);
        else shmCtx.lineTo(x, y);
    }
    shmCtx.stroke();

    const currentX = width / 2;
    const currentY = centerY - shmAmplitude * Math.sin(shmFrequency * (2 * Math.PI + shmTime));

    shmCtx.fillStyle = colors.accent;
    shmCtx.beginPath();
    shmCtx.arc(currentX, currentY, 8, 0, 2 * Math.PI);
    shmCtx.fill();

    shmCtx.fillStyle = colors.text;
    shmCtx.font = '12px Inter, sans-serif';
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

// ============================================================
// Beam Deflection Simulation
// ============================================================
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

    loadSlider?.addEventListener('input', (e) => {
        beamLoad = parseFloat(e.target.value);
        loadDisplay.textContent = beamLoad;
        drawBeam();
    });
    posSlider?.addEventListener('input', (e) => {
        beamPosition = parseFloat(e.target.value);
        posDisplay.textContent = beamPosition;
        drawBeam();
    });

    drawBeam();
}

function drawBeam() {
    if (!beamCtx) return;
    const colors = getThemeColors();
    const width = beamCanvas.width;
    const height = beamCanvas.height;
    const beamY = height / 2;
    const beamLength = width * 0.8;
    const beamStartX = width * 0.1;
    const beamEndX = beamStartX + beamLength;

    beamCtx.clearRect(0, 0, width, height);

    beamCtx.fillStyle = colors.text;
    beamCtx.beginPath();
    beamCtx.moveTo(beamStartX - 10, beamY + 20);
    beamCtx.lineTo(beamStartX, beamY);
    beamCtx.lineTo(beamStartX + 10, beamY + 20);
    beamCtx.closePath();
    beamCtx.fill();

    beamCtx.beginPath();
    beamCtx.arc(beamEndX, beamY + 20, 10, 0, Math.PI);
    beamCtx.fill();
    beamCtx.strokeStyle = colors.text;
    beamCtx.beginPath();
    beamCtx.moveTo(beamEndX - 10, beamY + 20);
    beamCtx.lineTo(beamEndX + 10, beamY + 20);
    beamCtx.lineWidth = 2;
    beamCtx.stroke();

    beamCtx.strokeStyle = colors.grid;
    beamCtx.lineWidth = 2;
    beamCtx.beginPath();
    beamCtx.moveTo(beamStartX, beamY);
    beamCtx.lineTo(beamEndX, beamY);
    beamCtx.stroke();

    const loadX = beamStartX + (beamLength * beamPosition / 100);
    const maxDeflection = (beamLoad / 100) * 30;
    const deflection = maxDeflection * Math.sin((Math.PI * (loadX - beamStartX)) / beamLength);

    beamCtx.strokeStyle = colors.primary;
    beamCtx.lineWidth = 3;
    beamCtx.beginPath();
    for (let x = beamStartX; x <= beamEndX; x += 2) {
        const localDeflection = maxDeflection * Math.sin((Math.PI * (x - beamStartX)) / beamLength);
        const y = beamY + localDeflection;
        if (x === beamStartX) beamCtx.moveTo(x, y);
        else beamCtx.lineTo(x, y);
    }
    beamCtx.stroke();

    const loadY = beamY + deflection;
    beamCtx.fillStyle = colors.accent;
    beamCtx.beginPath();
    beamCtx.moveTo(loadX - 8, loadY - 18);
    beamCtx.lineTo(loadX + 8, loadY - 18);
    beamCtx.lineTo(loadX, loadY);
    beamCtx.closePath();
    beamCtx.fill();

    beamCtx.fillStyle = colors.text;
    beamCtx.font = 'bold 12px Inter, sans-serif';
    beamCtx.fillText(`${beamLoad}N`, loadX - 15, loadY - 24);

    beamCtx.fillStyle = colors.primary;
    beamCtx.fillText(`Max Deflection: ${maxDeflection.toFixed(1)}px`, 10, 20);
}

// ============================================================
// Projectile Motion Simulation
// ============================================================
let projCanvas, projCtx;
let projVelocity = 40;
let projAngle = 45;
let projAnimationId = null;
let projStartTime = 0;
let projTraj = [];

function initProjectileSimulation() {
    projCanvas = document.getElementById('projectile-canvas');
    if (!projCanvas) return;
    projCtx = projCanvas.getContext('2d');

    const vSlider = document.getElementById('proj-velocity');
    const aSlider = document.getElementById('proj-angle');
    const vDisplay = document.getElementById('proj-vel-display');
    const aDisplay = document.getElementById('proj-angle-display');

    vSlider?.addEventListener('input', (e) => {
        projVelocity = parseFloat(e.target.value);
        vDisplay.textContent = projVelocity;
        drawProjectile();
    });
    aSlider?.addEventListener('input', (e) => {
        projAngle = parseFloat(e.target.value);
        aDisplay.textContent = projAngle;
        drawProjectile();
    });

    drawProjectile();
}

function projectileMath() {
    const g = 9.81;
    const angleRad = (projAngle * Math.PI) / 180;
    const vx = projVelocity * Math.cos(angleRad);
    const vy = projVelocity * Math.sin(angleRad);
    const flightTime = (2 * vy) / g;
    const range = vx * flightTime;
    const maxHeight = (vy * vy) / (2 * g);
    return { g, vx, vy, flightTime, range, maxHeight, angleRad };
}

function drawProjectile(progress = 1) {
    if (!projCtx) return;
    const colors = getThemeColors();
    const width = projCanvas.width;
    const height = projCanvas.height;
    const groundY = height - 30;

    projCtx.clearRect(0, 0, width, height);

    // Ground
    projCtx.strokeStyle = colors.text;
    projCtx.lineWidth = 2;
    projCtx.beginPath();
    projCtx.moveTo(0, groundY);
    projCtx.lineTo(width, groundY);
    projCtx.stroke();

    const { g, vx, vy, flightTime, range, maxHeight } = projectileMath();
    const padding = 30;
    const usableW = width - 2 * padding;
    const usableH = groundY - 20;
    const scaleX = usableW / Math.max(range, 1);
    const scaleY = usableH / Math.max(maxHeight, 1);
    const scale = Math.min(scaleX, scaleY * 0.9);

    // Trajectory (full path, faded)
    projCtx.strokeStyle = colors.grid;
    projCtx.lineWidth = 2;
    projCtx.setLineDash([4, 4]);
    projCtx.beginPath();
    for (let t = 0; t <= flightTime; t += flightTime / 60) {
        const x = padding + vx * t * scale;
        const y = groundY - (vy * t - 0.5 * g * t * t) * scale;
        if (t === 0) projCtx.moveTo(x, y);
        else projCtx.lineTo(x, y);
    }
    projCtx.stroke();
    projCtx.setLineDash([]);

    // Animated portion
    const tCurrent = flightTime * progress;
    projCtx.strokeStyle = colors.primary;
    projCtx.lineWidth = 3;
    projCtx.beginPath();
    let lastX = padding, lastY = groundY;
    for (let t = 0; t <= tCurrent; t += flightTime / 120) {
        const x = padding + vx * t * scale;
        const y = groundY - (vy * t - 0.5 * g * t * t) * scale;
        if (t === 0) projCtx.moveTo(x, y);
        else projCtx.lineTo(x, y);
        lastX = x;
        lastY = y;
    }
    projCtx.stroke();

    // Projectile
    projCtx.fillStyle = colors.accent;
    projCtx.beginPath();
    projCtx.arc(lastX, lastY, 6, 0, 2 * Math.PI);
    projCtx.fill();

    // Stats
    projCtx.fillStyle = colors.text;
    projCtx.font = '12px Inter, sans-serif';
    projCtx.fillText(`Range: ${range.toFixed(1)} m`, 10, 18);
    projCtx.fillText(`Max Height: ${maxHeight.toFixed(1)} m`, 10, 34);
    projCtx.fillText(`Flight Time: ${flightTime.toFixed(2)} s`, 10, 50);
}

function launchProjectile() {
    if (projAnimationId) cancelAnimationFrame(projAnimationId);
    const { flightTime } = projectileMath();
    const durationMs = Math.max(800, flightTime * 300);
    projStartTime = performance.now();

    function step(now) {
        const elapsed = now - projStartTime;
        const progress = Math.min(elapsed / durationMs, 1);
        drawProjectile(progress);
        if (progress < 1) {
            projAnimationId = requestAnimationFrame(step);
        } else {
            projAnimationId = null;
        }
    }
    projAnimationId = requestAnimationFrame(step);
}

// ============================================================
// Simulation control delegation
// ============================================================
document.addEventListener('click', (e) => {
    const action = e.target.closest('[data-sim-action]')?.getAttribute('data-sim-action');
    if (!action) return;
    if (action === 'reset-vector') resetVector();
    else if (action === 'toggle-shm') toggleSHM();
    else if (action === 'launch-projectile') launchProjectile();
});

// ============================================================
// Unit Converter
// ============================================================
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
        const opt1 = document.createElement('option');
        opt1.value = unit;
        opt1.textContent = unit;
        fromSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = unit;
        opt2.textContent = unit;
        if (i === 1) opt2.selected = true;
        toSelect.appendChild(opt2);
    });

    convertUnits();
}

function convertTemperature(value, from, to) {
    let celsius;
    switch (from) {
        case '°C': celsius = value; break;
        case '°F': celsius = (value - 32) * 5 / 9; break;
        case 'K':  celsius = value - 273.15; break;
        case '°R': celsius = (value - 491.67) * 5 / 9; break;
    }
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

    if (!Number.isFinite(value)) {
        resultEl.textContent = '—';
        formulaEl.textContent = '—';
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

    const formatted = fmt(result, 6);
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

document.getElementById('converter-category')?.addEventListener('change', updateConverterUnits);
document.getElementById('converter-value')?.addEventListener('input', convertUnits);
document.getElementById('converter-from')?.addEventListener('change', convertUnits);
document.getElementById('converter-to')?.addEventListener('change', convertUnits);
document.getElementById('converter-swap')?.addEventListener('click', swapConverterUnits);

// ============================================================
// Concept Card Navigation
// ============================================================
document.querySelectorAll('.concept-card').forEach(card => {
    const page = card.getAttribute('data-page');
    const navigate = (e) => {
        if (!page) return;
        e?.stopPropagation();
        window.location.href = page;
    };
    const btn = card.querySelector('.learn-more-btn:not(:disabled)');
    btn?.addEventListener('click', navigate);
    if (page) {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            window.location.href = page;
        });
    }
});

// ============================================================
// Scroll animations
// ============================================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// ============================================================
// Footer year
// ============================================================
const yearEl = document.getElementById('copyright-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============================================================
// Init on load
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.concepts, .calculators, .simulations').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });

    if (document.getElementById('converter-category')) {
        updateConverterUnits();
    }

    initVectorSimulation();
    initSHMSimulation();
    initBeamSimulation();
    initProjectileSimulation();
});
