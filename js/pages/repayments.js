window.TERRA.pages = window.TERRA.pages || {};
window.TERRA.pages.repayments = {
  data: [],
  page: 1,
  pageSize: 10,
  total: 0,
  selectedLoanId: null,

  async init() {
    await this.fetchData();
  },

  async fetchData() {
    try {
      const params = new URLSearchParams({ Page: this.page, PageSize: this.pageSize });
      const res = await window.TERRA.api.get(`/api/payments/?${params}`);
      const parsed = window.TERRA.ui.parseListResponse(res);
      this.data = parsed.items;
      this.total = parsed.total;
    } catch (e) {
      console.error('Fetch repayments error:', e);
      this.data = [];
      this.total = 0;
    }
  },

  statusChip(status) {
    if (status === 'Paid' || status === 'Succeeded' || status === 'SUCCESS') {
      return '<span class="chip chip-success"><span class="chip-dot"></span>Settled</span>';
    }
    if (status === 'Pending' || status === 'PENDING') {
      return '<span class="chip chip-warning"><span class="chip-dot"></span>Pending</span>';
    }
    if (status === 'Failed' || status === 'FAILED') {
      return '<span class="chip chip-error"><span class="chip-dot"></span>Failed</span>';
    }
    return `<span class="chip chip-neutral"><span class="chip-dot"></span>${status}</span>`;
  },

  render() {
    const rows = this.data.map(r => `
      <tr>
        <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--primary);">#${r.id}</td>
        <td style="font-family:'JetBrains Mono',monospace;">${window.TERRA.ui.escapeHtml(r.loanNo || '—')}</td>
        <td style="font-weight:500;">${window.TERRA.ui.escapeHtml(r.clientName || '—')}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-weight:700;">${window.TERRA.ui.formatCurrency(r.amount)}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text-secondary);">${window.TERRA.ui.formatDate(r.paymentDate)}</td>
        <td><span style="background:var(--bg);padding:4px 10px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text-secondary);font-weight:500;">${r.paymentMethod || '—'}</span></td>
        <td>${this.statusChip(r.status)}</td>
      </tr>
    `).join('');

    const collections = this.data.filter(r => r.status === 'Paid' || r.status === 'Succeeded').reduce((a, r) => a + (r.amount || 0), 0);
    const mpesaCount = this.data.filter(r => (r.paymentMethod || '').toUpperCase() === 'MPESA').length;
    const mpesaPct = this.data.length > 0 ? Math.round((mpesaCount / this.data.length) * 100) + '%' : '—';
    const pendingAmt = this.data.filter(r => r.status === 'Pending').reduce((a, r) => a + (r.amount || 0), 0);
    const overdueAmt = this.data.filter(r => r.status === 'Failed').reduce((a, r) => a + (r.amount || 0), 0);

    return `
      <div class="page-header">
        <div>
          <span class="label-caps">CASH FLOW</span>
          <h1>Repayments & Collections</h1>
          <p>Real-time daily collection ledger and payment reconciliation.</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-secondary" onclick="window.TERRA.pages.repayments.exportData()">
            <span class="material-symbols-outlined" style="font-size:16px;">download</span>Export Ledger
          </button>
          <button class="btn btn-primary" onclick="window.TERRA.pages.repayments.openRecordPaymentModal()">
            <span class="material-symbols-outlined" style="font-size:16px;">receipt</span>Record Payment
          </button>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Today's Collections <span class="material-symbols-outlined" style="color:var(--success);">check_circle</span></div>
          <div class="kpi-value success">${window.TERRA.ui.formatCurrency(collections)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">M-Pesa Inflow <span class="material-symbols-outlined" style="color:var(--primary);">smartphone</span></div>
          <div class="kpi-value primary">${mpesaPct}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Pending Cleared <span class="material-symbols-outlined" style="color:var(--warning);">pending_actions</span></div>
          <div class="kpi-value warning">${window.TERRA.ui.formatCurrency(pendingAmt)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Overdue Recovery <span class="material-symbols-outlined" style="color:var(--error);">warning</span></div>
          <div class="kpi-value error">${window.TERRA.ui.formatCurrency(overdueAmt)}</div>
        </div>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <h2 class="table-toolbar-title">Settled & Pending Installments</h2>
          <span class="table-toolbar-meta">Auto-reconciled via Webhook API</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Ref / Receipt</th><th>Loan ID</th><th>Borrower</th><th>Amount</th><th>Date</th><th>Method</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">No payments found.</td></tr>'}
            </tbody>
          </table>
        </div>
        ${window.TERRA.ui.renderPagination(this.page, this.total, 'payments', 'window.TERRA.pages.repayments.goPage')}
      </div>
    `;
  },

  goPage(p) {
    this.page = p;
    this.refresh();
  },

  async refresh() {
    await this.fetchData();
    document.getElementById('screen').innerHTML = this.render();
  },

  openRecordPaymentModal() {
    const body = `
      <form id="payment-form">
        <div class="form-group">
          <label class="form-label">Loan ID</label>
          <input class="form-input" name="loanId" type="number" required placeholder="e.g. 1" />
        </div>
        <div class="form-group">
          <label class="form-label">Schedule ID</label>
          <input class="form-input" name="scheduleId" type="number" required placeholder="e.g. 1" />
        </div>
        <div class="form-group">
          <label class="form-label">Amount</label>
          <input class="form-input" name="amount" type="number" step="0.01" required placeholder="e.g. 5000" />
        </div>
        <div class="form-group">
          <label class="form-label">Phone (M-Pesa)</label>
          <input class="form-input" name="phone" placeholder="e.g. +254700000000" />
        </div>
      </form>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="window.TERRA.ui.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="btn-record-payment">Record Payment</button>
    `;
    window.TERRA.ui.showModal('Record Repayment', body, footer);
    document.getElementById('btn-record-payment').addEventListener('click', async () => {
      const form = document.getElementById('payment-form');
      const fd = new FormData(form);
      const data = {
        loanId: parseInt(fd.get('loanId')),
        scheduleId: parseInt(fd.get('scheduleId')),
        amount: parseFloat(fd.get('amount')),
        phone: fd.get('phone') || ''
      };
      try {
        await window.TERRA.api.post('/api/payments/initiate', data);
        window.TERRA.ui.toast('Payment recorded', 'success');
        window.TERRA.ui.closeModal();
        this.refresh();
      } catch (e) {
        window.TERRA.ui.toast(e.message, 'error');
      }
    });
  },

  async exportData() {
    try {
      const headers = ['ID', 'Loan ID', 'Borrower', 'Amount', 'Date', 'Method', 'Status'];
      const rows = this.data.map(r => [
        r.id,
        r.loanNo || '',
        r.clientName || '',
        r.amount || 0,
        window.TERRA.ui.formatDate(r.paymentDate),
        r.paymentMethod || '',
        r.status || ''
      ]);
      window.TERRA.ui.downloadCSV('repayments.csv', headers, rows);
      window.TERRA.ui.toast('Export downloaded', 'success');
    } catch (e) {
      window.TERRA.ui.toast('Export failed: ' + e.message, 'error');
    }
  }
};
