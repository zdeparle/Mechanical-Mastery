# ⚙️ Mechanical Mastery

An interactive mechanical engineering learning app — subject guides, live
calculators, canvas simulations, a quiz engine, and a full reference sheet.
Built as a zero-dependency, zero-build static site: open `index.html` or serve
the folder and it just works (GitHub Pages friendly).

## What's inside

| Area | Contents |
|---|---|
| **Learn** | 6 subjects · 27 topics — Statics, Dynamics, Mechanics of Materials, Thermodynamics, Fluid Mechanics, Heat Transfer. Each topic has a summary, key ideas, equations with variable definitions, and a worked example. |
| **Calculators** | Unit converter (12 quantity types), beam calculator, axial stress & safety factor, shaft & torsion, ideal-gas solver, gas-process (W/Q/ΔU), pipe flow (Reynolds/Darcy–Weisbach), heat transfer, projectile motion. |
| **Simulations** | Projectile with air drag vs. vacuum, live beam shear/moment diagrams, damped spring–mass oscillator. |
| **Quiz** | 36-question bank, 10 random questions per run, instant feedback with explanations, per-subject best scores (localStorage). |
| **Reference** | Complete equation sheet, physical constants, material property table. |

Plus: dark/light theme, full-text search (press `/`), keyboard-accessible
navigation, reduced-motion support, mobile layout.

## Architecture

```
index.html          app shell (nav, search dialog, script loading)
css/main.css        design tokens + components, light/dark via [data-theme]
js/physics.js       pure computation core — no DOM, exported for Node too
js/data.js          all learning content (subjects, quiz bank, materials)
js/tools.js         calculator definitions on a shared form builder
js/sims.js          canvas simulations (each returns a destroy() for cleanup)
js/app.js           hash router, views, quiz engine, search, theming
tests/run-tests.js  test suite for the physics core
```

The rule that keeps this maintainable: **every formula lives in
`js/physics.js`**, is pure, and is covered by tests. UI files only format and
display.

## Development

No build step. To run locally:

```sh
python3 -m http.server 8000   # or any static server
```

To run the tests:

```sh
node tests/run-tests.js
```

## Disclaimer

Built for learning. Values and formulas are textbook-standard but this is not
a substitute for engineering judgment or code-stamped design.
