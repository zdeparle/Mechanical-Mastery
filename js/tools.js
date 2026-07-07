/*
 * Mechanical Mastery — tools.js
 * Calculator definitions. Each tool declares fields + a compute function;
 * the shared form builder handles rendering, live updates, and validation.
 * Depends on: physics.js (window.MM), data.js (window.MMDATA).
 */
window.MMTOOLS = (function () {
  'use strict';
  const MM = window.MM;
  const fmt = MM.fmt;

  // ---------------------------------------------------------------
  // Form builder
  // ---------------------------------------------------------------

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    for (const c of [].concat(children)) {
      if (c == null) continue;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
  }

  /**
   * Build a calculator form.
   * spec.fields: [{ id, label, unit, value, min, step, type:'number'|'select', options, allowEmpty }]
   * spec.compute(values) -> [{ label, value, unit, note, warn }] | { error }
   */
  function buildForm(container, spec) {
    const form = el('form', { class: 'calc-form', novalidate: '' });
    const inputs = {};

    for (const f of spec.fields) {
      const fieldWrap = el('div', { class: 'calc-field' });
      const label = el('label', { for: `f-${spec.id}-${f.id}` }, f.label);
      let input;
      if (f.type === 'select') {
        input = el('select', { id: `f-${spec.id}-${f.id}` });
        for (const opt of f.options) {
          const o = el('option', { value: opt.value ?? opt }, String(opt.label ?? opt));
          input.appendChild(o);
        }
        if (f.value != null) input.value = f.value;
      } else {
        input = el('input', {
          id: `f-${spec.id}-${f.id}`,
          type: 'number',
          inputmode: 'decimal',
          step: f.step ?? 'any',
          value: f.value ?? '',
          placeholder: f.allowEmpty ? 'leave blank to solve' : '',
        });
        if (f.min != null) input.setAttribute('min', f.min);
      }
      inputs[f.id] = input;
      fieldWrap.appendChild(label);
      const inputRow = el('div', { class: 'calc-input-row' }, [input]);
      if (f.unit) inputRow.appendChild(el('span', { class: 'calc-unit', html: f.unit }));
      fieldWrap.appendChild(inputRow);
      form.appendChild(fieldWrap);
    }

    const results = el('div', { class: 'calc-results', 'aria-live': 'polite' });

    function readValues() {
      const vals = {};
      for (const f of spec.fields) {
        const raw = inputs[f.id].value;
        if (f.type === 'select') { vals[f.id] = raw; continue; }
        const n = parseFloat(raw);
        vals[f.id] = Number.isFinite(n) ? n : null;
      }
      return vals;
    }

    function render() {
      results.innerHTML = '';
      let out;
      try {
        out = spec.compute(readValues());
      } catch (err) {
        out = { error: err.message };
      }
      if (!out) return;
      if (out.error) {
        results.appendChild(el('p', { class: 'calc-error' }, out.error));
        return;
      }
      for (const row of out) {
        const r = el('div', { class: 'calc-result-row' + (row.warn ? ' warn' : '') }, [
          el('span', { class: 'calc-result-label', html: row.label }),
          el('span', { class: 'calc-result-value', html: `<strong>${row.value}</strong>${row.unit ? ' ' + row.unit : ''}` }),
        ]);
        results.appendChild(r);
        if (row.note) results.appendChild(el('p', { class: 'calc-note', html: row.note }));
      }
    }

    form.addEventListener('input', render);
    form.addEventListener('submit', (e) => { e.preventDefault(); render(); });
    container.appendChild(form);
    container.appendChild(results);
    render();
  }

  // ---------------------------------------------------------------
  // Tool definitions
  // ---------------------------------------------------------------

  const TOOLS = [
    {
      id: 'converter',
      icon: '🔄',
      title: 'Unit Converter',
      blurb: 'Convert between SI and US customary units across 12 quantity types.',
      render(container) {
        const categories = Object.keys(MM.UNITS);
        const wrap = el('div', { class: 'converter' });
        const catSel = el('select', { 'aria-label': 'Quantity type' });
        for (const c of categories) catSel.appendChild(el('option', { value: c }, c[0].toUpperCase() + c.slice(1)));
        const valIn = el('input', { type: 'number', value: '1', step: 'any', 'aria-label': 'Value to convert' });
        const fromSel = el('select', { 'aria-label': 'From unit' });
        const toSel = el('select', { 'aria-label': 'To unit' });
        const out = el('div', { class: 'converter-out', 'aria-live': 'polite' });
        const swap = el('button', { type: 'button', class: 'btn btn-ghost', 'aria-label': 'Swap units' }, '⇄');

        function fillUnits() {
          const units = Object.keys(MM.UNITS[catSel.value]);
          fromSel.innerHTML = ''; toSel.innerHTML = '';
          for (const u of units) {
            fromSel.appendChild(el('option', { value: u }, u));
            toSel.appendChild(el('option', { value: u }, u));
          }
          toSel.selectedIndex = Math.min(1, units.length - 1);
          update();
        }
        function update() {
          const v = parseFloat(valIn.value);
          if (!Number.isFinite(v)) { out.textContent = ''; return; }
          const res = MM.convert(v, fromSel.value, toSel.value, catSel.value);
          out.innerHTML = `<strong>${fmt(v, 6)}</strong> ${fromSel.value} = <strong class="accent">${fmt(res, 6)}</strong> ${toSel.value}`;
        }
        swap.addEventListener('click', () => {
          const i = fromSel.selectedIndex;
          fromSel.selectedIndex = toSel.selectedIndex;
          toSel.selectedIndex = i;
          update();
        });
        [catSel, valIn, fromSel, toSel].forEach((n) => n.addEventListener('input', update));
        catSel.addEventListener('change', fillUnits);

        wrap.appendChild(el('div', { class: 'calc-field' }, [el('label', {}, 'Quantity'), catSel]));
        wrap.appendChild(el('div', { class: 'converter-row' }, [valIn, fromSel, swap, toSel]));
        wrap.appendChild(out);
        container.appendChild(wrap);
        fillUnits();
      },
    },

    {
      id: 'beam',
      icon: '🌉',
      title: 'Beam Calculator',
      blurb: 'Reactions, peak moment, bending stress, and deflection for common beam cases.',
      render(container) {
        buildForm(container, {
          id: 'beam',
          fields: [
            { id: 'type', label: 'Support type', type: 'select', options: [
              { value: 'ss', label: 'Simply supported' }, { value: 'cantilever', label: 'Cantilever' }] },
            { id: 'load', label: 'Load type', type: 'select', options: [
              { value: 'point', label: 'Point load' }, { value: 'udl', label: 'Uniform load' }] },
            { id: 'L', label: 'Span L', unit: 'm', value: 3, min: 0 },
            { id: 'P', label: 'Point load P (if point)', unit: 'kN', value: 10 },
            { id: 'a', label: 'Load position a from left/wall (if point)', unit: 'm', value: 1.5 },
            { id: 'w', label: 'Distributed load w (if uniform)', unit: 'kN/m', value: 5 },
            { id: 'E', label: 'Young’s modulus E', unit: 'GPa', value: 200 },
            { id: 'b', label: 'Section width b', unit: 'mm', value: 50 },
            { id: 'h', label: 'Section height h', unit: 'mm', value: 150 },
          ],
          compute(v) {
            if (!v.L || v.L <= 0) return { error: 'Span must be positive.' };
            const I = MM.rectI(v.b / 1000, v.h / 1000);
            const EI = (v.E * 1e9) * I;
            const P = (v.P ?? 0) * 1000, w = (v.w ?? 0) * 1000;
            let r;
            if (v.type === 'ss' && v.load === 'point') {
              if (v.a == null || v.a < 0 || v.a > v.L) return { error: 'Load position must be within the span.' };
              r = MM.ssPointLoad(v.L, P, v.a, EI);
            } else if (v.type === 'ss') {
              r = MM.ssUDL(v.L, w, EI);
            } else if (v.load === 'point') {
              if (v.a == null || v.a < 0 || v.a > v.L) return { error: 'Load position must be within the span.' };
              r = MM.cantileverPointLoad(v.L, P, v.a, EI);
            } else {
              r = MM.cantileverUDL(v.L, w, EI);
            }
            const c = (v.h / 1000) / 2;
            const sigma = MM.bendingStress(Math.abs(r.Mmax), c, I);
            const rows = [];
            if (r.R1 != null) {
              rows.push({ label: 'Reaction R<sub>1</sub> (left)', value: fmt(r.R1 / 1000), unit: 'kN' });
              rows.push({ label: 'Reaction R<sub>2</sub> (right)', value: fmt(r.R2 / 1000), unit: 'kN' });
            } else {
              rows.push({ label: 'Wall reaction', value: fmt(r.R / 1000), unit: 'kN' });
            }
            rows.push({ label: 'Max bending moment |M|', value: fmt(Math.abs(r.Mmax) / 1000), unit: 'kN·m' });
            rows.push({ label: 'Max bending stress σ = Mc/I', value: fmt(sigma / 1e6), unit: 'MPa', warn: sigma > 250e6,
              note: sigma > 250e6 ? '⚠ Exceeds typical structural-steel yield (250 MPa).' : null });
            if (r.deltaMax != null) {
              rows.push({ label: 'Max deflection', value: fmt(r.deltaMax * 1000), unit: 'mm',
                note: `Span/deflection ratio: L/${fmt(v.L / r.deltaMax, 3)} (floors typically require ≥ L/360).` });
            }
            return rows;
          },
        });
      },
    },

    {
      id: 'stress',
      icon: '🏋️',
      title: 'Axial Stress & Safety',
      blurb: 'Stress, strain, elongation, and factor of safety for a loaded bar.',
      render(container) {
        const mats = window.MMDATA.MATERIALS.filter((m) => m.yield != null);
        buildForm(container, {
          id: 'stress',
          fields: [
            { id: 'mat', label: 'Material', type: 'select', options: mats.map((m, i) => ({ value: i, label: m.name })) },
            { id: 'F', label: 'Axial force F', unit: 'kN', value: 15 },
            { id: 'd', label: 'Rod diameter d', unit: 'mm', value: 12, min: 0 },
            { id: 'L', label: 'Length L', unit: 'm', value: 2, min: 0 },
            { id: 'FS', label: 'Required factor of safety', unit: '', value: 2, min: 1 },
          ],
          compute(v) {
            if (!v.d || v.d <= 0 || !v.L || v.L <= 0) return { error: 'Diameter and length must be positive.' };
            const m = mats[parseInt(v.mat || 0, 10)];
            const A = Math.PI * Math.pow(v.d / 2000, 2);
            const sigma = MM.axialStress(Math.abs(v.F) * 1000, A);
            const delta = MM.elongation(Math.abs(v.F) * 1000, v.L, A, m.E * 1e9);
            const fs = MM.factorOfSafety(m.yield * 1e6, sigma);
            const ok = fs >= (v.FS || 1);
            return [
              { label: 'Cross-section area', value: fmt(A * 1e6), unit: 'mm²' },
              { label: 'Normal stress σ = F/A', value: fmt(sigma / 1e6), unit: 'MPa' },
              { label: 'Strain ε = σ/E', value: fmt(sigma / (m.E * 1e9), 4), unit: '' },
              { label: 'Elongation δ = FL/AE', value: fmt(delta * 1000), unit: 'mm' },
              { label: `Factor of safety vs. yield (${m.yield} MPa)`, value: fmt(fs, 3), unit: '',
                warn: !ok, note: ok ? '✓ Meets the required factor of safety.' : '⚠ Below the required factor of safety — increase the diameter or pick a stronger material.' },
            ];
          },
        });
      },
    },

    {
      id: 'torsion',
      icon: '🔧',
      title: 'Shaft & Torsion',
      blurb: 'Power–torque–speed, shear stress, and angle of twist for a solid shaft.',
      render(container) {
        buildForm(container, {
          id: 'torsion',
          fields: [
            { id: 'P', label: 'Transmitted power', unit: 'kW', value: 10, min: 0 },
            { id: 'N', label: 'Shaft speed', unit: 'rpm', value: 1500, min: 0 },
            { id: 'd', label: 'Shaft diameter', unit: 'mm', value: 30, min: 0 },
            { id: 'L', label: 'Shaft length', unit: 'm', value: 1, min: 0 },
            { id: 'G', label: 'Shear modulus G', unit: 'GPa', value: 79 },
          ],
          compute(v) {
            if (!v.N || v.N <= 0 || !v.d || v.d <= 0) return { error: 'Speed and diameter must be positive.' };
            const T = MM.torqueFromPower((v.P || 0) * 1000, v.N);
            const d = v.d / 1000;
            const J = MM.circleJ(d);
            const tau = MM.torsionShear(T, d / 2, J);
            const phi = MM.angleOfTwist(T, v.L || 0, J, (v.G || 79) * 1e9);
            return [
              { label: 'Torque T = P/ω', value: fmt(T), unit: 'N·m' },
              { label: 'Polar moment J = πd⁴/32', value: fmt(J * 1e12, 4), unit: 'mm⁴' },
              { label: 'Peak shear stress τ = Tr/J', value: fmt(tau / 1e6), unit: 'MPa',
                warn: tau > 60e6, note: tau > 60e6 ? '⚠ Above a typical 60 MPa allowable for steel shafting.' : null },
              { label: 'Angle of twist φ = TL/JG', value: fmt(MM.rad2deg(phi), 3), unit: '°',
                note: 'A common stiffness limit is 1° per meter of shaft.' },
            ];
          },
        });
      },
    },

    {
      id: 'gas',
      icon: '🎈',
      title: 'Ideal Gas Solver',
      blurb: 'Leave exactly one of P, V, n, T blank and solve PV = nRT for it.',
      render(container) {
        buildForm(container, {
          id: 'gas',
          fields: [
            { id: 'P', label: 'Pressure P', unit: 'kPa', value: 101.325, allowEmpty: true },
            { id: 'V', label: 'Volume V', unit: 'L', value: 24.5, allowEmpty: true },
            { id: 'n', label: 'Amount n', unit: 'mol', value: 1, allowEmpty: true },
            { id: 'T', label: 'Temperature T', unit: 'K', value: null, allowEmpty: true },
          ],
          compute(v) {
            const given = { P: v.P != null ? v.P * 1000 : null, V: v.V != null ? v.V / 1000 : null, n: v.n, T: v.T };
            const missing = Object.keys(given).filter((k) => given[k] == null);
            if (missing.length !== 1) return { error: 'Fill exactly three fields — the blank one is solved for.' };
            const r = MM.idealGasSolve(given);
            const display = {
              P: { label: 'Pressure', value: fmt(r.P / 1000), unit: 'kPa' },
              V: { label: 'Volume', value: fmt(r.V * 1000), unit: 'L' },
              n: { label: 'Amount of gas', value: fmt(r.n), unit: 'mol' },
              T: { label: 'Temperature', value: fmt(r.T), unit: `K (${fmt(r.T - 273.15, 4)} °C)` },
            };
            const rowsOut = [{ ...display[r.solved], label: `Solved — ${display[r.solved].label}` }];
            if (r.T <= 0) rowsOut.push({ label: 'Check', value: '⚠ non-physical temperature', unit: '', warn: true });
            return rowsOut;
          },
        });
      },
    },

    {
      id: 'process',
      icon: '♨️',
      title: 'Gas Process (W, Q, ΔU)',
      blurb: 'Work, heat, and internal-energy change for the four canonical ideal-gas processes.',
      render(container) {
        buildForm(container, {
          id: 'process',
          fields: [
            { id: 'type', label: 'Process', type: 'select', options: [
              { value: 'isothermal', label: 'Isothermal (T constant)' },
              { value: 'isobaric', label: 'Isobaric (P constant)' },
              { value: 'isochoric', label: 'Isochoric (V constant)' },
              { value: 'adiabatic', label: 'Adiabatic (Q = 0)' }] },
            { id: 'n', label: 'Amount n', unit: 'mol', value: 1, min: 0 },
            { id: 'T1', label: 'Initial temperature T₁', unit: 'K', value: 300 },
            { id: 'T2', label: 'Final temperature T₂ (isochoric only)', unit: 'K', value: 400 },
            { id: 'V1', label: 'Initial volume V₁', unit: 'L', value: 10 },
            { id: 'V2', label: 'Final volume V₂', unit: 'L', value: 20 },
            { id: 'gamma', label: 'Heat-capacity ratio γ', unit: '', value: 1.4 },
          ],
          compute(v) {
            if (!v.n || v.n <= 0) return { error: 'Amount of gas must be positive.' };
            const p = { n: v.n, T1: v.T1, T2: v.T2, V1: (v.V1 || 0) / 1000, V2: (v.V2 || 0) / 1000, gamma: v.gamma || 1.4 };
            if (v.type === 'isobaric') p.P = (v.n * MM.CONST.R * v.T1) / p.V1;
            if (v.type !== 'isochoric' && (!p.V1 || !p.V2 || p.V1 <= 0 || p.V2 <= 0)) return { error: 'Volumes must be positive.' };
            if (v.type === 'adiabatic') delete p.T2;
            const r = MM.gasProcess(v.type, p);
            const rows = [
              { label: 'Work done by gas W', value: fmt(r.W), unit: 'J' },
              { label: 'Heat added Q', value: fmt(r.Q), unit: 'J' },
              { label: 'Internal energy change ΔU', value: fmt(r.dU), unit: 'J', note: 'First-law check: Q − W = ΔU.' },
            ];
            if (r.T2 != null) rows.push({ label: 'Final temperature T₂', value: fmt(r.T2), unit: 'K' });
            return rows;
          },
        });
      },
    },

    {
      id: 'pipe',
      icon: '🚰',
      title: 'Pipe Flow',
      blurb: 'Reynolds number, flow regime, friction factor, and Darcy–Weisbach pressure drop.',
      render(container) {
        buildForm(container, {
          id: 'pipe',
          fields: [
            { id: 'fluid', label: 'Fluid', type: 'select', options: [
              { value: 'water', label: 'Water (20 °C)' }, { value: 'air', label: 'Air (20 °C)' }, { value: 'custom', label: 'Custom' }] },
            { id: 'rho', label: 'Density ρ (custom)', unit: 'kg/m³', value: 998 },
            { id: 'mu', label: 'Viscosity μ (custom)', unit: 'mPa·s', value: 1.0 },
            { id: 'v', label: 'Mean velocity', unit: 'm/s', value: 1.5, min: 0 },
            { id: 'D', label: 'Pipe inner diameter', unit: 'mm', value: 25, min: 0 },
            { id: 'L', label: 'Pipe length', unit: 'm', value: 10, min: 0 },
            { id: 'rough', label: 'Roughness ε', unit: 'mm', value: 0.045, min: 0 },
          ],
          compute(v) {
            if (!v.v || !v.D || v.v <= 0 || v.D <= 0) return { error: 'Velocity and diameter must be positive.' };
            let rho = v.rho, mu = (v.mu || 0) / 1000;
            if (v.fluid === 'water') { rho = MM.CONST.rhoWater; mu = MM.CONST.muWater; }
            if (v.fluid === 'air') { rho = MM.CONST.rhoAir; mu = MM.CONST.muAir; }
            if (!rho || !mu || rho <= 0 || mu <= 0) return { error: 'Density and viscosity must be positive.' };
            const D = v.D / 1000;
            const Re = MM.reynolds(rho, v.v, D, mu);
            const regime = MM.flowRegime(Re);
            const f = MM.darcyFrictionFactor(Re, (v.rough || 0) / 1000 / D);
            const dP = MM.pressureDrop(f, v.L || 0, D, rho, v.v);
            const Q = MM.volumetricFlow(v.v, Math.PI * D * D / 4);
            return [
              { label: 'Volumetric flow rate', value: fmt(Q * 1000), unit: 'L/s' },
              { label: 'Reynolds number', value: fmt(Re, 4), unit: '', note: `Flow regime: <strong>${regime}</strong>` },
              { label: 'Darcy friction factor f', value: fmt(f, 4), unit: '',
                note: regime === 'transitional' ? '⚠ Transitional regime — friction factor is uncertain here.' : null },
              { label: 'Pressure drop ΔP', value: fmt(dP / 1000), unit: 'kPa' },
              { label: 'Head loss', value: fmt(dP / (rho * MM.CONST.g), 4), unit: 'm' },
              { label: 'Pumping power ΔP·Q', value: fmt(dP * Q), unit: 'W' },
            ];
          },
        });
      },
    },

    {
      id: 'heat',
      icon: '🌡️',
      title: 'Heat Transfer',
      blurb: 'Conduction, convection, radiation, and lumped-capacitance cooling.',
      render(container) {
        buildForm(container, {
          id: 'heat',
          fields: [
            { id: 'mode', label: 'Mode', type: 'select', options: [
              { value: 'conduction', label: 'Conduction (plane wall)' },
              { value: 'convection', label: 'Convection' },
              { value: 'radiation', label: 'Radiation' }] },
            { id: 'A', label: 'Area A', unit: 'm²', value: 1, min: 0 },
            { id: 'Th', label: 'Hot temperature', unit: '°C', value: 100 },
            { id: 'Tc', label: 'Cold / surroundings temperature', unit: '°C', value: 25 },
            { id: 'k', label: 'Conductivity k (conduction)', unit: 'W/m·K', value: 50 },
            { id: 'L', label: 'Thickness L (conduction)', unit: 'mm', value: 100 },
            { id: 'h', label: 'Coefficient h (convection)', unit: 'W/m²·K', value: 25 },
            { id: 'eps', label: 'Emissivity ε (radiation)', unit: '', value: 0.9, min: 0 },
          ],
          compute(v) {
            if (!v.A || v.A <= 0) return { error: 'Area must be positive.' };
            const dT = (v.Th ?? 0) - (v.Tc ?? 0);
            if (v.mode === 'conduction') {
              if (!v.k || !v.L || v.k <= 0 || v.L <= 0) return { error: 'Conductivity and thickness must be positive.' };
              const q = MM.conduction(v.k, v.A, dT, v.L / 1000);
              return [
                { label: 'Heat rate q = kAΔT/L', value: fmt(q), unit: 'W' },
                { label: 'Thermal resistance L/kA', value: fmt((v.L / 1000) / (v.k * v.A), 4), unit: 'K/W' },
              ];
            }
            if (v.mode === 'convection') {
              if (!v.h || v.h <= 0) return { error: 'Convection coefficient must be positive.' };
              const q = MM.convection(v.h, v.A, dT);
              return [
                { label: 'Heat rate q = hAΔT', value: fmt(q), unit: 'W' },
                { label: 'Thermal resistance 1/hA', value: fmt(1 / (v.h * v.A), 4), unit: 'K/W' },
              ];
            }
            const Ts = (v.Th ?? 0) + 273.15, Tsur = (v.Tc ?? 0) + 273.15;
            if (Ts < 0 || Tsur < 0) return { error: 'Temperatures must be above absolute zero.' };
            const q = MM.radiation(Math.min(Math.max(v.eps ?? 0.9, 0), 1), v.A, Ts, Tsur);
            return [
              { label: 'Net radiation q = εσA(T⁴ₛ−T⁴)', value: fmt(q), unit: 'W',
                note: 'Temperatures are converted to kelvin internally — radiation always uses absolute temperature.' },
            ];
          },
        });
      },
    },

    {
      id: 'projectile-calc',
      icon: '🏹',
      title: 'Projectile (Analytic)',
      blurb: 'Range, apex height, and flight time for ideal projectile motion.',
      render(container) {
        buildForm(container, {
          id: 'projcalc',
          fields: [
            { id: 'v0', label: 'Launch speed v₀', unit: 'm/s', value: 25, min: 0 },
            { id: 'angle', label: 'Launch angle', unit: '°', value: 45, min: 0 },
            { id: 'h0', label: 'Launch height', unit: 'm', value: 0, min: 0 },
          ],
          compute(v) {
            if (v.v0 == null || v.v0 <= 0) return { error: 'Launch speed must be positive.' };
            if (v.angle == null || v.angle < 0 || v.angle > 90) return { error: 'Angle must be between 0° and 90°.' };
            const r = MM.projectile(v.v0, v.angle, v.h0 || 0);
            return [
              { label: 'Range', value: fmt(r.range), unit: 'm' },
              { label: 'Maximum height', value: fmt(r.hMax), unit: 'm' },
              { label: 'Time of flight', value: fmt(r.tFlight, 4), unit: 's' },
              { label: 'Time to apex', value: fmt(r.tApex, 4), unit: 's',
                note: 'Ideal (no drag). Try the projectile simulation to see how drag changes the picture.' },
            ];
          },
        });
      },
    },
  ];

  return { TOOLS, el };
})();
