window.TERRA.router = {
  routes: {
    'dashboard': { title: 'Dashboard', icon: 'dashboard' },
    'borrowers': { title: 'Borrowers', icon: 'group' },
    'officers': { title: 'Loan Officers', icon: 'badge' },
    'loans': { title: 'Loans', icon: 'payments' },
    'repayments': { title: 'Repayments', icon: 'receipt_long' },
    'audit': { title: 'Audit Logs', icon: 'history' }
  },

  navigate(page) {
    window.TERRA.store.setPage(page);
    window.location.hash = `#/${page}`;
    this.renderSidebar();
    this.loadPage(page);
  },

  renderSidebar() {
    const current = window.TERRA.store.state.currentPage;
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = Object.entries(this.routes).map(([key, route]) => {
      const active = current === key;
      const fillClass = active ? 'fill-1' : '';
      return `
        <a class="nav-item ${active ? 'active' : ''}" data-page="${key}">
          <div class="nav-item-left">
            <span class="material-symbols-outlined nav-item-icon ${fillClass}">${route.icon}</span>
            <span>${route.title}</span>
          </div>
        </a>
      `;
    }).join('');

    nav.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => this.navigate(el.dataset.page));
    });
  },

  errorPage(title, message) {
    return `
      <div class="card" style="text-align:center;padding:60px;">
        <span class="material-symbols-outlined" style="font-size:48px;color:var(--error);">error</span>
        <h2 style="margin-top:16px;">Failed to load ${title}</h2>
        <p style="color:var(--text-secondary);margin-top:8px;">${message}</p>
        <p style="color:var(--text-muted);font-size:12px;margin-top:8px;font-family:'JetBrains Mono',monospace;">Check browser console (F12) for details.</p>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="window.TERRA.router.retry('${title.replace(/'/g, "\\'")}')">Retry</button>
      </div>
    `;
  },

  retry(page) {
    this.navigate(page);
  },

  async loadPage(page) {
    const screen = document.getElementById('screen');
    const title = this.routes[page]?.title || page;
    document.title = `TerraLink Admin - ${title}`;

    const loader = document.getElementById('loading-indicator');
    if (loader) loader.remove();

    const pages = window.TERRA.pages;
    if (!pages[page]) {
      screen.innerHTML = `<div class="card" style="text-align:center;padding:60px;"><span class="material-symbols-outlined" style="font-size:48px;color:var(--text-muted);">construction</span><h2 style="margin-top:16px;">Page Coming Soon</h2></div>`;
      return;
    }

    try {
      if (pages[page].init) await pages[page].init();
      const html = pages[page].render();
      if (!html || html.trim().length === 0) {
        throw new Error('Page rendered empty content');
      }
      screen.innerHTML = html;
      if (pages[page].afterRender) pages[page].afterRender();
    } catch (err) {
      console.error(`[Router] Failed to load page: ${page}`, err);
      screen.innerHTML = this.errorPage(title, window.TERRA.ui.escapeHtml(err.message));
    }
  },

  init() {
    const hash = window.location.hash.replace('#/', '') || 'dashboard';
    const page = this.routes[hash] ? hash : 'dashboard';
    this.renderSidebar();
    this.navigate(page);
    window.addEventListener('hashchange', () => {
      const p = window.location.hash.replace('#/', '') || 'dashboard';
      if (this.routes[p]) this.navigate(p);
    });
  }
};
