/* my.stat — shared core: settings, i18n hooks, formatting, auth mock, exports, charts, shared UI.
 * Variants import everything from window.MS.ui / MS.fmt and own only layout + visual style.
 * Rule: no hardcoded UI text — every string comes from MS.i18n via t().
 */
(function () {
  const MS = window.MS;
  const R = window.React;
  const { useState, useEffect, useMemo, useRef, useCallback, useContext, createContext } = R;
  const html = window.htm.bind(R.createElement);
  MS.html = html;

  /* ===================== storage (never throws) ===================== */
  const store = {
    get(k, d) {
      try {
        const v = window.localStorage.getItem(k);
        return v ? JSON.parse(v) : d;
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        window.localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {}
    },
    sget(k, d) {
      try {
        const v = window.sessionStorage.getItem(k);
        return v ? JSON.parse(v) : d;
      } catch (e) {
        return d;
      }
    },
    sset(k, v) {
      try {
        window.sessionStorage.setItem(k, JSON.stringify(v));
      } catch (e) {}
    },
  };
  MS.store = store;

  /* ===================== settings ===================== */
  const DEFAULTS = {
    locale: 'uz-Latn',
    theme: 'system', // system | light | dark | hc
    accent: 'blue', // blue | green
    numberFormat: 'space', // space | comma | dot
    dateFormat: 'dmy', // dmy | iso | long
    lite: 'auto', // auto | on | off
    density: 'comfortable', // comfortable | compact
    lv: { enabled: false, fontScale: 1, scheme: 'normal', images: 'show', spacing: 'normal', simple: false },
  };
  function loadSettings() {
    const s = store.get('mystat.settings', {});
    return Object.assign({}, DEFAULTS, s, { lv: Object.assign({}, DEFAULTS.lv, s.lv || {}) });
  }

  /* Adaptive loading: slow network / Save-Data / low memory / reduced motion */
  function detectLite() {
    try {
      const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (c && c.saveData) return true;
      if (c && /(^|-)2g|3g/.test(c.effectiveType || '')) return true;
      if (navigator.deviceMemory && navigator.deviceMemory <= 2) return true;
    } catch (e) {}
    return false;
  }

  /* ===================== formatting ===================== */
  const SEP = { space: [' ', ','], comma: [',', '.'], dot: ['.', ','] };
  const MINUS = '−';
  function fmtNumber(n, dec, style) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    const [g, d] = SEP[style] || SEP.space;
    const neg = n < 0;
    const fixed = Math.abs(n).toFixed(dec == null ? 0 : dec);
    let [int, frac] = fixed.split('.');
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, g);
    return (neg ? MINUS : '') + int + (frac ? d + frac : '');
  }
  function pad(n) {
    return String(n).padStart(2, '0');
  }
  function fmtDate(iso, style, locale) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-').map(Number);
    if (style === 'iso') return y + '-' + pad(m) + '-' + pad(d);
    if (style === 'long') {
      return d + ' ' + MS.MONTHS_GEN[locale][m - 1] + ' ' + y; // "2 noyabr 2026", "2 ноября 2026"
    }
    return pad(d) + '.' + pad(m) + '.' + y;
  }
  const ROMAN = ['I', 'II', 'III', 'IV'];
  function fmtPeriod(p, locale, short) {
    if (!p) return '—';
    const t = (k, prm) => MS.i18n.translate(locale, k, prm);
    let m;
    if ((m = /^(\d{4})-Q(\d)$/.exec(p))) return short ? m[1] + ' ' + ROMAN[+m[2] - 1] : t('period.quarter', { y: m[1], q: m[2] });
    if ((m = /^(\d{4})-(\d\d)$/.exec(p))) {
      if (short) return MS.MONTHS_SHORT[locale][+m[2] - 1] + ' ' + m[1].slice(2);
      return t('period.month', { y: m[1], m: MS.MONTHS[locale][+m[2] - 1] });
    }
    return short ? p : t('period.year', { y: p });
  }
  function lt(obj, locale) {
    if (!obj) return '';
    return obj[locale] || obj['uz-Latn'] || '';
  }
  function fmtValue(v, ind, s, opts) {
    const num = fmtNumber(v, ind.decimals, s.numberFormat);
    if (opts && opts.noUnit) return num;
    const u = lt(ind.unit, s.locale);
    return u === '%' ? num + '%' : num + ' ' + u;
  }
  /* Change vs previous observation: pp for % indicators, relative % for levels. */
  function computeChange(ind, cur, prev, s) {
    const t = (k, p) => MS.i18n.translate(s.locale, k, p);
    if (cur == null || prev == null) return null;
    let delta, unitTxt, dec;
    if (ind.unitKind === 'pct') {
      delta = cur - prev;
      unitTxt = ' ' + t('change.pp');
      dec = 1;
    } else {
      delta = prev === 0 ? 0 : ((cur - prev) / Math.abs(prev)) * 100;
      unitTxt = '%';
      dec = 1;
    }
    const r = Math.round(delta * 10) / 10;
    const dir = r > 0 ? 'up' : r < 0 ? 'down' : 'flat';
    const tone = dir === 'flat' || ind.good === 'neutral' ? 'neutral' : dir === ind.good ? 'good' : 'bad';
    const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '■';
    const sign = r > 0 ? '+' : r < 0 ? MINUS : '';
    const valueTxt = sign + fmtNumber(Math.abs(r), dec, s.numberFormat) + unitTxt;
    const word = t('change.' + dir);
    return { dir, tone, arrow, delta: r, valueTxt, word, text: arrow + ' ' + valueTxt + ' · ' + word, aria: word + ' ' + valueTxt + ', ' + t('change.vsPrev') };
  }
  MS.fmt = { number: fmtNumber, date: fmtDate, period: fmtPeriod, lt, value: fmtValue, change: computeChange };

  /* ===================== contexts ===================== */
  const AppCtx = createContext(null);
  MS.AppCtx = AppCtx;
  function useApp() {
    return useContext(AppCtx);
  }

  /* toasts + announcer */
  let toastId = 0;

  /* effective theme */
  function useSystemDark() {
    const q = '(prefers-color-scheme: dark)';
    const [dark, setDark] = useState(() => window.matchMedia && window.matchMedia(q).matches);
    useEffect(() => {
      if (!window.matchMedia) return;
      const m = window.matchMedia(q);
      const fn = () => setDark(m.matches);
      m.addEventListener ? m.addEventListener('change', fn) : m.addListener(fn);
      return () => (m.removeEventListener ? m.removeEventListener('change', fn) : m.removeListener(fn));
    }, []);
    return dark;
  }
  function useMedia(query) {
    const [ok, setOk] = useState(() => window.matchMedia && window.matchMedia(query).matches);
    useEffect(() => {
      const m = window.matchMedia(query);
      const fn = () => setOk(m.matches);
      m.addEventListener ? m.addEventListener('change', fn) : m.addListener(fn);
      fn();
      return () => (m.removeEventListener ? m.removeEventListener('change', fn) : m.removeListener(fn));
    }, [query]);
    return ok;
  }

  /* ===================== AppProvider (one per variant) ===================== */
  function AppProvider(props) {
    const variant = props.variant;
    const [s, setS] = useState(loadSettings);
    const [route, setRoute] = useState(() => store.sget('mystat.route.' + variant, null) || props.initialRoute || { page: 'home' });
    const [user, setUser] = useState(() => store.get('mystat.auth', null));
    const [saved, setSaved] = useState(() => store.get('mystat.saved', []));
    const [history, setHistory] = useState(() => store.get('mystat.history', []));
    const [recent, setRecent] = useState(() => store.get('mystat.recent', []));
    const [toasts, setToasts] = useState([]);
    const [announce, setAnnounce] = useState('');
    const [loginOpen, setLoginOpen] = useState(false);
    const sysDark = useSystemDark();
    const sysMoreContrast = useMedia('(prefers-contrast: more)');
    const reducedMotion = useMedia('(prefers-reduced-motion: reduce)');
    const autoLite = useMemo(detectLite, []);
    const rootRef = useRef(null);

    const t = useCallback((k, p) => MS.i18n.translate(s.locale, k, p), [s.locale]);
    const L = useCallback((o) => lt(o, s.locale), [s.locale]);

    const set = useCallback((patch) => {
      setS((prev) => {
        const next = Object.assign({}, prev, patch);
        store.set('mystat.settings', next);
        return next;
      });
    }, []);
    const setLV = useCallback((patch) => {
      setS((prev) => {
        const next = Object.assign({}, prev, { lv: Object.assign({}, prev.lv, patch) });
        store.set('mystat.settings', next);
        return next;
      });
    }, []);

    const toast = useCallback((msg, tone) => {
      const id = ++toastId;
      setToasts((x) => x.concat([{ id, msg, tone: tone || 'info' }]));
      setAnnounce(msg);
      setTimeout(() => setToasts((x) => x.filter((y) => y.id !== id)), 4200);
    }, []);

    const go = useCallback(
      (page, params) => {
        const r = Object.assign({ page }, params || {});
        setRoute(r);
        store.sset('mystat.route.' + variant, r);
        try {
          window.scrollTo(0, 0);
        } catch (e) {}
        // move focus to the new page heading for screen readers
        setTimeout(() => {
          const h = document.querySelector('.ms-root [data-page-title]');
          if (h) h.focus({ preventScroll: true });
        }, 60);
        if (props.onRoute) props.onRoute(r);
      },
      [variant],
    );

    // external route requests (gallery screen switcher, share links)
    useEffect(() => {
      if (props.routeRequest) go(props.routeRequest.page, props.routeRequest);
    }, [props.routeRequest && props.routeRequest.nonce]);

    const login = useCallback(
      (role) =>
        new Promise((res) =>
          setTimeout(() => {
            const u = {
              id: 'DEMO-000001',
              role,
              name: 'Test Foydalanuvchi',
              email: 'test.user@example.uz',
              phone: '+998 90 000 00 00',
            };
            setUser(u);
            store.set('mystat.auth', u);
            res(u);
          }, 450),
        ),
      [],
    );
    const logout = useCallback(() => {
      setUser(null);
      store.set('mystat.auth', null);
    }, []);
    const updateProfile = useCallback((patch) => {
      setUser((u) => {
        const n = Object.assign({}, u, patch);
        store.set('mystat.auth', n);
        return n;
      });
    }, []);
    const toggleSaved = useCallback((id) => {
      setSaved((list) => {
        const n = list.indexOf(id) >= 0 ? list.filter((x) => x !== id) : [id].concat(list);
        store.set('mystat.saved', n);
        return n;
      });
    }, []);
    const addRecent = useCallback((id) => {
      setRecent((list) => {
        const n = [id].concat(list.filter((x) => x !== id)).slice(0, 8);
        store.set('mystat.recent', n);
        return n;
      });
    }, []);
    const addHistory = useCallback((item) => {
      setHistory((list) => {
        const n = [item].concat(list).slice(0, 20);
        store.set('mystat.history', n);
        return n;
      });
    }, []);

    // effective modes
    let theme = s.theme === 'system' ? (sysMoreContrast ? 'hc' : sysDark ? 'dark' : 'light') : s.theme;
    if (s.lv.enabled && s.lv.scheme === 'hc') theme = 'hc';
    const lite = s.lite === 'on' || (s.lite === 'auto' && autoLite);
    const simple = s.lv.enabled && s.lv.simple;
    const fontScale = s.lv.enabled ? s.lv.fontScale : 1;

    // document-level effects: lang, title, font scale
    const prevLocale = useRef(s.locale);
    useEffect(() => {
      document.documentElement.lang = MS.LOCALE_META[s.locale].htmlLang;
      if (prevLocale.current !== s.locale) {
        setAnnounce(MS.i18n.translate(s.locale, 'lang.changed', { name: MS.LOCALE_META[s.locale].native }));
        prevLocale.current = s.locale;
      }
    }, [s.locale]);
    const gray = s.lv.enabled && s.lv.scheme === 'gray';
    useEffect(() => {
      document.documentElement.style.filter = gray ? 'grayscale(1)' : '';
      return () => {
        document.documentElement.style.filter = '';
      };
    }, [gray]);
    useEffect(() => {
      document.documentElement.style.fontSize = fontScale * 100 + '%';
      return () => {
        document.documentElement.style.fontSize = '';
      };
    }, [fontScale]);
    useEffect(() => {
      const pageTitle =
        route.page === 'indicator'
          ? L((MS.data.byId[route.id] || MS.data.byId.cpi).name)
          : route.page === 'settings'
          ? t('nav.settings')
          : route.page === 'soon'
          ? t(route.navKey || 'common.comingSoon.title')
          : route.page === 'learn'
          ? route.id && MS.learn && MS.learn.byId[route.id]
            ? L(MS.learn.byId[route.id].title)
            : route.course && MS.learn && MS.learn.courseById[route.course]
            ? L(MS.learn.courseById[route.course].title)
            : t('nav.learn')
          : route.page === 'services'
          ? route.id && MS.services && MS.services.byId[route.id]
            ? L(MS.services.byId[route.id].title)
            : t('nav.services')
          : t('nav.home');
      document.title = pageTitle + ' · ' + (props.appName ? t(props.appName) : 'my.stat') + ' · ' + t('demo.short');
    }, [route, s.locale]);

    const fmt = useMemo(
      () => ({
        num: (n, dec) => fmtNumber(n, dec, s.numberFormat),
        date: (iso) => fmtDate(iso, s.dateFormat, s.locale),
        period: (p, short) => fmtPeriod(p, s.locale, short),
        value: (v, ind, o) => fmtValue(v, ind, s, o),
        change: (ind, cur, prev) => computeChange(ind, cur, prev, s),
      }),
      [s.numberFormat, s.dateFormat, s.locale],
    );

    const ctx = {
      variant,
      s,
      set,
      setLV,
      t,
      L,
      locale: s.locale,
      fmt,
      route,
      go,
      user,
      login,
      logout,
      updateProfile,
      saved,
      toggleSaved,
      history,
      addHistory,
      recent,
      addRecent,
      toast,
      announce: setAnnounce,
      theme,
      lite,
      autoLite,
      simple,
      reducedMotion: reducedMotion || lite,
      openLogin: () => setLoginOpen(true),
    };

    return html`<${AppCtx.Provider} value=${ctx}>
      <div
        ref=${rootRef}
        className=${'ms-root v-' + variant}
        data-theme=${theme}
        data-accent=${s.accent}
        data-density=${s.density}
        data-lite=${lite ? 'on' : 'off'}
        data-simple=${simple ? 'on' : 'off'}
        data-lv=${s.lv.enabled ? 'on' : 'off'}
        data-gray=${s.lv.enabled && s.lv.scheme === 'gray' ? 'on' : 'off'}
        data-images=${s.lv.enabled && s.lv.images === 'hide' ? 'hide' : 'show'}
        data-spacing=${s.lv.enabled && s.lv.spacing === 'wide' ? 'wide' : 'normal'}
        data-motion=${reducedMotion || lite ? 'reduce' : 'ok'}
        lang=${MS.LOCALE_META[s.locale].htmlLang}
      >
        ${props.children}
        <${LoginDialog} open=${loginOpen} onClose=${() => setLoginOpen(false)} />
        <div className="ms-toasts" aria-hidden="true">
          ${toasts.map((x) => html`<div key=${x.id} className=${'ms-toast ms-toast--' + x.tone}>${x.msg}</div>`)}
        </div>
        <div className="ms-sr" role="status" aria-live="polite" aria-atomic="true">${announce}</div>
      </div>
    <//>`;
  }

  /* ===================== async hook ===================== */
  function useAsync(fn, deps) {
    const [st, setSt] = useState({ status: 'loading', data: null, error: null });
    const [nonce, setNonce] = useState(0);
    useEffect(() => {
      let alive = true;
      setSt((p) => ({ status: 'loading', data: p.data, error: null }));
      Promise.resolve()
        .then(fn)
        .then(
          (data) => alive && setSt({ status: data == null || (Array.isArray(data) && !data.length) ? 'empty' : 'ready', data, error: null }),
          (error) => alive && setSt({ status: 'error', data: null, error }),
        );
      return () => {
        alive = false;
      };
    }, deps.concat([nonce]));
    return Object.assign({}, st, { retry: () => setNonce((n) => n + 1) });
  }

  /* ===================== icons (inline SVG, stroke-based) ===================== */
  const ICONS = {
    home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
    news: 'M4 4h13v16H6a2 2 0 0 1-2-2zM17 8h3v10a2 2 0 0 1-2 2M8 8h5M8 12h5M8 16h3',
    calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
    book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-5M12 8h.01',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    user: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
    globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    contrast: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 2v20',
    eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    download: 'M12 3v12M7 10l5 5 5-5M4 21h16',
    share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
    star: 'm12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
    logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    login: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3',
    building: 'M4 21V3h11v18M15 9h5v12M8 7h3M8 11h3M8 15h3M4 21h17',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
    table: 'M3 4h18v16H3zM3 10h18M3 15h18M9 4v16',
    menu: 'M3 6h18M3 12h18M3 18h18',
    close: 'M18 6 6 18M6 6l12 12',
    chevronDown: 'm6 9 6 6 6-6',
    chevronRight: 'm9 6 6 6-6 6',
    chevronLeft: 'm15 6-6 6 6 6',
    arrowUp: 'M12 19V5M5 12l7-7 7 7',
    arrowDown: 'M12 5v14M19 12l-7 7-7-7',
    check: 'M20 6 9 17l-5-5',
    message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    lightbulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
    layers: 'm12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
    feather: 'M20 4a7 7 0 0 0-10 0L4 10v10h10l6-6a7 7 0 0 0 0-10zM16 8 2 22M17 15H9',
  };
  function Icon(p) {
    const d = ICONS[p.name] || ICONS.info;
    const size = p.size || 20;
    return html`<svg className=${'ms-icon ' + (p.className || '')} width=${size} height=${size} viewBox="0 0 24 24" fill=${p.fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth=${p.stroke || 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d=${d} /></svg>`;
  }

  /* ===================== navigation registry ===================== */
  // Registry-based sidebar: future modules register here instead of hardcoding menus.
  const NAV = [
    { id: 'home', icon: 'home', key: 'nav.home', route: { page: 'home' }, bottom: true },
    { id: 'indicators', icon: 'chart', key: 'nav.indicators', route: { page: 'indicator', id: 'cpi' }, bottom: true },
    { id: 'services', icon: 'grid', key: 'nav.services', route: { page: 'services' }, bottom: true },
    { id: 'regions', icon: 'map', key: 'nav.regions', route: { page: 'services', id: 'my-region' }, bottom: true },
    { id: 'releases', icon: 'news', key: 'nav.releases', route: { page: 'soon', navKey: 'nav.releases' } },
    { id: 'calendar', icon: 'calendar', key: 'nav.calendar', route: { page: 'soon', navKey: 'nav.calendar' } },
    { id: 'publications', icon: 'book', key: 'nav.publications', route: { page: 'soon', navKey: 'nav.publications' } },
    { id: 'about', icon: 'info', key: 'nav.about', route: { page: 'soon', navKey: 'nav.about' } },
  ];
  const NAV_SETTINGS = { id: 'settings', icon: 'settings', key: 'nav.settings', route: { page: 'settings' } };
  MS.NAV = NAV;
  MS.NAV_SETTINGS = NAV_SETTINGS;
  MS.registerNav = (item) => NAV.push(item);
  function isActive(item, route) {
    if (item.route.page === 'soon') return route.page === 'soon' && route.navKey === item.route.navKey;
    if (item.route.page === 'services') {
      if (route.page !== 'services') return false;
      if (item.route.id) return route.id === item.route.id;
      return route.id !== 'my-region';
    }
    return item.route.page === route.page;
  }

  /* ===================== small shared components ===================== */
  function SkipLink() {
    const { t } = useApp();
    return html`<a className="ms-skip" href="#ms-main" onClick=${(e) => {
      e.preventDefault();
      const m = document.getElementById('ms-main');
      if (m) m.focus();
    }}>${t('skip')}</a>`;
  }
  function DemoBadge(p) {
    const { t } = useApp();
    return html`<span className=${'ms-demo-badge ' + (p.className || '')} title=${t('demo.label')}>${p.long ? t('demo.label') : t('demo.short')}</span>`;
  }
  function DemoBanner(p) {
    const { t } = useApp();
    return html`<div className=${'ms-demo-banner ' + (p.className || '')} role="note"><strong>${t('demo.label')}</strong><span> ${t('demo.notOfficial')}</span></div>`;
  }
  function LogoMark(p) {
    // Neutral placeholder logo (no emblem / flag / real logo — CLAUDE.md §9)
    const { t } = useApp();
    const size = p.size || 32;
    return html`<svg className="ms-logo" width=${size} height=${size} viewBox="0 0 32 32" role="img" aria-label=${t('logo.alt')}>
      <rect x="1" y="1" width="30" height="30" rx=${p.round ? 15 : 7} fill="var(--ms-accent)" />
      <rect x="8" y="17" width="4" height="8" rx="1" fill="var(--ms-accent-text)" />
      <rect x="14" y="11" width="4" height="14" rx="1" fill="var(--ms-accent-text)" />
      <rect x="20" y="7" width="4" height="18" rx="1" fill="var(--ms-accent-text)" />
    </svg>`;
  }

  /* Popover (menu button) — closes on outside click / Esc, returns focus */
  function Popover(p) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const btn = useRef(null);
    useEffect(() => {
      if (!open) return;
      const onDoc = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      const onKey = (e) => {
        if (e.key === 'Escape') {
          setOpen(false);
          btn.current && btn.current.focus();
        }
      };
      document.addEventListener('mousedown', onDoc);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onDoc);
        document.removeEventListener('keydown', onKey);
      };
    }, [open]);
    const close = () => {
      setOpen(false);
      btn.current && btn.current.focus();
    };
    return html`<div className=${'ms-pop ' + (p.className || '')} ref=${ref}>
      <button ref=${btn} type="button" className=${'ms-pop__btn ' + (p.buttonClass || '')} aria-expanded=${open} aria-haspopup="true" aria-label=${p.label} title=${p.label} onClick=${() => setOpen(!open)}>${p.button}</button>
      ${open && html`<div className=${'ms-pop__panel ms-pop__panel--' + (p.align || 'end') + (p.up ? ' ms-pop__panel--up' : '')} role="group" aria-label=${p.label}>${typeof p.children === 'function' ? p.children(close) : p.children}</div>`}
    </div>`;
  }

  function LangSwitcher(p) {
    const { s, set, t } = useApp();
    const meta = MS.LOCALE_META[s.locale];
    return html`<${Popover}
      className=${'ms-lang ' + (p.className || '')}
      buttonClass=${p.buttonClass || 'ms-btn ms-btn--ghost'}
      label=${t('lang.choose') + ' — ' + meta.native}
      align=${p.align}
      up=${p.up}
      button=${html`<${Icon} name="globe" size=${18} /><span className="ms-lang__code">${meta.code}</span>${p.showName && html`<span className="ms-lang__name">${meta.native}</span>`}`}
    >
      ${(close) => html`<ul className="ms-menu" role="list">
        ${MS.LOCALES.map(
          (l) => html`<li key=${l}><button type="button" className="ms-menu__item" aria-current=${l === s.locale ? 'true' : undefined} lang=${MS.LOCALE_META[l].htmlLang} onClick=${() => {
            set({ locale: l });
            close();
          }}>
            <span className="ms-menu__code">${MS.LOCALE_META[l].code}</span><span>${MS.LOCALE_META[l].native}</span>${l === s.locale && html`<${Icon} name="check" size=${16} />`}
          </button></li>`,
        )}
      </ul>`}
    <//>`;
  }

  const THEMES = [
    { id: 'system', icon: 'layers', key: 'theme.system' },
    { id: 'light', icon: 'sun', key: 'theme.light' },
    { id: 'dark', icon: 'moon', key: 'theme.dark' },
    { id: 'hc', icon: 'contrast', key: 'theme.hc' },
  ];
  function ThemeQuick(p) {
    const { s, set, t, theme } = useApp();
    const cur = THEMES.find((x) => x.id === (s.theme === 'system' ? 'system' : theme)) || THEMES[0];
    return html`<${Popover}
      className=${'ms-themeq ' + (p.className || '')}
      buttonClass=${p.buttonClass || 'ms-btn ms-btn--ghost'}
      label=${t('theme.toggle') + ' — ' + t(cur.key)}
      align=${p.align}
      up=${p.up}
      button=${html`<${Icon} name=${cur.icon} size=${18} />${p.showName && html`<span>${t(cur.key)}</span>`}`}
    >
      ${(close) => html`<div>
        <ul className="ms-menu" role="list">
          ${THEMES.map(
            (x) => html`<li key=${x.id}><button type="button" className="ms-menu__item" aria-current=${s.theme === x.id ? 'true' : undefined} onClick=${() => {
              set({ theme: x.id });
              close();
            }}><${Icon} name=${x.icon} size=${16} /><span>${t(x.key)}</span>${s.theme === x.id && html`<${Icon} name="check" size=${16} />`}</button></li>`,
          )}
        </ul>
        <div className="ms-menu__sep" role="separator"></div>
        <div className="ms-menu__label">${t('accent.label')}</div>
        <div className="ms-swatches">
          ${['blue', 'green'].map(
            (a) => html`<button key=${a} type="button" className=${'ms-swatch ms-swatch--' + a} aria-pressed=${s.accent === a} onClick=${() => set({ accent: a })}><span className="ms-swatch__dot" aria-hidden="true"></span>${t('accent.' + a)}</button>`,
          )}
        </div>
      </div>`}
    <//>`;
  }

  /* Modal dialog with focus trap */
  function Modal(p) {
    const { t } = useApp();
    const ref = useRef(null);
    const lastFocus = useRef(null);
    useEffect(() => {
      if (!p.open) return;
      lastFocus.current = document.activeElement;
      const el = ref.current;
      const f = () => el && el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      setTimeout(() => {
        const list = f();
        const first = el && (el.querySelector('[data-autofocus]') || (list && list[0]));
        first && first.focus();
      }, 30);
      const onKey = (e) => {
        if (e.key === 'Escape') p.onClose();
        if (e.key === 'Tab') {
          const list = Array.from(f() || []).filter((x) => !x.disabled);
          if (!list.length) return;
          const a = list[0], b = list[list.length - 1];
          if (e.shiftKey && document.activeElement === a) {
            e.preventDefault();
            b.focus();
          } else if (!e.shiftKey && document.activeElement === b) {
            e.preventDefault();
            a.focus();
          }
        }
      };
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('keydown', onKey);
        lastFocus.current && lastFocus.current.focus && lastFocus.current.focus();
      };
    }, [p.open]);
    if (!p.open) return null;
    return html`<div className="ms-modal" onMouseDown=${(e) => e.target === e.currentTarget && p.onClose()}>
      <div className=${'ms-modal__box ' + (p.className || '')} role="dialog" aria-modal="true" aria-labelledby="ms-modal-title" ref=${ref}>
        <div className="ms-modal__head">
          <h2 id="ms-modal-title" className="ms-modal__title">${p.title}</h2>
          <button type="button" className="ms-btn ms-btn--icon" aria-label=${t('common.close')} onClick=${p.onClose}><${Icon} name="close" /></button>
        </div>
        <div className="ms-modal__body">${p.children}</div>
      </div>
    </div>`;
  }

  function LoginDialog(p) {
    const { t, login, toast, go } = useApp();
    const [role, setRole] = useState('citizen');
    const [busy, setBusy] = useState(false);
    const roles = [
      { id: 'citizen', icon: 'user' },
      { id: 'org', icon: 'building' },
      { id: 'staff', icon: 'shield' },
    ];
    return html`<${Modal} open=${p.open} onClose=${p.onClose} title=${t('auth.login')} className="ms-login">
      <p className="ms-muted">${t('auth.pickRoleDesc')}</p>
      <fieldset className="ms-roles">
        <legend className="ms-roles__legend">${t('auth.pickRole')}</legend>
        ${roles.map(
          (r) => html`<label key=${r.id} className=${'ms-role' + (role === r.id ? ' is-on' : '')}>
            <input type="radio" name="ms-role" value=${r.id} checked=${role === r.id} onChange=${() => setRole(r.id)} data-autofocus=${role === r.id ? true : undefined} />
            <${Icon} name=${r.icon} size=${22} />
            <span className="ms-role__text"><strong>${t('role.' + r.id)}</strong><small>${t('role.' + r.id + '.desc')}</small></span>
          </label>`,
        )}
      </fieldset>
      <div className="ms-modal__actions">
        <button type="button" className="ms-btn ms-btn--ghost" onClick=${p.onClose}>${t('common.cancel')}</button>
        <button type="button" className="ms-btn ms-btn--primary" disabled=${busy} aria-busy=${busy} onClick=${async () => {
          setBusy(true);
          const u = await login(role);
          setBusy(false);
          p.onClose();
          toast(t('auth.loggedAs', { name: u.name }), 'good');
          go('settings', { section: 'cabinet' });
        }}>${busy ? t('auth.signingIn') : t('auth.continue')}</button>
      </div>
    <//>`;
  }

  /* User / login entry for the sidebar bottom (next to Settings) */
  function UserChip(p) {
    const { user, t, openLogin, go } = useApp();
    if (!user)
      return html`<button type="button" className=${'ms-btn ms-userchip ms-userchip--guest ' + (p.className || '')} onClick=${openLogin}><${Icon} name="login" /><span className="ms-userchip__label">${t('auth.loginShort')}</span></button>`;
    const initials = user.name
      .split(' ')
      .map((x) => x[0])
      .join('')
      .slice(0, 2);
    return html`<button type="button" className=${'ms-btn ms-userchip ' + (p.className || '')} onClick=${() => go('settings', { section: 'cabinet' })} aria-label=${t('nav.cabinet') + ': ' + user.name + ', ' + t('role.' + user.role)}>
      <span className="ms-avatar" aria-hidden="true">${initials}</span>
      <span className="ms-userchip__label"><strong>${user.name}</strong><small>${t('role.' + user.role)}</small></span>
    </button>`;
  }

  /* Toggle button for low-vision panel (eye icon + text) */
  function LowVisionButton(p) {
    const { t, s } = useApp();
    const [open, setOpen] = useState(false);
    return html`<${R.Fragment}>
      <button type="button" className=${'ms-btn ms-lvbtn ' + (p.buttonClass || 'ms-btn--ghost')} aria-pressed=${s.lv.enabled} aria-label=${p.iconOnly ? t('lv.button') : undefined} title=${p.iconOnly ? t('lv.button') : undefined} onClick=${() => setOpen(true)}>
        <${Icon} name="eye" size=${18} />${!p.iconOnly && html`<span className="ms-lvbtn__label">${t('lv.button')}</span>`}
      </button>
      <${Modal} open=${open} onClose=${() => setOpen(false)} title=${t('lv.title')} className="ms-lvmodal"><${LowVisionSettings} /><//>
    <//>`;
  }

  /* Segmented radio control used by all settings */
  function Segmented(p) {
    const name = 'ms-seg-' + p.id;
    return html`<fieldset className=${'ms-seg ' + (p.className || '')}>
      <legend className="ms-seg__legend">${p.label}</legend>
      ${p.desc && html`<p className="ms-seg__desc">${p.desc}</p>`}
      <div className="ms-seg__opts">
        ${p.options.map(
          (o) => html`<label key=${o.value} className=${'ms-seg__opt' + (p.value === o.value ? ' is-on' : '')} lang=${o.lang}>
            <input type="radio" name=${name} value=${o.value} checked=${p.value === o.value} disabled=${p.disabled} onChange=${() => p.onChange(o.value)} />
            <span>${o.label}</span>
          </label>`,
        )}
      </div>
    </fieldset>`;
  }
  function Switch(p) {
    return html`<label className=${'ms-switch' + (p.disabled ? ' is-disabled' : '')}>
      <input type="checkbox" role="switch" checked=${!!p.checked} disabled=${p.disabled} onChange=${(e) => p.onChange(e.target.checked)} />
      <span className="ms-switch__track" aria-hidden="true"><span className="ms-switch__thumb"></span></span>
      <span className="ms-switch__text"><span className="ms-switch__label">${p.label}</span>${p.desc && html`<small>${p.desc}</small>`}</span>
    </label>`;
  }

  /* ---------- settings building blocks ---------- */
  function LanguageSetting() {
    const { s, set, t } = useApp();
    return html`<${Segmented} id="lang" label=${t('lang.label')} value=${s.locale} onChange=${(v) => set({ locale: v })} options=${MS.LOCALES.map((l) => ({ value: l, label: MS.LOCALE_META[l].native, lang: MS.LOCALE_META[l].htmlLang }))} />`;
  }
  function ThemeSetting() {
    const { s, set, t } = useApp();
    return html`<${Segmented} id="theme" label=${t('theme.label')} value=${s.theme} onChange=${(v) => set({ theme: v })} options=${THEMES.map((x) => ({ value: x.id, label: t(x.key) }))} />`;
  }
  function AccentSetting() {
    const { s, set, t } = useApp();
    return html`<${Segmented} id="accent" className="ms-seg--accent" label=${t('accent.label')} value=${s.accent} onChange=${(v) => set({ accent: v })} options=${['blue', 'green'].map((a) => ({ value: a, label: t('accent.' + a) }))} />`;
  }
  function NumberFormatSetting() {
    const { s, set, t } = useApp();
    return html`<${Segmented} id="numfmt" label=${t('fmt.number')} value=${s.numberFormat} onChange=${(v) => set({ numberFormat: v })} options=${['space', 'comma', 'dot'].map((x) => ({ value: x, label: fmtNumber(1234567.8, 1, x) }))} />`;
  }
  function DateFormatSetting() {
    const { s, set, t } = useApp();
    return html`<${Segmented} id="datefmt" label=${t('fmt.date')} value=${s.dateFormat} onChange=${(v) => set({ dateFormat: v })} options=${['dmy', 'iso', 'long'].map((x) => ({ value: x, label: fmtDate('2026-11-02', x, s.locale) }))} />`;
  }
  function LiteSetting() {
    const { s, set, t, autoLite } = useApp();
    return html`<${Segmented} id="lite" label=${t('lite.label')} desc=${t('lite.desc') + (autoLite ? ' · ' + t('lite.autoReason') : '')} value=${s.lite} onChange=${(v) => set({ lite: v })} options=${['auto', 'on', 'off'].map((x) => ({ value: x, label: t('lite.' + x) }))} />`;
  }
  function DensitySetting() {
    const { s, set, t } = useApp();
    return html`<${Segmented} id="density" label=${t('density.label')} value=${s.density} onChange=${(v) => set({ density: v })} options=${['comfortable', 'compact'].map((x) => ({ value: x, label: t('density.' + x) }))} />`;
  }
  function LowVisionSettings() {
    const { s, setLV, t, toast } = useApp();
    const lv = s.lv;
    const dis = !lv.enabled;
    return html`<div className="ms-lvset">
      <${Switch} label=${t('lv.enabled')} checked=${lv.enabled} onChange=${(v) => {
        setLV({ enabled: v });
        toast(t(v ? 'lv.on' : 'lv.off'));
      }} />
      <${Segmented} id="lvfs" label=${t('lv.fontSize')} disabled=${dis} value=${lv.fontScale} onChange=${(v) => setLV({ fontScale: v })} options=${[1, 1.5, 2].map((x) => ({ value: x, label: x * 100 + '%' }))} />
      <${Segmented} id="lvsc" label=${t('lv.scheme')} disabled=${dis} value=${lv.scheme} onChange=${(v) => setLV({ scheme: v })} options=${['normal', 'hc', 'gray'].map((x) => ({ value: x, label: t('lv.scheme.' + x) }))} />
      <${Segmented} id="lvim" label=${t('lv.images')} disabled=${dis} value=${lv.images} onChange=${(v) => setLV({ images: v })} options=${['show', 'hide'].map((x) => ({ value: x, label: t('lv.images.' + x) }))} />
      <${Segmented} id="lvsp" label=${t('lv.spacing')} disabled=${dis} value=${lv.spacing} onChange=${(v) => setLV({ spacing: v })} options=${['normal', 'wide'].map((x) => ({ value: x, label: t('lv.spacing.' + x) }))} />
      <${Switch} label=${t('lv.simple')} desc=${t('lv.simple.desc')} disabled=${dis} checked=${lv.simple} onChange=${(v) => setLV({ simple: v })} />
      <button type="button" className="ms-btn ms-btn--ghost" onClick=${() => setLV(Object.assign({}, DEFAULTS.lv))}>${t('lv.reset')}</button>
    </div>`;
  }

  /* ---------- profile form with validation ---------- */
  function ProfileForm() {
    const { user, updateProfile, t, toast } = useApp();
    const [v, setV] = useState(() => ({ name: user.name, email: user.email, phone: user.phone }));
    const [err, setErr] = useState({});
    const [summary, setSummary] = useState('');
    const validate = (x) => {
      const e = {};
      if (!x.name || x.name.trim().replace(/[^\p{L}]/gu, '').length < 3) e.name = 'profile.err.name';
      if (!/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(x.email.trim())) e.email = 'profile.err.email';
      if (!/^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(x.phone.trim())) e.phone = 'profile.err.phone';
      return e;
    };
    const field = (k, type, auto) => html`<div className=${'ms-field' + (err[k] ? ' has-error' : '')}>
      <label htmlFor=${'ms-pf-' + k}>${t('profile.' + k)}</label>
      <input id=${'ms-pf-' + k} type=${type} autoComplete=${auto} value=${v[k]} maxLength="80" aria-invalid=${!!err[k]} aria-describedby=${err[k] ? 'ms-pf-' + k + '-err' : undefined} onInput=${(e) => setV(Object.assign({}, v, { [k]: e.target.value }))} />
      ${err[k] && html`<p id=${'ms-pf-' + k + '-err'} className="ms-field__err">${t(err[k])}</p>`}
    </div>`;
    return html`<form className="ms-form" noValidate onSubmit=${(e) => {
      e.preventDefault();
      const e2 = validate(v);
      setErr(e2);
      const n = Object.keys(e2).length;
      if (n) {
        setSummary(t('profile.err.summary', { n }));
        const first = document.getElementById('ms-pf-' + Object.keys(e2)[0]);
        first && first.focus();
        return;
      }
      setSummary('');
      updateProfile({ name: v.name.trim(), email: v.email.trim(), phone: v.phone.trim() });
      toast(t('profile.saved'), 'good');
    }}>
      <div className="ms-sr" role="alert">${summary}</div>
      ${summary && html`<p className="ms-form__summary">${summary}</p>`}
      ${field('name', 'text', 'name')} ${field('email', 'email', 'email')} ${field('phone', 'tel', 'tel')}
      <div className="ms-field ms-field--ro"><span className="ms-field__k">${t('profile.id')}</span><code>${user.id}</code></div>
      <p className="ms-muted ms-small">${t('profile.fake')}</p>
      <button type="submit" className="ms-btn ms-btn--primary">${t('common.save')}</button>
    </form>`;
  }

  function SavedList() {
    const { saved, toggleSaved, t, L, go, fmt } = useApp();
    if (!saved.length) return html`<p className="ms-empty">${t('cab.savedEmpty')}</p>`;
    return html`<ul className="ms-list" role="list">
      ${saved.map((id) => {
        const ind = MS.data.byId[id];
        if (!ind) return null;
        const s = MS.dataService.getObservationsSync(id);
        const last = s[s.length - 1];
        return html`<li key=${id} className="ms-list__item">
          <button type="button" className="ms-link" onClick=${() => go('indicator', { id })}>${L(ind.name)}</button>
          <span className="ms-num">${fmt.value(last.value, ind)}</span>
          <button type="button" className="ms-btn ms-btn--ghost ms-btn--sm" onClick=${() => toggleSaved(id)}>${t('cab.remove')}</button>
        </li>`;
      })}
    </ul>`;
  }
  function HistoryList() {
    const { history, t, L, fmt } = useApp();
    if (!history.length) return html`<p className="ms-empty">${t('cab.historyEmpty')}</p>`;
    return html`<ul className="ms-list" role="list">
      ${history.map((h, i) => {
        const ind = MS.data.byId[h.indicatorId];
        return html`<li key=${i} className="ms-list__item"><span>${ind ? L(ind.name) : h.indicatorId}</span><span className="ms-tag">${h.format.toUpperCase()}</span><span className="ms-muted ms-num">${fmt.date(h.date)}</span></li>`;
      })}
    </ul>`;
  }
  function NotificationsList() {
    const { t, L, fmt } = useApp();
    const cpi = MS.data.byId.cpi, gdp = MS.data.byId['gdp-growth'];
    const items = [
      { icon: 'bell', text: t('cab.notif.release', { name: L(cpi.name) }), date: cpi.lastUpdated },
      { icon: 'calendar', text: t('cab.notif.next', { name: L(gdp.name), date: fmt.date(gdp.nextRelease) }), date: '2026-10-30' },
      { icon: 'info', text: t('cab.notif.welcome'), date: '2026-11-02' },
    ];
    return html`<ul className="ms-list" role="list">
      ${items.map((x, i) => html`<li key=${i} className="ms-list__item"><${Icon} name=${x.icon} size=${18} /><span>${x.text}</span><span className="ms-muted ms-num">${fmt.date(x.date)}</span></li>`)}
    </ul>`;
  }
  function OrgBlock() {
    const { t } = useApp();
    return html`<div className="ms-orgblock"><dl className="ms-dl">
      <div><dt>${t('cab.org.name')}</dt><dd>${t('cab.org.nameValue')}</dd></div>
      <div><dt>${t('cab.org.tin')}</dt><dd><code>000000000</code></dd></div>
      <div><dt>${t('cab.org.activity')}</dt><dd>${t('cab.org.activityValue')}</dd></div>
    </dl>
    <p className="ms-later"><${Icon} name="clock" size=${16} /> ${t('cab.org.later')}</p></div>`;
  }
  function StaffBlock() {
    const { t, L, fmt } = useApp();
    const items = [
      { id: 'cpi', st: 'scheduled', date: MS.data.byId.cpi.nextRelease },
      { id: 'industry', st: 'scheduled', date: MS.data.byId.industry.nextRelease },
      { id: 'gdp-growth', st: 'draft', date: MS.data.byId['gdp-growth'].nextRelease },
    ];
    return html`<div className="ms-staffblock"><p className="ms-muted">${t('cab.staff.desc')}</p>
    <ul className="ms-list" role="list">
      ${items.map((x) => html`<li key=${x.id} className="ms-list__item"><span>${L(MS.data.byId[x.id].name)}</span><span className=${'ms-tag ms-tag--' + x.st}>${t('cab.staff.' + x.st)}</span><span className="ms-muted ms-num">${fmt.date(x.date)}</span></li>`)}
    </ul>
    <p className="ms-later"><${Icon} name="clock" size=${16} /> ${t('cab.staff.later')}</p></div>`;
  }
  function LoginPrompt() {
    const { t, openLogin } = useApp();
    return html`<div className="ms-loginprompt">
      <${Icon} name="user" size=${28} />
      <div><strong>${t('auth.needLogin')}</strong><p className="ms-muted">${t('auth.needLoginDesc')}</p></div>
      <button type="button" className="ms-btn ms-btn--primary" onClick=${openLogin}>${t('auth.login')}</button>
    </div>`;
  }

  /* ---------- states ---------- */
  function StateView(p) {
    const { t } = useApp();
    if (p.status === 'loading') return html`<div className="ms-state ms-state--loading" role="status"><span className="ms-spinner" aria-hidden="true"></span>${t('common.loading')}</div>`;
    if (p.status === 'error') return html`<div className="ms-state ms-state--error" role="alert"><p>${t('common.error')}</p><button type="button" className="ms-btn ms-btn--primary" onClick=${p.onRetry}>${t('common.retry')}</button></div>`;
    if (p.status === 'empty') return html`<div className="ms-state ms-state--empty"><p>${t('common.empty')}</p></div>`;
    return null;
  }
  function Skeleton(p) {
    return html`<div className="ms-skel" style=${{ height: p.h || 80 }} aria-hidden="true"></div>`;
  }
  function ComingSoon() {
    const { t, route, go } = useApp();
    return html`<section className="ms-soon">
      <h1 tabIndex="-1" data-page-title>${t(route.navKey || 'common.comingSoon.title')}</h1>
      <p><strong>${t('common.comingSoon.title')}</strong></p>
      <p className="ms-muted">${t('common.comingSoon.desc')}</p>
      <button type="button" className="ms-btn ms-btn--primary" onClick=${() => go('home')}>${t('common.toHome')}</button>
    </section>`;
  }

  /* ---------- change badge, sparkline ---------- */
  function ChangeBadge(p) {
    const c = p.change;
    if (!c) return null;
    return html`<span className=${'ms-change ms-change--' + c.tone + ' ms-change--' + c.dir + ' ' + (p.className || '')}>
      <span aria-hidden="true">${c.arrow}</span> <span aria-hidden="true">${c.valueTxt}</span>${!p.noWord && html`<span aria-hidden="true" className="ms-change__word"> · ${c.word}</span>`}
      <span className="ms-sr">${c.aria}</span>
    </span>`;
  }
  function Sparkline(p) {
    const vals = p.values.filter((v) => v != null);
    if (vals.length < 2) return null;
    const w = p.width || 120, h = p.height || 32, pd = 3;
    const min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    const sx = (i) => pd + (i / (vals.length - 1)) * (w - pd * 2);
    const sy = (v) => h - pd - (max === min ? 0.5 : (v - min) / (max - min)) * (h - pd * 2);
    const d = vals.map((v, i) => (i ? 'L' : 'M') + sx(i).toFixed(1) + ' ' + sy(v).toFixed(1)).join(' ');
    const area = d + ' L' + sx(vals.length - 1) + ' ' + (h - pd) + ' L' + sx(0) + ' ' + (h - pd) + ' Z';
    return html`<svg className="ms-spark" width=${w} height=${h} viewBox=${'0 0 ' + w + ' ' + h} aria-hidden="true" focusable="false">
      <path d=${area} fill="var(--ms-accent-soft)" stroke="none" />
      <path d=${d} fill="none" stroke="var(--ms-accent)" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx=${sx(vals.length - 1)} cy=${sy(vals[vals.length - 1])} r="2.8" fill="var(--ms-accent)" />
    </svg>`;
  }

  /* ===================== charts ===================== */
  let echartsP = null;
  function loadECharts() {
    if (window.echarts) return Promise.resolve(window.echarts);
    if (!echartsP)
      echartsP = new Promise((res, rej) => {
        const sc = document.createElement('script');
        sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.5.0/echarts.min.js';
        sc.async = true;
        sc.onload = () => res(window.echarts);
        sc.onerror = () => {
          echartsP = null;
          rej(new Error('echarts-load'));
        };
        document.head.appendChild(sc);
      });
    return echartsP;
  }
  function cssVar(el, name, fb) {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fb;
  }

  /* Lightweight SVG chart (lite mode + fallback). series: [{name, data:[{x,y}]}] */
  function SvgChart(p) {
    const { fmt } = useApp();
    const w = 640, h = p.height || 260, padL = 52, padR = 12, padT = 12, padB = 30;
    const all = [];
    p.series.forEach((s) => s.data.forEach((d) => d.y != null && all.push(d.y)));
    if (!all.length) return null;
    let min = Math.min.apply(null, all), max = Math.max.apply(null, all);
    if (p.type === 'bar') min = Math.min(0, min);
    if (min === max) max = min + 1;
    const span = max - min;
    min -= span * 0.06;
    max += span * 0.06;
    if (p.type === 'bar' && Math.min.apply(null, all) >= 0) min = 0;
    const n = p.series[0].data.length;
    const sx = (i) => padL + (n === 1 ? 0.5 : i / (n - 1)) * (w - padL - padR);
    const bw = ((w - padL - padR) / n) * 0.7;
    const sxb = (i) => padL + ((i + 0.5) / n) * (w - padL - padR);
    const sy = (v) => padT + (1 - (v - min) / (max - min)) * (h - padT - padB);
    const ticks = 4;
    const tickVals = Array.from({ length: ticks + 1 }, (_, i) => min + ((max - min) * i) / ticks);
    const step = Math.max(1, Math.ceil(n / 6));
    const colors = ['var(--ms-c1)', 'var(--ms-c2)', 'var(--ms-c3)', 'var(--ms-c4)'];
    return html`<svg className="ms-svgchart" viewBox=${'0 0 ' + w + ' ' + h} preserveAspectRatio="none" style=${{ width: '100%', height: h }} aria-hidden="true" focusable="false">
      ${tickVals.map((v, i) => html`<g key=${i}><line x1=${padL} x2=${w - padR} y1=${sy(v)} y2=${sy(v)} stroke="var(--ms-grid)" strokeWidth="1" /><text x=${padL - 6} y=${sy(v) + 4} textAnchor="end" fontSize="11" fill="var(--ms-muted)">${fmt.num(v, p.decimals > 1 ? 1 : p.decimals)}</text></g>`)}
      ${p.series[0].data.map((d, i) => (i % step === 0 || i === n - 1) && html`<text key=${'x' + i} x=${p.type === 'bar' ? sxb(i) : sx(i)} y=${h - 8} textAnchor="middle" fontSize="11" fill="var(--ms-muted)">${d.label}</text>`)}
      ${p.series.map((s, si) =>
        p.type === 'bar'
          ? s.data.map((d, i) => d.y != null && html`<rect key=${si + '-' + i} x=${sxb(i) - bw / 2} width=${bw} y=${Math.min(sy(d.y), sy(Math.max(0, min)))} height=${Math.abs(sy(d.y) - sy(Math.max(0, min)))} fill=${colors[si]} rx="1.5" />`)
          : html`<path key=${si} d=${s.data.map((d, i) => (i ? 'L' : 'M') + sx(i).toFixed(1) + ' ' + sy(d.y).toFixed(1)).join(' ')} fill="none" stroke=${colors[si]} strokeWidth="2.2" strokeLinejoin="round" />`,
      )}
      ${p.type !== 'bar' && html`<circle cx=${sx(n - 1)} cy=${sy(p.series[0].data[n - 1].y)} r="4" fill="var(--ms-c1)" />`}
    </svg>`;
  }

  function EChart(p) {
    const app = useApp();
    const ref = useRef(null);
    const inst = useRef(null);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
      let alive = true;
      let ro;
      loadECharts().then(
        (ec) => {
          if (!alive || !ref.current) return;
          if (inst.current) inst.current.dispose();
          const el = ref.current;
          const c = inst.current = ec.init(el, null, { renderer: 'svg' });
          const text = cssVar(el, '--ms-text', '#222');
          const muted = cssVar(el, '--ms-muted', '#666');
          const grid = cssVar(el, '--ms-grid', '#ddd');
          const font = cssVar(el, '--ms-font-body', 'sans-serif');
          const surface = cssVar(el, '--ms-surface', '#fff');
          const colors = ['--ms-c1', '--ms-c2', '--ms-c3', '--ms-c4'].map((v, i) => cssVar(el, v, ['#1f6feb', '#e36209', '#2da44e', '#8250df'][i]));
          const labels = p.series[0].data.map((d) => d.label);
          c.setOption({
            animation: !app.reducedMotion,
            animationDuration: 200,
            color: colors,
            textStyle: { fontFamily: font, color: text },
            grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
            tooltip: {
              trigger: 'axis',
              backgroundColor: surface,
              borderColor: grid,
              textStyle: { color: text, fontFamily: font },
              valueFormatter: (v) => app.fmt.num(v, p.decimals),
            },
            legend: p.series.length > 1 ? { bottom: 0, textStyle: { color: muted } } : undefined,
            xAxis: { type: 'category', data: labels, boundaryGap: p.type === 'bar', axisLine: { lineStyle: { color: grid } }, axisTick: { show: false }, axisLabel: { color: muted, hideOverlap: true } },
            yAxis: { type: 'value', scale: p.type !== 'bar', splitLine: { lineStyle: { color: grid } }, axisLabel: { color: muted, formatter: (v) => app.fmt.num(v, p.decimals > 1 ? 1 : p.decimals) } },
            series: p.series.map((s) => ({
              name: s.name,
              type: p.type === 'bar' ? 'bar' : 'line',
              data: s.data.map((d) => d.y),
              smooth: false,
              showSymbol: false,
              symbolSize: 6,
              lineStyle: { width: 2.4 },
              barMaxWidth: 28,
              areaStyle: p.type !== 'bar' && p.series.length === 1 ? { opacity: 0.08 } : undefined,
              endLabel: undefined,
            })),
          });
          ro = new ResizeObserver(() => c.resize());
          ro.observe(el);
        },
        () => alive && setFailed(true),
      );
      return () => {
        alive = false;
        ro && ro.disconnect();
      };
    }, [p.series, p.type, app.theme, app.s.accent, app.s.numberFormat, app.locale, app.s.lv.fontScale]);
    useEffect(() => () => inst.current && inst.current.dispose(), []);
    if (failed) return html`<${SvgChart} ...${p} />`;
    return html`<div ref=${ref} className="ms-echart" style=${{ width: '100%', height: p.height || 280 }} aria-hidden="true"></div>`;
  }

  /* Accessible chart wrapper: role=img + summary; ECharts in full mode, SVG in lite mode */
  function Chart(p) {
    const { lite, t } = useApp();
    return html`<figure className=${'ms-chart ' + (p.className || '')} role="img" aria-label=${p.ariaLabel}>
      ${lite ? html`<${SvgChart} ...${p} />` : html`<${EChart} ...${p} />`}
    </figure>`;
  }

  function DataTable(p) {
    // p.columns: [{key,label,num}], p.rows: [{...}], p.caption
    return html`<div className="ms-tablewrap" tabIndex="0" role="region" aria-label=${p.caption}>
      <table className="ms-table">
        <caption>${p.caption}</caption>
        <thead><tr>${p.columns.map((c) => html`<th key=${c.key} scope="col" className=${c.num ? 'is-num' : ''}>${c.label}</th>`)}</tr></thead>
        <tbody>
          ${p.rows.map((r, i) => html`<tr key=${i}>${p.columns.map((c, j) => (j === 0 ? html`<th key=${c.key} scope="row">${r[c.key]}</th>` : html`<td key=${c.key} className=${c.num ? 'is-num' : ''}>${r[c.key]}</td>`))}</tr>`)}
        </tbody>
      </table>
    </div>`;
  }

  /* ChartBlock: title + text summary + [Chart | Table] tabs + chart type toggle. Simplified mode → table only. */
  function ChartBlock(p) {
    const { t, simple } = useApp();
    const [view, setView] = useState(p.defaultView || 'chart');
    const [type, setType] = useState(p.type || 'line');
    const id = useMemo(() => 'cb' + Math.random().toString(36).slice(2, 8), []);
    const showChart = !simple && view === 'chart';
    return html`<section className=${'ms-chartblock ' + (p.className || '')} aria-labelledby=${id + '-t'}>
      <div className="ms-chartblock__head">
        <h2 id=${id + '-t'} className="ms-chartblock__title">${p.title}</h2>
        ${!simple &&
        html`<div className="ms-chartblock__tools">
          <div className="ms-tabs" role="group" aria-label=${t('ind.viewAs')}>
            <button type="button" className="ms-tab" aria-pressed=${view === 'chart'} onClick=${() => setView('chart')}><${Icon} name="chart" size=${16} />${t('ind.chart')}</button>
            <button type="button" className="ms-tab" aria-pressed=${view === 'table'} onClick=${() => setView('table')}><${Icon} name="table" size=${16} />${t('ind.table')}</button>
          </div>
          ${view === 'chart' &&
          !p.noTypeToggle &&
          html`<div className="ms-tabs" role="group" aria-label=${t('ind.chartType')}>
            <button type="button" className="ms-tab" aria-pressed=${type === 'line'} onClick=${() => setType('line')}>${t('ind.line')}</button>
            <button type="button" className="ms-tab" aria-pressed=${type === 'bar'} onClick=${() => setType('bar')}>${t('ind.bar')}</button>
          </div>`}
        </div>`}
      </div>
      ${p.summary && html`<p className="ms-chartblock__summary">${p.summary}</p>`}
      ${showChart
        ? html`<${Chart} series=${p.series} type=${type} decimals=${p.decimals} height=${p.height} ariaLabel=${t('ind.chartAria', { name: p.title })} />`
        : html`<${DataTable} caption=${p.tableCaption || p.title} columns=${p.columns} rows=${p.rows} />`}
    </section>`;
  }

  /* Schematic tile map of 14 regions */
  function TileMap(p) {
    const { L, fmt, t, locale } = useApp();
    const vals = p.data.filter((d) => d.value != null).map((d) => d.value);
    if (!vals.length) return null;
    const min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    const byR = {};
    p.data.forEach((d) => (byR[d.regionId] = d));
    const cols = 8, rows = 3;
    return html`<div className="ms-tilemap">
      <div className="ms-tilemap__scroll" tabIndex="0" role="region" aria-label=${p.label}><div className="ms-tilemap__grid" style=${{ gridTemplateColumns: 'repeat(' + cols + ', minmax(0, 1fr))', gridTemplateRows: 'repeat(' + rows + ', auto)' }} role="list" aria-label=${p.label}>
        ${MS.data.REGIONS.map((reg) => {
          const d = byR[reg.id];
          const share = d && d.value != null && max > min ? (d.value - min) / (max - min) : 0.5;
          const pct = Math.round(18 + share * 82);
          const sel = p.selected === reg.id;
          return html`<button key=${reg.id} type="button" role="listitem" className=${'ms-tile' + (sel ? ' is-sel' : '')}
            style=${{ gridColumn: reg.col + 1, gridRow: reg.row + 1, background: 'color-mix(in srgb, var(--ms-map-hi) ' + pct + '%, var(--ms-map-lo))' }}
            aria-pressed=${sel} aria-label=${L(reg.name) + ': ' + (d ? fmt.value(d.value, p.indicator) : '—')} title=${L(reg.name)}
            onClick=${() => p.onSelect && p.onSelect(sel ? 'UZ' : reg.id)}>
            <span className="ms-tile__lbl"><span className="ms-tile__abbr">${L(reg.abbr)}</span>
            <span className="ms-tile__val">${d ? fmt.value(d.value, p.indicator, { noUnit: true }) : '—'}</span></span>
          </button>`;
        })}
      </div></div>
      <div className="ms-tilemap__legend" aria-hidden="true">
        <span>${t('ind.mapLegendLow')} · ${fmt.value(min, p.indicator)}</span>
        <span className="ms-tilemap__ramp"></span>
        <span>${fmt.value(max, p.indicator)} · ${t('ind.mapLegendHigh')}</span>
      </div>
      <p className="ms-tilemap__note ms-muted ms-small">${t('ind.mapNote')}</p>
    </div>`;
  }

  /* ===================== exports: CSV, XLSX (own writer), PDF (canvas → JPEG in PDF) ===================== */
  const downloadsP = window.claude && typeof window.claude.use === 'function' ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
  async function saveFile(filename, data) {
    const dl = await downloadsP;
    if (dl) {
      try {
        await dl.save({ filename, data });
        return 'saved';
      } catch (e) {
        return e && (e.code === 'declined' || e.code === 'rate_limited') ? 'declined' : 'unavailable';
      }
    }
    if (window.claude) return 'unavailable';
    try {
      const blob = data instanceof Blob ? data : new Blob([data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 500);
      return 'saved';
    } catch (e) {
      return 'unavailable';
    }
  }
  function slug(s) {
    return String(s)
      .replace(/[ʻʼ'‘’`]/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 60);
  }
  function csvCell(v) {
    const s = v == null ? '' : String(v);
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function makeCSV(table) {
    return '﻿' + [table.header].concat(table.rows).map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
  }
  /* --- minimal ZIP (stored) + XLSX --- */
  const CRC_T = (() => {
    const tb = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      tb[n] = c >>> 0;
    }
    return tb;
  })();
  function crc32(b) {
    let c = 0xffffffff;
    for (let i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function zip(files) {
    const enc = new TextEncoder();
    const parts = [], central = [];
    let offset = 0;
    files.forEach((f) => {
      const name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
      const crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
      lh.setUint16(10, 0, true); lh.setUint16(12, 0x21, true); lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true);
      lh.setUint32(22, data.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
      ch.setUint16(10, 0, true); ch.setUint16(12, 0, true); ch.setUint16(14, 0x21, true); ch.setUint32(16, crc, true);
      ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, name.length, true);
      ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    });
    const csize = central.reduce((s, x) => s + x.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, csize, true); end.setUint32(16, offset, true);
    return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]), { type: 'application/zip' });
  }
  function xesc(s) {
    return String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  }
  function colName(i) {
    let s = '';
    i++;
    while (i) {
      const m = (i - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      i = Math.floor((i - 1) / 26);
    }
    return s;
  }
  function makeXLSX(table, sheetName) {
    const rows = [table.header].concat(table.rows);
    const sheetRows = rows
      .map((r, ri) => '<row r="' + (ri + 1) + '">' + r.map((v, ci) => {
        const ref = colName(ci) + (ri + 1);
        if (typeof v === 'number' && isFinite(v)) return '<c r="' + ref + '"><v>' + v + '</v></c>';
        return '<c r="' + ref + '" t="inlineStr"' + (ri === 0 ? ' s="1"' : '') + '><is><t>' + xesc(v == null ? '' : v) + '</t></is></c>';
      }).join('') + '</row>')
      .join('');
    const name = xesc(String(sheetName || 'Data').replace(/[\\/?*\[\]:]/g, ' ').slice(0, 31));
    return zip([
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="' + name + '" sheetId="1" r:id="rId1"/></sheets></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: 'xl/styles.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>' },
      { name: 'xl/worksheets/sheet1.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + sheetRows + '</sheetData></worksheet>' },
    ]);
  }
  /* PDF: draw a one-page report on canvas (any script renders), embed as JPEG */
  async function makePDF(report) {
    const W = 1240, H = 1754; // A4 @150dpi
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const g = cv.getContext('2d');
    const font = (getComputedStyle(document.querySelector('.ms-root') || document.body).getPropertyValue('--ms-font-body') || 'sans-serif').trim();
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, W, H);
    let y = 110;
    const left = 100;
    g.fillStyle = '#1b3a6b';
    g.fillRect(0, 0, W, 16);
    g.fillStyle = '#5a6473';
    g.font = '26px ' + font;
    g.fillText(report.org + ' · my.stat', left, y);
    y += 40;
    g.fillStyle = '#b42318';
    g.font = 'bold 24px ' + font;
    g.fillText(report.demo, left, y);
    y += 70;
    g.fillStyle = '#111827';
    g.font = 'bold 50px ' + font;
    wrap(g, report.title, left, y, W - 2 * left, 60).forEach((line, i) => g.fillText(line, left, (y += i ? 60 : 0)));
    y += 56;
    g.font = '28px ' + font;
    g.fillStyle = '#374151';
    g.fillText(report.subtitle, left, y);
    y += 80;
    g.font = 'bold 86px ' + font;
    g.fillStyle = '#111827';
    g.fillText(report.value, left, y);
    y += 50;
    g.font = '28px ' + font;
    g.fillStyle = '#374151';
    g.fillText(report.change, left, y);
    y += 50;
    // chart
    const cx = left, cy = y, cw = W - 2 * left, chh = 380;
    g.strokeStyle = '#e5e7eb';
    g.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      g.beginPath();
      g.moveTo(cx, cy + (chh * i) / 4);
      g.lineTo(cx + cw, cy + (chh * i) / 4);
      g.stroke();
    }
    const vals = report.series.map((d) => d.y);
    const mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
    g.strokeStyle = '#1b3a6b';
    g.lineWidth = 5;
    g.beginPath();
    vals.forEach((v, i) => {
      const px = cx + (vals.length === 1 ? 0 : (i / (vals.length - 1)) * cw);
      const py = cy + chh - (mx === mn ? 0.5 : (v - mn) / (mx - mn)) * chh;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    });
    g.stroke();
    g.font = '22px ' + font;
    g.fillStyle = '#5a6473';
    g.fillText(report.series[0].label, cx, cy + chh + 34);
    const lastLbl = report.series[report.series.length - 1].label;
    g.fillText(lastLbl, cx + cw - g.measureText(lastLbl).width, cy + chh + 34);
    y = cy + chh + 90;
    // table (last rows)
    g.font = 'bold 24px ' + font;
    g.fillStyle = '#111827';
    report.header.forEach((h, i) => g.fillText(h, left + i * 360, y));
    y += 14;
    g.fillStyle = '#d1d5db';
    g.fillRect(left, y, W - 2 * left, 2);
    g.font = '24px ' + font;
    report.rows.slice(-14).forEach((r) => {
      y += 40;
      g.fillStyle = '#111827';
      r.forEach((c, i) => g.fillText(String(c), left + i * 360, y));
    });
    y = H - 140;
    g.font = '22px ' + font;
    g.fillStyle = '#5a6473';
    wrap(g, report.footer, left, y, W - 2 * left, 32).forEach((line, i) => g.fillText(line, left, y + i * 32));
    const jpeg = await new Promise((res) => cv.toBlob((b) => res(b), 'image/jpeg', 0.9));
    const img = new Uint8Array(await jpeg.arrayBuffer());
    const enc = new TextEncoder();
    const pw = 595.28, ph = 841.89;
    const content = 'q ' + pw + ' 0 0 ' + ph + ' 0 0 cm /Im0 Do Q';
    const objs = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pw + ' ' + ph + '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>',
      null,
      '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream',
    ];
    const chunks = [];
    let len = 0;
    const push = (x) => {
      const b = typeof x === 'string' ? enc.encode(x) : x;
      chunks.push(b);
      len += b.length;
    };
    const offs = [];
    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    objs.forEach((o, i) => {
      offs.push(len);
      if (i === 3) {
        push('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + W + ' /Height ' + H + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + img.length + ' >>\nstream\n');
        push(img);
        push('\nendstream\nendobj\n');
      } else push(i + 1 + ' 0 obj\n' + o + '\nendobj\n');
    });
    const xref = len;
    let x = 'xref\n0 6\n0000000000 65535 f \n';
    offs.forEach((o) => (x += String(o).padStart(10, '0') + ' 00000 n \n'));
    push(x + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
    return new Blob(chunks, { type: 'application/pdf' });
  }
  function wrap(g, text, x, y, maxW) {
    const words = String(text).split(' ');
    const lines = [];
    let cur = '';
    words.forEach((w) => {
      const tst = cur ? cur + ' ' + w : w;
      if (g.measureText(tst).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else cur = tst;
    });
    if (cur) lines.push(cur);
    return lines;
  }

  /* ===================== indicator page model ===================== */
  function useIndicatorModel(id) {
    const app = useApp();
    const { t, L, fmt, s } = app;
    const ind = MS.data.byId[id] || null;
    const periods = useMemo(() => (ind ? MS.data.periodsFor(ind.frequency) : []), [id]);
    const defaultFrom = periods[Math.max(0, periods.length - (ind && ind.frequency === 'M' ? 24 : ind && ind.frequency === 'Q' ? 12 : 10))];
    const [from, setFrom] = useState(defaultFrom);
    const [to, setTo] = useState(periods[periods.length - 1]);
    const [regionId, setRegionId] = useState(app.route.region || 'UZ');
    useEffect(() => {
      if (ind) app.addRecent(id);
    }, [id]);
    useEffect(() => {
      setFrom(defaultFrom);
      setTo(periods[periods.length - 1]);
      setRegionId(app.route.region && ind && ind.regional ? app.route.region : 'UZ');
    }, [id]);
    const obs = useAsync(() => (ind ? MS.dataService.getObservations(id, { regionId, from, to }) : Promise.resolve(null)), [id, regionId, from, to]);
    const regional = useAsync(() => (ind && ind.regional ? MS.dataService.getRegional(id) : Promise.resolve([])), [id]);
    if (!ind) return { ind: null };

    const full = MS.dataService.getObservationsSync(id, regionId);
    const last = full[full.length - 1];
    const prev = full[full.length - 2];
    const change = fmt.change(ind, last && last.value, prev && prev.value);
    const regionName = regionId === 'UZ' ? t('common.country') : L(MS.data.REGIONS.find((r) => r.id === regionId).name);
    const data = obs.data || [];
    const series = [{ name: L(ind.name), data: data.map((o) => ({ x: o.period, label: fmt.period(o.period, true), y: o.value })) }];
    let summary = '';
    if (last) {
      summary = t('ind.summary', {
        period: fmt.period(last.period),
        name: L(ind.name) + ' (' + regionName + ')',
        value: fmt.value(last.value, ind),
        changeText: change ? t('change.vsPrev').replace(/^./, (c) => c.toUpperCase()) + ': ' + change.word + ', ' + change.valueTxt : '',
      });
      if (data.length > 1) {
        let mx = data[0], mn = data[0];
        data.forEach((o) => {
          if (o.value > mx.value) mx = o;
          if (o.value < mn.value) mn = o;
        });
        summary += ' ' + t('ind.summaryRange', { from: fmt.period(data[0].period), to: fmt.period(data[data.length - 1].period), max: fmt.value(mx.value, ind), maxPeriod: fmt.period(mx.period), min: fmt.value(mn.value, ind), minPeriod: fmt.period(mn.period) });
      }
    }
    const columns = [
      { key: 'period', label: t('common.period') },
      { key: 'value', label: t('common.value') + ', ' + L(ind.unit), num: true },
      { key: 'change', label: t('common.change'), num: true },
    ];
    const rows = data
      .slice()
      .reverse()
      .map((o, i, arr) => {
        const pv = arr[i + 1];
        const c = pv ? fmt.change(ind, o.value, pv.value) : null;
        return { period: fmt.period(o.period) + (o.status === 'provisional' ? ' (' + t('common.provisional') + ')' : ''), value: fmt.num(o.value, ind.decimals), change: c ? c.arrow + ' ' + c.valueTxt : '—' };
      });

    const table = () => ({
      header: [t('ind.code'), t('nav.indicators'), t('common.region'), t('common.period'), t('common.value'), t('common.unit')],
      rows: data.map((o) => [ind.code, L(ind.name), regionName, fmt.period(o.period), o.value, L(ind.unit)]),
    });
    const regionAbbr = regionId === 'UZ' ? 'UZ' : regionId;
    const fileBase = slug(L(ind.name)) + '_' + regionAbbr + '_' + from + '_' + to;
    async function download(format) {
      let data2, filename = fileBase + '.' + format;
      if (format === 'csv') data2 = makeCSV(table());
      else if (format === 'xlsx') data2 = makeXLSX(table(), L(ind.name));
      else
        data2 = await makePDF({
          org: t('org.name'),
          demo: t('demo.label'),
          title: L(ind.name),
          subtitle: regionName + ' · ' + fmt.period(data[0] && data[0].period) + ' – ' + fmt.period(last.period),
          value: fmt.value(last.value, ind),
          change: change ? change.text + ' (' + t('change.vsPrev') + ')' : '',
          series: series[0].data,
          header: [t('common.period'), t('common.value'), t('common.change')],
          rows: rows.map((r) => [r.period, r.value, r.change]).reverse(),
          footer: t('common.source') + ': ' + L(ind.source) + ' · ' + t('common.updated', { date: fmt.date(ind.lastUpdated) }) + ' · ' + t('demo.notOfficial'),
        });
      const res = await saveFile(filename, data2);
      if (res === 'saved') {
        app.addHistory({ indicatorId: id, format, date: new Date().toISOString().slice(0, 10) });
        app.toast(t('ind.downloadDone', { file: filename }), 'good');
      } else if (res === 'declined') app.toast(t('ind.downloadDeclined'));
      else app.toast(t('ind.downloadUnavailable'), 'bad');
    }
    const shareUrl = () => location.href.split('#')[0] + '#' + app.variant + '.' + id + '.' + regionId;

    const regionalRows = (regional.data || []).map((d) => {
      const reg = MS.data.REGIONS.find((r) => r.id === d.regionId);
      return { region: L(reg.name), value: fmt.num(d.value, ind.decimals), _v: d.value, _id: d.regionId };
    });

    return {
      ind,
      name: L(ind.name),
      description: L(ind.description),
      methodology: L(ind.methodology),
      source: L(ind.source),
      unit: L(ind.unit),
      category: L(ind.categoryName),
      frequency: t('freq.' + ind.frequency),
      updated: fmt.date(ind.lastUpdated),
      nextRelease: fmt.date(ind.nextRelease),
      last,
      prev,
      lastValue: last ? fmt.value(last.value, ind) : '—',
      lastPeriod: last ? fmt.period(last.period) : '—',
      prevValue: prev ? fmt.value(prev.value, ind) : '—',
      prevPeriod: prev ? fmt.period(prev.period) : '—',
      change,
      periods,
      periodOptions: periods.map((p) => ({ value: p, label: fmt.period(p) })),
      from,
      to,
      setFrom: (v) => (v <= to ? setFrom(v) : (setFrom(v), setTo(v))),
      setTo: (v) => (v >= from ? setTo(v) : (setTo(v), setFrom(v))),
      regionId,
      setRegionId,
      regionName,
      regionOptions: [{ value: 'UZ', label: t('ind.regionAll') }].concat(MS.data.REGIONS.map((r) => ({ value: r.id, label: L(r.name) }))),
      obs,
      series,
      summary,
      columns,
      rows,
      tableCaption: t('ind.tableCaption', { name: L(ind.name) + ' — ' + regionName, unit: L(ind.unit) }),
      regional,
      regionalRows,
      regionalPeriod: regional.data && regional.data[0] ? fmt.period(regional.data[0].period) : '',
      download,
      shareUrl,
      related: (MS.data.RELATED[ind.category] || []).filter((x) => x !== id).slice(0, 4).map((rid) => MS.data.byId[rid]),
    };
  }

  /* ===================== home model ===================== */
  function useHomeModel() {
    const app = useApp();
    const { L, fmt } = app;
    const releases = useAsync(() => MS.dataService.getReleases(), []);
    const cards = MS.data.HEADLINE_IDS.map((id) => {
      const ind = MS.data.byId[id];
      const s = MS.dataService.getObservationsSync(id);
      const last = s[s.length - 1], prev = s[s.length - 2];
      return {
        id,
        ind,
        name: L(ind.name),
        description: L(ind.description),
        category: L(ind.categoryName),
        value: fmt.value(last.value, ind, { noUnit: true }),
        unit: L(ind.unit),
        valueFull: fmt.value(last.value, ind),
        period: fmt.period(last.period),
        change: fmt.change(ind, last.value, prev.value),
        spark: s.slice(-12).map((o) => o.value),
        updated: fmt.date(ind.lastUpdated),
      };
    });
    const mapRel = (list) => (list || []).map((r) => ({ id: r.indicatorId, ind: MS.data.byId[r.indicatorId], name: L(MS.data.byId[r.indicatorId].name), date: fmt.date(r.date), iso: r.date, category: L(MS.data.byId[r.indicatorId].categoryName) }));
    return {
      cards,
      releases,
      latest: mapRel(releases.data && releases.data.latest),
      upcoming: mapRel(releases.data && releases.data.upcoming),
      popular: MS.data.POPULAR_IDS.map((id) => ({ id, name: L(MS.data.byId[id].name) })),
    };
  }

  /* ===================== search box (combobox) ===================== */
  function SearchBox(p) {
    const { t, locale, go, L } = useApp();
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    const [act, setAct] = useState(-1);
    const id = useMemo(() => 'sb' + Math.random().toString(36).slice(2, 7), []);
    const res = useMemo(() => MS.dataService.searchSync(q, locale), [q, locale]);
    const pick = (ind) => {
      setOpen(false);
      setQ('');
      go('indicator', { id: ind.id });
      p.onPick && p.onPick();
    };
    return html`<div className=${'ms-search ' + (p.className || '') + (p.big ? ' ms-search--big' : '')} role="search">
      <label htmlFor=${id} className=${p.showLabel ? 'ms-search__label' : 'ms-sr'}>${p.label || t('search.label')}</label>
      <div className="ms-search__box">
        <${Icon} name="search" size=${p.big ? 22 : 18} />
        <input id=${id} type="search" autoComplete="off" spellCheck="false" value=${q} placeholder=${t('search.placeholder')}
          role="combobox" aria-expanded=${open && q.length > 0} aria-controls=${id + '-list'} aria-autocomplete="list" aria-activedescendant=${act >= 0 ? id + '-o' + act : undefined}
          onInput=${(e) => {
            setQ(e.target.value);
            setOpen(true);
            setAct(-1);
          }}
          onFocus=${() => setOpen(true)}
          onBlur=${() => setTimeout(() => setOpen(false), 150)}
          onKeyDown=${(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setAct(Math.min(res.length - 1, act + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setAct(Math.max(-1, act - 1));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const r = res[act >= 0 ? act : 0];
              if (r) pick(r);
            } else if (e.key === 'Escape') setOpen(false);
          }} />
      </div>
      ${open &&
      q.length > 0 &&
      html`<ul id=${id + '-list'} className="ms-search__list" role="listbox" aria-label=${t('search.label')}>
        ${res.length
          ? res.map((r, i) => html`<li key=${r.id} id=${id + '-o' + i} role="option" aria-selected=${i === act} className=${'ms-search__opt' + (i === act ? ' is-act' : '')} onMouseDown=${(e) => {
              e.preventDefault();
              pick(r);
            }}><span>${L(r.name)}</span><small>${L(r.categoryName)}</small></li>`)
          : html`<li className="ms-search__none" role="option" aria-selected="false" aria-disabled="true">${t('search.noResults')}</li>`}
      </ul>`}
      <div className="ms-sr" aria-live="polite">${q ? t('search.results', { n: res.length }) : ''}</div>
    </div>`;
  }

  /* ===================== indicator-page action widgets ===================== */
  function DownloadButtons(p) {
    const { t } = useApp();
    const [busy, setBusy] = useState('');
    const m = p.model;
    return html`<div className=${'ms-downloads ' + (p.className || '')} role="group" aria-label=${t('ind.download')}>
      ${!p.noLabel && html`<span className="ms-downloads__label"><${Icon} name="download" size=${18} />${t('ind.download')}<small>${t('ind.downloadHint')}</small></span>`}
      <div className="ms-downloads__btns">
        ${['csv', 'xlsx', 'pdf'].map(
          (f) => html`<button key=${f} type="button" className=${'ms-btn ms-btn--fmt ' + (p.buttonClass || '')} aria-busy=${busy === f} disabled=${!!busy} onClick=${async () => {
            setBusy(f);
            try {
              await m.download(f);
            } finally {
              setBusy('');
            }
          }} title=${f === 'pdf' ? t('ind.pdfNote') : undefined}>${f.toUpperCase()}</button>`,
        )}
      </div>
    </div>`;
  }
  function ShareButton(p) {
    const { t, toast } = useApp();
    const [fallback, setFallback] = useState('');
    const inp = useRef(null);
    useEffect(() => {
      if (fallback && inp.current) inp.current.select();
    }, [fallback]);
    return html`<div className="ms-share">
      <button type="button" className=${'ms-btn ' + (p.buttonClass || 'ms-btn--ghost')} onClick=${() => {
        const url = p.model.shareUrl();
        try {
          navigator.clipboard.writeText(url).then(
            () => toast(t('ind.shareCopied'), 'good'),
            () => setFallback(url),
          );
        } catch (e) {
          setFallback(url);
        }
      }}><${Icon} name="share" size=${18} />${!p.iconOnly && html`<span>${t('ind.share')}</span>`}</button>
      ${fallback && html`<label className="ms-share__fb"><span>${t('ind.shareFallback')}</span><input ref=${inp} readOnly value=${fallback} onFocus=${(e) => e.target.select()} /></label>`}
    </div>`;
  }
  function SaveButton(p) {
    const { t, user, saved, toggleSaved, toast, openLogin } = useApp();
    const on = saved.indexOf(p.id) >= 0;
    return html`<button type="button" className=${'ms-btn ' + (p.buttonClass || 'ms-btn--ghost')} aria-pressed=${on} onClick=${() => {
      if (!user) {
        toast(t('ind.needLoginSave'));
        openLogin();
        return;
      }
      toggleSaved(p.id);
      toast(t(on ? 'ind.unsavedToast' : 'ind.savedToast'), on ? 'info' : 'good');
    }}><${Icon} name="star" size=${18} fill=${on} />${!p.iconOnly && html`<span>${t(on ? 'ind.savedIt' : 'ind.saveIt')}</span>`}</button>`;
  }
  function Select(p) {
    return html`<div className=${'ms-select ' + (p.className || '')}>
      <label htmlFor=${p.id}>${p.label}</label>
      <select id=${p.id} value=${p.value} onChange=${(e) => p.onChange(e.target.value)}>
        ${p.options.map((o) => html`<option key=${o.value} value=${o.value}>${o.label}</option>`)}
      </select>
    </div>`;
  }
  function Filters(p) {
    const { t } = useApp();
    const m = p.model;
    return html`<div className=${'ms-filters ' + (p.className || '')} role="group" aria-label=${t('ind.filters')}>
      <${Select} id=${'f-from-' + m.ind.id} label=${t('ind.periodFrom')} value=${m.from} onChange=${m.setFrom} options=${m.periodOptions} />
      <${Select} id=${'f-to-' + m.ind.id} label=${t('ind.periodTo')} value=${m.to} onChange=${m.setTo} options=${m.periodOptions} />
      ${m.ind.regional && html`<${Select} id=${'f-reg-' + m.ind.id} label=${t('common.region')} value=${m.regionId} onChange=${m.setRegionId} options=${m.regionOptions} />`}
    </div>`;
  }
  /* Regional block: tile map + table alternative (simplified mode → table) */
  function RegionalBlock(p) {
    const { t, simple } = useApp();
    const m = p.model;
    const [view, setView] = useState('map');
    if (!m.ind.regional) return html`<p className="ms-muted">${t('ind.noRegional')}</p>`;
    if (m.regional.status === 'loading') return html`<${StateView} status="loading" />`;
    if (m.regional.status === 'error') return html`<${StateView} status="error" onRetry=${m.regional.retry} />`;
    const showMap = !simple && view === 'map';
    return html`<section className=${'ms-regional ' + (p.className || '')} aria-labelledby=${'rg-' + m.ind.id}>
      <div className="ms-chartblock__head">
        <h2 id=${'rg-' + m.ind.id} className="ms-chartblock__title">${t('ind.regionsTitle', { period: m.regionalPeriod })}</h2>
        ${!simple &&
        html`<div className="ms-tabs" role="group" aria-label=${t('ind.viewAs')}>
          <button type="button" className="ms-tab" aria-pressed=${view === 'map'} onClick=${() => setView('map')}><${Icon} name="map" size=${16} />${t('ind.map')}</button>
          <button type="button" className="ms-tab" aria-pressed=${view === 'table'} onClick=${() => setView('table')}><${Icon} name="table" size=${16} />${t('ind.table')}</button>
        </div>`}
      </div>
      ${showMap
        ? html`<${TileMap} data=${m.regional.data} indicator=${m.ind} selected=${m.regionId} onSelect=${m.setRegionId} label=${t('ind.regionsTitle', { period: m.regionalPeriod })} />`
        : html`<${DataTable} caption=${t('ind.regionsTitle', { period: m.regionalPeriod }) + ', ' + m.unit} columns=${[{ key: 'region', label: t('common.region') }, { key: 'value', label: t('common.value') + ', ' + m.unit, num: true }]} rows=${m.regionalRows.slice().sort((a, b) => b._v - a._v)} />`}
    </section>`;
  }

  function FeedbackButton(p) {
    const { t, toast } = useApp();
    const [open, setOpen] = useState(false);
    const [txt, setTxt] = useState('');
    const [err, setErr] = useState('');
    return html`<${R.Fragment}>
      <button type="button" className=${'ms-btn ' + (p.buttonClass || 'ms-btn--ghost')} onClick=${() => setOpen(true)}><${Icon} name="message" size=${18} /><span>${t('feedback.button')}</span></button>
      <${Modal} open=${open} onClose=${() => setOpen(false)} title=${t('feedback.title')}>
        <form className="ms-form" noValidate onSubmit=${(e) => {
          e.preventDefault();
          if (txt.trim().length < 5) {
            setErr(t('feedback.err'));
            return;
          }
          setErr('');
          setTxt('');
          setOpen(false);
          toast(t('feedback.thanks'), 'good');
        }}>
          <div className=${'ms-field' + (err ? ' has-error' : '')}>
            <label htmlFor="ms-fb">${t('feedback.label')}</label>
            <textarea id="ms-fb" rows="4" maxLength="1000" value=${txt} aria-invalid=${!!err} aria-describedby=${err ? 'ms-fb-err' : undefined} onInput=${(e) => setTxt(e.target.value)} data-autofocus></textarea>
            ${err && html`<p id="ms-fb-err" className="ms-field__err" role="alert">${err}</p>`}
          </div>
          <div className="ms-modal__actions"><button type="submit" className="ms-btn ms-btn--primary">${t('feedback.send')}</button></div>
        </form>
      <//>
    <//>`;
  }
  function LiteBadge() {
    const { lite, t } = useApp();
    if (!lite) return null;
    return html`<span className="ms-litebadge" title=${t('lite.desc')}><${Icon} name="feather" size=${14} />${t('lite.active')}</span>`;
  }

  /* Default page router used by variants: page components passed in */
  function Pages(p) {
    const { route } = useApp();
    if (route.page === 'indicator') return html`<${p.Indicator} key=${route.id || 'cpi'} id=${route.id || 'cpi'} />`;
    if (route.page === 'settings') return html`<${p.Settings} />`;
    if (route.page === 'soon') return html`<${ComingSoon} />`;
    if (route.page === 'learn') return MS.ui.LearnPage ? html`<${MS.ui.LearnPage} key=${route.id || 'all'} id=${route.id || null} />` : html`<${ComingSoon} />`;
    if (route.page === 'services') return p.Services ? html`<${p.Services} key=${route.id || 'all'} id=${route.id || null} />` : html`<${ComingSoon} />`;
    return html`<${p.Home} />`;
  }

  /* Font loader (Google Fonts, demo only) */
  const loadedFonts = {};
  function useFont(href) {
    useEffect(() => {
      if (!href || loadedFonts[href]) return;
      loadedFonts[href] = 1;
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      document.head.appendChild(l);
    }, [href]);
  }

  MS.variants = MS.variants || {};
  MS.registerVariant = (id, def) => (MS.variants[id] = def);
  MS.ui = {
    html, R, useApp, useAsync, useMedia, useFont, AppProvider, Icon, ICONS, NAV, NAV_SETTINGS, isActive,
    SkipLink, DemoBadge, DemoBanner, LogoMark, Popover, LangSwitcher, ThemeQuick, LowVisionButton, Modal, LoginDialog, UserChip,
    Segmented, Switch, LanguageSetting, ThemeSetting, AccentSetting, NumberFormatSetting, DateFormatSetting, LiteSetting, DensitySetting, LowVisionSettings,
    ProfileForm, SavedList, HistoryList, NotificationsList, OrgBlock, StaffBlock, LoginPrompt,
    StateView, Skeleton, ComingSoon, ChangeBadge, Sparkline, Chart, SvgChart, DataTable, ChartBlock, TileMap,
    useIndicatorModel, useHomeModel, SearchBox, DownloadButtons, ShareButton, SaveButton, Select, Filters, RegionalBlock,
    FeedbackButton, LiteBadge, Pages,
  };
  MS.export = { makeCSV, makeXLSX, makePDF, saveFile, slug };
})();
