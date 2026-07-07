/*
 * Mechanical Mastery test suite for the pure physics core.
 * Run with: node tests/run-tests.js
 */
'use strict';
const MM = require('../js/physics.js');

let passed = 0, failed = 0;
const failures = [];

function approx(actual, expected, tol = 1e-6) {
  if (expected === 0) return Math.abs(actual) < tol;
  return Math.abs(actual - expected) / Math.abs(expected) < tol;
}

function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    failed++;
    failures.push(`${name}: ${err.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function assertApprox(actual, expected, tol, label) {
  assert(approx(actual, expected, tol),
    `${label || 'value'} = ${actual}, expected ≈ ${expected}`);
}

// ---------- statics ----------
test('resultant of opposing forces is zero', () => {
  const r = MM.resultant2D([{ mag: 10, angleDeg: 0 }, { mag: 10, angleDeg: 180 }]);
  assertApprox(r.mag, 0, 1e-9, 'magnitude');
});

test('3-4-5 resultant', () => {
  const r = MM.resultant2D([{ mag: 3, angleDeg: 0 }, { mag: 4, angleDeg: 90 }]);
  assertApprox(r.mag, 5, 1e-9, 'magnitude');
  assertApprox(r.angleDeg, 53.13010235, 1e-6, 'angle');
});

test('moment sign convention (+CCW)', () => {
  // 10 N upward at x=2 about origin -> +20 N·m
  assertApprox(MM.momentAboutPoint(0, 10, 2, 0, 0, 0), 20, 1e-9, 'moment');
  // 10 N upward at x=-2 -> -20
  assertApprox(MM.momentAboutPoint(0, 10, -2, 0, 0, 0), -20, 1e-9, 'moment');
});

// ---------- beams ----------
test('SS beam central point load', () => {
  const L = 4, P = 1000, EI = 2e6;
  const r = MM.ssPointLoad(L, P, L / 2, EI);
  assertApprox(r.R1, 500, 1e-9, 'R1');
  assertApprox(r.Mmax, P * L / 4, 1e-9, 'Mmax');
  assertApprox(r.deltaMax, (P * L ** 3) / (48 * EI), 1e-6, 'deltaMax');
  assertApprox(r.xDeltaMax, 2, 1e-6, 'xDeltaMax');
});

test('SS beam off-center point load reactions', () => {
  const r = MM.ssPointLoad(10, 600, 3, 0);
  assertApprox(r.R1, 420, 1e-9, 'R1');
  assertApprox(r.R2, 180, 1e-9, 'R2');
  assertApprox(r.Mmax, 600 * 3 * 7 / 10, 1e-9, 'Mmax');
});

test('SS beam UDL', () => {
  const L = 6, w = 500, EI = 5e6;
  const r = MM.ssUDL(L, w, EI);
  assertApprox(r.R1, 1500, 1e-9, 'R');
  assertApprox(r.Mmax, w * L * L / 8, 1e-9, 'Mmax');
  assertApprox(r.deltaMax, 5 * w * L ** 4 / (384 * EI), 1e-9, 'deltaMax');
});

test('cantilever point load at tip', () => {
  const L = 2, P = 800, EI = 1e6;
  const r = MM.cantileverPointLoad(L, P, L, EI);
  assertApprox(r.Mmax, 1600, 1e-9, 'Mmax');
  assertApprox(r.deltaMax, P * L ** 3 / (3 * EI), 1e-9, 'tip deflection');
});

test('cantilever UDL', () => {
  const L = 3, w = 400, EI = 2e6;
  const r = MM.cantileverUDL(L, w, EI);
  assertApprox(r.Mmax, w * L * L / 2, 1e-9, 'Mmax');
  assertApprox(r.deltaMax, w * L ** 4 / (8 * EI), 1e-9, 'tip deflection');
});

test('beam diagram closes to zero moment at free ends', () => {
  const d = MM.beamDiagrams({ type: 'ss', load: 'point', L: 5, P: 1000, a: 2 });
  assertApprox(d.M[0], 0, 1e-6, 'M(0)');
  assertApprox(d.M[d.M.length - 1], 0, 1e-6, 'M(L)');
  const peak = Math.max(...d.M);
  assertApprox(peak, 1000 * 2 * 3 / 5, 0.02, 'peak moment');
});

// ---------- mechanics of materials ----------
test('axial stress/elongation', () => {
  // Steel rod: F=10 kN, A=100 mm², L=1 m, E=200 GPa
  const sigma = MM.axialStress(10000, 100e-6);
  assertApprox(sigma, 100e6, 1e-9, 'stress'); // 100 MPa
  const d = MM.elongation(10000, 1, 100e-6, 200e9);
  assertApprox(d, 0.5e-3, 1e-9, 'elongation'); // 0.5 mm
});

test('section properties', () => {
  assertApprox(MM.rectI(0.1, 0.2), 0.1 * 0.008 / 12, 1e-12, 'rect I');
  assertApprox(MM.circleJ(0.05), Math.PI * 0.05 ** 4 / 32, 1e-12, 'circle J');
  assertApprox(MM.circleJ(0.05), 2 * MM.circleI(0.05), 1e-9, 'J = 2I for circle');
});

test('torsion: shear stress and twist', () => {
  const d = 0.05, J = MM.circleJ(d), T = 500, L = 2, G = 80e9;
  const tau = MM.torsionShear(T, d / 2, J);
  assertApprox(tau, T * (d / 2) / J, 1e-12, 'tau');
  const phi = MM.angleOfTwist(T, L, J, G);
  assertApprox(phi, T * L / (J * G), 1e-12, 'phi');
});

test('power-torque-speed', () => {
  // 100 N·m at 3000 rpm ≈ 31.4 kW
  assertApprox(MM.powerFromTorque(100, 3000), 31415.9265, 1e-6, 'power');
  assertApprox(MM.torqueFromPower(31415.9265, 3000), 100, 1e-6, 'torque');
});

test('Euler buckling', () => {
  // Pinned-pinned steel column: E=200GPa, I=1e-6 m^4, L=3 m
  const P = MM.eulerBuckling(200e9, 1e-6, 3, 1);
  assertApprox(P, Math.PI ** 2 * 200e9 * 1e-6 / 9, 1e-9, 'Pcr');
});

// ---------- thermodynamics ----------
test('ideal gas solve each variable', () => {
  // 1 mol at 300 K in 0.0224 m³ -> P ≈ 111.36 kPa... just check consistency
  const base = { P: 100000, V: 0.025, T: 300 };
  const n = MM.idealGasSolve({ ...base, n: null }).n;
  assertApprox(MM.idealGasSolve({ V: base.V, n, T: base.T, P: null }).P, base.P, 1e-9, 'P');
  assertApprox(MM.idealGasSolve({ P: base.P, n, T: base.T, V: null }).V, base.V, 1e-9, 'V');
  assertApprox(MM.idealGasSolve({ P: base.P, V: base.V, n, T: null }).T, base.T, 1e-9, 'T');
});

test('isothermal work', () => {
  // 1 mol at 300 K doubling volume: W = nRT ln2
  const r = MM.gasProcess('isothermal', { n: 1, T1: 300, V1: 1, V2: 2 });
  assertApprox(r.W, 1 * MM.CONST.R * 300 * Math.LN2, 1e-9, 'W');
  assertApprox(r.Q, r.W, 1e-12, 'Q = W');
  assertApprox(r.dU, 0, 1e-12, 'dU = 0');
});

test('isobaric first law consistency', () => {
  const r = MM.gasProcess('isobaric', { n: 1, P: 100000, V1: 0.020, V2: 0.030 });
  assertApprox(r.Q, r.dU + r.W, 1e-6, 'Q = dU + W');
  assertApprox(r.W, 1000, 1e-9, 'W = P dV');
});

test('adiabatic temperature ratio', () => {
  // Diatomic gas compressed to half volume: T2 = T1 · 2^0.4
  const r = MM.gasProcess('adiabatic', { n: 1, T1: 300, V1: 2, V2: 1, gamma: 1.4 });
  assertApprox(r.T2, 300 * Math.pow(2, 0.4), 1e-9, 'T2');
  assertApprox(r.Q, 0, 1e-12, 'Q');
  assertApprox(r.W, -r.dU, 1e-9, 'W = -dU');
});

test('Carnot and COP', () => {
  assertApprox(MM.carnotEfficiency(600, 300), 0.5, 1e-12, 'eta');
  assertApprox(MM.copRefrigerator(300, 250), 5, 1e-12, 'COP_R');
  assertApprox(MM.copHeatPump(300, 250), 6, 1e-12, 'COP_HP');
  assertApprox(MM.copHeatPump(300, 250) - MM.copRefrigerator(300, 250), 1, 1e-9, 'COP_HP = COP_R + 1');
});

// ---------- fluids ----------
test('Reynolds number and regime', () => {
  const Re = MM.reynolds(998, 1, 0.05, 1.002e-3);
  assertApprox(Re, 998 * 1 * 0.05 / 1.002e-3, 1e-12, 'Re');
  assert(MM.flowRegime(1000) === 'laminar', 'laminar');
  assert(MM.flowRegime(3000) === 'transitional', 'transitional');
  assert(MM.flowRegime(10000) === 'turbulent', 'turbulent');
});

test('laminar friction factor', () => {
  assertApprox(MM.darcyFrictionFactor(1000), 0.064, 1e-12, 'f');
});

test('Haaland friction factor sane for smooth pipe', () => {
  const f = MM.darcyFrictionFactor(1e5, 0);
  // Blasius gives ~0.0179 at Re=1e5; Haaland should be within ~5%
  assertApprox(f, 0.0179, 0.06, 'f turbulent');
});

test('pressure drop and hydrostatics', () => {
  const dp = MM.pressureDrop(0.02, 100, 0.05, 998, 2);
  assertApprox(dp, 0.02 * (100 / 0.05) * 998 * 4 / 2, 1e-12, 'dp');
  assertApprox(MM.hydrostaticPressure(998, 10), 998 * 9.80665 * 10, 1e-12, 'P_hydro');
  assertApprox(MM.dynamicPressure(1.204, 10), 60.2, 1e-9, 'q');
});

// ---------- heat transfer ----------
test('conduction/convection/radiation', () => {
  assertApprox(MM.conduction(0.8, 10, 20, 0.2), 800, 1e-9, 'conduction');
  assertApprox(MM.convection(25, 2, 30), 1500, 1e-9, 'convection');
  const q = MM.radiation(0.9, 1, 400, 300);
  assertApprox(q, 0.9 * 5.670374419e-8 * (400 ** 4 - 300 ** 4), 1e-9, 'radiation');
});

test('thermal series resistance', () => {
  const { Rtot, q } = MM.thermalSeries([0.1, 0.2, 0.2], 50);
  assertApprox(Rtot, 0.5, 1e-12, 'Rtot');
  assertApprox(q, 100, 1e-12, 'q');
});

test('lumped capacitance decays toward ambient', () => {
  const p = { h: 50, Lc: 0.005, k: 200, rho: 2700, c: 900, V: 1e-6, A: 6e-4, Ti: 100, Tinf: 25, t: 60 };
  const r = MM.lumpedCapacitance(p);
  assert(r.valid, 'Bi < 0.1 should be valid');
  assert(r.T < 100 && r.T > 25, 'T between Ti and Tinf');
  const later = MM.lumpedCapacitance({ ...p, t: 600 });
  assert(later.T < r.T, 'monotonic cooling');
});

// ---------- projectile & SHM ----------
test('projectile 45° level ground', () => {
  const r = MM.projectile(20, 45, 0);
  assertApprox(r.range, 400 / MM.CONST.g, 1e-9, 'range = v²/g at 45°');
  assertApprox(r.hMax, 100 / MM.CONST.g, 1e-9, 'hMax');
  assertApprox(r.tFlight, 2 * r.tApex, 1e-9, 'symmetric flight');
});

test('projectile from height lands beyond level-ground range', () => {
  const level = MM.projectile(20, 30, 0);
  const raised = MM.projectile(20, 30, 10);
  assert(raised.range > level.range, 'longer range from height');
  assert(raised.tFlight > level.tFlight, 'longer flight from height');
});

test('drag step reduces speed vs vacuum', () => {
  let s = { x: 0, y: 0, vx: 30, vy: 30 };
  const p = { m: 0.145, Cd: 0.47, rho: 1.204, A: 4.2e-3, g: 9.80665 };
  for (let i = 0; i < 100; i++) s = MM.dragStep(s, 0.01, p);
  // After 1 s in vacuum: vx stays 30. With drag it must be less.
  assert(s.vx < 30, 'vx decays with drag');
  assert(s.vx > 0, 'vx stays positive');
});

test('SHM undamped period', () => {
  // m=1, k=4 -> wn=2, T=pi. x(t) should return to x0 at t=T.
  const p = { m: 1, k: 4, c: 0, x0: 0.1, v0: 0 };
  assertApprox(MM.shmPosition(Math.PI, p), 0.1, 1e-9, 'x(T) = x0');
  assertApprox(MM.shmPosition(Math.PI / 2, p), -0.1, 1e-9, 'x(T/2) = -x0');
});

test('damped SHM decays', () => {
  const p = { m: 1, k: 4, c: 0.5, x0: 0.1, v0: 0 };
  assert(Math.abs(MM.shmPosition(10, p)) < 0.01, 'amplitude decays');
});

// ---------- units ----------
test('length/pressure/energy conversions', () => {
  assertApprox(MM.convert(1, 'in', 'mm', 'length'), 25.4, 1e-12, 'in->mm');
  assertApprox(MM.convert(1, 'atm', 'psi', 'pressure'), 14.6959, 1e-4, 'atm->psi');
  assertApprox(MM.convert(1, 'kWh', 'MJ', 'energy'), 3.6, 1e-12, 'kWh->MJ');
  assertApprox(MM.convert(1, 'hp', 'W', 'power'), 745.6999, 1e-6, 'hp->W');
});

test('temperature conversions', () => {
  assertApprox(MM.convert(100, '°C', '°F', 'temperature'), 212, 1e-9, 'C->F');
  assertApprox(MM.convert(32, '°F', '°C', 'temperature'), 0, 1e-9, 'F->C');
  assertApprox(MM.convert(0, '°C', 'K', 'temperature'), 273.15, 1e-9, 'C->K');
  assertApprox(MM.convert(0, 'K', '°R', 'temperature'), 0, 1e-9, 'K->R');
});

test('round-trip conversions are identity', () => {
  for (const cat of Object.keys(MM.UNITS)) {
    const units = Object.keys(MM.UNITS[cat]);
    const v = MM.convert(MM.convert(123.456, units[0], units[1], cat), units[1], units[0], cat);
    assertApprox(v, 123.456, 1e-9, `${cat} round trip`);
  }
});

// ---------- formatting ----------
test('fmt basics', () => {
  assert(MM.fmt(0) === '0', 'zero');
  assert(MM.fmt(NaN) === '—', 'NaN');
  assert(MM.fmt(1234.5) === '1,235', 'rounds to 4 sig figs with separator');
  assert(MM.fmt(1.5e9).includes('e'), 'big numbers use exponent');
});

// ---------- report ----------
console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) {
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
