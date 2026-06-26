;(() => {
  'use strict';
  const CC = {
    v: '0.1.0',
    cfg: {
      policy_version: '2026-06-01',
      categories: ['necessary', 'analytics', 'marketing', 'preferences'],
      lang: 'auto',
      localesPath: './locales/',
      layout: 'banner', // banner | modal
      position: 'bottom', // bottom | top | center
      expiryDays: 365
    },
    state: { locale: {}, consent: null, el: null },

    init(cfg = {}) {
      this.cfg = {...this.cfg,...cfg};
      this.state.consent = this.getConsent();
      this.state.consent? this.run() : this.loadLocale().then(() => this.render());
    },

    getConsent() {
      try {
        const c = JSON.parse(localStorage.getItem('cc_consent') || 'null');
        if (!c || c.ver!== this.cfg.policy_version) return null;
        if (Date.now() - c.ts > this.cfg.expiryDays * 864e5) return null;
        return c;
      } catch(e) { return null }
    },

    async loadLocale() {
      let l = this.cfg.lang === 'auto'? (navigator.language || 'en').slice(0,2) : this.cfg.lang;
      const fetchL = async lang => {
        try { const r = await fetch(`${this.cfg.localesPath}${lang}.json`); return r.ok? r.json() : null; }
        catch(e) { return null; }
      };
      this.state.locale = await fetchL(l) || await fetchL('en') || {};
    },

    render() {
      if (document.getElementById('cc-main')) return;
      const t = this.state.locale;
      const p = this.cfg.position === 'center'? 'top:50%;left:50%;transform:translate(-50%,-50%);max-width:500px;'
            : `${this.cfg.position}:0;left:0;right:0;`;

      this.state.el = document.createElement('div');
      this.state.el.id = 'cc-main';
      this.state.el.innerHTML = `
        <div style="position:fixed;${p}background:#1a1a1a;color:#eee;padding:20px;
          font:14px/1.6 system-ui;z-index:2147483647;box-shadow:0 0 30px rgba(0,0,0,.5)" role="dialog">
          <p style="margin:0 0 16px">${t.banner?.description || 'We use cookies to improve your experience.'}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button data-cc="accept" style="background:#0a7;border:0;color:#000;padding:10px 16px;
              border-radius:4px;cursor:pointer;font-weight:600">${t.banner?.acceptAll || 'Accept all'}</button>
            <button data-cc="reject" style="background:#444;border:0;color:#fff;padding:10px 16px;
              border-radius:4px;cursor:pointer">${t.banner?.rejectAll || 'Reject non-essential'}</button>
            <button data-cc="manage" style="background:transparent;border:1px solid #666;color:#ccc;
              padding:10px 16px;border-radius:4px;cursor:pointer">${t.banner?.manage || 'Customize'}</button>
          </div>
          <div id="cc-modal" style="display:none;margin-top:16px;border-top:1px solid #333;padding-top:16px">
            ${this.cfg.categories.filter(c=>c!=='necessary').map(cat => `
              <label style="display:flex;align-items:center;margin:8px 0;cursor:pointer">
                <input type="checkbox" data-cat="${cat}" style="margin-right:8px">
                <span><b>${t.categories?.[cat]?.name || cat}</b>: ${t.categories?.[cat]?.description || ''}</span>
              </label>
            `).join('')}
            <button data-cc="save" style="background:#0a7;border:0;color:#000;padding:10px 16px;
              border-radius:4px;cursor:pointer;margin-top:8px">${t.modal?.save || 'Save preferences'}</button>
          </div>
        </div>`;

      document.body.appendChild(this.state.el);
      this.state.el.onclick = e => {
        const a = e.target.dataset.cc;
        if (a === 'accept') this.save(['analytics','marketing','preferences']);
        if (a === 'reject') this.save([]);
        if (a === 'manage') this.state.el.querySelector('#cc-modal').style.display = 'block';
        if (a === 'save') {
          const cats = [...this.state.el.querySelectorAll('input:checked')].map(i => i.dataset.cat);
          this.save(cats);
        }
      };
    },

    save(categories) {
      this.state.consent = { categories, ts: Date.now(), ver: this.cfg.policy_version };
      try { localStorage.setItem('cc_consent', JSON.stringify(this.state.consent)); } catch(e) {}
      this.state.el?.remove();
      this.run();
    },

    run() {
      const allowed = this.state.consent?.categories || [];
      document.querySelectorAll('script[type="text/plain"][data-category]').forEach(old => {
        if (!allowed.includes(old.dataset.category)) return;
        const s = document.createElement('script');
        old.dataset.src? s.src = old.dataset.src : s.textContent = old.textContent;
        [...old.attributes].forEach(a =>!['type','data-category','data-src'].includes(a.name) && s.setAttribute(a.name, a.value));
        old.replaceWith(s);
      });
      window.dispatchEvent(new CustomEvent('cc:consent', {detail: this.state.consent}));
      this.exposeAPI();
    },

    exposeAPI() {
      window.CookieConsent = {
        hasConsent: cat =>!cat?!!this.state.consent : this.state.consent?.categories.includes(cat),
        show: () => { localStorage.removeItem('cc_consent'); this.state.consent = null; this.render(); },
        version: this.v
      };
    }
  };

  const s = document.currentScript;
  if (s) {
    let cfg = {};
    try { cfg = s.dataset.config? JSON.parse(s.dataset.config) : {}; } catch(e) {}
    const start = () => CC.init(cfg);
    document.readyState === 'loading'? document.addEventListener('DOMContentLoaded', start) : start();
  }
})();