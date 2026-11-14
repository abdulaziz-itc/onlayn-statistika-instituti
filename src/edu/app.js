/* «Onlayn statistika instituti» — standalone learning platform shell (v0.4).
 * One lesson, video first. Left sidebar: «Dars»; bottom-left: «Sozlamalar». Mobile: top bar + bottom bar.
 * Reuses the shared core (AppProvider, settings blocks, language / theme / low-vision controls) and the lesson
 * module (MS.ui.LessonPage, solo mode). No login, no cabinet, no portal pages.
 * Scope: .ms-root.v-edu · class prefix e- · every UI string through t().
 */
(function () {
  const MS = window.MS;
  const {
    html, R, useApp, useMedia, Icon, AppProvider, SkipLink, DemoBadge,
    LangSwitcher, ThemeQuick, LowVisionButton,
    LanguageSetting, ThemeSetting, AccentSetting, LiteSetting, LowVisionSettings,
  } = MS.ui;
  const { useState, useEffect } = R;

  /* ---------- strings: [uz-Latn, uz-Cyrl, kaa, ru, en] ---------- */
  MS.i18n.extend({
    'edu.name': ['Onlayn statistika instituti', 'Онлайн статистика институти', 'Onlayn statistika institutı', 'Онлайн-институт статистики', 'Online Institute of Statistics'],
    'edu.tag': ['Oʻquv platformasi', 'Ўқув платформаси', 'Oqıw platforması', 'Учебная платформа', 'Learning platform'],
    'edu.logoAlt': ['Onlayn statistika instituti logotipi (vaqtinchalik)', 'Онлайн статистика институти логотипи (вақтинчалик)', 'Onlayn statistika institutı logotipi (waqıtsha)', 'Логотип Онлайн-института статистики (временный)', 'Online Institute of Statistics logo (placeholder)'],
    'edu.nav.lesson': ['Dars', 'Дарс', 'Sabaq', 'Урок', 'Lesson'],
    'edu.demoNote': [
      'Dars matni va test savollari namuna, mutaxassis tekshirmagan.',
      'Дарс матни ва тест саволлари намуна, мутахассис текширмаган.',
      'Sabaq teksti hám test sorawları úlgi, qánige tekserip shıqpaǵan.',
      'Текст урока и вопросы теста — пример, эксперт их не проверял.',
      'The lesson text and quiz questions are samples and have not been reviewed by an expert.',
    ],
    'edu.settings.sub': ['Til, koʻrinish va maxsus imkoniyatlar', 'Тил, кўриниш ва махсус имкониятлар', 'Til, kórinis hám arnawlı múmkinshilikler', 'Язык, оформление и специальные возможности', 'Language, appearance and accessibility'],
    'edu.foot': [
      '© 2026 Onlayn statistika instituti · Prototip',
      '© 2026 Онлайн статистика институти · Прототип',
      '© 2026 Onlayn statistika institutı · Prototip',
      '© 2026 Онлайн-институт статистики · Прототип',
      '© 2026 Online Institute of Statistics · Prototype',
    ],
  });

  const LESSON_ID = 'statistika-nima';
  const NAV_ITEMS = [{ id: 'lesson', icon: 'video', key: 'edu.nav.lesson', page: 'learn' }];
  const NAV_SET = { id: 'settings', icon: 'settings', key: 'nav.settings', page: 'settings' };

  /* Neutral placeholder mark (no emblem / flag / real logo) */
  function Mark(p) {
    const { t } = useApp();
    const size = p.size || 36;
    return html`<svg className="e-mark" width=${size} height=${size} viewBox="0 0 36 36" role="img" aria-label=${t('edu.logoAlt')}>
      <rect x="1" y="1" width="34" height="34" rx="9" fill="var(--ms-accent)" />
      <path d="M14 11.5v13l11-6.5z" fill="var(--ms-accent-text)" />
    </svg>`;
  }

  function Brand(p) {
    const { t } = useApp();
    return html`<div className=${'e-brand ' + (p.className || '')}>
      <${Mark} size=${p.size || 36} />
      <span className="e-brand__txt"><strong>${t('edu.name')}</strong><small>${t('edu.tag')}</small></span>
    </div>`;
  }

  function Settings() {
    const { t } = useApp();
    return html`<div className="e-page e-settings">
      <header className="e-head">
        <h1 className="e-title" tabIndex="-1" data-page-title>${t('settings.title')}</h1>
        <p className="e-sub">${t('edu.settings.sub')}</p>
      </header>
      <section className="e-card" aria-labelledby="e-set-1">
        <h2 id="e-set-1" className="e-h2"><${Icon} name="globe" size=${20} />${t('settings.appearance')}</h2>
        <${LanguageSetting} />
        <${ThemeSetting} />
        <${AccentSetting} />
      </section>
      <section className="e-card" aria-labelledby="e-set-2">
        <h2 id="e-set-2" className="e-h2"><${Icon} name="eye" size=${20} />${t('settings.access')}</h2>
        <${LowVisionSettings} />
      </section>
      <section className="e-card" aria-labelledby="e-set-3">
        <h2 id="e-set-3" className="e-h2"><${Icon} name="feather" size=${20} />${t('settings.performance')}</h2>
        <${LiteSetting} />
      </section>
    </div>`;
  }

  function Shell() {
    const { t, route, go, s, lite } = useApp();
    const big = s.lv.enabled && s.lv.fontScale > 1;
    // enlarged text needs the room the sidebar takes, so the compact layout starts earlier
    const compact = useMedia(big ? '(max-width: 1799px)' : '(max-width: 899px)');
    const tiny = useMedia('(max-width: 419px)');
    const page = route.page === 'settings' ? 'settings' : 'learn';
    const item = (it, cls) => html`<li key=${it.id}><button type="button" className=${cls} aria-current=${page === it.page ? 'page' : undefined}
      onClick=${() => go(it.page, it.page === 'learn' ? { id: LESSON_ID } : null)}><${Icon} name=${it.icon} size=${cls === 'e-bbar__btn' ? 22 : 20} /><span>${t(it.key)}</span></button></li>`;

    return html`<${R.Fragment}>
      <${SkipLink} />
      <div className="e-shell" data-layout=${compact ? 'compact' : 'wide'}>
        ${!compact &&
        html`<div className="e-side">
          <${Brand} />
          <nav className="e-nav" aria-label=${t('nav.label')}>
            <ul role="list">${NAV_ITEMS.map((it) => item(it, 'e-nav__item'))}</ul>
            <ul role="list" className="e-nav__foot">${item(NAV_SET, 'e-nav__item')}</ul>
          </nav>
        </div>`}
        <div className="e-work">
          <div className="ms-demo-banner e-demo" role="note"><strong>${t('demo.label')}</strong><span> ${t('edu.demoNote')}</span></div>
          <header className="e-top">
            ${compact && html`<${Brand} className="e-top__brand" size=${32} />`}
            <div className="e-top__tools">
              ${/* compact: the DEMO banner sits right above, so the badge is not repeated; on very narrow screens the lite badge keeps its icon only */ null}
              ${!compact && html`<${DemoBadge} />`}
              ${lite && html`<span className="ms-litebadge e-lite" title=${t('lite.desc')}><${Icon} name="feather" size=${14} /><span className=${tiny ? 'ms-sr' : undefined}>${t('lite.active')}</span></span>`}
              <${LangSwitcher} buttonClass="ms-btn e-tbtn" align="end" />
              <${ThemeQuick} buttonClass="ms-btn e-tbtn" align="end" />
              <${LowVisionButton} buttonClass="e-tbtn" iconOnly=${tiny || (compact && big)} />
            </div>
          </header>
          <main id="ms-main" tabIndex="-1" className="e-main">
            ${page === 'settings' ? html`<${Settings} />` : html`<${MS.ui.LessonPage} key=${LESSON_ID} id=${LESSON_ID} solo=${true} />`}
          </main>
          <footer className="e-foot"><span>${t('edu.foot')}</span><span>${t('edu.demoNote')}</span></footer>
        </div>
      </div>
      ${compact &&
      html`<nav className="e-bbar" aria-label=${t('nav.bottom')}>
        <ul role="list">${NAV_ITEMS.concat([NAV_SET]).map((it) => item(it, 'e-bbar__btn'))}</ul>
      </nav>`}
    <//>`;
  }

  /* #settings / #lesson deep links (handy for sharing and for audits) */
  function parseHash() {
    const h = (location.hash || '').slice(1);
    if (h === 'settings') return { page: 'settings' };
    if (h === 'lesson') return { page: 'learn', id: LESSON_ID };
    return null;
  }

  function App() {
    const [req, setReq] = useState(() => {
      const r = parseHash();
      return r ? Object.assign({ nonce: 1 }, r) : null;
    });
    useEffect(() => {
      const fn = () => {
        const r = parseHash();
        if (r) setReq(Object.assign({ nonce: Date.now() }, r));
      };
      window.addEventListener('hashchange', fn);
      return () => window.removeEventListener('hashchange', fn);
    }, []);
    return html`<${AppProvider} variant="edu" appName="edu.name" initialRoute=${{ page: 'learn', id: LESSON_ID }} routeRequest=${req}><${Shell} /><//>`;
  }

  function boot() {
    window.ReactDOM.createRoot(document.getElementById('app')).render(html`<${App} />`);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
