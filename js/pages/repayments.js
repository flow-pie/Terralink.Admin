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
    if (!window.TERRA || !window.TERRA.api) {
      console.error('[Repayments] API module not available');
      this.data = [];
      this.total = 0;
      return;
    }
    try {
      const params = new URLSearchParams({ Page: this.page, PageSize: this.pageSize });
      const res = await window.TERRA.api.get(`/api/payments/?${params}`);
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
      console.error('Fetch repayments error:', e);
      this.data = [];
      this.total = 0;
    }
  },

  render() {
    const rows = this.data.map(r => {
      const statusChip = r.status === 'Paid' || r.status === 'Succeeded' || r.status === 'SUCCESS'
        ? '<span class="chip chip-success"><span class="chip-dot"></span>Settled</span>'
        : r.status === 'Pending' || r.status === 'PENDING'
          ? '<span class="chip chip-warning"><span class="chip-dot"></span>Pending</span>'
          : r.status === 'Failed' || r.status === 'FAILED'
            ? '<span class="chip chip-error"><span class="chip-dot"></span>Failed</span>'
            : `<span class="chip chip-neutral"><span class="chip-dot"></span>${r.status}</span>`;

      return `
        <tr>
          <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--primary);">#${r.id}</td>
          <td style="font-family:'JetBrains Mono',monospace;">${window.TERRA.ui.escapeHtml(r.loanNo || '—')}</td>
          <td style="font-weight:500;">${window.TERRA.ui.escapeHtml(r.clientName || '—')}</td>
          <td style="font-family:'JetBrains Mono',monospace;font-weight:700;">${window.TERRA.ui.formatCurrency(r.amount)}</td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text-secondary);">${window.TERRA.ui.formatDate(r.paymentDate)}</td>
          <td><span style="background:var(--bg);padding:4px 10px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text-secondary);font-weight:500;">${r.paymentMethod || '—'}</span></td>
          <td>${statusChip}</td>
        </tr>
      `;
    }).join('');

    const paginationHtml = `
      <div class="pagination">
        <div>Showing <b style="color:var(--text);">${this.data.length}</b> payments</div>
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
          <div class="kpi-value success">${window.TERRA.ui.formatCurrency(this.data.filter(r => r.status === 'Paid' || r.status === 'Succeeded').reduce((a, r) => a + (r.amount || 0), 0))}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">M-Pesa Inflow <span class="material-symbols-outlined" style="color:var(--primary);">smartphone</span></div>
          <div class="kpi-value primary">${this.data.length > 0 ? Math.round((this.data.filter(r => (r.paymentMethod || '').toUpperCase() === 'MPESA').length / this.data.length) * 100) + '%' : '—'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Pending Cleared <span class="material-symbols-outlined" style="color:var(--warning);">pending_actions</span></div>
          <div class="kpi-value warning">${window.TERRA.ui.formatCurrency(this.data.filter(r => r.status === 'Pending').reduce((a, r) => a + (r.amount || 0), 0))}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Overdue Recovery <span class="material-symbols-outlined" style="color:var(--error);">warning</span></div>
          <div class="kpi-value error">${window.TERRA.ui.formatCurrency(this.data.filter(r => r.status === 'Failed').reduce((a, r) => a + (r.amount || 0), 0))}</div>
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
        ${paginationHtml}
      </div>
    `;
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
      const csvContent = [
        ['ID', 'Loan ID', 'Borrower', 'Amount', 'Date', 'Method', 'Status'].join(','),
        ...this.data.map(r => [
          `${r.id}`,
          `"${(r.loanNo || '').replace(/"/g, '""')}"`,
          `"${(r.clientName || '').replace(/"/g, '""')}"`,
          `"${r.amount || 0}"`,
          `"${window.TERRA.ui.formatDate(r.paymentDate)}"`,
          `"${(r.paymentMethod || '').replace(/"/g, '""')}"`,
          `"${(r.status || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'repayments.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      window.TERRA.ui.toast('Export downloaded', 'success');
    } catch (e) {
      window.TERRA.ui.toast('Export failed: ' + e.message, 'error');
    }
  }
};