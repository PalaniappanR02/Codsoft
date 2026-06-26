const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getToken() {
  return localStorage.getItem('access_token');
}
function setToken(token) {
  localStorage.setItem('access_token', token);
}
function removeToken() {
  localStorage.removeItem('access_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    removeToken();
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.message || 'Request failed'), {
      status: res.status,
      data: err,
    });
  }

  if (res.status === 204) return null;
  return res.json();
}

function createEntity(urlPath) {
  return {
    async list(sort, limit) {
      const params = new URLSearchParams();
      if (sort) params.set('sort', sort);
      if (limit) params.set('limit', limit);
      const qs = params.toString();
      return request('GET', `/${urlPath}${qs ? '?' + qs : ''}`);
    },
    async filter(where = {}, sort, limit) {
      return request('POST', `/${urlPath}/filter`, { where, sort, limit });
    },
    async get(id) {
      return request('GET', `/${urlPath}/${id}`);
    },
    async create(data) {
      return request('POST', `/${urlPath}`, data);
    },
    async update(id, data) {
      return request('PUT', `/${urlPath}/${id}`, data);
    },
    async delete(id) {
      return request('DELETE', `/${urlPath}/${id}`);
    },
  };
}

const GOOGLE_OAUTH_URL = import.meta.env.VITE_GOOGLE_OAUTH_URL || `${BASE_URL}/auth/google`;

const auth = {
  async loginViaEmailPassword(email, password) {
    const data = await request('POST', '/auth/login', { email, password });
    if (data?.access_token) setToken(data.access_token);
    return data;
  },
  loginWithProvider(provider, redirectPath = '/') {
    const returnUrl = encodeURIComponent(window.location.origin + redirectPath);
    window.location.href = `${GOOGLE_OAUTH_URL}?redirect_uri=${returnUrl}`;
  },
  async register({ email, password }) {
    return request('POST', '/auth/register', { email, password });
  },
  async verifyOtp({ email, otpCode }) {
    const data = await request('POST', '/auth/verify-otp', { email, otpCode });
    if (data?.access_token) setToken(data.access_token);
    return data;
  },
  async resendOtp(email) {
    return request('POST', '/auth/resend-otp', { email });
  },
  async resetPasswordRequest(email) {
    return request('POST', '/auth/forgot-password', { email });
  },
  async resetPassword({ resetToken, newPassword }) {
    return request('POST', '/auth/reset-password', { resetToken, newPassword });
  },
  async me() {
    return request('GET', '/auth/me');
  },
  setToken(token) {
    setToken(token);
  },
  logout(redirectUrl) {
    removeToken();
    window.location.href = redirectUrl || '/login';
  },
  redirectToLogin(returnUrl) {
    const url = returnUrl ? `/login?next=${encodeURIComponent(returnUrl)}` : '/login';
    window.location.href = url;
  },
};

const integrations = {
  Core: {
    async UploadFile({ file }) {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Upload failed');
      }
      return res.json();
    },
  },
};

export const apiClient = {
  entities: {
    Product:       createEntity('products'),
    Category:      createEntity('categories'),
    Order:         createEntity('orders'),
    Coupon:        createEntity('coupons'),
    Review:        createEntity('reviews'),
    StoreSettings: createEntity('store-settings'),
  },
  auth,
  integrations,
};

export const base44 = apiClient;