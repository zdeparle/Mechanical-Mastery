/*
 * Mechanical Mastery — sims.js
 * Canvas simulations: projectile with drag, beam shear/moment diagrams,
 * and a damped spring-mass oscillator. Each sim's render(container) returns
 * a destroy() function so the router can clean up animation frames.
 */
window.MMSIMS = (function () {
  'use strict';
  const MM = window.MM;
  const el = () => window.MMTOOLS.el;

  function themeColor(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  /** Create a DPI-aware canvas that fills its container width. */
  function makeCanvas(container, aspect = 0.55) {
    const canvas = document.createElement('canvas');
    canvas.className = 'sim-canvas';
    container.appendChild(canvas);
    function resize() {
      const w = container.clientWidth || 600;
      const h = Math.max(240, Math.round(w * aspect));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    return { canvas, ctx: canvas.getContext('2d'), resize, get w() { return canvas.clientWidth; }, get h() { return canvas.clientHeight; } };
  }

  function slider(labelHtml, min, max, step, value, oninput) {
    const wrap = document.createElement('div');
    wrap.className = 'sim-control';
    const label = document.createElement('label');
    const readout = document.createElement('span');
    readout.className = 'sim-readout';
    const input = document.createElement('input');
    input.type = 'range';
    input.min = min; input.max = max; input.step = step; input.value = value;
    function update() {
      readout.textContent = input.value;
      oninput(parseFloat(input.value));
    }
    input.addEventListener('input', update);
    label.innerHTML = labelHtml + ' ';
    label.appendChild(readout);
    wrap.appendChild(label);
    wrap.appendChild(input);
    readout.textContent = value;
    return wrap;
  }

  function button(text, onclick, cls = 'btn btn-primary') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = text;
    b.addEventListener('click', onclick);
    return b;
  }

  // ---------------------------------------------------------------
  // 1. Projectile motion with drag
  // ---------------------------------------------------------------
  function projectileSim(container) {
    const E = el();
    const controls = E('div', { class: 'sim-controls' });
    const canvasWrap = E('div', { class: 'sim-canvas-wrap' });
    const readout = E('div', { class: 'sim-stats', 'aria-live': 'polite' });
    container.appendChild(controls);
    container.appendChild(canvasWrap);
    container.appendChild(readout);

    const cv = makeCanvas(canvasWrap, 0.5);
    const state = { v0: 30, angle: 45, drag: true, trace: [], traceIdeal: [], running: false, raf: 0, landed: null };
    const params = { m: 0.145, Cd: 0.47, rho: MM.CONST.rhoAir, A: 4.2e-3, g: MM.CONST.g };

    controls.appendChild(slider('Launch speed <b>v₀</b> (m/s):', 5, 60, 1, state.v0, (v) => { state.v0 = v; reset(); }));
    controls.appendChild(slider('Angle (°):', 5, 85, 1, state.angle, (v) => { state.angle = v; reset(); }));
    const dragToggle = E('label', { class: 'sim-check' });
    const cb = E('input', { type: 'checkbox' });
    cb.checked = true;
    cb.addEventListener('change', () => { state.drag = cb.checked; reset(); });
    dragToggle.appendChild(cb);
    dragToggle.appendChild(document.createTextNode(' Include air drag (baseball)'));
    controls.appendChild(dragToggle);
    controls.appendChild(button('Launch', launch));

    function worldToScreen(x, y, scale) {
      return [40 + x * scale, cv.h - 30 - y * scale];
    }

    function computeScale() {
      const ideal = MM.projectile(state.v0, state.angle, 0);
      const maxX = Math.max(ideal.range * 1.08, 10);
      const maxY = Math.max(ideal.hMax * 1.3, 5);
      return Math.min((cv.w - 70) / maxX, (cv.h - 60) / maxY);
    }

    function draw() {
      const ctx = cv.ctx;
      const grid = themeColor('--border', '#ccc');
      const fg = themeColor('--text-2', '#666');
      const accent = themeColor('--accent', '#6366f1');
      const accent2 = themeColor('--acc-dynamics', '#f59e0b');
      ctx.clearRect(0, 0, cv.w, cv.h);
      const scale = computeScale();

      // ground
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cv.h - 30);
      ctx.lineTo(cv.w, cv.h - 30);
      ctx.stroke();

      // ideal trajectory (dashed)
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = fg;
      ctx.beginPath();
      state.traceIdeal.forEach((p, i) => {
        const [sx, sy] = worldToScreen(p.x, p.y, scale);
        i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // actual trajectory
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      state.trace.forEach((p, i) => {
        const [sx, sy] = worldToScreen(p.x, p.y, scale);
        i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
      });
      ctx.stroke();

      // projectile dot
      const last = state.trace[state.trace.length - 1];
      if (last) {
        const [sx, sy] = worldToScreen(last.x, last.y, scale);
        ctx.fillStyle = accent2;
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // launch arrow
      const th = MM.deg2rad(state.angle);
      const [ox, oy] = worldToScreen(0, 0, scale);
      ctx.strokeStyle = accent2;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(th) * 34, oy - Math.sin(th) * 34);
      ctx.stroke();
    }

    function reset() {
      cancelAnimationFrame(state.raf);
      state.running = false;
      state.landed = null;
      state.trace = [];
      // Precompute ideal path for comparison
      const ideal = MM.projectile(state.v0, state.angle, 0);
      state.traceIdeal = [];
      for (let i = 0; i <= 80; i++) {
        const t = (ideal.tFlight * i) / 80;
        state.traceIdeal.push({ x: ideal.vx * t, y: ideal.vy * t - 0.5 * MM.CONST.g * t * t });
      }
      updateReadout(ideal, null);
      draw();
    }

    function updateReadout(ideal, actual) {
      readout.innerHTML =
        `<div><span>Ideal range</span><strong>${MM.fmt(ideal.range)} m</strong></div>` +
        `<div><span>Ideal apex</span><strong>${MM.fmt(ideal.hMax)} m</strong></div>` +
        (actual ? `<div><span>${state.drag ? 'With drag' : 'Simulated'} range</span><strong>${MM.fmt(actual.x)} m</strong></div>` : '') +
        (actual && state.drag ? `<div><span>Drag cost</span><strong>${MM.fmt((1 - actual.x / ideal.range) * 100, 3)}%</strong></div>` : '');
    }

    function launch() {
      reset();
      state.running = true;
      const th = MM.deg2rad(state.angle);
      let s = { x: 0, y: 0, vx: state.v0 * Math.cos(th), vy: state.v0 * Math.sin(th) };
      state.trace.push({ ...s });
      const dt = 1 / 240;
      let acc = 0, lastTs = null;

      function frame(ts) {
        if (!state.running) return;
        if (lastTs == null) lastTs = ts;
        acc += Math.min((ts - lastTs) / 1000, 0.05);
        lastTs = ts;
        while (acc > dt && s.y >= 0) {
          s = state.drag
            ? MM.dragStep(s, dt, params)
            : { x: s.x + s.vx * dt, y: s.y + (s.vy - params.g * dt) * dt, vx: s.vx, vy: s.vy - params.g * dt };
          acc -= dt;
          state.trace.push({ x: s.x, y: Math.max(s.y, 0) });
        }
        draw();
        if (s.y < 0) {
          state.running = false;
          state.landed = s;
          updateReadout(MM.projectile(state.v0, state.angle, 0), s);
          return;
        }
        state.raf = requestAnimationFrame(frame);
      }
      state.raf = requestAnimationFrame(frame);
    }

    const onResize = () => { cv.resize(); draw(); };
    window.addEventListener('resize', onResize);
    reset();
    return () => {
      cancelAnimationFrame(state.raf);
      window.removeEventListener('resize', onResize);
    };
  }

  // ---------------------------------------------------------------
  // 2. Beam shear & moment diagrams
  // ---------------------------------------------------------------
  function beamSim(container) {
    const E = el();
    const controls = E('div', { class: 'sim-controls' });
    const canvasWrap = E('div', { class: 'sim-canvas-wrap' });
    const readout = E('div', { class: 'sim-stats', 'aria-live': 'polite' });
    container.appendChild(controls);
    container.appendChild(canvasWrap);
    container.appendChild(readout);

    const cv = makeCanvas(canvasWrap, 0.7);
    const state = { type: 'ss', load: 'point', L: 6, P: 10, a: 3, w: 4 };

    const typeSel = E('select', { 'aria-label': 'Support type' });
    [['ss', 'Simply supported'], ['cantilever', 'Cantilever']].forEach(([v, t]) =>
      typeSel.appendChild(E('option', { value: v }, t)));
    const loadSel = E('select', { 'aria-label': 'Load type' });
    [['point', 'Point load'], ['udl', 'Uniform load']].forEach(([v, t]) =>
      loadSel.appendChild(E('option', { value: v }, t)));
    typeSel.addEventListener('change', () => { state.type = typeSel.value; draw(); });
    loadSel.addEventListener('change', () => { state.load = loadSel.value; draw(); });
    controls.appendChild(E('div', { class: 'sim-control' }, [typeSel]));
    controls.appendChild(E('div', { class: 'sim-control' }, [loadSel]));
    controls.appendChild(slider('Magnitude (kN or kN/m):', 1, 30, 1, state.P, (v) => { state.P = v; state.w = v; draw(); }));
    controls.appendChild(slider('Load position a/L (point):', 0.05, 0.95, 0.05, 0.5, (v) => { state.a = v * state.L; draw(); }));

    function plotSeries(ctx, xs, ys, x0, y0, w, h, color, label, unit) {
      const maxAbs = Math.max(1e-9, ...ys.map((y) => Math.abs(y)));
      const grid = themeColor('--border', '#ccc');
      const fg = themeColor('--text-2', '#666');
      const py0 = y0 + 18, ph = h - 18; // reserve space so the label never overlaps the curve
      const axisY = py0 + ph / 2;
      // axis
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, axisY);
      ctx.lineTo(x0 + w, axisY);
      ctx.stroke();
      // curve + fill
      ctx.beginPath();
      xs.forEach((x, i) => {
        const sx = x0 + (x / state.L) * w;
        const sy = axisY - (ys[i] / maxAbs) * (ph / 2 - 4);
        i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineTo(x0 + w, axisY);
      ctx.lineTo(x0, axisY);
      ctx.closePath();
      ctx.fillStyle = color + '33';
      ctx.fill();
      ctx.fillStyle = fg;
      ctx.font = '600 12px system-ui, sans-serif';
      ctx.fillText(`${label} (peak ${MM.fmt(maxAbs)} ${unit})`, x0, y0 + 10);
    }

    function draw() {
      const ctx = cv.ctx;
      ctx.clearRect(0, 0, cv.w, cv.h);
      const fg = themeColor('--text-1', '#222');
      const accent = themeColor('--accent', '#6366f1');
      const accent2 = themeColor('--acc-heat', '#ef4444');
      const margin = 46;
      const bw = cv.w - margin * 2;
      const beamY = 44;

      const cfg = { type: state.type, load: state.load, L: state.L, P: state.P, a: state.a, w: state.w, n: 160 };
      const d = MM.beamDiagrams(cfg);

      // beam sketch
      ctx.strokeStyle = fg;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(margin, beamY);
      ctx.lineTo(margin + bw, beamY);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      if (state.type === 'ss') {
        for (const px of [margin, margin + bw]) {
          ctx.beginPath();
          ctx.moveTo(px, beamY + 3);
          ctx.lineTo(px - 9, beamY + 20);
          ctx.lineTo(px + 9, beamY + 20);
          ctx.closePath();
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = fg;
        ctx.fillRect(margin - 8, beamY - 22, 8, 44);
      }
      // load sketch
      ctx.strokeStyle = accent2;
      ctx.fillStyle = accent2;
      ctx.lineWidth = 2;
      if (state.load === 'point') {
        const lx = margin + (state.a / state.L) * bw;
        ctx.beginPath();
        ctx.moveTo(lx, beamY - 32);
        ctx.lineTo(lx, beamY - 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(lx, beamY - 3);
        ctx.lineTo(lx - 5, beamY - 12);
        ctx.lineTo(lx + 5, beamY - 12);
        ctx.closePath();
        ctx.fill();
      } else {
        for (let i = 0; i <= 10; i++) {
          const lx = margin + (bw * i) / 10;
          ctx.beginPath();
          ctx.moveTo(lx, beamY - 22);
          ctx.lineTo(lx, beamY - 6);
          ctx.stroke();
        }
        ctx.strokeRect(margin, beamY - 24, bw, 2);
      }

      const plotH = (cv.h - beamY - 60) / 2;
      plotSeries(ctx, d.x, d.V, margin, beamY + 30, bw, plotH, accent, 'Shear V', 'kN');
      plotSeries(ctx, d.x, d.M, margin, beamY + 40 + plotH, bw, plotH, accent2, 'Moment M', 'kN·m');

      const maxM = Math.max(...d.M.map(Math.abs));
      const maxV = Math.max(...d.V.map(Math.abs));
      readout.innerHTML =
        `<div><span>Peak shear</span><strong>${MM.fmt(maxV)} kN</strong></div>` +
        `<div><span>Peak moment</span><strong>${MM.fmt(maxM)} kN·m</strong></div>` +
        `<div><span>Span</span><strong>${state.L} m</strong></div>`;
    }

    const onResize = () => { cv.resize(); draw(); };
    window.addEventListener('resize', onResize);
    draw();
    return () => window.removeEventListener('resize', onResize);
  }

  // ---------------------------------------------------------------
  // 3. Spring–mass oscillator
  // ---------------------------------------------------------------
  function shmSim(container) {
    const E = el();
    const controls = E('div', { class: 'sim-controls' });
    const canvasWrap = E('div', { class: 'sim-canvas-wrap' });
    const readout = E('div', { class: 'sim-stats', 'aria-live': 'polite' });
    container.appendChild(controls);
    container.appendChild(canvasWrap);
    container.appendChild(readout);

    const cv = makeCanvas(canvasWrap, 0.5);
    const state = { m: 2, k: 50, c: 1, raf: 0, t: 0, running: true, history: [] };

    controls.appendChild(slider('Mass m (kg):', 0.5, 10, 0.5, state.m, (v) => { state.m = v; restart(); }));
    controls.appendChild(slider('Stiffness k (N/m):', 5, 200, 5, state.k, (v) => { state.k = v; restart(); }));
    controls.appendChild(slider('Damping c (N·s/m):', 0, 40, 0.5, state.c, (v) => { state.c = v; restart(); }));
    controls.appendChild(button('Restart', restart, 'btn btn-ghost'));

    function restart() {
      state.t = 0;
      state.history = [];
      updateStats();
    }

    function updateStats() {
      const wn = Math.sqrt(state.k / state.m);
      const zeta = state.c / (2 * Math.sqrt(state.k * state.m));
      const kind = zeta === 0 ? 'undamped' : zeta < 1 ? 'underdamped' : zeta === 1 ? 'critically damped' : 'overdamped';
      readout.innerHTML =
        `<div><span>ω<sub>n</sub></span><strong>${MM.fmt(wn, 3)} rad/s</strong></div>` +
        `<div><span>f<sub>n</sub></span><strong>${MM.fmt(wn / (2 * Math.PI), 3)} Hz</strong></div>` +
        `<div><span>ζ</span><strong>${MM.fmt(zeta, 3)}</strong></div>` +
        `<div><span>Response</span><strong>${kind}</strong></div>`;
    }

    let lastTs = null;
    function frame(ts) {
      if (lastTs == null) lastTs = ts;
      state.t += Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      const x = MM.shmPosition(state.t, { m: state.m, k: state.k, c: state.c, x0: 1, v0: 0 });
      state.history.push({ t: state.t, x });
      while (state.history.length && state.history[0].t < state.t - 8) state.history.shift();
      draw(x);
      state.raf = requestAnimationFrame(frame);
    }

    function draw(x) {
      const ctx = cv.ctx;
      ctx.clearRect(0, 0, cv.w, cv.h);
      const fg = themeColor('--text-1', '#222');
      const grid = themeColor('--border', '#ccc');
      const accent = themeColor('--accent', '#6366f1');
      const accent2 = themeColor('--acc-dynamics', '#f59e0b');

      // Left: spring-mass sketch. Right: displacement trace.
      const sketchW = Math.min(160, cv.w * 0.28);
      const midY = cv.h / 2;
      const amp = Math.min(70, cv.h * 0.28);
      const massY = midY + x * amp * -1;

      // wall
      ctx.fillStyle = grid;
      ctx.fillRect(sketchW / 2 - 34, 8, 68, 6);
      // spring (zigzag)
      ctx.strokeStyle = fg;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sketchW / 2, 14);
      const coils = 8, springLen = massY - 14 - 16;
      for (let i = 0; i <= coils; i++) {
        const yy = 14 + (springLen * i) / coils;
        const xx = sketchW / 2 + (i === 0 || i === coils ? 0 : (i % 2 ? 12 : -12));
        ctx.lineTo(xx, yy);
      }
      ctx.lineTo(sketchW / 2, massY - 16);
      ctx.stroke();
      // mass
      ctx.fillStyle = accent2;
      ctx.beginPath();
      ctx.roundRect(sketchW / 2 - 20, massY - 16, 40, 32, 6);
      ctx.fill();

      // trace
      const tx0 = sketchW + 24, tw = cv.w - tx0 - 16;
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx0, midY);
      ctx.lineTo(tx0 + tw, midY);
      ctx.stroke();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      state.history.forEach((p, i) => {
        const sx = tx0 + ((p.t - Math.max(0, state.t - 8)) / 8) * tw;
        const sy = midY - p.x * amp;
        i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
      });
      ctx.stroke();
    }

    const onResize = () => cv.resize();
    window.addEventListener('resize', onResize);
    updateStats();
    state.raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(state.raf);
      window.removeEventListener('resize', onResize);
    };
  }

  const SIMS = [
    {
      id: 'projectile',
      icon: '🏹',
      title: 'Projectile Motion',
      blurb: 'Launch a baseball with and without air drag and compare trajectories in real time.',
      about: 'The dashed curve is the ideal vacuum parabola; the solid curve integrates quadratic drag (F = ½C<sub>d</sub>ρv²A) with a semi-implicit Euler stepper at 240 Hz. Notice how drag makes the trajectory asymmetric — the descent is steeper than the climb.',
      render: projectileSim,
    },
    {
      id: 'beam',
      icon: '🌉',
      title: 'Beam Diagrams',
      blurb: 'Drag the load along a beam and watch the shear and moment diagrams respond live.',
      about: 'Shear jumps at point loads and varies linearly under distributed load; moment is the running integral of shear and peaks where shear crosses zero. These two diagrams are how every beam is designed.',
      render: beamSim,
    },
    {
      id: 'shm',
      icon: '〰️',
      title: 'Spring–Mass Oscillator',
      blurb: 'Tune mass, stiffness, and damping to explore natural frequency and damping regimes.',
      about: 'The analytic solution of m·ẍ + c·ẋ + k·x = 0 released from x₀ = 1. Push damping up to find the critically damped boundary (ζ = 1) — the fastest return to rest with no overshoot, which is what car suspensions aim for.',
      render: shmSim,
    },
  ];

  return { SIMS };
})();
