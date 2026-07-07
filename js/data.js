/*
 * Mechanical Mastery — data.js
 * All learning content: subjects, topics, equations, examples, quiz bank,
 * material properties, and physical constants. Pure data, no logic.
 *
 * Equation markup: plain HTML with <sub>/<sup> and Unicode Greek letters.
 */
window.MMDATA = (function () {
  'use strict';

  const SUBJECTS = [
    {
      id: 'statics',
      icon: '⚖️',
      title: 'Statics',
      tagline: 'Forces and moments in equilibrium — the foundation of every structure.',
      color: 'var(--acc-statics)',
      topics: [
        {
          id: 'equilibrium',
          title: 'Force Systems & Equilibrium',
          summary: 'A rigid body is in static equilibrium when the resultant force and the resultant moment about any point are both zero. Every statics problem reduces to drawing a correct free-body diagram and applying these conditions.',
          points: [
            'Draw the free-body diagram first — isolate the body and replace every contact and support with its reaction forces.',
            'In 2D you get three independent equations: ΣF<sub>x</sub> = 0, ΣF<sub>y</sub> = 0, ΣM = 0.',
            'A problem with more unknowns than equilibrium equations is statically indeterminate.',
          ],
          equations: [
            { eq: 'ΣF<sub>x</sub> = 0,&nbsp; ΣF<sub>y</sub> = 0,&nbsp; ΣM<sub>O</sub> = 0', vars: 'Equilibrium of a rigid body in a plane' },
            { eq: 'R = √(F<sub>x</sub>² + F<sub>y</sub>²),&nbsp; θ = tan⁻¹(F<sub>y</sub>/F<sub>x</sub>)', vars: 'Resultant of concurrent forces' },
          ],
          example: {
            problem: 'A 100 N sign hangs from two cables that make 30° and 60° with the ceiling. Find the cable tensions.',
            solution: 'Equilibrium at the connection point: T₁cos30° = T₂cos60° (horizontal) and T₁sin30° + T₂sin60° = 100 N (vertical). Solving: T₁ = 50 N, T₂ = 86.6 N. Check: the steeper cable always carries more load.',
          },
        },
        {
          id: 'moments',
          title: 'Moments & Couples',
          summary: 'A moment measures the tendency of a force to rotate a body about a point. A couple is a pair of equal, opposite, non-collinear forces — it produces a pure moment that is the same about every point.',
          points: [
            'Moment = force × perpendicular distance to the line of action.',
            'The 2D cross-product form M = x·F<sub>y</sub> − y·F<sub>x</sub> handles any geometry without hunting for perpendicular distances.',
            'Couples let you slide a force to a parallel line by adding the compensating moment (force–couple system).',
          ],
          equations: [
            { eq: 'M = F·d', vars: 'F = force (N), d = perpendicular distance (m)' },
            { eq: 'M<sub>O</sub> = x·F<sub>y</sub> − y·F<sub>x</sub>', vars: '(x, y) = position of the force relative to O' },
            { eq: 'M<sub>couple</sub> = F·d', vars: 'd = separation of the two forces; same about any point' },
          ],
          example: {
            problem: 'A 200 N force acts at the end of a 0.4 m wrench, 25° off perpendicular. What torque does it apply?',
            solution: 'Only the perpendicular component turns the bolt: M = 200 × 0.4 × cos25° = 72.5 N·m.',
          },
        },
        {
          id: 'trusses',
          title: 'Trusses',
          summary: 'Trusses are structures of straight two-force members connected at pin joints. Each member carries pure tension or pure compression, which makes them extremely efficient and easy to analyze.',
          points: [
            'Method of joints: apply ΣF = 0 at each pin; start at a joint with at most two unknowns.',
            'Method of sections: cut through up to three members and apply full rigid-body equilibrium to one side.',
            'Zero-force members: two non-collinear members at an unloaded joint are both zero-force; they matter for stability, not strength.',
            'A simple planar truss is statically determinate when m + 3 = 2j (m members, j joints).',
          ],
          equations: [
            { eq: 'm + 3 = 2j', vars: 'Determinacy check for a simple planar truss' },
          ],
          example: {
            problem: 'A symmetric triangular truss spans 4 m with a 10 kN load at the apex, 2 m above the supports. Find the force in each sloped member.',
            solution: 'Each support carries 5 kN. At a support joint the sloped member rises at tan⁻¹(2/2) = 45°. Vertical equilibrium: F·sin45° = 5 kN, so F = 7.07 kN in compression.',
          },
        },
        {
          id: 'friction',
          title: 'Dry Friction',
          summary: 'Friction resists relative sliding between surfaces. It is self-adjusting up to a maximum of μₛN; beyond that the surfaces slip and kinetic friction μₖN (slightly lower) takes over.',
          points: [
            'Static friction is an inequality: f ≤ μ<sub>s</sub>N. Do not assume f = μ<sub>s</sub>N unless slipping is impending.',
            'On an incline, slipping impends when tanθ = μ<sub>s</sub> — the angle of repose.',
            'Belt friction grows exponentially with wrap angle: T₂ = T₁e^(μβ).',
          ],
          equations: [
            { eq: 'f ≤ μ<sub>s</sub>N,&nbsp; f<sub>k</sub> = μ<sub>k</sub>N', vars: 'μ = friction coefficient, N = normal force' },
            { eq: 'θ<sub>repose</sub> = tan⁻¹ μ<sub>s</sub>', vars: 'Steepest slope before sliding' },
            { eq: 'T₂ = T₁·e<sup>μβ</sup>', vars: 'Belt friction; β = wrap angle in radians' },
          ],
          example: {
            problem: 'A 50 kg crate sits on a floor with μₛ = 0.4. Will a 150 N horizontal push move it?',
            solution: 'Maximum static friction = 0.4 × 50 × 9.81 = 196 N. Since 150 N < 196 N the crate stays put, and friction is exactly 150 N (not 196 N).',
          },
        },
        {
          id: 'centroids',
          title: 'Centroids & Moments of Inertia',
          summary: 'The centroid is the geometric center of an area; the area moment of inertia measures how far the area is spread from an axis. Both feed directly into beam bending and buckling analysis.',
          points: [
            'Composite bodies: sum each part\'s Σ(x̄ᵢAᵢ)/ΣAᵢ; treat holes as negative area.',
            'Parallel-axis theorem: I = Ī + A·d² — inertia always grows as you move away from the centroid.',
            'Deep, thin sections (I-beams) maximize I per unit area, which is why they dominate structural design.',
          ],
          equations: [
            { eq: 'x̄ = Σx̄ᵢAᵢ / ΣAᵢ', vars: 'Composite centroid' },
            { eq: 'I = Ī + A·d²', vars: 'Parallel-axis theorem; d = axis offset from centroid' },
            { eq: 'I<sub>rect</sub> = bh³/12,&nbsp; I<sub>circle</sub> = πd⁴/64', vars: 'Common centroidal moments of inertia' },
          ],
          example: {
            problem: 'Compare I for a 20 × 60 mm rectangle bent about its strong vs. weak axis.',
            solution: 'Strong: 20 × 60³/12 = 360 × 10³ mm⁴. Weak: 60 × 20³/12 = 40 × 10³ mm⁴. Same area, 9× the stiffness — orientation matters cubically.',
          },
        },
      ],
    },

    {
      id: 'dynamics',
      icon: '🎯',
      title: 'Dynamics',
      tagline: 'Motion, forces, energy, and momentum — how machines actually move.',
      color: 'var(--acc-dynamics)',
      topics: [
        {
          id: 'kinematics',
          title: 'Kinematics of Particles',
          summary: 'Kinematics describes motion without asking why it happens: position, velocity, and acceleration linked by derivatives. With constant acceleration the familiar closed-form equations apply.',
          points: [
            'v = dx/dt and a = dv/dt; the chain-rule form a = v·dv/dx is the key to problems given in terms of position.',
            'The constant-acceleration equations only apply when a is truly constant — free fall, not braking with fading brakes.',
            'Projectile motion is two independent problems: constant velocity horizontally, constant acceleration vertically.',
          ],
          equations: [
            { eq: 'v = v₀ + at', vars: 'velocity under constant acceleration' },
            { eq: 'x = x₀ + v₀t + ½at²', vars: 'position under constant acceleration' },
            { eq: 'v² = v₀² + 2a(x − x₀)', vars: 'time-free relation' },
            { eq: 'R = v₀²sin2θ / g', vars: 'level-ground projectile range' },
          ],
          example: {
            problem: 'A car brakes from 30 m/s to rest over 60 m. What constant deceleration is required?',
            solution: 'v² = v₀² + 2a·Δx → 0 = 900 + 2a(60) → a = −7.5 m/s². That is about 0.76g — near the limit of ordinary tires.',
          },
        },
        {
          id: 'newton',
          title: 'Newton\'s Second Law',
          summary: 'ΣF = ma connects the force world of statics to the motion world of kinematics. The procedure never changes: free-body diagram, pick axes (align one with acceleration), sum forces.',
          points: [
            'Weight is mg downward; normal force is whatever the surface must supply — never assume N = mg on inclines or in elevators.',
            'For curved paths use normal–tangential axes: ΣF<sub>n</sub> = mv²/ρ points toward the center.',
            'Connected bodies share acceleration magnitude through inextensible cords — write one equation per mass.',
          ],
          equations: [
            { eq: 'ΣF = ma', vars: 'Newton\'s second law' },
            { eq: 'ΣF<sub>n</sub> = mv²/ρ', vars: 'centripetal equation; ρ = radius of curvature' },
          ],
          example: {
            problem: 'What speed lets a car round a flat 80 m curve if μₛ = 0.8?',
            solution: 'Friction supplies the centripetal force: μmg = mv²/ρ → v = √(0.8 × 9.81 × 80) = 25.1 m/s ≈ 90 km/h.',
          },
        },
        {
          id: 'energy',
          title: 'Work & Energy',
          summary: 'The work–energy theorem trades force-and-acceleration detail for a scalar bookkeeping of energy. It shines when you care about speeds at positions rather than times.',
          points: [
            'Work–energy theorem: ΣU = ΔKE. Gravity and springs can be moved to the other side as potential energy.',
            'Friction always removes mechanical energy: U<sub>f</sub> = −μ<sub>k</sub>N·d.',
            'Power is the rate of doing work: P = F·v — the reason cars downshift on hills.',
          ],
          equations: [
            { eq: 'KE = ½mv²,&nbsp; PE<sub>g</sub> = mgh,&nbsp; PE<sub>s</sub> = ½kx²', vars: 'energy forms' },
            { eq: 'KE₁ + PE₁ + U<sub>other</sub> = KE₂ + PE₂', vars: 'energy balance' },
            { eq: 'P = F·v = dW/dt', vars: 'mechanical power' },
          ],
          example: {
            problem: 'A 2 kg block slides from rest down a 5 m high frictionless ramp into a spring (k = 800 N/m). Find the maximum compression.',
            solution: 'mgh = ½kx² → x = √(2 × 2 × 9.81 × 5 / 800) = 0.495 m. The ramp shape is irrelevant — only the height matters.',
          },
        },
        {
          id: 'momentum',
          title: 'Impulse & Momentum',
          summary: 'Impulse–momentum methods handle problems where force acts over time — impacts, jets, rocket thrust. Momentum of a system is conserved whenever external impulses vanish.',
          points: [
            'Impulse J = ∫F dt = Δ(mv); a small force for a long time equals a big force for a short time.',
            'Collisions: momentum is always conserved; kinetic energy only in perfectly elastic ones.',
            'Coefficient of restitution e = (separation speed)/(approach speed) ranges 0 (plastic) to 1 (elastic).',
          ],
          equations: [
            { eq: 'J = ∫F dt = mΔv', vars: 'impulse–momentum theorem' },
            { eq: 'm₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′', vars: 'conservation of momentum' },
            { eq: 'e = (v₂′ − v₁′)/(v₁ − v₂)', vars: 'coefficient of restitution' },
          ],
          example: {
            problem: 'A 0.145 kg baseball arrives at 40 m/s and leaves the bat at 50 m/s the other way, in 0.7 ms. Find the average force.',
            solution: 'Δv = 90 m/s, so J = 0.145 × 90 = 13.05 N·s and F = J/t = 13.05/0.0007 ≈ 18.6 kN — over 10,000× the ball\'s weight.',
          },
        },
        {
          id: 'vibration',
          title: 'Rotation & Vibration',
          summary: 'Rotational dynamics mirrors translation with torque, angular acceleration, and mass moment of inertia. Add a restoring force and you get vibration — the mass-spring oscillator underlies everything from engine mounts to earthquake design.',
          points: [
            'ΣM = Iα is Newton\'s second law for rotation; I depends on the mass distribution and the axis.',
            'Undamped natural frequency ω<sub>n</sub> = √(k/m) — stiffer is faster, heavier is slower.',
            'Damping ratio ζ classifies response: underdamped (oscillates), critically damped (fastest return), overdamped (sluggish).',
            'Resonance occurs when forcing frequency approaches ω<sub>n</sub>; design either stiffens away from it or adds damping.',
          ],
          equations: [
            { eq: 'ΣM = Iα', vars: 'rotational second law' },
            { eq: 'ω<sub>n</sub> = √(k/m),&nbsp; T = 2π/ω<sub>n</sub>', vars: 'natural frequency and period' },
            { eq: 'ζ = c / (2√(km))', vars: 'damping ratio' },
          ],
          example: {
            problem: 'A 250 kg machine on isolation mounts with k = 100 kN/m: what is its natural frequency?',
            solution: 'ωₙ = √(100000/250) = 20 rad/s → f = 3.18 Hz. Any excitation near 3 Hz (e.g., a motor at ~190 rpm) risks resonance.',
          },
        },
      ],
    },

    {
      id: 'materials',
      icon: '🔩',
      title: 'Mechanics of Materials',
      tagline: 'How real components stretch, twist, bend, and fail under load.',
      color: 'var(--acc-materials)',
      topics: [
        {
          id: 'stress-strain',
          title: 'Stress & Strain',
          summary: 'Stress normalizes force by area; strain normalizes deformation by length. Their ratio in the elastic region is Young\'s modulus — the single most important material property in structural design.',
          points: [
            'Normal stress σ = F/A; shear stress τ = V/A acts parallel to the surface.',
            'The stress–strain curve reveals everything: stiffness (slope), yield strength (end of elastic), ultimate strength, and ductility.',
            'Design uses a factor of safety: allowable stress = strength / FS.',
          ],
          equations: [
            { eq: 'σ = F/A,&nbsp; ε = δ/L', vars: 'normal stress and strain' },
            { eq: 'σ = Eε', vars: 'Hooke\'s law; E = Young\'s modulus' },
            { eq: 'FS = σ<sub>fail</sub> / σ<sub>allow</sub>', vars: 'factor of safety' },
            { eq: 'ν = −ε<sub>lateral</sub>/ε<sub>axial</sub>', vars: 'Poisson\'s ratio (≈0.3 for metals)' },
          ],
          example: {
            problem: 'A 12 mm steel rod carries 15 kN. Stress? Safe against 250 MPa yield with FS = 2?',
            solution: 'A = π(0.006)² = 1.13 × 10⁻⁴ m², σ = 15000/1.13e-4 = 133 MPa. Allowable = 250/2 = 125 MPa. 133 > 125 — not acceptable; use a 14 mm rod (σ = 97 MPa).',
          },
        },
        {
          id: 'axial',
          title: 'Axial Loading',
          summary: 'Members in pure tension or compression deform by δ = FL/AE. Stiffness in series and parallel combines like electrical resistors, which makes stepped and composite bars routine.',
          points: [
            'δ = FL/AE — deformation scales with load and length, inversely with area and stiffness.',
            'Segments in series: total δ is the sum; members in parallel share load in proportion to AE/L.',
            'Thermal strain ε = αΔT adds directly; constrained thermal expansion creates stress σ = EαΔT with no external load at all.',
          ],
          equations: [
            { eq: 'δ = FL / AE', vars: 'axial deformation' },
            { eq: 'δ<sub>T</sub> = αΔT·L', vars: 'free thermal expansion' },
            { eq: 'σ<sub>T</sub> = EαΔT', vars: 'fully constrained thermal stress' },
          ],
          example: {
            problem: 'A steel rail (α = 12 × 10⁻⁶/°C, E = 200 GPa) is fully constrained and heats by 40 °C. What stress develops?',
            solution: 'σ = EαΔT = 200e9 × 12e-6 × 40 = 96 MPa compression — enough to buckle track, which is why rails get expansion joints.',
          },
        },
        {
          id: 'torsion',
          title: 'Torsion',
          summary: 'Circular shafts under torque develop shear stress that grows linearly from zero at the center to a maximum at the surface. This is the core of every drivetrain and power-transmission calculation.',
          points: [
            'τ = Tr/J peaks at the outer surface — material near the center barely works, which is why hollow shafts are efficient.',
            'Angle of twist φ = TL/JG is the torsional analog of δ = FL/AE.',
            'Power, torque, speed: P = Tω. At fixed power, halving rpm doubles torque.',
          ],
          equations: [
            { eq: 'τ<sub>max</sub> = Tr / J', vars: 'T = torque, r = outer radius, J = polar moment' },
            { eq: 'J = πd⁴/32', vars: 'solid circular shaft' },
            { eq: 'φ = TL / JG', vars: 'angle of twist; G = shear modulus' },
            { eq: 'P = Tω = T·(2πN/60)', vars: 'N in rpm' },
          ],
          example: {
            problem: 'A motor delivers 10 kW at 1500 rpm through a 30 mm solid shaft. Find the peak shear stress.',
            solution: 'T = P/ω = 10000/(157.1) = 63.7 N·m. J = π(0.03)⁴/32 = 7.95 × 10⁻⁸ m⁴. τ = 63.7 × 0.015/7.95e-8 = 12.0 MPa — comfortable for steel.',
          },
        },
        {
          id: 'bending',
          title: 'Beam Bending',
          summary: 'Bending creates tension on one face and compression on the other, varying linearly through the depth. The flexure formula σ = Mc/I with shear and moment diagrams is the workhorse of structural analysis.',
          points: [
            'Draw shear and moment diagrams first; the peak moment locates the critical section.',
            'σ = Mc/I: stress peaks at the extreme fibers, at the section of maximum moment.',
            'Section modulus S = I/c collapses geometry into one number: σ = M/S.',
            'Deflection limits (like L/360 for floors) often govern the design before strength does.',
          ],
          equations: [
            { eq: 'σ = Mc / I = M / S', vars: 'flexure formula' },
            { eq: 'M<sub>max</sub> = PL/4', vars: 'simply supported, central point load' },
            { eq: 'M<sub>max</sub> = wL²/8', vars: 'simply supported, uniform load' },
            { eq: 'δ<sub>max</sub> = 5wL⁴ / 384EI', vars: 'simply supported UDL deflection' },
          ],
          example: {
            problem: 'A 3 m simply supported beam (rect. 50 × 150 mm) carries 2 kN at midspan. Peak bending stress?',
            solution: 'M = PL/4 = 1.5 kN·m. I = 0.05 × 0.15³/12 = 1.41 × 10⁻⁵ m⁴, c = 0.075 m. σ = 1500 × 0.075/1.41e-5 = 8.0 MPa.',
          },
        },
        {
          id: 'buckling',
          title: 'Column Buckling',
          summary: 'Slender columns fail by buckling — a sudden sideways instability — at loads far below the material\'s strength. Euler\'s formula shows the critical load depends on stiffness and length, not strength.',
          points: [
            'P<sub>cr</sub> = π²EI/(KL)²: doubling length cuts capacity by 4×; a stronger alloy with the same E does not help.',
            'End conditions set K: pinned–pinned 1.0, fixed–free 2.0, fixed–pinned 0.7, fixed–fixed 0.5.',
            'Columns buckle about the axis of least I — check both directions.',
            'Euler applies to slender columns; short columns simply crush at the yield stress.',
          ],
          equations: [
            { eq: 'P<sub>cr</sub> = π²EI / (KL)²', vars: 'Euler critical load' },
            { eq: 'σ<sub>cr</sub> = π²E / (KL/r)²', vars: 'r = √(I/A), slenderness form' },
          ],
          example: {
            problem: 'A pinned–pinned 25 mm solid steel strut is 1.5 m long. Critical load?',
            solution: 'I = π(0.025)⁴/64 = 1.92 × 10⁻⁸ m⁴. Pcr = π² × 200e9 × 1.92e-8/1.5² = 16.8 kN. Note yield would allow ~123 kN — buckling governs by 7×.',
          },
        },
      ],
    },

    {
      id: 'thermo',
      icon: '🌡️',
      title: 'Thermodynamics',
      tagline: 'Energy, heat, work, and the limits nature imposes on every engine.',
      color: 'var(--acc-thermo)',
      topics: [
        {
          id: 'first-law',
          title: 'The First Law',
          summary: 'Energy is conserved: heat added to a system either raises its internal energy or leaves as work. Every energy audit — engines, compressors, buildings — is an application of this bookkeeping.',
          points: [
            'Closed system: Q − W = ΔU (with W the work done by the system).',
            'Sign conventions kill more exam points than physics does — fix yours and never waver.',
            'For steady-flow devices use enthalpy: q − w = Δh + Δke + Δpe.',
          ],
          equations: [
            { eq: 'Q − W = ΔU', vars: 'closed-system first law' },
            { eq: 'W = ∫P dV', vars: 'boundary work' },
            { eq: 'h = u + Pv', vars: 'enthalpy definition' },
          ],
          example: {
            problem: 'A gas absorbs 500 J of heat while doing 200 J of work on its surroundings. ΔU?',
            solution: 'ΔU = Q − W = 500 − 200 = +300 J. The rest of the energy left as work.',
          },
        },
        {
          id: 'ideal-gas',
          title: 'Ideal Gas & Processes',
          summary: 'PV = nRT plus the process path (isothermal, isobaric, isochoric, adiabatic) fully determines work and heat for a gas. These four canonical processes are the building blocks of every cycle.',
          points: [
            'Isothermal: ΔU = 0, so Q = W = nRT·ln(V₂/V₁).',
            'Isochoric: W = 0, so Q = ΔU = nc<sub>v</sub>ΔT.',
            'Isobaric: W = PΔV and Q = nc<sub>p</sub>ΔT.',
            'Adiabatic: Q = 0, TV^(γ−1) = const — compression heats the gas (diesel ignition).',
          ],
          equations: [
            { eq: 'PV = nRT', vars: 'ideal gas law; R = 8.314 J/(mol·K)' },
            { eq: 'W<sub>isothermal</sub> = nRT·ln(V₂/V₁)', vars: '' },
            { eq: 'TV<sup>γ−1</sup> = const,&nbsp; PV<sup>γ</sup> = const', vars: 'adiabatic relations; γ = c<sub>p</sub>/c<sub>v</sub>' },
          ],
          example: {
            problem: 'Air (γ = 1.4) at 300 K is compressed adiabatically to 1/10 its volume. Final temperature?',
            solution: 'T₂ = T₁(V₁/V₂)^(γ−1) = 300 × 10^0.4 = 754 K. This is exactly how a diesel engine ignites fuel with no spark plug.',
          },
        },
        {
          id: 'second-law',
          title: 'The Second Law & Entropy',
          summary: 'Heat flows spontaneously only from hot to cold, and no engine can convert heat to work completely. Entropy quantifies this one-way street and sets the theoretical ceiling on every heat engine.',
          points: [
            'Entropy of an isolated system never decreases; real processes are irreversible.',
            'The Carnot limit η = 1 − T<sub>C</sub>/T<sub>H</sub> depends only on absolute temperatures.',
            'Refrigerators and heat pumps are engines run backwards; their COP can exceed 1 because they move heat rather than create it.',
          ],
          equations: [
            { eq: 'ΔS ≥ ∫δQ/T', vars: 'Clausius inequality (= for reversible)' },
            { eq: 'η<sub>Carnot</sub> = 1 − T<sub>C</sub>/T<sub>H</sub>', vars: 'temperatures in kelvin' },
            { eq: 'COP<sub>ref</sub> = T<sub>C</sub>/(T<sub>H</sub>−T<sub>C</sub>),&nbsp; COP<sub>hp</sub> = T<sub>H</sub>/(T<sub>H</sub>−T<sub>C</sub>)', vars: 'Carnot COPs' },
          ],
          example: {
            problem: 'A power plant runs between 800 K steam and a 300 K river. Best possible efficiency?',
            solution: 'η = 1 − 300/800 = 62.5%. Real plants achieve roughly 40% — the gap is irreversibility, not bad engineering.',
          },
        },
        {
          id: 'cycles',
          title: 'Power Cycles',
          summary: 'Cycles convert heat to work continuously by carrying a working fluid around a closed loop. Otto (gasoline), Diesel, Brayton (gas turbine), and Rankine (steam) power nearly all of civilization.',
          points: [
            'Otto cycle efficiency rises with compression ratio: η = 1 − r^(1−γ) — knock limits r in practice.',
            'Rankine cycles dominate electricity generation; pumping liquid instead of compressing vapor is the trick.',
            'Brayton efficiency rises with pressure ratio; turbine inlet temperature is the limiting technology.',
          ],
          equations: [
            { eq: 'η<sub>Otto</sub> = 1 − r<sup>1−γ</sup>', vars: 'r = compression ratio' },
            { eq: 'η<sub>th</sub> = W<sub>net</sub> / Q<sub>in</sub>', vars: 'any cycle' },
            { eq: 'η<sub>Brayton</sub> = 1 − r<sub>p</sub><sup>(1−γ)/γ</sup>', vars: 'r<sub>p</sub> = pressure ratio' },
          ],
          example: {
            problem: 'An engine with compression ratio 10 (γ = 1.4): ideal Otto efficiency?',
            solution: 'η = 1 − 10^(−0.4) = 60.2%. Real engines get ~35% — heat loss, friction, and finite combustion speed take the rest.',
          },
        },
      ],
    },

    {
      id: 'fluids',
      icon: '💧',
      title: 'Fluid Mechanics',
      tagline: 'Pressure, flow, and the forces fluids exert on everything they touch.',
      color: 'var(--acc-fluids)',
      topics: [
        {
          id: 'properties',
          title: 'Fluid Properties & Hydrostatics',
          summary: 'Pressure in a static fluid increases linearly with depth and acts equally in all directions. This single fact designs dams, submarines, hydraulic presses, and barometers.',
          points: [
            'P = ρgh — depth is all that matters, not container shape.',
            'Pascal\'s principle: pressure applied to a confined fluid transmits undiminished — a small piston can lift a car.',
            'Buoyancy F<sub>B</sub> = ρ<sub>fluid</sub>gV<sub>displaced</sub>: a body floats when it displaces its own weight.',
          ],
          equations: [
            { eq: 'P = P₀ + ρgh', vars: 'hydrostatic pressure at depth h' },
            { eq: 'F₁/A₁ = F₂/A₂', vars: 'hydraulic press (Pascal)' },
            { eq: 'F<sub>B</sub> = ρgV', vars: 'Archimedes\' principle' },
          ],
          example: {
            problem: 'What is the gauge pressure 30 m underwater?',
            solution: 'P = ρgh = 998 × 9.81 × 30 = 294 kPa — about 2.9 atmospheres above the surface pressure.',
          },
        },
        {
          id: 'bernoulli',
          title: 'Continuity & Bernoulli',
          summary: 'Mass conservation forces fluid to speed up in constrictions; Bernoulli\'s equation shows the pressure drops when it does. Together they explain venturis, airspeed indicators, and why shower curtains attack you.',
          points: [
            'Continuity: A₁v₁ = A₂v₂ for incompressible flow — half the area, twice the speed.',
            'Bernoulli applies along a streamline in steady, incompressible, frictionless flow — check those assumptions.',
            'Each term is an energy per volume: static pressure, dynamic pressure ½ρv², and elevation head ρgz.',
          ],
          equations: [
            { eq: 'A₁v₁ = A₂v₂', vars: 'continuity (incompressible)' },
            { eq: 'P + ½ρv² + ρgz = const', vars: 'Bernoulli along a streamline' },
            { eq: 'v = √(2gh)', vars: 'Torricelli — outflow from a tank' },
          ],
          example: {
            problem: 'Water flows at 2 m/s through a 10 cm pipe that necks down to 5 cm. Find the velocity and pressure change.',
            solution: 'Area ratio 4 → v₂ = 8 m/s. ΔP = ½ρ(v₁² − v₂²) = ½ × 998 × (4 − 64) = −29.9 kPa: the pressure drops in the throat.',
          },
        },
        {
          id: 'viscous',
          title: 'Viscous Flow in Pipes',
          summary: 'Real fluids lose pressure to friction. The Reynolds number decides laminar vs. turbulent, and the Darcy–Weisbach equation with a friction factor converts that into pumping cost.',
          points: [
            'Re = ρvD/μ: below ~2300 laminar, above ~4000 turbulent.',
            'Laminar friction factor is exact: f = 64/Re. Turbulent needs the Moody chart or the Haaland/Colebrook correlations.',
            'Head loss scales with v² in turbulent flow — doubling flow rate roughly quadruples the pressure drop.',
          ],
          equations: [
            { eq: 'Re = ρvD/μ', vars: 'Reynolds number' },
            { eq: 'ΔP = f·(L/D)·(ρv²/2)', vars: 'Darcy–Weisbach' },
            { eq: 'f<sub>lam</sub> = 64/Re', vars: 'laminar exact solution' },
          ],
          example: {
            problem: 'Water at 1.5 m/s in a 25 mm pipe: laminar or turbulent?',
            solution: 'Re = 998 × 1.5 × 0.025/0.001 = 37,400 — fully turbulent, like nearly every practical water flow.',
          },
        },
        {
          id: 'drag',
          title: 'External Flow & Drag',
          summary: 'A body moving through fluid feels drag proportional to dynamic pressure, frontal area, and a shape-dependent coefficient. Streamlining attacks the pressure (form) drag that dominates blunt bodies.',
          points: [
            'F<sub>D</sub> = ½C<sub>d</sub>ρv²A: drag grows with the square of speed, so drag power grows with the cube.',
            'Typical C<sub>d</sub>: sphere 0.47, modern car 0.25–0.35, flat plate 1.28, streamlined body ~0.04.',
            'Terminal velocity: drag equals weight, then acceleration stops.',
          ],
          equations: [
            { eq: 'F<sub>D</sub> = ½C<sub>d</sub>ρv²A', vars: 'drag force' },
            { eq: 'v<sub>t</sub> = √(2mg / (C<sub>d</sub>ρA))', vars: 'terminal velocity' },
            { eq: 'P<sub>drag</sub> = F<sub>D</sub>·v', vars: 'power to overcome drag' },
          ],
          example: {
            problem: 'How much power does drag consume for a car (Cd = 0.30, A = 2.2 m²) at 120 km/h?',
            solution: 'v = 33.3 m/s. F = ½ × 0.30 × 1.204 × 33.3² × 2.2 = 441 N. P = F·v = 14.7 kW — most of the engine\'s highway output.',
          },
        },
      ],
    },

    {
      id: 'heat',
      icon: '🔥',
      title: 'Heat Transfer',
      tagline: 'Conduction, convection, and radiation — how thermal energy moves.',
      color: 'var(--acc-heat)',
      topics: [
        {
          id: 'conduction',
          title: 'Conduction',
          summary: 'Heat diffuses through solids from hot to cold at a rate set by thermal conductivity, area, and temperature gradient. Fourier\'s law is the Ohm\'s law of heat flow.',
          points: [
            'q = kAΔT/L for a plane wall; conductivity k spans five orders of magnitude from aerogel to copper.',
            'The electrical analogy — R = L/kA, q = ΔT/R — turns multilayer walls into series-resistor problems.',
            'Contact resistance between rough surfaces is why CPU coolers need thermal paste.',
          ],
          equations: [
            { eq: 'q = kA·ΔT / L', vars: 'Fourier\'s law, plane wall' },
            { eq: 'R<sub>cond</sub> = L / kA', vars: 'conduction resistance' },
            { eq: 'q = ΔT / ΣR', vars: 'series composite wall' },
          ],
          example: {
            problem: 'A 3 × 5 m brick wall (k = 0.7 W/m·K) 20 cm thick separates 22 °C from −5 °C. Heat loss?',
            solution: 'q = 0.7 × 15 × 27/0.2 = 1418 W — why insulation (k ≈ 0.04) matters: 5 cm of it would cut this by ~80%.',
          },
        },
        {
          id: 'convection',
          title: 'Convection',
          summary: 'Moving fluid carries heat away from surfaces. All the physics hides in the convection coefficient h, which ranges from ~5 (still air) to ~10,000 W/m²·K (boiling water).',
          points: [
            'Newton\'s law of cooling: q = hAΔT — deceptively simple; finding h is the whole discipline.',
            'Forced convection (fans, pumps) gives far higher h than natural convection.',
            'Dimensionless groups (Nu, Re, Pr) correlate h across geometries: Nu = hL/k.',
          ],
          equations: [
            { eq: 'q = hA(T<sub>s</sub> − T<sub>∞</sub>)', vars: 'Newton\'s law of cooling' },
            { eq: 'R<sub>conv</sub> = 1 / hA', vars: 'convection resistance' },
            { eq: 'Nu = hL/k<sub>fluid</sub>', vars: 'Nusselt number' },
          ],
          example: {
            problem: 'A 0.05 m² heat sink at 60 °C sits in 25 °C air. Compare natural (h = 10) vs. fan-forced (h = 80).',
            solution: 'Natural: q = 10 × 0.05 × 35 = 17.5 W. Forced: 140 W. The fan buys 8× the cooling — this is every laptop.',
          },
        },
        {
          id: 'radiation',
          title: 'Radiation',
          summary: 'Every surface above absolute zero emits thermal radiation as T⁴. It needs no medium, dominates at high temperature, and is the only way heat leaves a spacecraft.',
          points: [
            'q = εσA(T⁴ₛ − T⁴<sub>sur</sub>): the fourth power makes radiation explode at furnace temperatures.',
            'Emissivity ε: polished metal ~0.05, black paint ~0.95 — surface finish is a design variable.',
            'At room temperature radiation and natural convection are comparable; don\'t neglect either.',
          ],
          equations: [
            { eq: 'q = εσA(T<sub>s</sub>⁴ − T<sub>sur</sub>⁴)', vars: 'σ = 5.67 × 10⁻⁸ W/m²K⁴' },
            { eq: 'E<sub>b</sub> = σT⁴', vars: 'blackbody emissive power' },
          ],
          example: {
            problem: 'A 1 m² black surface (ε = 0.9) at 400 K faces surroundings at 300 K. Net radiation?',
            solution: 'q = 0.9 × 5.67e-8 × (400⁴ − 300⁴) = 893 W — as much as a small space heater, with no contact at all.',
          },
        },
        {
          id: 'transient',
          title: 'Transient Cooling',
          summary: 'When a small or highly conductive body cools, its interior stays nearly uniform and the temperature decays exponentially — the lumped-capacitance model. The Biot number tells you when this shortcut is legal.',
          points: [
            'Biot number Bi = hL<sub>c</sub>/k compares surface convection to internal conduction; lumped analysis is valid for Bi < 0.1.',
            'Temperature decays with time constant τ = ρVc/hA — the thermal RC circuit.',
            'Quenching, thermocouple response, and coffee cooling are all this one equation.',
          ],
          equations: [
            { eq: 'Bi = hL<sub>c</sub>/k,&nbsp; L<sub>c</sub> = V/A', vars: 'validity check: Bi < 0.1' },
            { eq: 'T(t) = T<sub>∞</sub> + (T<sub>i</sub> − T<sub>∞</sub>)e<sup>−t/τ</sup>', vars: 'lumped-capacitance response' },
            { eq: 'τ = ρVc / hA', vars: 'thermal time constant' },
          ],
          example: {
            problem: 'A small aluminum part (τ = 90 s) is quenched from 200 °C into 25 °C oil. Temperature after 3 minutes?',
            solution: 'T = 25 + 175·e^(−180/90) = 25 + 175 × 0.135 = 48.7 °C — after two time constants, ~86% of the way to ambient.',
          },
        },
      ],
    },
  ];

  // ---------------------------------------------------------------
  // Material properties (room temperature, typical values)
  // ---------------------------------------------------------------
  const MATERIALS = [
    { name: 'Structural steel (A36)', E: 200, G: 79, yield: 250, ultimate: 400, density: 7850, k: 50, alpha: 12 },
    { name: 'Stainless steel (304)', E: 193, G: 77, yield: 215, ultimate: 505, density: 8000, k: 16, alpha: 17 },
    { name: 'Aluminum 6061-T6', E: 69, G: 26, yield: 276, ultimate: 310, density: 2700, k: 167, alpha: 23.6 },
    { name: 'Titanium Ti-6Al-4V', E: 114, G: 44, yield: 880, ultimate: 950, density: 4430, k: 6.7, alpha: 8.6 },
    { name: 'Copper (annealed)', E: 117, G: 44, yield: 70, ultimate: 220, density: 8960, k: 401, alpha: 16.5 },
    { name: 'Brass (C260)', E: 110, G: 40, yield: 200, ultimate: 350, density: 8530, k: 120, alpha: 19.9 },
    { name: 'Gray cast iron', E: 110, G: 44, yield: null, ultimate: 200, density: 7200, k: 53, alpha: 10.8 },
    { name: 'ABS plastic', E: 2.3, G: 0.8, yield: 40, ultimate: 45, density: 1050, k: 0.25, alpha: 90 },
    { name: 'Nylon 6/6', E: 2.9, G: 1.0, yield: 82, ultimate: 82, density: 1140, k: 0.25, alpha: 80 },
    { name: 'Oak (along grain)', E: 12, G: 1.0, yield: null, ultimate: 100, density: 750, k: 0.17, alpha: 5 },
    { name: 'Concrete (compression)', E: 30, G: 12, yield: null, ultimate: 30, density: 2400, k: 1.7, alpha: 10 },
    { name: 'Carbon fiber laminate', E: 140, G: 5, yield: null, ultimate: 1500, density: 1600, k: 7, alpha: 2 },
  ];

  // ---------------------------------------------------------------
  // Physical constants for the reference page
  // ---------------------------------------------------------------
  const CONSTANTS = [
    { symbol: 'g', name: 'Standard gravity', value: '9.80665 m/s²' },
    { symbol: 'R', name: 'Universal gas constant', value: '8.314 J/(mol·K)' },
    { symbol: 'σ', name: 'Stefan–Boltzmann constant', value: '5.670 × 10⁻⁸ W/(m²·K⁴)' },
    { symbol: 'P<sub>atm</sub>', name: 'Standard atmosphere', value: '101.325 kPa' },
    { symbol: 'ρ<sub>water</sub>', name: 'Water density (20 °C)', value: '998 kg/m³' },
    { symbol: 'μ<sub>water</sub>', name: 'Water viscosity (20 °C)', value: '1.002 × 10⁻³ Pa·s' },
    { symbol: 'ρ<sub>air</sub>', name: 'Air density (20 °C, 1 atm)', value: '1.204 kg/m³' },
    { symbol: 'c<sub>water</sub>', name: 'Water specific heat', value: '4186 J/(kg·K)' },
    { symbol: 'γ<sub>air</sub>', name: 'Air heat-capacity ratio', value: '1.400' },
    { symbol: 'M<sub>air</sub>', name: 'Molar mass of air', value: '28.97 g/mol' },
  ];

  // ---------------------------------------------------------------
  // Quiz bank — 36 questions across all subjects
  // Each: { subject, q, choices[4], answer (index), why }
  // ---------------------------------------------------------------
  const QUIZ = [
    // --- statics
    { subject: 'statics', q: 'For a rigid body in 2D equilibrium, how many independent scalar equations are available?', choices: ['2', '3', '4', '6'], answer: 1, why: 'ΣFx = 0, ΣFy = 0, and ΣM = 0 — three equations, so at most three unknowns.' },
    { subject: 'statics', q: 'A couple produces a moment that is…', choices: ['largest at its midpoint', 'zero about its center', 'the same about every point', 'proportional to distance from it'], answer: 2, why: 'A couple is a free vector: F·d about any point in the plane.' },
    { subject: 'statics', q: 'Two non-collinear members meet at an unloaded truss joint. The member forces are…', choices: ['equal and opposite', 'both zero', 'both in tension', 'indeterminate'], answer: 1, why: 'Equilibrium along each independent direction forces both to be zero-force members.' },
    { subject: 'statics', q: 'A block rests on a slope at the angle of repose. The friction coefficient equals…', choices: ['sin θ', 'cos θ', 'tan θ', '1/tan θ'], answer: 2, why: 'At impending slip, mg·sinθ = μ·mg·cosθ, so μ = tanθ.' },
    { subject: 'statics', q: 'The parallel-axis theorem states I = ?', choices: ['Ī − Ad²', 'Ī + Ad²', 'Ī·d²', 'Ī + A²d'], answer: 1, why: 'Moving away from the centroid always adds A·d² — inertia is minimal about the centroidal axis.' },
    { subject: 'statics', q: 'A 60 N force acts perpendicular to a 0.5 m lever. The moment is…', choices: ['30 N·m', '60 N·m', '120 N·m', '15 N·m'], answer: 0, why: 'M = F·d = 60 × 0.5 = 30 N·m.' },
    // --- dynamics
    { subject: 'dynamics', q: 'A projectile\'s horizontal velocity (no drag) during flight…', choices: ['decreases steadily', 'increases steadily', 'stays constant', 'oscillates'], answer: 2, why: 'No horizontal force acts, so vx is constant; only vy changes under gravity.' },
    { subject: 'dynamics', q: 'For maximum range on level ground, launch angle should be…', choices: ['30°', '45°', '60°', '90°'], answer: 1, why: 'R = v²sin(2θ)/g peaks when 2θ = 90°.' },
    { subject: 'dynamics', q: 'Doubling a car\'s speed multiplies its kinetic energy by…', choices: ['2', '4', '8', '√2'], answer: 1, why: 'KE = ½mv² — quadratic in speed. Braking distance scales the same way.' },
    { subject: 'dynamics', q: 'In a perfectly inelastic collision, what is conserved?', choices: ['kinetic energy only', 'momentum only', 'both', 'neither'], answer: 1, why: 'Momentum is always conserved without external impulses; maximum KE is lost when bodies stick together.' },
    { subject: 'dynamics', q: 'The natural frequency of a mass–spring system is…', choices: ['√(m/k)', '√(k/m)', 'k/m', '2πkm'], answer: 1, why: 'ωn = √(k/m): stiffer springs oscillate faster, heavier masses slower.' },
    { subject: 'dynamics', q: 'Critical damping is the value of damping that…', choices: ['maximizes oscillation', 'returns to rest fastest without oscillating', 'eliminates all motion', 'doubles the period'], answer: 1, why: 'ζ = 1 is the boundary between oscillatory and sluggish response — used in car suspensions and door closers.' },
    { subject: 'dynamics', q: 'A net centripetal force on a body moving in a circle points…', choices: ['tangent to the path', 'outward', 'toward the center', 'opposite the velocity'], answer: 2, why: 'ΣFn = mv²/ρ is directed toward the center of curvature; nothing physically pushes outward.' },
    // --- materials
    { subject: 'materials', q: 'Young\'s modulus is the slope of the stress–strain curve in the…', choices: ['plastic region', 'elastic region', 'necking region', 'entire curve'], answer: 1, why: 'E = σ/ε only while deformation is linear-elastic and recoverable.' },
    { subject: 'materials', q: 'A rod\'s diameter is doubled. Under the same axial load, stress becomes…', choices: ['½', '¼', '2×', 'unchanged'], answer: 1, why: 'Area grows 4× with diameter squared, so σ = F/A drops to a quarter.' },
    { subject: 'materials', q: 'In a torsion shaft, shear stress is maximum…', choices: ['at the center', 'at the outer surface', 'uniform everywhere', 'at mid-radius'], answer: 1, why: 'τ = Tr/J grows linearly with radius — which is why hollow shafts are so efficient.' },
    { subject: 'materials', q: 'For a simply supported beam with a central point load, the maximum bending moment is…', choices: ['PL/2', 'PL/4', 'PL/8', 'PL²/8'], answer: 1, why: 'Reactions are P/2; the moment peaks at midspan: (P/2)(L/2) = PL/4.' },
    { subject: 'materials', q: 'Euler buckling load depends on material only through…', choices: ['yield strength', 'ultimate strength', 'Young\'s modulus', 'hardness'], answer: 2, why: 'Pcr = π²EI/(KL)² — buckling is a stiffness instability, not a strength failure.' },
    { subject: 'materials', q: 'Doubling a column\'s length changes its Euler buckling load by…', choices: ['½', '¼', '2×', 'no change'], answer: 1, why: 'Pcr ∝ 1/L², so twice the length means one quarter the capacity.' },
    { subject: 'materials', q: 'A constrained steel rail heats up. The stress that develops is…', choices: ['zero', 'tension', 'compression', 'shear only'], answer: 2, why: 'It wants to expand but cannot, so the constraint pushes back: σ = EαΔT in compression.' },
    // --- thermo
    { subject: 'thermo', q: 'The first law for a closed system is…', choices: ['Q = W', 'Q − W = ΔU', 'Q + W = 0', 'ΔS ≥ 0'], answer: 1, why: 'Heat in minus work out equals the change in internal energy.' },
    { subject: 'thermo', q: 'In an isothermal ideal-gas process, ΔU is…', choices: ['equal to Q', 'equal to W', 'zero', 'negative'], answer: 2, why: 'Ideal-gas internal energy depends only on temperature, which doesn\'t change — so Q = W.' },
    { subject: 'thermo', q: 'During adiabatic compression, gas temperature…', choices: ['drops', 'stays constant', 'rises', 'depends on the gas'], answer: 2, why: 'Q = 0, so all compression work becomes internal energy: TV^(γ−1) = const. Diesel ignition works this way.' },
    { subject: 'thermo', q: 'Carnot efficiency between 600 K and 300 K is…', choices: ['25%', '50%', '75%', '100%'], answer: 1, why: 'η = 1 − Tc/Th = 1 − 300/600 = 50%, the ceiling no real engine can beat.' },
    { subject: 'thermo', q: 'A heat pump\'s COP can exceed 1 because it…', choices: ['creates energy', 'moves heat rather than converting it', 'violates the second law', 'runs on gas'], answer: 1, why: 'It uses work to pump existing heat uphill — 1 J of work can move 3–4 J of heat indoors.' },
    { subject: 'thermo', q: 'Raising the compression ratio of an Otto-cycle engine…', choices: ['lowers efficiency', 'raises efficiency', 'has no effect', 'only raises power'], answer: 1, why: 'η = 1 − r^(1−γ): more compression extracts more work per unit heat, until knock intervenes.' },
    // --- fluids
    { subject: 'fluids', q: 'Gauge pressure at depth h in a static liquid is…', choices: ['ρgh', 'ρg/h', '½ρv²', 'ρh/g'], answer: 0, why: 'Hydrostatics: pressure grows linearly with depth, independent of container shape.' },
    { subject: 'fluids', q: 'A pipe necks to half its diameter. Incompressible flow speed becomes…', choices: ['2×', '4×', '½', 'unchanged'], answer: 1, why: 'Continuity: A₁v₁ = A₂v₂ and area scales with diameter squared.' },
    { subject: 'fluids', q: 'By Bernoulli, where flow speeds up along a level streamline, pressure…', choices: ['rises', 'falls', 'is unchanged', 'equals ρgh'], answer: 1, why: 'P + ½ρv² is constant: dynamic pressure grows at the expense of static pressure.' },
    { subject: 'fluids', q: 'Pipe flow is laminar when the Reynolds number is below about…', choices: ['23', '230', '2300', '23000'], answer: 2, why: 'Re < ~2300 keeps pipe flow smooth and layered; above ~4000 it is turbulent.' },
    { subject: 'fluids', q: 'Aerodynamic drag force scales with speed as…', choices: ['v', 'v²', 'v³', '√v'], answer: 1, why: 'F = ½Cdρv²A. (Drag power scales as v³ — the cost of driving fast.)' },
    { subject: 'fluids', q: 'At terminal velocity, a falling object\'s acceleration is…', choices: ['g', 'g/2', 'zero', 'negative'], answer: 2, why: 'Drag has grown to exactly balance weight, so net force — and acceleration — is zero.' },
    // --- heat
    { subject: 'heat', q: 'Fourier\'s law says conduction heat rate is proportional to…', choices: ['T⁴', 'the temperature gradient', 'h·A', 'flow velocity'], answer: 1, why: 'q = kA·dT/dx — heat diffuses down the temperature gradient.' },
    { subject: 'heat', q: 'Doubling insulation thickness (other things equal) changes conduction loss to…', choices: ['½', '¼', '2×', 'unchanged'], answer: 0, why: 'q = kAΔT/L is inversely proportional to thickness.' },
    { subject: 'heat', q: 'Radiation heat transfer scales with absolute temperature as…', choices: ['T', 'T²', 'T³', 'T⁴'], answer: 3, why: 'Stefan–Boltzmann: E = σT⁴ — the fourth power makes radiation dominate in furnaces.' },
    { subject: 'heat', q: 'The lumped-capacitance model is valid when the Biot number is…', choices: ['> 1', '> 0.1', '< 0.1', 'exactly 1'], answer: 2, why: 'Bi = hLc/k < 0.1 means internal conduction is fast enough that the body stays nearly uniform.' },
    { subject: 'heat', q: 'Which typically has the highest convection coefficient h?', choices: ['still air', 'fan-forced air', 'flowing water', 'boiling water'], answer: 3, why: 'Boiling reaches ~10,000 W/m²K; still air manages ~5. Phase change is the ultimate heat mover.' },
    { subject: 'heat', q: 'After one thermal time constant τ, a lumped body has completed about…', choices: ['37% of its temperature change', '50%', '63%', '95%'], answer: 2, why: '1 − e⁻¹ ≈ 0.632 — the same 63% rule as an RC circuit.' },
  ];

  return { SUBJECTS, MATERIALS, CONSTANTS, QUIZ };
})();
