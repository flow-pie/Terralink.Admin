(function() {
  const STORAGE_KEY = 'terralink_auth';

  function getStored() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  }

  function setStored(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function clearStored() {
    localStorage.removeItem(STORAGE_KEY);
  }

  window.TERRA.auth = {
    user: null,
    token: null,

    init() {
      const data = getStored();
      if (data?.token && data?.user) {
        this.token = data.token;
        this.user = data.user;
      }
    },

    getToken() {
      return this.token;
    },

    getUser() {
      return this.user;
    },

    async login(identifier, password) {
      if (!window.TERRA || !window.TERRA.api) {
        throw new Error('System not initialized. Please refresh the page.');
      }
      const data = await window.TERRA.api.post('/api/auth/login', {
        identifier,
        password
      });

      if (data.mfaRequired && data.mfaToken) {
        return { mfaRequired: true, mfaToken: data.mfaToken };
      }

      this.token = data.accessToken;
      this.user = {
        id: data.user.id,
        name: data.user.fullName || data.user.username || 'Admin',
        role: data.user.roleName || 'Admin',
        email: data.user.email || ''
      };
      setStored({ token: this.token, user: this.user });
      return data;
    },

    async verifyMfa(mfaToken, code) {
      const data = await window.TERRA.api.post('/api/auth/mfa/verify', {
        mfaToken,
        code
      });
      this.token = data.accessToken;
      this.user = {
        id: data.user.id,
        name: data.user.fullName || data.user.username || 'Admin',
        role: data.user.roleName || 'Admin',
        email: data.user.email || ''
      };
      setStored({ token: this.token, user: this.user });
      return data;
    },

    async refresh() {
      const data = getStored();
      if (!data?.refreshToken) throw new Error('No refresh token');
      const res = await window.TERRA.api.post('/api/auth/refresh', {
        refreshToken: data.refreshToken
      });
      this.token = res.accessToken;
      setStored({ ...data, token: this.token });
    },

    logout() {
      this.token = null;
      this.user = null;
      clearStored();
    },

    isAuthenticated() {
      return !!this.token;
    },

    async setupMfa() {
      const data = await window.TERRA.api.post('/api/auth/mfa/setup', {});
      return data;
    },

    async confirmMfaSetup(code) {
      const data = await window.TERRA.api.post('/api/auth/mfa/confirm-setup', { code });
      return data;
    },

    async getProfile() {
      const data = await window.TERRA.api.get('/api/users/me');
      return data;
    },

    async updateProfile(updates) {
      const data = await window.TERRA.api.patch('/api/users/me', updates);
      if (data) {
        if (data.email && this.user) this.user.email = data.email;
        if (data.mfaEnabled !== undefined) {
          this.user.mfaEnabled = data.mfaEnabled;
        }
        setStored({ ...getStored(), user: this.user });
      }
      return data;
    }
  };
})();
