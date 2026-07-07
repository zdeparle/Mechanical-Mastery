/*
 * Mechanical Mastery — app.js
 * Hash router, page views, quiz engine, search, and theme handling.
 * Depends on: physics.js, data.js, tools.js, sims.js.
 */
(function () {
  'use strict';
  const MM = window.MM;
  const DATA = window.MMDATA;
  const { TOOLS, el } = window.MMTOOLS;
  const { SIMS } = window.MMSIMS;

  const app = document.getElementById('app');
  let cleanup = null; // active view's destroy function

  // ---------------------------------------------------------------
  // Theme
  // ---------------------------------------------------------------
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mm-theme', next);
    window.dispatchEvent(new Event('resize')); // sims re-read theme colors on redraw
  });

  // ---------------------------------------------------------------
  // Mobile nav
  // ---------------------------------------------------------------
  const menuBtn = document.getElementById('menu-toggle');
  const navList = document.getElementById('primary-nav');
  menuBtn.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  navList.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navList.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // ---------------------------------------------------------------
  // Router
  // ---------------------------------------------------------------
  const routes = [
    { pattern: /^\/?$/, view: viewHome },
    { pattern: /^\/learn\/?$/, view: viewLearn },
    { pattern: /^\/learn\/([\w-]+)\/?$/, view: viewSubject },
    { pattern: /^\/tools\/?$/, view: viewTools },
    { pattern: /^\/tools\/([\w-]+)\/?$/, view: viewTool },
    { pattern: /^\/sims\/?$/, view: viewSims },
    { pattern: /^\/sims\/([\w-]+)\/?$/, view: viewSim },
    { pattern: /^\/quiz\/?$/, view: viewQuiz },
    { pattern: /^\/reference\/?$/, view: viewReference },
  ];

  function currentPath() {
    return (location.hash || '#/').replace(/^#/, '');
  }

  function navigate() {
    if (cleanup) { try { cleanup(); } catch (e) { /* view already gone */ } cleanup = null; }
    const path = currentPath();
    app.innerHTML = '';
    let matched = false;
    for (const r of routes) {
      const m = path.match(r.pattern);
      if (m) {
        cleanup = r.view(...m.slice(1)) || null;
        matched = true;
        break;
      }
    }
    if (!matched) viewNotFound();
    // Highlight active nav link
    document.querySelectorAll('#primary-nav a').forEach((a) => {
      const section = a.getAttribute('href').replace(/^#/, '').split('/')[1] || '';
      const cur = path.split('/')[1] || '';
      a.classList.toggle('active', section === cur);
      if (section === cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', navigate);

  // ---------------------------------------------------------------
  // Shared components
  // ---------------------------------------------------------------
  function pageHeader(title, subtitle, backHref, backLabel) {
    const head = el('div', { class: 'page-head' });
    if (backHref) head.appendChild(el('a', { href: backHref, class: 'back-link' }, `← ${backLabel}`));
    head.appendChild(el('h1', { html: title }));
    if (subtitle) head.appendChild(el('p', { class: 'page-subtitle', html: subtitle }));
    return head;
  }

  function cardGrid(items, hrefFor, extra) {
    const grid = el('div', { class: 'card-grid' });
    for (const item of items) {
      const card = el('a', { href: hrefFor(item), class: 'card' }, [
        el('div', { class: 'card-icon', 'aria-hidden': 'true' }, item.icon),
        el('h3', {}, item.title),
        el('p', { html: item.tagline || item.blurb }),
        extra ? extra(item) : null,
      ]);
      if (item.color) card.style.setProperty('--card-accent', item.color);
      grid.appendChild(card);
    }
    return grid;
  }

  // ---------------------------------------------------------------
  // Views
  // ---------------------------------------------------------------
  function viewHome() {
    document.title = 'Mechanical Mastery — Interactive Mechanical Engineering';
    const hero = el('section', { class: 'hero' }, [
      el('div', { class: 'hero-gears', 'aria-hidden': 'true', html:
        `<svg viewBox="0 0 120 120" class="gear g1"><path d="M60 8l6 12a42 42 0 0 1 12 5l13-4 8 8-4 13a42 42 0 0 1 5 12l12 6v11l-12 6a42 42 0 0 1-5 12l4 13-8 8-13-4a42 42 0 0 1-12 5l-6 12h-11l-6-12a42 42 0 0 1-12-5l-13 4-8-8 4-13a42 42 0 0 1-5-12L8 71V60l12-6a42 42 0 0 1 5-12l-4-13 8-8 13 4a42 42 0 0 1 12-5l6-12z" fill="currentColor" opacity=".16"/><circle cx="55" cy="65" r="17" fill="currentColor" opacity=".25"/></svg>` +
        `<svg viewBox="0 0 120 120" class="gear g2"><path d="M60 8l6 12a42 42 0 0 1 12 5l13-4 8 8-4 13a42 42 0 0 1 5 12l12 6v11l-12 6a42 42 0 0 1-5 12l4 13-8 8-13-4a42 42 0 0 1-12 5l-6 12h-11l-6-12a42 42 0 0 1-12-5l-13 4-8-8 4-13a42 42 0 0 1-5-12L8 71V60l12-6a42 42 0 0 1 5-12l-4-13 8-8 13 4a42 42 0 0 1 12-5l6-12z" fill="currentColor" opacity=".16"/><circle cx="55" cy="65" r="17" fill="currentColor" opacity=".25"/></svg>` }),
      el('h1', {}, 'Master Mechanical Engineering'),
      el('p', { class: 'hero-sub' }, 'Six core subjects, nine calculators, live simulations, and a quiz engine — everything interactive, everything explained.'),
      el('div', { class: 'hero-actions' }, [
        el('a', { href: '#/learn', class: 'btn btn-primary btn-lg' }, 'Start Learning'),
        el('a', { href: '#/tools', class: 'btn btn-ghost btn-lg' }, 'Open the Toolbox'),
      ]),
    ]);

    const stats = el('div', { class: 'stat-row' }, [
      statTile(String(DATA.SUBJECTS.length), 'subjects'),
      statTile(String(DATA.SUBJECTS.reduce((s, x) => s + x.topics.length, 0)), 'topics'),
      statTile(String(TOOLS.length), 'calculators'),
      statTile(String(DATA.QUIZ.length), 'quiz questions'),
    ]);

    const subjects = el('section', { class: 'home-section' }, [
      el('h2', {}, 'Learn the Subjects'),
      cardGrid(DATA.SUBJECTS, (s) => `#/learn/${s.id}`,
        (s) => el('span', { class: 'card-meta' }, `${s.topics.length} topics`)),
    ]);

    const toolsSec = el('section', { class: 'home-section' }, [
      el('h2', {}, 'Use the Tools'),
      cardGrid([
        ...TOOLS.slice(0, 3).map((t) => ({ ...t, tagline: t.blurb, href: `#/tools/${t.id}` })),
        ...SIMS.slice(0, 3).map((s) => ({ ...s, tagline: s.blurb, href: `#/sims/${s.id}` })),
      ], (t) => t.href),
      el('p', { class: 'center' }, [
        el('a', { href: '#/tools', class: 'btn btn-ghost' }, 'All calculators →'),
        ' ',
        el('a', { href: '#/sims', class: 'btn btn-ghost' }, 'All simulations →'),
      ]),
    ]);

    app.append(hero, stats, subjects, toolsSec);
  }

  function statTile(value, label) {
    return el('div', { class: 'stat-tile' }, [
      el('strong', {}, value),
      el('span', {}, label),
    ]);
  }

  function viewLearn() {
    document.title = 'Learn — Mechanical Mastery';
    app.appendChild(pageHeader('Subjects', 'Each subject breaks into focused topics with key ideas, equations, and a worked example.'));
    app.appendChild(cardGrid(DATA.SUBJECTS, (s) => `#/learn/${s.id}`,
      (s) => el('span', { class: 'card-meta' }, `${s.topics.length} topics`)));
  }

  function viewSubject(id) {
    const subject = DATA.SUBJECTS.find((s) => s.id === id);
    if (!subject) return viewNotFound();
    document.title = `${subject.title} — Mechanical Mastery`;
    app.appendChild(pageHeader(`${subject.icon} ${subject.title}`, subject.tagline, '#/learn', 'All subjects'));

    // Topic table of contents
    const toc = el('nav', { class: 'topic-toc', 'aria-label': 'Topics' });
    subject.topics.forEach((t, i) => {
      toc.appendChild(el('a', { href: `#topic-${t.id}`, onclick: (e) => {
        e.preventDefault();
        document.getElementById(`topic-${t.id}`)?.scrollIntoView({ behavior: 'smooth' });
      } }, `${i + 1}. ${t.title}`));
    });
    app.appendChild(toc);

    for (const topic of subject.topics) {
      const sec = el('section', { class: 'topic', id: `topic-${topic.id}` }, [
        el('h2', {}, topic.title),
        el('p', { class: 'topic-summary' }, topic.summary),
        el('h3', {}, 'Key ideas'),
        el('ul', {}, topic.points.map((p) => el('li', { html: p }))),
        el('h3', {}, 'Equations'),
        el('div', { class: 'eq-list' }, topic.equations.map((e) =>
          el('div', { class: 'eq-row' }, [
            el('code', { class: 'eq', html: e.eq }),
            e.vars ? el('span', { class: 'eq-vars', html: e.vars }) : null,
          ]))),
      ]);
      if (topic.example) {
        sec.appendChild(el('details', { class: 'example' }, [
          el('summary', {}, `Worked example — ${topic.example.problem}`),
          el('p', { html: topic.example.solution }),
        ]));
      }
      app.appendChild(sec);
    }

    const related = el('div', { class: 'related-row' }, [
      el('a', { href: '#/quiz', class: 'btn btn-primary' }, `Quiz yourself on ${subject.title} →`),
    ]);
    app.appendChild(related);
  }

  function viewTools() {
    document.title = 'Calculators — Mechanical Mastery';
    app.appendChild(pageHeader('Calculators', 'Engineering tools that update live as you type. All formulas match the subject pages.'));
    app.appendChild(cardGrid(TOOLS.map((t) => ({ ...t, tagline: t.blurb })), (t) => `#/tools/${t.id}`));
  }

  function viewTool(id) {
    const tool = TOOLS.find((t) => t.id === id);
    if (!tool) return viewNotFound();
    document.title = `${tool.title} — Mechanical Mastery`;
    app.appendChild(pageHeader(`${tool.icon} ${tool.title}`, tool.blurb, '#/tools', 'All calculators'));
    const body = el('div', { class: 'tool-body' });
    app.appendChild(body);
    return tool.render(body) || null;
  }

  function viewSims() {
    document.title = 'Simulations — Mechanical Mastery';
    app.appendChild(pageHeader('Simulations', 'Real physics, integrated live on a canvas. Change a parameter and watch the system respond.'));
    app.appendChild(cardGrid(SIMS.map((s) => ({ ...s, tagline: s.blurb })), (s) => `#/sims/${s.id}`));
  }

  function viewSim(id) {
    const sim = SIMS.find((s) => s.id === id);
    if (!sim) return viewNotFound();
    document.title = `${sim.title} — Mechanical Mastery`;
    app.appendChild(pageHeader(`${sim.icon} ${sim.title}`, sim.blurb, '#/sims', 'All simulations'));
    const body = el('div', { class: 'sim-body' });
    app.appendChild(body);
    const destroy = sim.render(body);
    app.appendChild(el('p', { class: 'sim-about', html: sim.about }));
    return destroy;
  }

  // ---------------------------------------------------------------
  // Quiz
  // ---------------------------------------------------------------
  function viewQuiz() {
    document.title = 'Quiz — Mechanical Mastery';
    app.appendChild(pageHeader('Quiz', 'Ten random questions. Instant feedback, explanations included.'));

    const setup = el('div', { class: 'quiz-setup' });
    const subjSel = el('select', { 'aria-label': 'Quiz subject' });
    subjSel.appendChild(el('option', { value: 'all' }, 'All subjects'));
    for (const s of DATA.SUBJECTS) subjSel.appendChild(el('option', { value: s.id }, s.title));

    const best = JSON.parse(localStorage.getItem('mm-best-scores') || '{}');
    const bestNote = el('p', { class: 'quiz-best' });
    function updateBestNote() {
      const b = best[subjSel.value];
      bestNote.textContent = b != null ? `Best score for this selection: ${b}/10` : 'No attempts yet for this selection.';
    }
    subjSel.addEventListener('change', updateBestNote);
    updateBestNote();

    const startBtn = el('button', { class: 'btn btn-primary btn-lg' }, 'Start Quiz');
    setup.append(el('div', { class: 'calc-field' }, [el('label', {}, 'Subject'), subjSel]), bestNote, startBtn);
    app.appendChild(setup);

    const quizArea = el('div', { class: 'quiz-area', 'aria-live': 'polite' });
    app.appendChild(quizArea);

    startBtn.addEventListener('click', () => {
      const pool = subjSel.value === 'all' ? DATA.QUIZ : DATA.QUIZ.filter((q) => q.subject === subjSel.value);
      const questions = shuffle([...pool]).slice(0, Math.min(10, pool.length));
      setup.hidden = true;
      runQuiz(quizArea, questions, subjSel.value, () => {
        setup.hidden = false;
        updateBestNote();
      });
    });
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function runQuiz(area, questions, subjectKey, onDone) {
    let index = 0, score = 0;

    function showQuestion() {
      area.innerHTML = '';
      const q = questions[index];
      const subj = DATA.SUBJECTS.find((s) => s.id === q.subject);
      area.appendChild(el('div', { class: 'quiz-progress' }, [
        el('span', {}, `Question ${index + 1} of ${questions.length}`),
        el('span', { class: 'quiz-chip' }, `${subj.icon} ${subj.title}`),
        el('span', {}, `Score: ${score}`),
      ]));
      const bar = el('div', { class: 'quiz-bar' }, [el('div', { class: 'quiz-bar-fill' })]);
      bar.firstChild.style.width = `${(index / questions.length) * 100}%`;
      area.appendChild(bar);
      area.appendChild(el('h2', { class: 'quiz-question' }, q.q));

      const choiceWrap = el('div', { class: 'quiz-choices' });
      const feedback = el('div', { class: 'quiz-feedback' });
      let answered = false;

      q.choices.forEach((choice, i) => {
        const btn = el('button', { class: 'quiz-choice' }, choice);
        btn.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          const correct = i === q.answer;
          if (correct) score++;
          choiceWrap.querySelectorAll('.quiz-choice').forEach((b, bi) => {
            b.disabled = true;
            if (bi === q.answer) b.classList.add('correct');
            else if (bi === i) b.classList.add('wrong');
          });
          feedback.appendChild(el('p', { class: correct ? 'quiz-right' : 'quiz-wrong' },
            correct ? '✓ Correct!' : '✗ Not quite.'));
          feedback.appendChild(el('p', { class: 'quiz-why' }, q.why));
          feedback.appendChild(el('button', { class: 'btn btn-primary', onclick: next },
            index + 1 < questions.length ? 'Next question →' : 'See results'));
          feedback.querySelector('button').focus();
        });
        choiceWrap.appendChild(btn);
      });
      area.appendChild(choiceWrap);
      area.appendChild(feedback);
    }

    function next() {
      index++;
      if (index < questions.length) showQuestion();
      else showResults();
    }

    function showResults() {
      area.innerHTML = '';
      const pct = score / questions.length;
      const verdict = pct === 1 ? 'Perfect — mastery achieved! 🏆'
        : pct >= 0.8 ? 'Excellent work! 🎉'
        : pct >= 0.6 ? 'Solid — review the misses and try again. 👍'
        : 'Keep at it — the subject pages cover every one of these. 📚';
      const best = JSON.parse(localStorage.getItem('mm-best-scores') || '{}');
      const scaled = Math.round((score / questions.length) * 10);
      if (best[subjectKey] == null || scaled > best[subjectKey]) {
        best[subjectKey] = scaled;
        localStorage.setItem('mm-best-scores', JSON.stringify(best));
      }
      area.appendChild(el('div', { class: 'quiz-results' }, [
        el('div', { class: 'quiz-score-ring' }, `${score}/${questions.length}`),
        el('h2', {}, verdict),
        el('div', { class: 'hero-actions' }, [
          el('button', { class: 'btn btn-primary', onclick: () => { area.innerHTML = ''; onDone(); } }, 'New quiz'),
          el('a', { href: '#/learn', class: 'btn btn-ghost' }, 'Back to subjects'),
        ]),
      ]));
    }

    showQuestion();
  }

  // ---------------------------------------------------------------
  // Reference
  // ---------------------------------------------------------------
  function viewReference() {
    document.title = 'Reference — Mechanical Mastery';
    app.appendChild(pageHeader('Reference', 'Every equation from the subject pages, plus constants and material properties.'));

    // Equation sheet by subject
    for (const s of DATA.SUBJECTS) {
      const sec = el('section', { class: 'ref-section' }, [el('h2', {}, `${s.icon} ${s.title}`)]);
      const list = el('div', { class: 'eq-list' });
      for (const t of s.topics) {
        for (const e of t.equations) {
          list.appendChild(el('div', { class: 'eq-row' }, [
            el('code', { class: 'eq', html: e.eq }),
            el('span', { class: 'eq-vars', html: e.vars || t.title }),
          ]));
        }
      }
      sec.appendChild(list);
      app.appendChild(sec);
    }

    // Constants
    const constSec = el('section', { class: 'ref-section' }, [el('h2', {}, '🔢 Physical Constants')]);
    const ctable = el('table', { class: 'ref-table' }, [
      el('thead', {}, el('tr', {}, [el('th', {}, 'Symbol'), el('th', {}, 'Name'), el('th', {}, 'Value')])),
      el('tbody', {}, DATA.CONSTANTS.map((c) => el('tr', {}, [
        el('td', { html: c.symbol }), el('td', {}, c.name), el('td', { html: c.value })]))),
    ]);
    constSec.appendChild(el('div', { class: 'table-scroll' }, ctable));
    app.appendChild(constSec);

    // Materials
    const matSec = el('section', { class: 'ref-section' }, [
      el('h2', {}, '🧱 Material Properties'),
      el('p', { class: 'page-subtitle' }, 'Typical room-temperature values. E, G in GPa; strengths in MPa; density in kg/m³; k in W/m·K; α in 10⁻⁶/°C.'),
    ]);
    const mtable = el('table', { class: 'ref-table' }, [
      el('thead', {}, el('tr', {}, ['Material', 'E', 'G', 'Yield', 'Ultimate', 'ρ', 'k', 'α'].map((h) => el('th', {}, h)))),
      el('tbody', {}, DATA.MATERIALS.map((m) => el('tr', {}, [
        el('td', {}, m.name),
        el('td', {}, String(m.E)),
        el('td', {}, String(m.G)),
        el('td', {}, m.yield == null ? '—' : String(m.yield)),
        el('td', {}, String(m.ultimate)),
        el('td', {}, String(m.density)),
        el('td', {}, String(m.k)),
        el('td', {}, String(m.alpha)),
      ]))),
    ]);
    matSec.appendChild(el('div', { class: 'table-scroll' }, mtable));
    app.appendChild(matSec);
  }

  function viewNotFound() {
    document.title = 'Not found — Mechanical Mastery';
    app.innerHTML = '';
    app.appendChild(el('div', { class: 'notfound' }, [
      el('h1', {}, '⚙️ 404'),
      el('p', {}, 'That page slipped through the linkage.'),
      el('a', { href: '#/', class: 'btn btn-primary' }, 'Back home'),
    ]));
  }

  // ---------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------
  const searchIndex = [];
  for (const s of DATA.SUBJECTS) {
    searchIndex.push({ title: s.title, kind: 'Subject', icon: s.icon, href: `#/learn/${s.id}`, text: s.tagline });
    for (const t of s.topics) {
      searchIndex.push({ title: t.title, kind: s.title, icon: s.icon, href: `#/learn/${s.id}`, text: t.summary });
    }
  }
  for (const t of TOOLS) searchIndex.push({ title: t.title, kind: 'Calculator', icon: t.icon, href: `#/tools/${t.id}`, text: t.blurb });
  for (const s of SIMS) searchIndex.push({ title: s.title, kind: 'Simulation', icon: s.icon, href: `#/sims/${s.id}`, text: s.blurb });
  searchIndex.push({ title: 'Quiz', kind: 'Practice', icon: '🎓', href: '#/quiz', text: 'Test yourself with random questions.' });
  searchIndex.push({ title: 'Reference', kind: 'Reference', icon: '📋', href: '#/reference', text: 'Equation sheet, constants, material properties.' });

  const searchDialog = document.getElementById('search-dialog');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchBtn = document.getElementById('search-toggle');

  function openSearch() {
    searchDialog.showModal();
    searchInput.value = '';
    renderSearch('');
    searchInput.focus();
  }
  searchBtn.addEventListener('click', openSearch);
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !searchDialog.open && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
    }
  });
  searchDialog.addEventListener('click', (e) => {
    if (e.target === searchDialog) searchDialog.close();
  });
  searchInput.addEventListener('input', () => renderSearch(searchInput.value));
  searchResults.addEventListener('click', (e) => {
    if (e.target.closest('a')) searchDialog.close();
  });

  function renderSearch(query) {
    const q = query.trim().toLowerCase();
    searchResults.innerHTML = '';
    const hits = q
      ? searchIndex.filter((it) => (it.title + ' ' + it.kind + ' ' + it.text).toLowerCase().includes(q))
      : searchIndex.slice(0, 8);
    if (!hits.length) {
      searchResults.appendChild(el('p', { class: 'search-empty' }, 'No matches — try “beam”, “entropy”, or “drag”.'));
      return;
    }
    for (const hit of hits.slice(0, 12)) {
      searchResults.appendChild(el('a', { href: hit.href, class: 'search-hit' }, [
        el('span', { class: 'search-hit-icon', 'aria-hidden': 'true' }, hit.icon),
        el('span', { class: 'search-hit-body' }, [
          el('strong', {}, hit.title),
          el('small', {}, hit.kind),
        ]),
      ]));
    }
  }

  // ---------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------
  document.getElementById('year').textContent = new Date().getFullYear();
  navigate();
})();
