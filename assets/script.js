/**
 * Minimal site script for crypta-network.github.io
 * Modules kept: Viewport, Mobile Menu, Logo, Theme Switcher
 */

// Viewport: ensure responsive meta exists
const ViewportModule = (() => {
  const init = () => {
    try {
      if (!document.querySelector('meta[name="viewport"]')) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1';
        document.head.appendChild(meta);
      }
    } catch {}
  };
  return { init };
})();

// Mobile menu: simple hamburger toggle under 991px
const MobileMenuModule = (() => {
  const ACTIVE = 'active';
  const BREAKPOINT = 991;
  let navbar, navlist, burger;

  const createBurger = () => {
    const el = document.createElement('div');
    el.id = 'hamburger-box';
    el.innerHTML = '<span></span><span></span><span></span><span></span>';
    el.addEventListener('click', () => {
      navlist?.classList.toggle(ACTIVE);
      el.classList.toggle(ACTIVE);
    });
    return el;
  };

  const attach = () => {
    if (!navbar || burger?.isConnected) return;
    burger = createBurger();
    navbar.appendChild(burger);
  };

  const detach = () => {
    navlist?.classList.remove(ACTIVE);
    burger?.classList.remove(ACTIVE);
    burger?.remove();
    burger = null;
  };

  const onResize = () => (window.innerWidth < BREAKPOINT ? attach() : detach());

  const init = () => {
    navbar = document.getElementById('navbar');
    navlist = document.getElementById('navlist');
    if (!navbar || !navlist) return;
    onResize();
    window.addEventListener('resize', onResize);
  };

  const destroy = () => window.removeEventListener('resize', onResize);
  return { init, destroy };
})();

// Logo: insert clickable logo at start of navbar
const LogoModule = (() => {
  let logo;
  const init = () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const href = (document.querySelector('#navlist li a[href]') || {}).href || '/';
    logo = document.createElement('a');
    logo.className = 'logo-link';
    logo.href = href;
    logo.title = 'Browse Crypta';
    navbar.insertBefore(logo, navbar.firstChild);
  };
  const destroy = () => logo?.remove();
  return { init, destroy };
})();

// Theme switcher: toggles <html data-theme> and inserts a button in navbar
const ThemeSwitcherModule = (() => {
  const STORAGE_KEY = 'theme-mode'; // 'light' | 'dark' | null (auto)
  let btn, navbar, mql;

  const save = (mode) => {
    try {
      if (mode === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  };
  const read = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  };
  const browserPrefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = () => (read() || (browserPrefersDark() ? 'dark' : 'light'));

  const apply = () => {
    const theme = current();
    document.documentElement.setAttribute('data-theme', theme);
    updateButton(theme);
  };

  const updateButton = (theme) => {
    if (!btn) return;
    const opposite = theme === 'dark' ? 'light' : 'dark';
    btn.title = `Switch to ${opposite} theme`;
    btn.setAttribute('aria-label', 'Toggle theme');
    // Set icon to indicate the action (what you will switch to)
    btn.setAttribute('data-icon', opposite);
  };

  const toggle = () => {
    const theme = current();
    const next = theme === 'dark' ? 'light' : 'dark';
    // Switch to auto if matches browser preference
    if ((next === 'dark' && browserPrefersDark()) || (next === 'light' && !browserPrefersDark())) {
      save(null);
    } else {
      save(next);
    }
    apply();
  };

  const createButton = () => {
    const b = document.createElement('button');
    b.className = 'theme-toggle';
    const icon = document.createElement('span');
    icon.className = 'theme-toggle-icon';
    b.appendChild(icon);
    b.addEventListener('click', toggle);
    return b;
  };

  const init = () => {
    navbar = document.getElementById('navbar');
    const navlist = document.getElementById('navlist');
    if (!navbar || !navlist) return;
    apply();
    btn = createButton();
    if (navlist.nextSibling) navbar.insertBefore(btn, navlist.nextSibling); else navbar.appendChild(btn);
    if (window.matchMedia) {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
      (mql.addEventListener ? mql.addEventListener('change', apply) : mql.addListener(apply));
    }
  };
  const destroy = () => {
    if (mql) (mql.removeEventListener ? mql.removeEventListener('change', apply) : mql.removeListener(apply));
    btn?.remove();
  };
  return { init, destroy };
})();

// Init
(() => {
  const modules = [ViewportModule, MobileMenuModule, LogoModule, ThemeSwitcherModule];
  const initAll = () => modules.forEach(m => m.init());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll, { once: true });
  else initAll();
})();
