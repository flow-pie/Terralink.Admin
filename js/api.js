(function() {
  function getConfig() {
    return (window.TERRA && window.TERRA.config) || {};
  }

  async function request(path, options = {}) {
    const config = getConfig();
    const url = `${config.apiBase}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = (window.TERRA && window.TERRA.auth && window.TERRA.auth.getToken) ? window.TERRA.auth.getToken() : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      (window.TERRA.auth && window.TERRA.auth.logout) ? window.TERRA.auth.logout() : null;
      window.location.reload();
      throw new Error('Session expired');
    }

    if (res.status === 204) {
      return null;
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      return { pdf: true, blob: await res.blob() };
    }
    if (contentType && contentType.includes('text/csv')) {
      return { csv: true, text: await res.text() };
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data?.message || data?.title || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  window.TERRA.api = {
    get: (path) => request(path),
    post: (path, body) => request(path, {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    patch: (path, body) => request(path, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),
    delete: (path) => request(path, { method: 'DELETE' }),
    download: async (path) => {
      const config = getConfig();
      const token = (window.TERRA && window.TERRA.auth && window.TERRA.auth.getToken) ? window.TERRA.auth.getToken() : null;
      const url = `${config.apiBase}${path}`;
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();
      const cd = res.headers.get('content-disposition') || '';
      const match = cd.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : 'download.bin';
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    },
    postForm: async (path, formData) => {
      const config = getConfig();
      const url = `${config.apiBase}${path}`;
      const token = (window.TERRA && window.TERRA.auth && window.TERRA.auth.getToken) ? window.TERRA.auth.getToken() : null;
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });
      if (res.status === 204) return null;
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.message || data?.title || `HTTP ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    }
  };

  console.log('[API] window.TERRA.api initialized:', !!window.TERRA.api);
})();