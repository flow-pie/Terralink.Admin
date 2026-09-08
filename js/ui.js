window.TERRA.ui = {
  toast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    const icons = { success: 'check_circle', error: 'error' };
    const icon = icons[type] || 'info';

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined" style="font-size:18px;">${icon}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  showModal(title, bodyHtml, footerHtml = '') {
    const container = document.getElementById('modal-container');
    container.innerHTML = `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close" onclick="window.TERRA.ui.closeModal()">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">${bodyHtml}</div>
          ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
        </div>
      </div>
    `;
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') this.closeModal();
    });
  },

  closeModal() {
    document.getElementById('modal-container').innerHTML = '';
  },

  confirm(message, onConfirm) {
    const body = `<p style="font-size:14px;color:var(--text-secondary);margin-bottom:8px;">${message}</p>`;
    const footer = `
      <button class="btn btn-secondary" onclick="window.TERRA.ui.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="confirm-yes">Confirm</button>
    `;
    this.showModal('Confirm Action', body, footer);
    document.getElementById('confirm-yes').addEventListener('click', () => {
      this.closeModal();
      onConfirm();
    });
  },

  formatCurrency(amount, currency = 'KSh') {
    if (amount == null) return `${currency} 0.00`;
    return `${currency} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  },

  formatAuditDetails(details) {
    if (!details) return '—';
    if (typeof details === 'string') {
      try { details = JSON.parse(details); } catch { return details; }
    }
    if (typeof details !== 'object' || Array.isArray(details)) return JSON.stringify(details);

    const labelMap = {
      clientId: 'Client',
      applicationId: 'Application',
      loanId: 'Loan',
      scheduleId: 'Schedule',
      userId: 'User',
      roleId: 'Role',
      status: 'Status',
      mfaRequired: 'MFA Required',
      mfaEnabled: 'MFA Enabled',
      mfaSecretSet: 'MFA Secret Set',
      isFirstSetup: 'First Setup',
      disposableIncome: 'Disposable Income',
      estimatedValue: 'Estimated Value',
      action: 'Action',
      entityType: 'Entity Type',
      entityId: 'Entity ID',
      email: 'Email',
      username: 'Username',
      fullName: 'Full Name',
      employeeNo: 'Employee No',
      password: 'Password',
      phone: 'Phone',
      address: 'Address',
      gender: 'Gender',
      dateOfBirth: 'Date of Birth',
      amount: 'Amount',
      paymentMethod: 'Payment Method',
      paymentDate: 'Payment Date',
      loanNo: 'Loan No',
      clientName: 'Client Name',
      referenceNo: 'Reference No',
      purpose: 'Purpose',
      durationMonths: 'Duration',
      interestRate: 'Interest Rate',
      balance: 'Balance',
      repaymentAmount: 'Repayment',
      repaymentProgress: 'Progress',
      nextDueDate: 'Next Due',
      nextInstallmentAmount: 'Next Installment',
      approvedAmount: 'Approved Amount',
      requestedAmount: 'Requested Amount',
      loanProductId: 'Loan Product',
      loanProductName: 'Product',
      assignedOfficer: 'Officer',
      totalClients: 'Total Clients',
      activeLoans: 'Active Loans',
      outstandingPortfolio: 'Outstanding',
      disbursedMtd: 'Disbursed MTD',
      pendingApplications: 'Pending Apps',
      overdueLoans: 'Overdue',
      totalDisbursed: 'Total Disbursed',
      totalRepaid: 'Total Repaid',
      totalLoanOfficers: 'Officers'
    };

    const formatValue = (key, val) => {
      if (val === null || val === undefined) return 'None';
      if (typeof val === 'boolean') return val ? 'Yes' : 'No';
      if (key === 'amount' || key === 'estimatedValue' || key === 'disposableIncome' || key === 'requestedAmount' || key === 'approvedAmount' || key === 'balance' || key === 'repaymentAmount' || key === 'nextInstallmentAmount') {
        return `KSh ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (key === 'interestRate') return `${val}%`;
      if (key === 'repaymentProgress') return `${val}%`;
      if (key === 'durationMonths') return `${val} months`;
      return String(val);
    };

    const parts = Object.entries(details).map(([key, val]) => {
      const label = labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      return `${label}: ${formatValue(key, val)}`;
    });

    return parts.join(', ');
  },

  formatAuditDetailsDetailed(details) {
    if (!details) return '—';
    if (typeof details === 'string') {
      try { details = JSON.parse(details); } catch { return window.TERRA.ui.escapeHtml(details); }
    }
    if (typeof details !== 'object' || Array.isArray(details)) return window.TERRA.ui.escapeHtml(JSON.stringify(details, null, 2));

    const labelMap = {
      clientId: 'Client',
      applicationId: 'Application',
      loanId: 'Loan',
      scheduleId: 'Schedule',
      userId: 'User',
      roleId: 'Role',
      status: 'Status',
      mfaRequired: 'MFA Required',
      mfaEnabled: 'MFA Enabled',
      mfaSecretSet: 'MFA Secret Set',
      isFirstSetup: 'First Setup',
      disposableIncome: 'Disposable Income',
      estimatedValue: 'Estimated Value',
      action: 'Action',
      entityType: 'Entity Type',
      entityId: 'Entity ID',
      email: 'Email',
      username: 'Username',
      fullName: 'Full Name',
      employeeNo: 'Employee No',
      password: 'Password',
      phone: 'Phone',
      address: 'Address',
      gender: 'Gender',
      dateOfBirth: 'Date of Birth',
      amount: 'Amount',
      paymentMethod: 'Payment Method',
      paymentDate: 'Payment Date',
      loanNo: 'Loan No',
      clientName: 'Client Name',
      referenceNo: 'Reference No',
      purpose: 'Purpose',
      durationMonths: 'Duration',
      interestRate: 'Interest Rate',
      balance: 'Balance',
      repaymentAmount: 'Repayment',
      repaymentProgress: 'Progress',
      nextDueDate: 'Next Due',
      nextInstallmentAmount: 'Next Installment',
      approvedAmount: 'Approved Amount',
      requestedAmount: 'Requested Amount',
      loanProductId: 'Loan Product',
      loanProductName: 'Product',
      assignedOfficer: 'Officer',
      totalClients: 'Total Clients',
      activeLoans: 'Active Loans',
      outstandingPortfolio: 'Outstanding',
      disbursedMtd: 'Disbursed MTD',
      pendingApplications: 'Pending Apps',
      overdueLoans: 'Overdue',
      totalDisbursed: 'Total Disbursed',
      totalRepaid: 'Total Repaid',
      totalLoanOfficers: 'Officers'
    };

    const formatValue = (key, val) => {
      if (val === null || val === undefined) return '<span style="color:var(--text-muted);">None</span>';
      if (typeof val === 'boolean') return val ? '<span style="color:var(--success);">Yes</span>' : '<span style="color:var(--error);">No</span>';
      if (key === 'amount' || key === 'estimatedValue' || key === 'disposableIncome' || key === 'requestedAmount' || key === 'approvedAmount' || key === 'balance' || key === 'repaymentAmount' || key === 'nextInstallmentAmount') {
        return `<span style="font-family:'JetBrains Mono',monospace;font-weight:700;">KSh ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
      }
      if (key === 'interestRate') return `${val}%`;
      if (key === 'repaymentProgress') return `${val}%`;
      if (key === 'durationMonths') return `${val} months`;
      return window.TERRA.ui.escapeHtml(String(val));
    };

    const rows = Object.entries(details).map(([key, val]) => {
      const label = labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);"><span style="color:var(--text-secondary);">${label}</span><span style="font-weight:600;text-align:right;max-width:60%;">${formatValue(key, val)}</span></div>`;
    }).join('');

    return `<div style="display:flex;flex-direction:column;gap:2px;">${rows}</div>`;
  },

  statusBadge(status) {
    const map = {
      'Active': 'chip-success', 'Approved': 'chip-success', 'Paid': 'chip-success',
      'Verified': 'chip-success', 'Settled': 'chip-success', 'Completed': 'chip-success',
      'Pending': 'chip-warning', 'Pending Review': 'chip-warning', 'Under Review': 'chip-warning',
      'In Review': 'chip-warning', 'Processing': 'chip-warning', 'Awaiting Disbursement': 'chip-warning',
      'Defaulted': 'chip-error', 'Overdue': 'chip-error', 'Rejected': 'chip-error',
      'Failed': 'chip-error', 'Update Req': 'chip-error',
      'Closed': 'chip-info', 'Disbursed': 'chip-info',
      'Inactive': 'chip-neutral', 'On Leave': 'chip-neutral', 'Cancelled': 'chip-neutral'
    };
    const cls = map[status] || 'chip-neutral';
    return `<span class="chip ${cls}"><span class="chip-dot"></span>${status}</span>`;
  },

  stars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.4 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '<span class="material-symbols-outlined fill-1" style="font-size:15px;color:#a16207;">star</span>'.repeat(full);
    if (half) html += '<span class="material-symbols-outlined fill-1" style="font-size:15px;color:#a16207;">star_half</span>';
    html += '<span class="material-symbols-outlined" style="font-size:15px;color:#e7e5e4;">star</span>'.repeat(empty);
    return html;
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  parseListResponse(res) {
    if (Array.isArray(res)) return { items: res, total: res.length };
    if (res && Array.isArray(res.items)) return { items: res.items, total: res.totalCount || res.items.length };
    return { items: [], total: 0 };
  },

  renderPagination(current, total, label, onPage) {
    const totalPages = Math.max(1, Math.ceil(total / 10));
    const start = (current - 1) * 10 + 1;
    const end = Math.min(current * 10, total);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return `
      <div class="pagination">
        <div>Showing <b style="color:var(--text);">${start}</b> to <b style="color:var(--text);">${end}</b> of <b style="color:var(--text);">${total}</b> ${label}</div>
        <div style="display:flex;align-items:center;gap:4px;">
          <button class="page-btn" ${current <= 1 ? 'disabled' : ''} onclick="${onPage}(${current - 1})"><span class="material-symbols-outlined" style="font-size:18px;">chevron_left</span></button>
          ${pages.map(p => `<button class="page-btn ${p === current ? 'active' : ''}" onclick="${onPage}(${p})">${p}</button>`).join('')}
          <button class="page-btn" ${current >= totalPages ? 'disabled' : ''} onclick="${onPage}(${current + 1})"><span class="material-symbols-outlined" style="font-size:18px;">chevron_right</span></button>
        </div>
      </div>
    `;
  },

  downloadCSV(filename, headers, rows) {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        const s = String(cell || '');
        return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
