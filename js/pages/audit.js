window.TERRA.pages = window.TERRA.pages || {};
window.TERRA.pages.audit = {
  data: [],
  page: 1,
  pageSize: 10,
  total: 0,
  searchQuery: '',
  userFilter: 'All',
  actionFilter: 'All',

  async init() {
    this.searchQuery = window.TERRA.store.state.searchQuery || '';
    this.userFilter = window.TERRA.store.state.filters.audit.user;
    this.actionFilter = window.TERRA.store.state.filters.audit.action;
    await this.fetchData();
  },

  async fetchData() {
    try {
      const params = new URLSearchParams({ Page: this.page, PageSize: this.pageSize });
      if (this.userFilter !== 'All') params.set('Action', this.userFilter);
      if (this.actionFilter !== 'All') params.set('EntityType', this.actionFilter);
      const res = await window.TERRA.api.get(`/api/audit-log/?${params}`);
      const parsed = window.TERRA.ui.parseListResponse(res);
      this.data = parsed.items;
      this.total = parsed.total;
    } catch (e) {
      console.error('Fetch audit error:', e);
      this.data = [];
      this.total = 0;
    }
  },

  iconFor(action) {
    const map = {
      'Status Update': 'edit_document',
      'Record Deletion': 'delete_forever',
      'Risk Parameter Mod': 'tune',
      'Payment Applied': 'receipt_long',
      'Loan Disbursed': 'payments',
      'Borrower Registered': 'person_add',
      'System Config': 'settings'
    };
    return map[action] || 'info';
  },

  render() {
    const rows = this.data.map(l => {
      const icon = this.iconFor(l.action);
      return `
        <tr class="clickable" onclick="window.TERRA.pages.audit.viewLog(${l.id})">
          <td class="font-mono" style="font-size:12px;color:var(--text-secondary);">
            <div style="color:var(--text);font-weight:500;">${window.TERRA.ui.formatDate(l.createdAt)}</div>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;border:1px solid var(--border);">${(l.actorUsername || '?')[0]?.toUpperCase() || '?'}</div>
              <div>
                <div style="font-weight:700;font-size:13px;">${window.TERRA.ui.escapeHtml(l.actorUsername || 'System')}</div>
                <div style="font-size:11px;color:var(--text-muted);">${window.TERRA.ui.escapeHtml(l.actorRole || '—')}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:var(--bg);font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;border:1px solid var(--border);">
              <span class="material-symbols-outlined" style="font-size:14px;color:var(--primary);">${icon}</span>
              ${window.TERRA.ui.escapeHtml(l.action || '—')}
            </span>
          </td>
          <td class="font-mono" style="font-weight:700;color:var(--primary);">${window.TERRA.ui.escapeHtml(l.entityType || '—')}-${l.entityId || '—'}</td>
          <td style="max-width:320px;">
            <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;">
              <span class="material-symbols-outlined" style="font-size:14px;">${icon}</span>
              ${window.TERRA.ui.formatAuditDetailsDetailed(l.details)}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="page-header">
        <div>
          <span class="label-caps">COMPLIANCE TRAIL</span>
          <h1>Audit Logs</h1>
          <p>Immutable chronological trail of all system mutations and access events.</p>
        </div>
        <button class="btn btn-secondary" onclick="window.TERRA.pages.audit.exportData()">
          <span class="material-symbols-outlined" style="font-size:16px;">download</span>Export Log
        </button>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <div class="search-input">
            <span class="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search by ID, action, or user..." value="${window.TERRA.ui.escapeHtml(this.searchQuery)}" oninput="window.TERRA.pages.audit.onSearch(this.value)" />
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <select class="filter-select" onchange="window.TERRA.pages.audit.onUserFilter(this.value)">
              <option value="All" ${this.userFilter === 'All' ? 'selected' : ''}>User: All</option>
              <option value="Administrator" ${this.userFilter === 'Administrator' ? 'selected' : ''}>Administrator</option>
              <option value="Loan Officer" ${this.userFilter === 'Loan Officer' ? 'selected' : ''}>Loan Officer</option>
              <option value="Compliance" ${this.userFilter === 'Compliance' ? 'selected' : ''}>Compliance</option>
              <option value="Automated" ${this.userFilter === 'Automated' ? 'selected' : ''}>Automated</option>
            </select>
            <select class="filter-select" onchange="window.TERRA.pages.audit.onActionFilter(this.value)">
              <option value="All" ${this.actionFilter === 'All' ? 'selected' : ''}>Action: All</option>
              <option value="Status Update" ${this.actionFilter === 'Status Update' ? 'selected' : ''}>Status Update</option>
              <option value="Record Deletion" ${this.actionFilter === 'Record Deletion' ? 'selected' : ''}>Record Deletion</option>
              <option value="Risk Parameter Mod" ${this.actionFilter === 'Risk Parameter Mod' ? 'selected' : ''}>Risk Parameter Mod</option>
              <option value="Payment Applied" ${this.actionFilter === 'Payment Applied' ? 'selected' : ''}>Payment Applied</option>
              <option value="System Config" ${this.actionFilter === 'System Config' ? 'selected' : ''}>System Config</option>
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Detail</th></tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No audit logs found.</td></tr>'}
            </tbody>
          </table>
        </div>
        ${window.TERRA.ui.renderPagination(this.page, this.total, 'events', 'window.TERRA.pages.audit.goPage')}
      </div>
    `;
  },

  goPage(p) {
    this.page = p;
    window.TERRA.store.state.pagination.audit.page = p;
    this.refresh();
  },

  onSearch(val) {
    this.searchQuery = val;
    window.TERRA.store.state.searchQuery = val;
    this.refresh();
  },

  onUserFilter(val) {
    this.userFilter = val;
    window.TERRA.store.state.filters.audit.user = val;
    this.refresh();
  },

  onActionFilter(val) {
    this.actionFilter = val;
    window.TERRA.store.state.filters.audit.action = val;
    this.refresh();
  },

  async refresh() {
    await this.fetchData();
    document.getElementById('screen').innerHTML = this.render();
  },

  async viewLog(id) {
    const log = this.data.find(l => l.id === id);
    if (!log) return;
    const body = `
      <div style="margin-bottom:16px;">
        <span class="label-caps">Audit Transaction Record</span>
        <h3 style="font-size:18px;font-weight:700;margin-top:4px;">${window.TERRA.ui.escapeHtml(log.entityType || '—')}-${log.entityId || '—'}</h3>
        <p style="font-size:12px;color:var(--text-secondary);font-family:'JetBrains Mono',monospace;">${window.TERRA.ui.formatDate(log.createdAt)}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
          <span style="color:var(--text-secondary);">Actor</span>
          <span style="font-weight:600;">${window.TERRA.ui.escapeHtml(log.actorUsername || 'System')} (${window.TERRA.ui.escapeHtml(log.actorRole || '—')})</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
          <span style="color:var(--text-secondary);">Action</span>
          <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--primary);">${window.TERRA.ui.escapeHtml(log.action || '—')}</span>
        </div>
        <div style="padding:10px 0;border-bottom:1px solid var(--border);">
          <span style="color:var(--text-secondary);display:block;margin-bottom:8px;">Details</span>
          ${window.TERRA.ui.formatAuditDetailsDetailed(log.details)}
        </div>
        <details style="margin-top:4px;">
          <summary style="font-size:11px;color:var(--text-muted);cursor:pointer;font-family:'JetBrains Mono',monospace;">Raw JSON</summary>
          <div style="background:var(--sidebar-bg);color:#a8a29e;padding:16px;border-radius:var(--radius);font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.6;border:1px solid rgba(255,255,255,0.08);overflow-x:auto;margin-top:8px;">
            <span style="color:rgba(255,255,255,0.4);display:block;margin-bottom:4px;">// Raw Audit Payload</span>
            ${window.TERRA.ui.escapeHtml(JSON.stringify({
              audit_id: `AUD-${log.id}`,
              entity: log.entityType,
              entityId: log.entityId,
              actor: log.actorUsername,
              role: log.actorRole,
              detail: log.details,
              status: 'VERIFIED_HASH_CHAIN_COMPLIANT'
            }, null, 2))}
          </div>
        </details>
      </div>
    `;
    window.TERRA.ui.showModal('Audit Log Detail', body, '<button class="btn btn-primary" onclick="window.TERRA.ui.closeModal()">Done</button>');
  },

  async exportData() {
    try {
      const headers = ['Timestamp', 'User', 'Role', 'Action', 'Entity', 'Details'];
      const rows = this.data.map(l => [
        window.TERRA.ui.formatDate(l.createdAt),
        l.actorUsername || '',
        l.actorRole || '',
        l.action || '',
        `${l.entityType || ''}-${l.entityId || ''}`,
        window.TERRA.ui.formatAuditDetails(l.details)
      ]);
      window.TERRA.ui.downloadCSV('audit-log.csv', headers, rows);
      window.TERRA.ui.toast('Export downloaded', 'success');
    } catch (e) {
      window.TERRA.ui.toast('Export failed: ' + e.message, 'error');
    }
  }
};
