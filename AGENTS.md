# Agent Notes for This Repository

Scope: Entire repository.

Purpose: Lightweight guidance for agents and contributors working on this static site.

Coding & Content Conventions
- Keep changes minimal and focused; prefer surgical edits to broad refactors.
- Do not commit local notes or environment artifacts. `tmp_changes.md` is for scratch context only.
- HTML: single page `index.html` is the entry point. Favor semantic sections and small, readable inline overrides when necessary.
- CSS: primary stylesheet is `assets/theme.css`. Minor one-off overrides may live inline in `index.html` to avoid theme churn.
- JS: site behavior lives in `assets/script.js` and small inline scripts in `index.html` for page‑specific logic.

Files to Avoid Committing
- `tmp_changes.md` (explicitly ignored).
- Local environment/cache folders (e.g., `.idea/`, `.npm-cache/`).

Build/Run
- This is a static site. Open `index.html` in a browser or serve with any static file server.

Accessibility & UX
- Maintain clear color contrast for buttons/links.
- External links should open in a new tab with `rel="noopener noreferrer"`.
- Prefer concise copy. Use `<details>` to collapse verbose guidance.

Navigation & Theme
- The navbar uses IDs `#navbar` and `#navlist`. Keep them stable for the theme script.
- Theme is toggled via `<html data-theme="light|dark">`; the single screenshot swaps source based on this attribute.

Release Download UI
- The download dropdown is auto‑populated from the latest GitHub release, with clear OS/arch labels, sorted groups, and checksums excluded.
- Linux guidance: Desktops → Ubuntu Snap; other distros Flatpak. Servers → prefer native packages (.deb/.rpm).

Review Checklist (before pushing)
- No accidental additions of `tmp_changes.md` or local IDE caches.
- External links open in new tabs.
- Navbar sits flush at the top; no top gap.
- Single screenshot swaps correctly across themes.

