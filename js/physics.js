/*
 * Mechanical Mastery — physics.js
 * Pure computation core. No DOM access, no side effects.
 * Loaded in the browser as window.MM and in Node (tests) via module.exports.
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------
  const CONST = {
    g: 9.80665,              // standard gravity, m/s^2
    R: 8.314462618,          // universal gas constant, J/(mol·K)
    sigmaSB: 5.670374419e-8, // Stefan–Boltzmann, W/(m^2·K^4)
    atm: 101325,             // standard atmosphere, Pa
    rhoWater: 998,           // water density at 20 °C, kg/m^3
    muWater: 1.002e-3,       // water dynamic viscosity at 20 °C, Pa·s
    rhoAir: 1.204,           // air density at 20 °C, kg/m^3
    muAir: 1.825e-5,         // air dynamic viscosity at 20 °C, Pa·s
  };

  const deg2rad = (d) => (d * Math.PI) / 180;
  const rad2deg = (r) => (r * 180) / Math.PI;

  // ---------------------------------------------------------------
  // Statics
  // ---------------------------------------------------------------

  /** Resultant of coplanar concurrent forces: [{mag, angleDeg}, ...] */
  function resultant2D(forces) {
    let fx = 0, fy = 0;
    for (const f of forces) {
      fx += f.mag * Math.cos(deg2rad(f.angleDeg));
      fy += f.mag * Math.sin(deg2rad(f.angleDeg));
    }
    const mag = Math.hypot(fx, fy);
    const angleDeg = mag < 1e-12 ? 0 : rad2deg(Math.atan2(fy, fx));
    return { fx, fy, mag, angleDeg };
  }

  /** Moment of force (fx, fy) applied at (x, y) about point (px, py). +CCW. */
  function momentAboutPoint(fx, fy, x, y, px, py) {
    return (x - px) * fy - (y - py) * fx;
  }

  // ---------------------------------------------------------------
  // Beams (E·I in consistent units; x measured from left support)
  // ---------------------------------------------------------------

  /** Simply supported beam, point load P at distance a from left, span L. */
  function ssPointLoad(L, P, a, EI) {
    const b = L - a;
    const R1 = (P * b) / L;
    const R2 = (P * a) / L;
    const Mmax = (P * a * b) / L; // under the load
    let deltaMax = null, xDeltaMax = null;
    if (EI > 0) {
      // Max deflection occurs on the longer segment.
      const longSeg = Math.max(a, b);
      const shortSeg = Math.min(a, b);
      // Standard result with load closer to one end (use b as the short side):
      // δmax = P·b·(L²−b²)^{3/2} / (9√3·L·EI) at x = √((L²−b²)/3) from the
      // support on the long-segment side.
      const bs = shortSeg;
      xDeltaMax = Math.sqrt((L * L - bs * bs) / 3);
      deltaMax = (P * bs * Math.pow(L * L - bs * bs, 1.5)) / (9 * Math.sqrt(3) * L * EI);
      if (a < b) xDeltaMax = L - xDeltaMax; // measure from the left support
      void longSeg;
    }
    return { R1, R2, Mmax, xMmax: a, deltaMax, xDeltaMax };
  }

  /** Simply supported beam, uniform load w (force/length) over full span L. */
  function ssUDL(L, w, EI) {
    const R = (w * L) / 2;
    const Mmax = (w * L * L) / 8;
    const deltaMax = EI > 0 ? (5 * w * Math.pow(L, 4)) / (384 * EI) : null;
    return { R1: R, R2: R, Mmax, xMmax: L / 2, deltaMax, xDeltaMax: L / 2 };
  }

  /** Cantilever (fixed at x=0), point load P at distance a from the wall. */
  function cantileverPointLoad(L, P, a, EI) {
    const Mmax = P * a; // at the wall
    const deltaEnd = EI > 0 ? (P * a * a * (3 * L - a)) / (6 * EI) : null;
    return { R: P, Mwall: Mmax, Mmax, xMmax: 0, deltaMax: deltaEnd, xDeltaMax: L };
  }

  /** Cantilever, uniform load w over full length L. */
  function cantileverUDL(L, w, EI) {
    const Mmax = (w * L * L) / 2;
    const deltaEnd = EI > 0 ? (w * Math.pow(L, 4)) / (8 * EI) : null;
    return { R: w * L, Mwall: Mmax, Mmax, xMmax: 0, deltaMax: deltaEnd, xDeltaMax: L };
  }

  /**
   * Sample shear V(x) and moment M(x) for diagram plotting.
   * cfg: { type: 'ss'|'cantilever', load: 'point'|'udl', L, P, a, w, n }
   */
  function beamDiagrams(cfg) {
    const n = cfg.n || 200;
    const xs = [], V = [], M = [];
    const { L } = cfg;
    for (let i = 0; i <= n; i++) {
      const x = (L * i) / n;
      let v = 0, m = 0;
      if (cfg.type === 'ss' && cfg.load === 'point') {
        const { P, a } = cfg;
        const R1 = (P * (L - a)) / L;
        v = x < a ? R1 : R1 - P;
        m = x < a ? R1 * x : R1 * x - P * (x - a);
      } else if (cfg.type === 'ss' && cfg.load === 'udl') {
        const { w } = cfg;
        const R1 = (w * L) / 2;
        v = R1 - w * x;
        m = R1 * x - (w * x * x) / 2;
      } else if (cfg.type === 'cantilever' && cfg.load === 'point') {
        const { P, a } = cfg;
        v = x < a ? P : 0;
        m = x < a ? -P * (a - x) : 0;
      } else if (cfg.type === 'cantilever' && cfg.load === 'udl') {
        const { w } = cfg;
        v = w * (L - x);
        m = -(w * (L - x) * (L - x)) / 2;
      }
      xs.push(x); V.push(v); M.push(m);
    }
    return { x: xs, V, M };
  }

  // ---------------------------------------------------------------
  // Mechanics of materials
  // ---------------------------------------------------------------

  const axialStress = (F, A) => F / A;
  const axialStrain = (delta, L) => delta / L;
  const elongation = (F, L, A, E) => (F * L) / (A * E);
  const factorOfSafety = (strength, stress) => strength / stress;

  const rectI = (b, h) => (b * Math.pow(h, 3)) / 12;
  const circleI = (d) => (Math.PI * Math.pow(d, 4)) / 64;
  const circleJ = (d) => (Math.PI * Math.pow(d, 4)) / 32;

  const bendingStress = (M, c, I) => (M * c) / I;
  const torsionShear = (T, r, J) => (T * r) / J;
  const angleOfTwist = (T, L, J, Gmod) => (T * L) / (J * Gmod);
  /** Shaft power (W) from torque (N·m) and speed (rpm). */
  const powerFromTorque = (T, rpm) => T * ((2 * Math.PI * rpm) / 60);
  const torqueFromPower = (P, rpm) => P / ((2 * Math.PI * rpm) / 60);

  /** Euler critical buckling load. K: effective length factor. */
  const eulerBuckling = (E, I, L, K) => (Math.PI * Math.PI * E * I) / Math.pow(K * L, 2);

  // ---------------------------------------------------------------
  // Thermodynamics
  // ---------------------------------------------------------------

  /**
   * Solve PV = nRT for the one missing variable.
   * vals: {P, V, n, T} with exactly one of them null/undefined.
   */
  function idealGasSolve(vals) {
    const { P, V, n, T } = vals;
    const R = CONST.R;
    const missing = ['P', 'V', 'n', 'T'].filter((k) => vals[k] == null);
    if (missing.length !== 1) throw new Error('Provide exactly three of P, V, n, T');
    switch (missing[0]) {
      case 'P': return { ...vals, P: (n * R * T) / V, solved: 'P' };
      case 'V': return { ...vals, V: (n * R * T) / P, solved: 'V' };
      case 'n': return { ...vals, n: (P * V) / (R * T), solved: 'n' };
      case 'T': return { ...vals, T: (P * V) / (n * R), solved: 'T' };
    }
  }

  /**
   * Boundary work and heat for an ideal-gas process.
   * type: isothermal | isobaric | isochoric | adiabatic
   * p: { n, T1, T2, V1, V2, P, gamma, cv, cp } — supply what the process needs.
   * Returns { W, Q, dU } in joules (W = work done BY the gas).
   */
  function gasProcess(type, p) {
    const R = CONST.R;
    const gamma = p.gamma ?? 1.4;
    const cv = p.cv ?? R / (gamma - 1);
    const cp = p.cp ?? (gamma * R) / (gamma - 1);
    let W, Q, dU;
    switch (type) {
      case 'isothermal': {
        W = p.n * R * p.T1 * Math.log(p.V2 / p.V1);
        dU = 0;
        Q = W;
        break;
      }
      case 'isobaric': {
        W = p.P * (p.V2 - p.V1);
        const T1 = p.T1 ?? (p.P * p.V1) / (p.n * R);
        const T2 = p.T2 ?? (p.P * p.V2) / (p.n * R);
        dU = p.n * cv * (T2 - T1);
        Q = p.n * cp * (T2 - T1);
        break;
      }
      case 'isochoric': {
        W = 0;
        dU = p.n * cv * (p.T2 - p.T1);
        Q = dU;
        break;
      }
      case 'adiabatic': {
        Q = 0;
        // W = (P1V1 − P2V2)/(γ−1) = n·cv·(T1−T2)
        const T2 = p.T2 ?? p.T1 * Math.pow(p.V1 / p.V2, gamma - 1);
        dU = p.n * cv * (T2 - p.T1);
        W = -dU;
        return { W, Q, dU, T2 };
      }
      default:
        throw new Error('Unknown process: ' + type);
    }
    return { W, Q, dU };
  }

  /** Carnot efficiency from absolute temperatures. */
  const carnotEfficiency = (Th, Tc) => 1 - Tc / Th;
  const copRefrigerator = (Th, Tc) => Tc / (Th - Tc);
  const copHeatPump = (Th, Tc) => Th / (Th - Tc);

  // ---------------------------------------------------------------
  // Fluid mechanics
  // ---------------------------------------------------------------

  const reynolds = (rho, v, D, mu) => (rho * v * D) / mu;

  function flowRegime(Re) {
    if (Re < 2300) return 'laminar';
    if (Re <= 4000) return 'transitional';
    return 'turbulent';
  }

  /** Darcy friction factor: exact 64/Re laminar, Haaland correlation turbulent. */
  function darcyFrictionFactor(Re, relRoughness = 0) {
    if (Re <= 0) return NaN;
    if (Re < 2300) return 64 / Re;
    const inv = -1.8 * Math.log10(Math.pow(relRoughness / 3.7, 1.11) + 6.9 / Re);
    return 1 / (inv * inv);
  }

  /** Darcy–Weisbach pressure drop (Pa). */
  const pressureDrop = (f, L, D, rho, v) => f * (L / D) * (rho * v * v) / 2;

  const hydrostaticPressure = (rho, h, g = CONST.g) => rho * g * h;
  const dynamicPressure = (rho, v) => 0.5 * rho * v * v;
  const dragForce = (Cd, rho, v, A) => 0.5 * Cd * rho * v * v * A;
  const volumetricFlow = (v, A) => v * A;

  // ---------------------------------------------------------------
  // Heat transfer
  // ---------------------------------------------------------------

  /** Conduction through a plane wall (W). */
  const conduction = (k, A, dT, L) => (k * A * dT) / L;
  /** Convection from a surface (W). */
  const convection = (h, A, dT) => h * A * dT;
  /** Net radiation exchange, surface at Ts to surroundings at Tsur (W). */
  const radiation = (eps, A, Ts, Tsur) =>
    eps * CONST.sigmaSB * A * (Math.pow(Ts, 4) - Math.pow(Tsur, 4));

  /** Series thermal resistances -> total R and heat rate for a given ΔT. */
  function thermalSeries(resistances, dT) {
    const Rtot = resistances.reduce((s, r) => s + r, 0);
    return { Rtot, q: dT / Rtot };
  }

  /**
   * Lumped-capacitance transient cooling.
   * Returns { Bi, tau, T } — temperature after time t.
   * p: { h, Lc, k, rho, c, V, A, Ti, Tinf, t }
   */
  function lumpedCapacitance(p) {
    const Bi = (p.h * p.Lc) / p.k;
    const tau = (p.rho * p.V * p.c) / (p.h * p.A);
    const T = p.Tinf + (p.Ti - p.Tinf) * Math.exp(-p.t / tau);
    return { Bi, tau, T, valid: Bi < 0.1 };
  }

  // ---------------------------------------------------------------
  // Dynamics / projectile motion
  // ---------------------------------------------------------------

  /** Ideal projectile launched at v0 (m/s), angle (deg), from height h0 (m). */
  function projectile(v0, angleDeg, h0 = 0, g = CONST.g) {
    const th = deg2rad(angleDeg);
    const vx = v0 * Math.cos(th);
    const vy = v0 * Math.sin(th);
    const tApex = vy / g;
    const hMax = h0 + (vy * vy) / (2 * g);
    // Time of flight: solve h0 + vy t − ½gt² = 0 (positive root)
    const tFlight = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g;
    const range = vx * tFlight;
    return { vx, vy, tApex, hMax, tFlight, range };
  }

  /**
   * One semi-implicit Euler step with quadratic drag.
   * state: {x, y, vx, vy}; p: {m, Cd, rho, A, g}; dt seconds.
   */
  function dragStep(state, dt, p) {
    const v = Math.hypot(state.vx, state.vy);
    const k = (0.5 * p.Cd * p.rho * p.A) / p.m;
    const ax = -k * v * state.vx;
    const ay = -p.g - k * v * state.vy;
    const vx = state.vx + ax * dt;
    const vy = state.vy + ay * dt;
    return { x: state.x + vx * dt, y: state.y + vy * dt, vx, vy };
  }

  /** Underdamped/critically/overdamped spring-mass position at time t. */
  function shmPosition(t, p) {
    // p: { m, k, c, x0, v0 }
    const wn = Math.sqrt(p.k / p.m);
    const zeta = p.c / (2 * Math.sqrt(p.k * p.m));
    if (zeta < 1) {
      const wd = wn * Math.sqrt(1 - zeta * zeta);
      const A = p.x0;
      const B = (p.v0 + zeta * wn * p.x0) / wd;
      return Math.exp(-zeta * wn * t) * (A * Math.cos(wd * t) + B * Math.sin(wd * t));
    }
    if (zeta === 1) {
      return Math.exp(-wn * t) * (p.x0 + (p.v0 + wn * p.x0) * t);
    }
    const s1 = -wn * (zeta - Math.sqrt(zeta * zeta - 1));
    const s2 = -wn * (zeta + Math.sqrt(zeta * zeta - 1));
    const C2 = (p.v0 - s1 * p.x0) / (s2 - s1);
    const C1 = p.x0 - C2;
    return C1 * Math.exp(s1 * t) + C2 * Math.exp(s2 * t);
  }

  // ---------------------------------------------------------------
  // Unit conversion
  // ---------------------------------------------------------------
  // Each category maps unit -> factor to SI base. Temperature is special-cased.
  const UNITS = {
    length: { m: 1, mm: 1e-3, cm: 1e-2, km: 1e3, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
    area: { 'm²': 1, 'mm²': 1e-6, 'cm²': 1e-4, 'in²': 6.4516e-4, 'ft²': 0.09290304 },
    volume: { 'm³': 1, L: 1e-3, mL: 1e-6, 'in³': 1.6387064e-5, 'ft³': 0.028316846592, gal: 3.785411784e-3 },
    mass: { kg: 1, g: 1e-3, t: 1e3, lbm: 0.45359237, oz: 0.028349523125, slug: 14.59390 },
    force: { N: 1, kN: 1e3, MN: 1e6, lbf: 4.4482216152605, kip: 4448.2216152605, kgf: 9.80665 },
    pressure: { Pa: 1, kPa: 1e3, MPa: 1e6, GPa: 1e9, bar: 1e5, atm: 101325, psi: 6894.757293168, ksi: 6894757.293168, 'mmHg': 133.322387415 },
    energy: { J: 1, kJ: 1e3, MJ: 1e6, Wh: 3600, kWh: 3.6e6, cal: 4.184, kcal: 4184, BTU: 1055.05585262, 'ft·lbf': 1.3558179483314 },
    power: { W: 1, kW: 1e3, MW: 1e6, hp: 745.69987158227, 'BTU/h': 0.29307107017, 'ft·lbf/s': 1.3558179483314 },
    torque: { 'N·m': 1, 'kN·m': 1e3, 'lbf·ft': 1.3558179483314, 'lbf·in': 0.1129848290276167, 'kgf·m': 9.80665 },
    speed: { 'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704, 'ft/s': 0.3048, knot: 0.514444 },
    flow: { 'm³/s': 1, 'L/s': 1e-3, 'L/min': 1e-3 / 60, 'gal/min': 3.785411784e-3 / 60, 'ft³/s': 0.028316846592 },
    temperature: { '°C': 'C', '°F': 'F', K: 'K', '°R': 'R' },
  };

  function convert(value, from, to, category) {
    const table = UNITS[category];
    if (!table) throw new Error('Unknown category: ' + category);
    if (category === 'temperature') {
      // to kelvin
      let K;
      switch (table[from]) {
        case 'C': K = value + 273.15; break;
        case 'F': K = (value - 32) * 5 / 9 + 273.15; break;
        case 'K': K = value; break;
        case 'R': K = value * 5 / 9; break;
        default: throw new Error('Unknown unit: ' + from);
      }
      switch (table[to]) {
        case 'C': return K - 273.15;
        case 'F': return (K - 273.15) * 9 / 5 + 32;
        case 'K': return K;
        case 'R': return K * 9 / 5;
        default: throw new Error('Unknown unit: ' + to);
      }
    }
    if (!(from in table) || !(to in table)) throw new Error('Unknown unit');
    return (value * table[from]) / table[to];
  }

  // ---------------------------------------------------------------
  // Formatting helpers (pure)
  // ---------------------------------------------------------------

  /** Human-friendly number: engineering-ish precision without noise. */
  function fmt(x, sig = 4) {
    if (x == null || Number.isNaN(x)) return '—';
    if (x === 0) return '0';
    const ax = Math.abs(x);
    if (ax >= 1e6 || ax < 1e-3) return x.toExponential(sig - 1).replace('e+', 'e');
    const digits = Math.max(0, sig - 1 - Math.floor(Math.log10(ax)));
    return x.toLocaleString('en-US', { maximumFractionDigits: Math.min(digits, 8) });
  }

  const MM = {
    CONST, deg2rad, rad2deg,
    resultant2D, momentAboutPoint,
    ssPointLoad, ssUDL, cantileverPointLoad, cantileverUDL, beamDiagrams,
    axialStress, axialStrain, elongation, factorOfSafety,
    rectI, circleI, circleJ, bendingStress, torsionShear, angleOfTwist,
    powerFromTorque, torqueFromPower, eulerBuckling,
    idealGasSolve, gasProcess, carnotEfficiency, copRefrigerator, copHeatPump,
    reynolds, flowRegime, darcyFrictionFactor, pressureDrop,
    hydrostaticPressure, dynamicPressure, dragForce, volumetricFlow,
    conduction, convection, radiation, thermalSeries, lumpedCapacitance,
    projectile, dragStep, shmPosition,
    UNITS, convert, fmt,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = MM;
  global.MM = MM;
})(typeof window !== 'undefined' ? window : globalThis);
