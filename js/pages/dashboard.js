window.TERRA.pages = window.TERRA.pages || {};
window.TERRA.pages.dashboard = {
  stats: null,
  portfolio: null,
  activity: [],

  async init() {
    console.log('[Dashboard] init started');
    if (!window.TERRA || !window.TERRA.api) {
      console.error('[Dashboard] API module not available');
      this.stats = {};
      this.portfolio = {};
      this.activity = [];
      return;
    }
    try {
      const [statsRes, portfolioRes, activityRes] = await Promise.all([
        window.TERRA.api.get('/api/admin/dashboard/stats').catch((e) => { console.error('[Dashboard] stats error:', e); return {}; }),
        window.TERRA.api.get('/api/reports/portfolio-summary').catch((e) => { console.error('[Dashboard] portfolio error:', e); return {}; }),
        window.TERRA.api.get('/api/admin/recent-activity').catch((e) => { console.error('[Dashboard] activity error:', e); return []; })
      ]);
      this.stats = statsRes;
      this.portfolio = portfolioRes;
      this.activity = Array.isArray(activityRes) ? activityRes : [];
      console.log('[Dashboard] init complete', this.stats, this.portfolio, this.activity);
    } catch (e) {
      console.error('[Dashboard] init error:', e);
    }
  },

  render() {
    const s = this.stats || {};
    const p = this.portfolio || {};
    const activities = this.activity;

    const totalClients = p.totalClients || 0;
    const activeLoans = p.activeLoans || 0;
    const outstanding = p.outstandingPortfolio || 0;
    const disbursed = p.disbursedMtd || 0;
    const pending = p.pendingApplications || 0;
    const overdue = p.overdueLoans || 0;

    const activityHtml = activities.length === 0
      ? '<p style="color:var(--text-muted);font-size:13px;">No recent activity.</p>'
      : activities.slice(0, 5).map(a => {
          const iconMap = {
            'loan': 'payments',
            'client': 'person_add',
            'payment': 'receipt',
            'audit': 'history',
            'user': 'badge',
            'default': 'info'
          };
          const colorMap = {
            'loan': 'green',
            'client': 'orange',
            'payment': 'blue',
            'audit': 'red',
            'user': 'green',
            'default': 'blue'
          };
          const type = a.type?.toLowerCase() || 'default';
          const icon = iconMap[type] || 'info';
          const color = colorMap[type] || 'blue';
          return `
            <div class="activity-item">
              <div class="activity-icon ${color}"><span class="material-symbols-outlined">${icon}</span></div>
              <div class="activity-content">
                <div class="activity-title">${window.TERRA.ui.escapeHtml(a.title || 'Activity')}</div>
                ${a.meta ? `<div class="activity-subtitle">${window.TERRA.ui.escapeHtml(a.meta)}</div>` : ''}
                <div class="activity-time">${window.TERRA.ui.formatDate(a.timestamp)}</div>
              </div>
            </div>
          `;
        }).join('');

    return `
      <div class="page-header">
        <div>
          <h1>System Overview</h1>
          <p>Real-time data of TerraLink portfolio, collection velocity, and field operations.</p>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Clients <span class="material-symbols-outlined" style="color:var(--text);">group</span></div>
          <div class="kpi-value">${totalClients.toLocaleString()}</div>
          <span class="chip chip-success" style="margin-top:8px;"><span class="chip-dot"></span>Registered</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Active Loans <span class="material-symbols-outlined" style="color:var(--primary);">payments</span></div>
          <div class="kpi-value primary">${activeLoans.toLocaleString()}</div>
          <span class="chip chip-info" style="margin-top:8px;"><span class="chip-dot"></span>Outstanding: ${window.TERRA.ui.formatCurrency(outstanding)}</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Disbursed <span class="material-symbols-outlined" style="color:var(--success);">trending_up</span></div>
          <div class="kpi-value success">${window.TERRA.ui.formatCurrency(disbursed)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Pending Loan Applications <span class="material-symbols-outlined" style="color:var(--warning);">pending_actions</span></div>
          <div class="kpi-value warning">${pending.toLocaleString()}</div>
        </div>
      </div>

      <div class="bento-row bento-1">
        <div class="card">
          <div class="card-header">
            <div>
              <span class="label-caps">COLLECTION PROGRESS</span>
              <h2 class="card-title">Total Portfolio Outstanding</h2>
            </div>
            <span class="chip chip-success"><span class="chip-dot"></span>On Pace</span>
          </div>
          <div style="margin-top:12px;">
            <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
              <span style="font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;color:var(--primary);">${window.TERRA.ui.formatCurrency(outstanding)}</span>
            </div>
            <div style="margin-top:16px;">
              <div style="height:8px;background:var(--bg);border-radius:999px;overflow:hidden;">
                <div style="height:100%;background:var(--primary);border-radius:999px;width:${p.totalDisbursed > 0 ? Math.round((p.totalRepaid / p.totalDisbursed) * 100) : 0}%;transition:width 0.6s;"></div>
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:8px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text-secondary);">
                <span>${window.TERRA.ui.formatCurrency(p.totalRepaid || 0)} collected</span>
                <span style="font-weight:700;color:var(--primary);">${p.totalDisbursed > 0 ? Math.round((p.totalRepaid / p.totalDisbursed) * 100) : 0}% collected</span>
                <span>${overdue} overdue</span>
              </div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
            <div style="padding:12px;background:var(--bg);border-radius:var(--radius);cursor:pointer;" onclick="window.TERRA.router.navigate('borrowers')">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);display:flex;align-items:center;justify-content:space-between;">Borrowers <span class="material-symbols-outlined" style="font-size:16px;color:var(--primary);">group</span></div>
              <div style="font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;margin-top:4px;">${totalClients.toLocaleString()}</div>
              <div style="font-size:10px;color:var(--text-muted);">Total registered</div>
            </div>
            <div style="padding:12px;background:var(--bg);border-radius:var(--radius);cursor:pointer;" onclick="window.TERRA.router.navigate('loans')">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);display:flex;align-items:center;justify-content:space-between;">Active Loans <span class="material-symbols-outlined" style="font-size:16px;color:var(--primary);">payments</span></div>
              <div style="font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;margin-top:4px;">${activeLoans}</div>
              <div style="font-size:10px;color:var(--text-muted);">Outstanding: ${window.TERRA.ui.formatCurrency(outstanding)}</div>
            </div>
            <div style="padding:12px;background:var(--bg);border-radius:var(--radius);cursor:pointer;" onclick="window.TERRA.router.navigate('officers')">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);display:flex;align-items:center;justify-content:space-between;">Officers <span class="material-symbols-outlined" style="font-size:16px;color:var(--primary);">badge</span></div>
              <div style="font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;margin-top:4px;">${(s.totalLoanOfficers || 0).toLocaleString()}</div>
              <div style="font-size:10px;color:var(--text-muted);">${(s.totalLoanOfficers || 0) > 0 ? 'Team active' : 'No officers'}</div>
            </div>
          </div>
        </div>

        
      </div>

      <div class="bento-row bento-3-reverse">
        <div class="card" style="background:var(--primary);color:#fff;border-color:var(--primary-hover);">
          <div style="position:relative;z-index:1;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <span class="label-caps" style="color:rgba(255,255,255,0.8);">DISBURSED</span>
              <span style="background:rgba(255,255,255,0.2);color:#fff;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;">${p.pendingApplications || 0} Pending</span>
            </div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:700;color:#fff;">${window.TERRA.ui.formatCurrency(p.disbursedMtd || 0)}</div>
            <p style="font-size:13px;color:rgba(255,255,255,0.9);margin-top:4px;">Total value disbursed month-to-date across all active facilities.</p>
            <div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:16px;margin-top:24px;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:11px;color:rgba(255,255,255,0.7);">M-Pesa B2C Gateway Active</span>
              <button onclick="window.TERRA.router.navigate('loans')" style="background:#fff;color:var(--primary);border:none;padding:8px 16px;border-radius:999px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">
                Release <span class="material-symbols-outlined" style="font-size:16px;">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="material-symbols-outlined fill-1" style="color:var(--error);font-size:22px;">error</span>
              <h2 class="card-title" style="margin:0;">Action Required</h2>
            </div>
            <span class="chip chip-error font-mono">${overdue + pending} Items</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div style="padding:16px;background:#fff;border-radius:var(--radius);border:1px solid var(--border);cursor:pointer;" onclick="window.TERRA.router.navigate('loans')">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <span class="label-caps" style="color:var(--error);margin:0;">OVERDUE</span>
                <span style="width:8px;height:8px;background:var(--error);border-radius:50%;display:inline-block;animation:ping 1.6s ease-in-out infinite;"></span>
              </div>
              <div style="font-size:24px;font-weight:700;color:var(--error);font-family:'JetBrains Mono',monospace;">${overdue}</div>
              <p style="font-size:11px;color:var(--text-secondary);margin:4px 0 8px;">Past grace period</p>
              <div style="font-size:12px;color:var(--primary);font-weight:600;display:flex;align-items:center;gap:4px;">Review <span class="material-symbols-outlined" style="font-size:14px;">arrow_forward</span></div>
            </div>
            <div style="padding:16px;background:#fff;border-radius:var(--radius);border:1px solid var(--border);cursor:pointer;" onclick="window.TERRA.router.navigate('loans')">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <span class="label-caps" style="color:var(--warning);margin:0;">PENDING APPS</span>
                <span style="width:8px;height:8px;background:var(--warning);border-radius:50%;display:inline-block;"></span>
              </div>
              <div style="font-size:24px;font-weight:700;color:var(--warning);font-family:'JetBrains Mono',monospace;">${pending}</div>
              <p style="font-size:11px;color:var(--text-secondary);margin:4px 0 8px;">Underwriting queued</p>
              <div style="font-size:12px;color:var(--primary);font-weight:600;display:flex;align-items:center;gap:4px;">Approve <span class="material-symbols-outlined" style="font-size:14px;">arrow_forward</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bento-row bento-3">
        <div class="card">
          <div class="card-header">
            <div>
              <span class="label-caps">DISTRIBUTION</span>
              <h2 class="card-title">Loan Portfolio</h2>
            </div>
            <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text-muted);background:var(--bg);padding:2px 8px;border-radius:4px;">${activeLoans} Total</span>
          </div>
          <div class="donut-container">
            <svg viewBox="0 0 100 100" style="width:100%;height:100%;">
              <circle cx="50" cy="50" fill="none" r="40" stroke="#f5f5f4" stroke-width="12"></circle>
              <circle cx="50" cy="50" fill="none" r="40" stroke="var(--primary)" stroke-width="12" stroke-dasharray="251.2" stroke-dashoffset="100.48"></circle>
              <circle cx="50" cy="50" fill="none" r="40" stroke="var(--success)" stroke-width="12" stroke-dasharray="251.2" stroke-dashoffset="188.4" transform="rotate(216 50 50)"></circle>
              <circle cx="50" cy="50" fill="none" r="40" stroke="#d6d3d1" stroke-width="12" stroke-dasharray="251.2" stroke-dashoffset="213.52" transform="rotate(306 50 50)"></circle>
            </svg>
            <div class="donut-center">
              <span style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;">${activeLoans}</span>
              <span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Loans</span>
            </div>
          </div>
          <div style="display:flex;justify-content:center;gap:16px;padding-top:12px;border-top:1px solid var(--border);font-size:11px;color:var(--text-secondary);">
            <div style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;background:var(--primary);display:inline-block;"></span> Active</div>
            <div style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;background:var(--success);display:inline-block;"></span> Done</div>
            <div style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;background:#d6d3d1;display:inline-block;"></span> Pend</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Recent Activity</h2>
            </div>
            <span class="status-dot"></span>
          </div>
          <div style="margin:8px 0;">
            ${activityHtml || '<p style="color:var(--text-muted);font-size:13px;">Loading activity...</p>'}
          </div>
          <div style="border-top:1px solid var(--border);padding-top:12px;text-align:center;">
            <a href="#/audit" style="font-size:12px;font-weight:700;color:var(--primary);display:inline-flex;align-items:center;gap:4px;">
              View complete audit stream <span class="material-symbols-outlined" style="font-size:14px;">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    `;
  },

  refresh() {
    const page = window.TERRA.store.state.currentPage;
    if (page === 'dashboard') {
      this.init().then(() => {
        document.getElementById('screen').innerHTML = this.render();
      });
    }
  }
};