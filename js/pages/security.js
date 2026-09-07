window.TERRA.pages.security = {
  mfaEnabled: false,
  mfaSetupStep: 'idle', // idle, show-secret, verify, done
  setupSecret: null,
  setupQrUri: null,
  manualKey: null,

  async init() {
    try {
      const profile = await window.TERRA.auth.getProfile();
      this.mfaEnabled = profile.mfaEnabled || false;
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
    this.mfaSetupStep = 'idle';
    this.setupSecret = null;
    this.setupQrUri = null;
    this.manualKey = null;
  },

  render() {
    if (this.mfaEnabled) {
      return this.renderEnabled();
    }
    return this.renderDisabled();
  },

  renderEnabled() {
    return `
      <div class="page-header">
        <div>
          <span class="label-caps">SECURITY</span>
          <h1>Multi-Factor Authentication</h1>
          <p>Manage your two-factor authentication settings.</p>
        </div>
      </div>

      <div class="card" style="max-width:600px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <div style="width:48px;height:48px;border-radius:50%;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center;">
            <span class="material-symbols-outlined" style="font-size:24px;color:var(--success);">check_circle</span>
          </div>
          <div>
            <h2 style="margin:0;">MFA is Active</h2>
            <p style="margin:0;font-size:13px;color:var(--text-secondary);">Your account is protected with two-factor authentication.</p>
          </div>
        </div>
        <div style="background:var(--bg);border-radius:var(--radius);padding:16px;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;">
            <span style="color:var(--text-secondary);">Status</span>
            <span style="font-weight:700;color:var(--success);">Enabled</span>
          </div>
        </div>
        <button class="btn btn-secondary" onclick="window.TERRA.pages.security.disableMfa()">
          <span class="material-symbols-outlined" style="font-size:18px;">lock_open</span>Disable MFA
        </button>
      </div>
    `;
  },

  renderDisabled() {
    if (this.mfaSetupStep === 'show-secret' && this.setupQrUri) {
      return this.renderQrCode();
    }
    if (this.mfaSetupStep === 'verify') {
      return this.renderVerify();
    }
    if (this.mfaSetupStep === 'done') {
      return this.renderDone();
    }
    return this.renderSetupPrompt();
  },

  renderSetupPrompt() {
    return `
      <div class="page-header">
        <div>
          <span class="label-caps">SECURITY</span>
          <h1>Multi-Factor Authentication</h1>
          <p>Add an extra layer of security to your account.</p>
        </div>
      </div>

      <div class="card" style="max-width:600px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;">
            <span class="material-symbols-outlined" style="font-size:24px;color:var(--text-muted);">shield</span>
          </div>
          <div>
            <h2 style="margin:0;">MFA is Disabled</h2>
            <p style="margin:0;font-size:13px;color:var(--text-secondary);">Enable MFA to secure your account with a time-based code.</p>
          </div>
        </div>
        <div style="background:var(--bg);border-radius:var(--radius);padding:16px;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;">
            <span style="color:var(--text-secondary);">Status</span>
            <span style="font-weight:700;color:var(--text-muted);">Disabled</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="window.TERRA.pages.security.startSetup()">
          <span class="material-symbols-outlined" style="font-size:18px;">lock</span>Enable MFA
        </button>
      </div>
    `;
  },

  renderQrCode() {
    return `
      <div class="page-header">
        <div>
          <span class="label-caps">SECURITY</span>
          <h1>Setup MFA</h1>
          <p>Scan the QR code with your authenticator app.</p>
        </div>
      </div>

      <div class="card" style="max-width:600px;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;padding:16px;background:#fff;border-radius:12px;border:1px solid var(--border);">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.setupQrUri)}" alt="MFA QR Code" style="width:200px;height:200px;" />
          </div>
        </div>
        <div style="background:var(--bg);border-radius:var(--radius);padding:16px;margin-bottom:20px;">
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700;margin-bottom:8px;">Manual Entry Key</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;letter-spacing:0.05em;word-break:break-all;">${this.manualKey}</div>
        </div>
        <button class="btn btn-primary" style="width:100%;" onclick="window.TERRA.pages.security.goToVerify()">
          I have scanned the code
        </button>
      </div>
    `;
  },

  renderVerify() {
    return `
      <div class="page-header">
        <div>
          <span class="label-caps">SECURITY</span>
          <h1>Verify Setup</h1>
          <p>Enter the 6-digit code from your authenticator app to confirm setup.</p>
        </div>
      </div>

      <div class="card" style="max-width:600px;">
        <div style="margin-bottom:20px;">
          <label class="form-label">Verification Code</label>
          <input class="form-input" id="mfaVerifyCode" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="000000" autocomplete="off" />
          <p class="err" id="mfaVerifyError" style="color:var(--error);font-size:13px;margin-top:8px;min-height:20px;"></p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-secondary" style="flex:1;" onclick="window.TERRA.pages.security.backToQr()">Back</button>
          <button class="btn btn-primary" style="flex:1;" onclick="window.TERRA.pages.security.confirmSetup()">Confirm</button>
        </div>
      </div>
    `;
  },

  renderDone() {
    return `
      <div class="page-header">
        <div>
          <span class="label-caps">SECURITY</span>
          <h1>MFA Enabled</h1>
          <p>Two-factor authentication is now active on your account.</p>
        </div>
      </div>

      <div class="card" style="max-width:600px;text-align:center;padding:40px;">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          <span class="material-symbols-outlined" style="font-size:32px;color:var(--success);">check_circle</span>
        </div>
        <h2 style="margin:0 0 8px;">Success</h2>
        <p style="color:var(--text-secondary);margin:0 0 24px;">MFA has been enabled. You will need to enter a code from your authenticator app each time you sign in.</p>
        <button class="btn btn-primary" onclick="window.TERRA.router.navigate('dashboard')">Go to Dashboard</button>
      </div>
    `;
  },

  async startSetup() {
    try {
      const data = await window.TERRA.auth.setupMfa();
      this.setupSecret = data.secret;
      this.setupQrUri = data.qrCodeUri;
      this.manualKey = data.manualEntryKey;
      this.mfaSetupStep = 'show-secret';
      document.getElementById('screen').innerHTML = this.render();
    } catch (e) {
      window.TERRA.ui.toast(e.message, 'error');
    }
  },

  goToVerify() {
    this.mfaSetupStep = 'verify';
    document.getElementById('screen').innerHTML = this.render();
    setTimeout(() => $('mfaVerifyCode')?.focus(), 100);
  },

  backToQr() {
    this.mfaSetupStep = 'show-secret';
    document.getElementById('screen').innerHTML = this.render();
  },

  async confirmSetup() {
    const code = document.getElementById('mfaVerifyCode')?.value || '';
    const errEl = document.getElementById('mfaVerifyError');
    if (!code || code.length !== 6) {
      if (errEl) errEl.textContent = 'Please enter the 6-digit code.';
      return;
    }
    try {
      const data = await window.TERRA.auth.confirmMfaSetup(code);
      if (data.success) {
        this.mfaEnabled = true;
        this.mfaSetupStep = 'done';
        document.getElementById('screen').innerHTML = this.render();
      } else {
        if (errEl) errEl.textContent = 'Invalid code. Please try again.';
      }
    } catch (e) {
      if (errEl) errEl.textContent = e.message;
    }
  },

  async disableMfa() {
    try {
      await window.TERRA.ui.confirm('Are you sure you want to disable MFA? This will reduce your account security.', async () => {
        await window.TERRA.auth.updateProfile({ mfaEnabled: false });
        this.mfaEnabled = false;
        this.mfaSetupStep = 'idle';
        this.setupSecret = null;
        this.setupQrUri = null;
        this.manualKey = null;
        document.getElementById('screen').innerHTML = this.render();
        window.TERRA.ui.toast('MFA disabled', 'success');
      });
    } catch (e) {
      window.TERRA.ui.toast(e.message, 'error');
    }
  },

  refresh() {
    this.init().then(() => {
      document.getElementById('screen').innerHTML = this.render();
    });
  }
};

function $(id) { return document.getElementById(id); }
