window.TERRA.pages = window.TERRA.pages || {};
window.TERRA.pages.borrowers = {
  data: [],
  page: 1,
  pageSize: 10,
  total: 0,
  searchQuery: '',
  kycFilter: 'All',
  selectedBorrower: null,

  async init() {
    this.page = window.TERRA.store.state.pagination.borrowers.page;
    this.searchQuery = window.TERRA.store.state.searchQuery || '';
    this.kycFilter = window.TERRA.store.state.filters.borrowers.kyc;
    await this.fetchData();
  },

  async fetchData() {
    try {
      const params = new URLSearchParams({
        Page: this.page,
        PageSize: this.pageSize
      });
      if (this.searchQuery) params.set('Search', this.searchQuery);
      if (this.kycFilter !== 'All') params.set('VerificationStatus', this.kycFilter);

      const res = await window.TERRA.api.get(`/api/clients/?${params}`);
      const parsed = window.TERRA.ui.parseListResponse(res);
      this.data = parsed.items;
      this.total = parsed.total;
    } catch (e) {
      console.error('Fetch borrowers error:', e);
      this.data = [];
      this.total = 0;
    }
  },

  render() {
    const avatar = (b) => b.avatarUrl
      ? `<img src="${window.TERRA.ui.escapeHtml(b.avatarUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;background:var(--bg);border-radius:50%;">${(b.fullName || '?')[0]?.toUpperCase() || '?'}</div>`;

    const kycBadge = (status) => {
      if (status === 'VERIFIED') return '<span class="chip chip-success"><span class="chip-dot"></span>Verified</span>';
      if (status === 'UPDATE REQ' || status === 'REJECTED') return '<span class="chip chip-error"><span class="chip-dot"></span>Update Req</span>';
      return '<span class="chip chip-neutral"><span class="chip-dot"></span>Pending</span>';
    };

    const rows = this.data.map(b => {
      const status = b.verificationStatus || 'PENDING';
      return `
        <tr class="clickable" onclick="window.TERRA.pages.borrowers.viewBorrower(${b.id})">
          <td>
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:40px;height:40px;border-radius:50%;overflow:hidden;border:1px solid var(--border);flex-shrink:0;">${avatar(b)}</div>
              <div>
                <div style="font-weight:700;font-size:14px;">${window.TERRA.ui.escapeHtml(b.fullName || 'Unknown')}</div>
                <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text-muted);">${window.TERRA.ui.escapeHtml(b.employeeNo || b.nationalId || '—')}</div>
              </div>
            </div>
          </td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:12px;">
            <div style="color:var(--text);font-weight:500;">${window.TERRA.ui.escapeHtml(b.phone || '—')}</div>
            <div style="color:var(--text-muted);font-size:11px;">${window.TERRA.ui.escapeHtml(b.email || '—')}</div>
          </td>
          <td>${kycBadge(status)}</td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;">${b.employeeNo || '—'}</td>
          <td style="color:var(--text-secondary);font-weight:500;">${window.TERRA.ui.escapeHtml(b.address || '—')}</td>
          <td style="text-align:right;">
            <button class="icon-btn" onclick="event.stopPropagation();window.TERRA.pages.borrowers.viewBorrower(${b.id})" title="View Details">
              <span class="material-symbols-outlined" style="font-size:20px;">visibility</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    const verified = this.data.filter(b => b.verificationStatus === 'VERIFIED').length;
    const pending = this.data.filter(b => b.verificationStatus === 'PENDING').length;

    return `
      <div class="page-header">
        <div>
          <span class="label-caps">REGISTRY</span>
          <h1>Borrower Directory</h1>
          <p>Central registry for all registered borrowers and their KYC status.</p>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Borrowers <span class="material-symbols-outlined" style="color:var(--primary);">group</span></div>
          <div class="kpi-value">${this.total.toLocaleString()}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Verified <span class="material-symbols-outlined" style="color:var(--success);">verified</span></div>
          <div class="kpi-value success">${verified}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Pending Review <span class="material-symbols-outlined" style="color:var(--warning);">pending_actions</span></div>
          <div class="kpi-value warning">${pending}</div>
        </div>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <div class="search-input">
            <span class="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search borrowers..." value="${window.TERRA.ui.escapeHtml(this.searchQuery)}" oninput="window.TERRA.pages.borrowers.onSearch(this.value)" />
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <select class="filter-select" onchange="window.TERRA.pages.borrowers.onKycFilter(this.value)">
              <option value="All" ${this.kycFilter === 'All' ? 'selected' : ''}>KYC: All</option>
              <option value="Verified" ${this.kycFilter === 'VERIFIED' ? 'selected' : ''}>Verified</option>
              <option value="Pending" ${this.kycFilter === 'PENDING' ? 'selected' : ''}>Pending</option>
              <option value="Rejected" ${this.kycFilter === 'REJECTED' ? 'selected' : ''}>Rejected</option>
            </select>
            <button class="export-btn" onclick="window.TERRA.pages.borrowers.exportData()">
              <span class="material-symbols-outlined" style="font-size:16px;">download</span>Export
            </button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Borrower</th><th>Contact</th><th>KYC Status</th><th>Client No</th><th>Address</th><th style="text-align:right;">Actions</th></tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No borrowers found.</td></tr>'}
            </tbody>
          </table>
        </div>
        ${window.TERRA.ui.renderPagination(this.page, this.total, 'borrowers', 'window.TERRA.pages.borrowers.goPage')}
      </div>
    `;
  },

  goPage(p) {
    this.page = p;
    window.TERRA.store.state.pagination.borrowers.page = p;
    this.refresh();
  },

  onSearch(val) {
    this.searchQuery = val;
    this.page = 1;
    window.TERRA.store.state.searchQuery = val;
    this.refresh();
  },

  onKycFilter(val) {
    this.kycFilter = val;
    window.TERRA.store.state.filters.borrowers.kyc = val;
    this.page = 1;
    this.refresh();
  },

  async refresh() {
    await this.fetchData();
    document.getElementById('screen').innerHTML = this.render();
  },

  async viewBorrower(id) {
    try {
      const b = await window.TERRA.api.get(`/api/clients/${id}`);
      this.selectedBorrower = b;
      const kycBadge = b.verificationStatus === 'VERIFIED'
        ? '<span class="chip chip-success"><span class="chip-dot"></span>Verified</span>'
        : b.verificationStatus === 'REJECTED'
          ? '<span class="chip chip-error"><span class="chip-dot"></span>Rejected</span>'
          : '<span class="chip chip-neutral"><span class="chip-dot"></span>Pending</span>';

      const body = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
          <div style="width:56px;height:56px;border-radius:50%;overflow:hidden;border:2px solid var(--border);background:var(--bg);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;">
            ${(b.fullName || '?')[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 style="font-size:18px;font-weight:700;">${window.TERRA.ui.escapeHtml(b.fullName || 'Unknown')}</h3>
            <p style="font-size:12px;color:var(--text-secondary);font-family:'JetBrains Mono',monospace;">${window.TERRA.ui.escapeHtml(b.employeeNo || b.nationalId || '—')}</p>
            ${kycBadge}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Phone</span>
            <span style="font-weight:600;">${window.TERRA.ui.escapeHtml(b.phone || '—')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Email</span>
            <span style="font-weight:600;">${window.TERRA.ui.escapeHtml(b.email || '—')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Address</span>
            <span style="font-weight:600;max-width:240px;text-align:right;">${window.TERRA.ui.escapeHtml(b.address || '—')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Gender</span>
            <span style="font-weight:600;">${b.gender || '—'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Date of Birth</span>
            <span style="font-weight:600;font-family:'JetBrains Mono',monospace;">${window.TERRA.ui.formatDate(b.dateOfBirth)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;">
            <span style="color:var(--text-secondary);">Registered</span>
            <span style="font-weight:600;font-family:'JetBrains Mono',monospace;">${window.TERRA.ui.formatDate(b.createdAt)}</span>
          </div>
        </div>
      `;
      const footer = `
        <button class="btn btn-secondary" onclick="window.TERRA.ui.closeModal()">Close</button>
        ${b.verificationStatus !== 'VERIFIED' ? `<button class="btn btn-primary" onclick="window.TERRA.pages.borrowers.verifyBorrower(${b.id})">Verify KYC</button>` : ''}
      `;
      window.TERRA.ui.showModal('Borrower Details', body, footer);
    } catch (e) {
      window.TERRA.ui.toast(e.message, 'error');
    }
  },

  async verifyBorrower(id) {
    try {
      await window.TERRA.api.post(`/api/clients/${id}/verify`, {});
      window.TERRA.ui.toast('Borrower KYC verified', 'success');
      window.TERRA.ui.closeModal();
      this.refresh();
    } catch (e) {
      window.TERRA.ui.toast(e.message, 'error');
    }
  },

  openNewBorrowerModal() {
    const body = `
      <form id="new-borrower-form">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input class="form-input" name="fullName" required placeholder="e.g. Jane Doe" />
        </div>
        <div class="form-group">
          <label class="form-label">National ID</label>
          <input class="form-input" name="nationalId" required placeholder="e.g. 12345678" />
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input class="form-input" name="phone" required placeholder="e.g. +254 700 000 000" />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" name="email" type="email" placeholder="e.g. jane@example.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <textarea class="form-textarea" name="address" placeholder="Residential address"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" name="password" type="password" placeholder="Min 8 characters" />
        </div>
      </form>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="window.TERRA.ui.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="btn-save-borrower">Register Borrower</button>
    `;
    window.TERRA.ui.showModal('Register New Borrower', body, footer);
    document.getElementById('btn-save-borrower').addEventListener('click', async () => {
      const form = document.getElementById('new-borrower-form');
      const fd = new FormData(form);
      const data = {
        fullName: fd.get('fullName'),
        nationalId: fd.get('nationalId'),
        phone: fd.get('phone'),
        email: fd.get('email') || '',
        address: fd.get('address') || '',
        password: fd.get('password') || undefined,
        gender: 'Other',
        dateOfBirth: new Date().toISOString().split('T')[0]
      };
      try {
        await window.TERRA.api.post('/api/clients/register', data);
        window.TERRA.ui.toast('Borrower registered successfully', 'success');
        window.TERRA.ui.closeModal();
        this.refresh();
      } catch (e) {
        window.TERRA.ui.toast(e.message, 'error');
      }
    });
  },

  async exportData() {
    try {
      const headers = ['Name', 'National ID', 'Phone', 'Email', 'Address', 'Status'];
      const rows = this.data.map(b => [
        b.fullName || '',
        b.nationalId || '',
        b.phone || '',
        b.email || '',
        b.address || '',
        b.verificationStatus || ''
      ]);
      window.TERRA.ui.downloadCSV('borrowers.csv', headers, rows);
      window.TERRA.ui.toast('Export downloaded', 'success');
    } catch (e) {
      window.TERRA.ui.toast('Export failed: ' + e.message, 'error');
    }
  }
};
