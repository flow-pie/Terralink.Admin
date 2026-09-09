window.TERRA.pages = window.TERRA.pages || {};
window.TERRA.pages.loans = {
  data: [],
  page: 1,
  pageSize: 10,
  total: 0,
  searchQuery: '',
  statusFilter: 'All',

  async init() {
    this.searchQuery = window.TERRA.store.state.searchQuery || '';
    this.statusFilter = window.TERRA.store.state.filters.loans.status;
    await this.fetchData();
  },

  async fetchData() {
    try {
      const params = new URLSearchParams({ Page: this.page, PageSize: this.pageSize });
      if (this.searchQuery) params.set('Search', this.searchQuery);
      if (this.statusFilter !== 'All') params.set('Status', this.statusFilter);
      const res = await window.TERRA.api.get(`/api/loans/?${params}`);
      const parsed = window.TERRA.ui.parseListResponse(res);
      this.data = parsed.items;
      this.total = parsed.total;
    } catch (e) {
      console.error('Fetch loans error:', e);
      this.data = [];
      this.total = 0;
    }
  },

  render() {
    const rows = this.data.map(l => `
      <tr class="clickable" onclick="window.TERRA.pages.loans.viewLoan(${l.id})">
        <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--primary);">${window.TERRA.ui.escapeHtml(l.loanNo || l.referenceNo || `#${l.id}`)}</td>
        <td>
          <div style="font-weight:700;font-size:14px;">${window.TERRA.ui.escapeHtml(l.clientFullName || 'Unknown')}</div>
          <div style="font-size:12px;color:var(--text-secondary);">${l.loanProductName || '—'}</div>
        </td>
        <td style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:14px;">${window.TERRA.ui.formatCurrency(l.approvedAmount || l.balance)}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text-secondary);">${window.TERRA.ui.formatCurrency(l.penaltiesAccrued || 0)}</td>
        <td>${window.TERRA.ui.statusBadge(l.status || 'Pending')}</td>
        <td style="color:var(--text-secondary);font-weight:500;">${window.TERRA.ui.formatCurrency(l.outstandingAmount || 0)}</td>
        <td style="text-align:right;">
          <button class="icon-btn" onclick="event.stopPropagation();window.TERRA.pages.loans.viewLoan(${l.id})" title="View Details">
            <span class="material-symbols-outlined" style="font-size:20px;">visibility</span>
          </button>
        </td>
      </tr>
    `).join('');

    const totalDisbursed = this.data.reduce((a, l) => a + (l.approvedAmount || 0), 0);
    const totalBalance = this.data.reduce((a, l) => a + (l.balance || 0), 0);
    const avgProgress = this.data.length > 0
      ? Math.round(this.data.reduce((a, l) => a + (l.repaymentProgress || 0), 0) / this.data.length) + '%'
      : '—';

    return `
      <div class="page-header">
        <div>
          <span class="label-caps">FACILITIES</span>
          <h1>Loans Portfolio</h1>
          <p>Overview of active facilities, disbursement pipeline, and repayment health.</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-secondary" onclick="window.TERRA.pages.loans.exportData()">
            <span class="material-symbols-outlined" style="font-size:16px;">download</span>Export
          </button>
          <button class="btn btn-primary" onclick="window.TERRA.pages.loans.openNewLoanModal()">
            <span class="material-symbols-outlined" style="font-size:16px;">add</span>New Loan
          </button>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Disbursed <span class="material-symbols-outlined" style="color:var(--primary);">account_balance_wallet</span></div>
          <div class="kpi-value">${window.TERRA.ui.formatCurrency(totalDisbursed)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Outstanding Principal <span class="material-symbols-outlined" style="color:var(--warning);">pending</span></div>
          <div class="kpi-value warning">${window.TERRA.ui.formatCurrency(totalBalance)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Collection Rate <span class="material-symbols-outlined" style="color:var(--success);">task_alt</span></div>
          <div class="kpi-value success">${avgProgress}</div>
        </div>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <div class="search-input">
            <span class="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search loans..." value="${window.TERRA.ui.escapeHtml(this.searchQuery)}" oninput="window.TERRA.pages.loans.onSearch(this.value)" />
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <select class="filter-select" onchange="window.TERRA.pages.loans.onStatusFilter(this.value)">
              <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>Status: All</option>
              <option value="Active" ${this.statusFilter === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Pending" ${this.statusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Approved" ${this.statusFilter === 'Approved' ? 'selected' : ''}>Approved</option>
              <option value="Defaulted" ${this.statusFilter === 'Defaulted' ? 'selected' : ''}>Defaulted</option>
              <option value="Closed" ${this.statusFilter === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Loan ID</th><th>Borrower</th><th>Amount</th><th>Penalties Accrued</th><th>Status</th><th>Outstanding Amount</th><th style="text-align:right;">Actions</th></tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">No loans found.</td></tr>'}
            </tbody>
          </table>
        </div>
        ${window.TERRA.ui.renderPagination(this.page, this.total, 'loans', 'window.TERRA.pages.loans.goPage')}
      </div>
    `;
  },

  goPage(p) {
    this.page = p;
    window.TERRA.store.state.pagination.loans.page = p;
    this.refresh();
  },

  onSearch(val) {
    this.searchQuery = val;
    window.TERRA.store.state.searchQuery = val;
    this.refresh();
  },

  onStatusFilter(val) {
    this.statusFilter = val;
    window.TERRA.store.state.filters.loans.status = val;
    this.page = 1;
    this.refresh();
  },

  async refresh() {
    await this.fetchData();
    document.getElementById('screen').innerHTML = this.render();
  },

  async viewLoan(id) {
    try {
      const l = await window.TERRA.api.get(`/api/loans/${id}`);
      const body = `
        <div style="margin-bottom:16px;">
          <h3 style="font-size:18px;font-weight:700;">${window.TERRA.ui.escapeHtml(l.loanNo || `#${l.id}`)}</h3>
          <p style="font-size:13px;color:var(--text-secondary);">${window.TERRA.ui.escapeHtml(l.clientFullName || 'Unknown')}</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px;background:var(--bg);border-radius:var(--radius);margin-bottom:16px;">
          <div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Principal</div>
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:16px;">${window.TERRA.ui.formatCurrency(l.approvedAmount)}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Balance</div>
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:16px;">${window.TERRA.ui.formatCurrency(l.balance)}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Repayment</div>
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:16px;">${window.TERRA.ui.formatCurrency(l.repaymentAmount)}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Progress</div>
            <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:16px;">${l.repaymentProgress || 0}%</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Status</span>
            ${window.TERRA.ui.statusBadge(l.status || 'Pending')}
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Interest Rate</span>
            <span style="font-weight:600;">${l.interestRate || '—'}%</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text-secondary);">Next Due</span>
            <span style="font-weight:600;font-family:'JetBrains Mono',monospace;">${window.TERRA.ui.formatDate(l.nextDueDate)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;">
            <span style="color:var(--text-secondary);">Next Installment</span>
            <span style="font-weight:600;font-family:'JetBrains Mono',monospace;">${window.TERRA.ui.formatCurrency(l.nextInstallmentAmount)}</span>
          </div>
        </div>
      `;
      window.TERRA.ui.showModal('Loan Details', body, '<button class="btn btn-secondary" onclick="window.TERRA.ui.closeModal()">Close</button>');
    } catch (e) {
      window.TERRA.ui.toast(e.message, 'error');
    }
  },

  openNewLoanModal() {
    const body = `
      <form id="new-loan-form">
        <div class="form-group">
          <label class="form-label">Borrower</label>
          <select class="form-select" name="clientId" id="loan-borrower-select" required>
            <option value="">Select borrower...</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Loan Product</label>
          <select class="form-select" name="loanProductId" id="loan-product-select" required>
            <option value="">Select product...</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Requested Amount</label>
          <input class="form-input" name="requestedAmount" type="number" required placeholder="e.g. 50000" />
        </div>
        <div class="form-group">
          <label class="form-label">Duration (Months)</label>
          <input class="form-input" name="durationMonths" type="number" required placeholder="e.g. 12" />
        </div>
        <div class="form-group">
          <label class="form-label">Purpose</label>
          <textarea class="form-textarea" name="purpose" placeholder="Purpose of the loan..."></textarea>
        </div>
      </form>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="window.TERRA.ui.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="btn-save-loan">Submit Application</button>
    `;
    window.TERRA.ui.showModal('New Loan Application', body, footer);

    this.loadLoanFormOptions().then(() => {
      document.getElementById('btn-save-loan').addEventListener('click', async () => {
        const form = document.getElementById('new-loan-form');
        const fd = new FormData(form);
        const data = {
          loanProductId: parseInt(fd.get('loanProductId')),
          requestedAmount: parseFloat(fd.get('requestedAmount')),
          durationMonths: parseInt(fd.get('durationMonths')),
          purpose: fd.get('purpose') || ''
        };
        try {
          await window.TERRA.api.post('/api/loan-applications/', data);
          window.TERRA.ui.toast('Loan application submitted', 'success');
          window.TERRA.ui.closeModal();
          this.refresh();
        } catch (e) {
          window.TERRA.ui.toast(e.message, 'error');
        }
      });
    });
  },

  async loadLoanFormOptions() {
    try {
      const [clients, products] = await Promise.all([
        window.TERRA.api.get('/api/clients/'),
        window.TERRA.api.get('/api/loan-products/')
      ]);
      const clientSelect = document.getElementById('loan-borrower-select');
      const productSelect = document.getElementById('loan-product-select');
      if (clientSelect && Array.isArray(clients)) {
        clientSelect.innerHTML = '<option value="">Select borrower...</option>' + clients.map(c => `<option value="${c.id}">${window.TERRA.ui.escapeHtml(c.fullName)} (${c.employeeNo || c.nationalId || '—'})</option>`).join('');
      }
      if (productSelect && Array.isArray(products)) {
        productSelect.innerHTML = '<option value="">Select product...</option>' + products.map(p => `<option value="${p.id}">${window.TERRA.ui.escapeHtml(p.name)} (${p.minimumAmount} - ${p.maximumAmount})</option>`).join('');
      }
    } catch (e) {
      console.error('Failed to load form options:', e);
    }
  },

  async exportData() {
    try {
      const headers = ['Loan ID', 'Borrower', 'Amount', 'Status', 'Date'];
      const rows = this.data.map(l => [
        l.loanNo || '',
        l.clientFullName || '',
        l.approvedAmount || 0,
        l.status || '',
        window.TERRA.ui.formatDate(l.submittedAt || l.createdAt)
      ]);
      window.TERRA.ui.downloadCSV('loans.csv', headers, rows);
      window.TERRA.ui.toast('Export downloaded', 'success');
    } catch (e) {
      window.TERRA.ui.toast('Export failed: ' + e.message, 'error');
    }
  }
};
