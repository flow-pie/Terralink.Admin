window.TERRA.pages.officers = {
  data: [],
  page: 1,
  pageSize: 10,
  total: 0,
  searchQuery: '',

  async init() {
    this.searchQuery = window.TERRA.store.state.searchQuery || '';
    await this.fetchData();
  },

  async fetchData() {
    if (!window.TERRA || !window.TERRA.api) {
      console.error('[Officers] API module not available');
      this.data = [];
      this.total = 0;
      return;
    }
    try {
      const params = new URLSearchParams({ Page: this.page, PageSize: this.pageSize });
      if (this.searchQuery) params.set('Search', this.searchQuery);
      const res = await window.TERRA.api.get(`/api/admin/users?role=Loan%20Officer&status=Active&page=${this.page}&pageSize=${this.pageSize}&search=${this.searchQuery ? encodeURIComponent(this.searchQuery) : ''}`);
      if (Array.isArray(res)) {
        this.data = res;
        this.total = res.length;
      } else if (res && Array.isArray(res.items)) {
        this.data = res.items;
        this.total = res.totalCount || res.items.length;
      } else {
        this.data = [];
        this.total = 0;
      }
    } catch (e) {
      console.error('Fetch officers error:', e);
      this.data = [];
      this.total = 0;
    }
  },

  render() {
    const rows = this.data.map(o => {
      const avatar = o.avatarUrl
        ? `<img src="${window.TERRA.ui.escapeHtml(o.avatarUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;background:var(--bg);border-radius:50%;">${(o.username || '?')[0]?.toUpperCase() || '?'}</div>`;

      return `
        <tr class="clickable" onclick="window.TERRA.pages.officers.viewOfficer(${o.userId || 'null'})">
          <td>
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:40px;height:40px;border-radius:50%;overflow:hidden;border:1px solid var(--border);flex-shrink:0;">${avatar}</div>
              <div>
                <div style="font-weight:700;font-size:14px;">${window.TERRA.ui.escapeHtml(o.username || o.fullName || 'Unknown')}</div>
                <div style="font-size:12px;color:var(--text-secondary);">${window.TERRA.ui.escapeHtml(o.roleName || 'Staff')}</div>
              </div>
            </div>
          </td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text-secondary);">${window.TERRA.ui.escapeHtml(o.employeeNo || '—')}</td>
          <td>
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;">${o.email || '—'}</div>
          </td>
          <td style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;">${o.lastLogin ? new Date(o.lastLogin).toLocaleDateString() : 'Never'}</td>
          <td><span class="chip ${o.status === 'Active' ? 'chip-success' : 'chip-neutral'}"><span class="chip-dot"></span>${o.status || 'Active'}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:12px;">${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</span>
            </div>
          </td>
          <td style="text-align:right;">
            <button class="icon-btn" onclick="event.stopPropagation();window.TERRA.pages.officers.viewOfficer(${o.userId || 'null'})" title="View Details">
              <span class="material-symbols-outlined" style="font-size:20px;">visibility</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    const paginationHtml = `
      <div class="pagination">
        <div>Showing <b style="color:var(--text);">${this.total}</b> officers</div>
        <div style="display:flex;align-items:center;gap:4px;">
          <button class="page-btn" disabled><span class="material-symbols-outlined" style="font-size:18px;">chevron_left</span></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" disabled><span class="material-symbols-outlined" style="font-size:18px;">chevron_right</span></button>
        </div>
      </div>
    `;

    return `
      <div class="page-header">
        <div>
          <span class="label-caps">TEAM DIRECTORY</span>
          <h1>Loan Officers</h1>
          <p>Manage staff workload and monitor performance metrics.</p>
        </div>
        <button class="btn btn-primary" onclick="window.TERRA.pages.officers.openNewOfficerModal()">
          <span class="material-symbols-outlined" style="font-size:18px;">person_add</span>Add Officer
        </button>
      </div>

      <div class="kpi-grid bento-2">
        <div class="kpi-card">
          <div class="kpi-label">Total Officers <span class="material-symbols-outlined" style="color:var(--primary);">groups</span></div>
          <div class="kpi-value">${this.data.filter(o => o.roleName === 'Loan Officer').length}</div>
        </div>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <div class="search-input">
            <span class="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search officers..." value="${window.TERRA.ui.escapeHtml(this.searchQuery)}" oninput="window.TERRA.pages.officers.onSearch(this.value)" />
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Officer</th><th>Staff ID</th><th>Email</th><th>Last Login</th><th>Status</th><th>Created At</th><th style="text-align:right;">Actions</th></tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">No officers found.</td></tr>'}
            </tbody>
          </table>
        </div>
        ${paginationHtml}
      </div>
    `;
  },

  onSearch(val) {
    this.searchQuery = val;
    window.TERRA.store.state.searchQuery = val;
    this.refresh();
  },

  async refresh() {
    await this.fetchData();
    document.getElementById('screen').innerHTML = this.render();
  },

  async viewOfficer(id) {
    try {
      const users = await window.TERRA.api.get(`/api/admin/users?search=${id}`);
      const o = users.find(u => u.userId == Number(id));

      if (!o) {
        window.TERRA.ui.toast('Officer not found', 'error');
        return;
      }
      console.log('Officer details:', o);
      const body = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
          <div style="width:56px;height:56px;border-radius:50%;overflow:hidden;border:2px solid var(--primary);background:var(--bg);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;">
            ${(o.username || '?')[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 style="font-size:18px;font-weight:700;">${window.TERRA.ui.escapeHtml(o.username || o.fullName || 'Unknown')}</h3>
            <p style="font-size:12px;color:var(--text-secondary);font-family:'JetBrains Mono',monospace;">${window.TERRA.ui.escapeHtml(o.employeeNo || '—')} • ${window.TERRA.ui.escapeHtml(o.roleName || 'Staff')}</p>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Email</span>
            <span style="font-weight:600;">${window.TERRA.ui.escapeHtml(o.email || '—')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Role</span>
            <span style="font-weight:600;">${window.TERRA.ui.escapeHtml(o.roleName || '—')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Status</span>
            <span style="font-weight:600;">${o.status || '—'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;">
            <span style="color:var(--text-secondary);">Last Login</span>
            <span style="font-weight:600;font-family:'JetBrains Mono',monospace;">${o.lastLogin ? new Date(o.lastLogin).toLocaleString() : 'Never'}</span>
          </div>
        </div>
      `;
      window.TERRA.ui.showModal('Officer Details', body, '<button class="btn btn-secondary" onclick="window.TERRA.ui.closeModal()">Close</button>');
    } catch (e) {
      window.TERRA.ui.toast(e.message, 'error');
    }
  },

  openNewOfficerModal() {
    const body = `
      <form id="new-officer-form">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input class="form-input" name="username" required placeholder="e.g. josto" />
        </div>
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input class="form-input" name="fullName" required placeholder="e.g. Josto" />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" name="email" type="email" required placeholder="e.g. josto@terralink.org" />
        </div>
        <div class="form-group">
          <label class="form-label">Employee No</label>
          <input class="form-input" name="employeeNo" required placeholder="e.g. TL-1234" />
        </div>
        <div class="form-group">
          <label class="form-label">Role</label>
          <select class="form-select" name="roleName">
            <option value="Loan Officer">Loan Officer</option>
           
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" name="password" type="password" required placeholder="Min 8 characters" />
        </div>
      </form>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="window.TERRA.ui.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="btn-save-officer">Register Officer</button>
    `;
    window.TERRA.ui.showModal('Register New Loan Officer', body, footer);
    document.getElementById('btn-save-officer').addEventListener('click', async () => {
      const form = document.getElementById('new-officer-form');
      const fd = new FormData(form);
      const data = {
        username: fd.get('username'),
        fullName: fd.get('fullName'),
        email: fd.get('email'),
        employeeNo: fd.get('employeeNo'),
        roleName: fd.get('roleName'),
        password: fd.get('password')
      };
      try {
        await window.TERRA.api.post('/api/admin/users', data);
        window.TERRA.ui.toast('Loan officer registered successfully', 'success');
        window.TERRA.ui.closeModal();
        this.refresh();
      } catch (e) {
        window.TERRA.ui.toast(e.message, 'error');
      }
    });
  }
}