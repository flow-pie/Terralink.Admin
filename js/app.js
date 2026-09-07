(function() {
  console.log('[App] Starting...');
  console.log('[App] window.TERRA exists:', !!window.TERRA);
  console.log('[App] window.TERRA.config:', !!window.TERRA?.config);
  console.log('[App] window.TERRA.api:', !!window.TERRA?.api);
  console.log('[App] window.TERRA.auth:', !!window.TERRA?.auth);
  console.log('[App] window.TERRA.router:', !!window.TERRA?.router);
  console.log('[App] window.TERRA.ui:', !!window.TERRA?.ui);
  console.log('[App] window.TERRA.pages:', !!window.TERRA?.pages);

  if (!window.TERRA || !window.TERRA.auth || !window.TERRA.api || !window.TERRA.router) {
    var screen = document.getElementById('screen');
    if (screen) {
      screen.innerHTML = '<div class="card" style="text-align:center;padding:60px;color:var(--error);"><h2>App Initialization Failed</h2><p style="color:var(--text-secondary);margin-top:8px;">One or more core modules failed to load.</p><p style="color:var(--text-muted);font-size:12px;margin-top:8px;font-family:JetBrains Mono,monospace;">Check browser console (F12) for details.</p><p style="color:var(--text-muted);font-size:12px;margin-top:4px;">Try: Ctrl+Shift+R (hard refresh)</p></div>';
    }
    console.error('[App] Missing modules:', {
      terra: !!window.TERRA,
      config: !!window.TERRA?.config,
      api: !!window.TERRA?.api,
      auth: !!window.TERRA?.auth,
      router: !!window.TERRA?.router,
      ui: !!window.TERRA?.ui,
      pages: !!window.TERRA?.pages
    });
    return;
  }

  const auth = window.TERRA.auth;

  // Restore session from localStorage before checking auth state
  if (typeof auth.init === 'function') {
    auth.init();
  }

  if (!auth.isAuthenticated()) {
    console.log('[App] Not authenticated, redirecting to login');
    window.location.href = 'login.html';
    return;
  }

  console.log('[App] Authenticated, loading UI...');
  function updateProfileUI() {
    const user = auth.getUser();
    console.log('[App] User profile:', user);
    const avatarUrl = user?.avatarUrl || window.TERRA.config.defaultAvatar;
    document.getElementById('sidebar-avatar').src = avatarUrl;
    document.getElementById('profile-avatar').src = avatarUrl;
    document.getElementById('sidebar-name').textContent = user?.name || 'Administrator';
    document.getElementById('profile-name').textContent = user?.name || 'Administrator';
    document.getElementById('sidebar-role').textContent = user?.role || 'Admin';
    document.getElementById('profile-role').textContent = user?.role || 'Admin';
  }

  updateProfileUI();

  console.log('[App] Initializing router...');
  window.TERRA.router.init();
  console.log('[App] Router initialized');

  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      window.TERRA.store.setSearch(e.target.value);
      const currentPage = window.TERRA.store.state.currentPage;
      if (window.TERRA.pages[currentPage]?.refresh) {
        window.TERRA.pages[currentPage].refresh();
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

  const profileBtn = document.getElementById('btn-profile');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      window.TERRA.router.navigate('settings');
    });
  }

  console.log('[App] Ready');
})();