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
    const href = document.querySelector('#navlist li a[href]')?.href || '/';
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
    // Create and insert the button first so updateButton() can set the correct icon immediately.
    btn = createButton();
    // Set the correct icon before inserting to avoid a brief default icon flash.
    updateButton(current());
    if (navlist.nextSibling) navbar.insertBefore(btn, navlist.nextSibling); else navbar.appendChild(btn);
    // Now apply theme state (sets <html data-theme> and updates the button icon).
    apply();
    if (window.matchMedia) {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', apply);
      } else {
        // Fallback without using deprecated addListener
        mql.onchange = apply;
      }
    }
  };
  const destroy = () => {
    if (mql) {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', apply);
      } else if ('onchange' in mql) {
        mql.onchange = null;
      }
    }
    btn?.remove();
  };
  return { init, destroy };
})();

// Init
(() => {
  // Screenshot: keep screenshot image in sync with theme
  const ScreenshotModule = (() => {
    const LIGHT_SRC = 'assets/images/screenshot_light.png';
    const DARK_SRC = 'assets/images/screenshot_dark.png';
    let img, mo, mql;

    const applyScreenshot = () => {
      if (!img) return;
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      const dark = theme === 'dark';
      const next = dark ? DARK_SRC : LIGHT_SRC;
      if (img.getAttribute('src') !== next) {
        img.setAttribute('src', next);
      }
      img.setAttribute('alt', dark ? 'Crypta UI in dark mode' : 'Crypta UI in light mode');
    };

    // Hoisted handlers to reduce nesting depth
    const onThemeMutation = (muts) => {
      if (muts.some(m => m.attributeName === 'data-theme')) applyScreenshot();
    };
    const onToggleClick = (e) => {
      if (e.target && (e.target.classList?.contains('theme-toggle') || e.target.closest?.('.theme-toggle'))) {
        setTimeout(applyScreenshot, 0);
      }
    };
    const onMediaChange = () => setTimeout(applyScreenshot, 0);

    const init = () => {
      img = document.getElementById('screenshot');
      applyScreenshot();
      mo = new MutationObserver(onThemeMutation);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      document.addEventListener('click', onToggleClick);

      try {
        mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
        if (mql && typeof mql.addEventListener === 'function') {
          mql.addEventListener('change', onMediaChange);
        } else if (mql && 'onchange' in mql) {
          mql.onchange = onMediaChange;
        }
      } catch {}
    };

    const destroy = () => {
      try { mo?.disconnect(); } catch {}
      document.removeEventListener('click', onToggleClick);
      if (mql && typeof mql.removeEventListener === 'function') mql.removeEventListener('change', onMediaChange);
      else if (mql && 'onchange' in mql) mql.onchange = null;
    };
    return { init, destroy };
  })();

  // Downloads + external link upgrades
  const DownloadModule = (() => {
    const API = 'https://api.github.com/repos/crypta-network/cryptad/releases/latest';
    let select, button, hint;

    const setExternalTargets = () => {
      const anchors = document.querySelectorAll('a[href^="http"]');
      anchors.forEach(a => {
        try {
          const url = new URL(a.href, location.href);
          if (url.origin !== location.origin) {
            a.target = '_blank';
            const rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
            if (!rel.includes('noopener')) rel.push('noopener');
            if (!rel.includes('noreferrer')) rel.push('noreferrer');
            a.setAttribute('rel', rel.join(' '));
          }
        } catch {}
      });
    };

    const ua = navigator.userAgent.toLowerCase();
    let clientInfo = { os: 'unknown', arch: null, bitness: null };

    const EXT_PRIORITIES = {
      mac: ['.dmg', '.pkg', '.zip'],
      win: ['.exe', '.msi', '.zip'],
      deb: ['.deb'],
      rpm: ['.rpm'],
      nix: ['.flatpak', '.flatpakref', '.snap', '.appimage', '.tar.gz', '.zip'],
      any: ['.zip', '.tar.gz']
    };

    const distroFromUA = () => {
      if (/ubuntu|debian|mint|elementary|pop_os/.test(ua)) return 'deb';
      if (/fedora|rhel|centos|rocky|alma|suse|opensuse/.test(ua)) return 'rpm';
      return null;
    };

    const osFromUA = () => {
      if (/windows/.test(ua)) return 'win';
      if (/mac|darwin/.test(ua)) return 'mac';
      if (/linux|x11/.test(ua)) return 'linux';
      return 'unknown';
    };

    // UA-CH detection for architecture/bitness where supported (Chromium / Edge)
    const detectViaUAClientHints = async () => {
      try {
        if (!navigator.userAgentData || typeof navigator.userAgentData.getHighEntropyValues !== 'function') return null;
        const hints = await navigator.userAgentData.getHighEntropyValues([
          'architecture',
          'bitness',
          'platform',
          'platformVersion'
        ]);
        const arch = (hints.architecture || '').toLowerCase();
        const bits = (hints.bitness || '').toLowerCase();
        let archNorm;
        if (arch === 'arm' && bits === '64') archNorm = 'arm64';
        else if (arch === 'arm' && bits === '32') archNorm = 'armv7';
        else if (arch === 'x86' && bits === '64') archNorm = 'x86_64';
        else if (arch === 'x86' && bits === '32') archNorm = 'i386';
        let osNorm = osFromUA();
        const platformLower = (hints.platform || '').toLowerCase();
        if (platformLower.includes('win')) osNorm = 'win';
        else if (platformLower.includes('mac')) osNorm = 'mac';
        else if (platformLower.includes('linux')) osNorm = 'linux';
        return {
          os: osNorm,
          arch: archNorm,
          bitness: bits || null
        };
      } catch {
        return null;
      }
    };

    const detectClient = async () => {
      const os = osFromUA();
      const ch = await detectViaUAClientHints();
      clientInfo = ch ?? { os, arch: null, bitness: null };
      return clientInfo;
    };

    const fileBase = (input) => {
      try {
        const s = String(input || '');
        const q = s.split('?')[0];
        const h = q.split('#')[0];
        const base = h.substring(h.lastIndexOf('/') + 1);
        return decodeURIComponent(base);
      } catch { return String(input || ''); }
    };

    const RE_TRAILING_EXT = /(\.[a-z0-9]+)$/i;

    const extOf = (name) => {
      const base = fileBase(name).toLowerCase();
      if (base.endsWith('.tar.gz')) return '.tar.gz';
      const m = RE_TRAILING_EXT.exec(base);
      return m ? m[1] : '';
    };

    const ARCH_TOKENS = [
      ['x86_64', 'x86_64'], ['amd64', 'x86_64'], ['x64', 'x86_64'],
      ['aarch64', 'arm64'], ['arm64', 'arm64'],
      ['armv7hl', 'armv7'], ['armv7', 'armv7'], ['armhf', 'armhf'],
      ['i386', 'i386'], ['i686', 'i386'], ['x86', 'i386'],
      ['ppc64le', 'ppc64le'], ['s390x', 's390x'],
      ['universal', 'universal'], ['noarch', 'universal'], ['all', 'universal']
    ];

    const archFromName = (name) => {
      const n = fileBase(name).toLowerCase();
      for (const [needle, norm] of ARCH_TOKENS) {
        if (n.includes(needle)) return norm;
      }
      return null;
    };

    const osFromExt = (ext) => {
      if (ext === '.dmg' || ext === '.pkg') return 'macOS';
      if (ext === '.exe' || ext === '.msi') return 'Windows';
      if (ext === '.deb') return 'Debian/Ubuntu';
      if (ext === '.rpm') return 'Fedora/RHEL/openSUSE';
      if (ext === '.snap') return 'Snap';
      if (ext === '.flatpak' || ext === '.flatpakref') return 'Flatpak';
      if (ext === '.appimage' || ext === '.AppImage') return 'AppImage';
      if (ext === '.jar') return 'Universal';
      if (ext === '.zip' || ext === '.tar.gz') return null;
      return null;
    };

    const osFromName = (name) => {
      const n = fileBase(name).toLowerCase();
      if (/windows|win32|win64/.test(n)) return 'Windows';
      if (/mac|darwin|osx/.test(n)) return 'macOS';
      if (/linux|gnu/.test(n)) return 'Linux';
      return null;
    };

    const extNoteFor = (ext) => {
      if (!ext) return '';
      return ext === '.tar.gz' ? '(.tar.gz)' : `(${ext})`;
    };

    const archLabelFor = (arch, baseOS) => {
      if (!arch) return null;
      if (arch === 'x86_64') return baseOS === 'Windows' ? 'x64' : 'x86_64';
      if (arch === 'arm64') return 'ARM64';
      if (arch === 'i386') return 'x86';
      if (arch === 'universal') return 'universal';
      return arch;
    };

    const composeLabel = (osName, archLabel, extNote) => (
      archLabel ? `${osName} (${archLabel}) ${extNote}` : `${osName} ${extNote}`
    );

    const isSpecialOS = (osName) => osName === 'Snap' || osName === 'Flatpak' || osName === 'AppImage';

    const labelFor = (input) => {
      const name = fileBase(input);
      const ext = extOf(name);
      if (ext === '.jar') return 'Universal (JAR)';

      const baseOS = osFromExt(ext) || osFromName(name) || '';
      const arch = archFromName(name);
      const archLabel = archLabelFor(arch, baseOS);
      const extNote = extNoteFor(ext);

      if (isSpecialOS(baseOS)) return composeLabel(baseOS, archLabel, '');
      if (baseOS) return composeLabel(baseOS, archLabel, extNote);
      return name;
    };

    const isChecksum = (name) => {
      const n = fileBase(name).toLowerCase();
      return n.includes('sha256sum') || n.endsWith('sha256sums.txt') || n.includes('checksum');
    };

    const chooseBest = (assets, info) => {
      const pool = assets.filter(a => !isChecksum(a.name));
      const os = info?.os || osFromUA();
      const distro = distroFromUA();
      if (os === 'win') {
        // Prefer native ARM64 if the browser reports ARM64
        if (info?.arch === 'arm64') {
          const armCand = pool.find(a => (extOf(a.name) === '.exe' || extOf(a.name) === '.msi') && archFromName(a.name) === 'arm64');
          if (armCand) return armCand;
        }
        for (const ext of EXT_PRIORITIES.win) {
          // If we know we're on ARM64, try to avoid x86-only unless no choice
          const match = pool.find(a => extOf(a.name) === ext && (info?.arch !== 'arm64' || archFromName(a.name) !== 'x86_64'))
                    || pool.find(a => extOf(a.name) === ext);
          if (match) return match;
        }
      } else if (os === 'mac') {
        for (const ext of EXT_PRIORITIES.mac) {
          const match = pool.find(a => extOf(a.name) === ext);
          if (match) return match;
        }
      } else if (os === 'linux') {
        if (distro === 'deb') {
          const deb = pool.find(a => extOf(a.name) === '.deb');
          if (deb) return deb;
        }
        if (distro === 'rpm') {
          const rpm = pool.find(a => extOf(a.name) === '.rpm');
          if (rpm) return rpm;
        }
        for (const ext of EXT_PRIORITIES.nix) {
          const match = pool.find(a => extOf(a.name) === ext);
          if (match) return match;
        }
      }
      for (const ext of EXT_PRIORITIES.any) {
        const match = pool.find(a => extOf(a.name) === ext);
        if (match) return match;
      }
      return pool[0] || null;
    };

    const GROUP_ORDER = {
      'Windows': 10,
      'macOS': 20,
      'Debian/Ubuntu': 30,
      'Fedora/RHEL/openSUSE': 40,
      'AppImage': 50,
      'Flatpak': 60,
      'Snap': 70,
      'Universal': 80,
      'Other': 90,
      'Checksum': 95
    };

    const ARCH_ORDER = {
      'x86_64': 0,
      'arm64': 1,
      'i386': 2,
      'armv7': 3,
      'armhf': 4,
      'ppc64le': 5,
      's390x': 6,
      'universal': 7,
      '': 8,
    };

    const extOrderForGroup = (group) => {
      if (group === 'Windows') return EXT_PRIORITIES.win;
      if (group === 'macOS') return EXT_PRIORITIES.mac;
      if (group === 'Debian/Ubuntu') return EXT_PRIORITIES.deb;
      if (group === 'Fedora/RHEL/openSUSE') return EXT_PRIORITIES.rpm;
      if (group === 'AppImage' || group === 'Flatpak' || group === 'Snap') return EXT_PRIORITIES.nix;
      if (group === 'Universal') return ['.jar'];
      return EXT_PRIORITIES.any;
    };

    const metaFor = (a) => {
      const filename = fileBase(a.name || a.browser_download_url || '');
      const ext = extOf(filename);
      let group = osFromExt(ext) || osFromName(filename) || 'Other';
      if (/sha256sum/i.test(filename) || /sha256.*\.txt$/i.test(filename)) group = 'Checksum';
      const arch = archFromName(filename) || '';
      const groupRank = GROUP_ORDER[group] ?? GROUP_ORDER['Other'];
      const archRank = ARCH_ORDER[arch] ?? 9;
      const order = extOrderForGroup(group);
      const extRank = order.includes(ext) ? order.indexOf(ext) : 999;
      const label = labelFor(filename);
      return { a, filename, ext, group, groupRank, arch, archRank, extRank, label };
    };

    const sortAssets = (assets) => assets
      .map(metaFor)
      .sort((x, y) =>
        x.groupRank - y.groupRank ||
        x.archRank - y.archRank ||
        x.extRank - y.extRank ||
        x.label.localeCompare(y.label)
      );

    const populateSelect = (assets) => {
      select.innerHTML = '';
      const usedLabels = new Set();
      const sorted = sortAssets(assets.filter(a => !isChecksum(a.name)));
      sorted.forEach(({ a, label, filename }) => {
        let finalLabel = label;
        if (usedLabels.has(label)) finalLabel = `${label} — ${filename}`;
        usedLabels.add(label);
        const opt = document.createElement('option');
        opt.value = a.browser_download_url;
        opt.textContent = finalLabel;
        select.appendChild(opt);
      });
    };

    const applyChoice = (asset) => {
      if (!asset) return;
      button.href = asset.browser_download_url;
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
      const fullLabel = labelFor(asset.name);
      button.textContent = `Download ${fullLabel}`;
      if (hint) {
        const os = osFromUA();
        if (os === 'linux') {
          hint.innerHTML = `${fullLabel} selected. <span class="release-note">Linux desktops: Ubuntu → Snap; other distros → Flatpak. Linux servers: prefer native packages (.deb for Debian/Ubuntu, .rpm for Fedora/RHEL/openSUSE).</span>`;
        } else {
          hint.textContent = `${fullLabel} selected.`;
        }
      }
      select.value = asset.browser_download_url;
      setExternalTargets();
    };

    const fallback = () => {
      button.href = 'https://github.com/crypta-network/cryptad/releases/latest';
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
      button.textContent = 'Download (Choose from Releases)';
      if (hint) hint.textContent = 'Unable to auto‑detect. Pick from Releases.';
      select.innerHTML = '';
      setExternalTargets();
    };

    const init = () => {
      select = document.getElementById('download-package');
      button = document.getElementById('download-button');
      hint = document.getElementById('download-hint');
      setExternalTargets();
      if (!select || !button) return;

      const assetsPromise = fetch(API, { headers: { 'Accept': 'application/vnd.github+json' } })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
        .then(data => (Array.isArray(data.assets) ? data.assets : []));

      const infoPromise = detectClient();

      Promise.allSettled([assetsPromise, infoPromise]).then(results => {
        const assetsRes = results[0];
        const infoRes = results[1];
        const assets = assetsRes.status === 'fulfilled' ? assetsRes.value : [];
        const info = infoRes.status === 'fulfilled' ? infoRes.value : clientInfo;
        if (!assets.length) return fallback();
        populateSelect(assets);
        applyChoice(chooseBest(assets, info));
      }).catch(() => fallback());

      select.addEventListener('change', (e) => {
        const url = e.target.value;
        const selText = e.target?.options?.[e.target.selectedIndex]?.textContent ?? labelFor(url);
        button.href = url;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.textContent = `Download ${selText}`;
        setExternalTargets();
      });
    };

    const destroy = () => {
      // No persistent listeners aside from the select change bound above; safe to noop here.
    };
    return { init, destroy };
  })();

  // Footer year
  const FooterModule = (() => {
    const init = () => {
      const yearEl = document.getElementById('footer-year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    };
    return { init };
  })();

  const modules = [ViewportModule, MobileMenuModule, LogoModule, ThemeSwitcherModule, ScreenshotModule, DownloadModule, FooterModule];
  const initAll = () => modules.forEach(m => m.init());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll, { once: true });
  else initAll();
})();
