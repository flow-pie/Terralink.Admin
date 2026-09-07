window.TERRA.ui = {
  toast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined" style="font-size:18px;">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>
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
    const body = `
      <p style="font-size:14px;color:var(--text-secondary);margin-bottom:8px;">${message}</p>
    `;
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

  statusBadge(status) {
    const map = {
      'Active': 'chip-success',
      'Approved': 'chip-success',
      'Paid': 'chip-success',
      'Verified': 'chip-success',
      'Settled': 'chip-success',
      'Completed': 'chip-success',
      'Pending': 'chip-warning',
      'Pending Review': 'chip-warning',
      'Under Review': 'chip-warning',
      'In Review': 'chip-warning',
      'Processing': 'chip-warning',
      'Defaulted': 'chip-error',
      'Overdue': 'chip-error',
      'Rejected': 'chip-error',
      'Failed': 'chip-error',
      'Update Req': 'chip-error',
      'Closed': 'chip-info',
      'Inactive': 'chip-neutral',
      'On Leave': 'chip-neutral',
      'Cancelled': 'chip-neutral',
      'Disbursed': 'chip-info',
      'Awaiting Disbursement': 'chip-warning'
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
  }
};