(function() {
  if (!window.TERRA || !window.TERRA.auth || !window.TERRA.api || !window.TERRA.router) {
    const screen = document.getElementById('screen');
    if (screen) {
      screen.innerHTML = '<div class="card" style="text-align:center;padding:60px;color:var(--error);"><h2>App Initialization Failed</h2><p style="color:var(--text-secondary);margin-top:8px;">One or more core modules failed to load.</p><p style="color:var(--text-muted);font-size:12px;margin-top:8px;font-family:JetBrains Mono,monospace;">Check browser console (F12) for details.</p><p style="color:var(--text-muted);font-size:12px;margin-top:4px;">Try: Ctrl+Shift+R (hard refresh)</p></div>';
    }
    return;
  }

  const auth = window.TERRA.auth;
  auth.init();

  if (!auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  window.TERRA.router.init();

  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      window.TERRA.store.setSearch(e.target.value);
      const page = window.TERRA.store.state.currentPage;
      if (window.TERRA.pages[page]?.refresh) {
        window.TERRA.pages[page].refresh();
      }
    });
  }

  const newLoanBtn = document.getElementById('btn-new-loan');
  if (newLoanBtn) {
    newLoanBtn.addEventListener('click', () => {
      if (window.TERRA.pages.loans?.openNewLoanModal) {
        window.TERRA.pages.loans.openNewLoanModal();
      } else {
        window.TERRA.router.navigate('loans');
      }
    });
  }

  const notifBtn = document.getElementById('btn-notifications');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      window.TERRA.ui.toast('Notifications panel coming soon', 'info');
    });
  }
})();
