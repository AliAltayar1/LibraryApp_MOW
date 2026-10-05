import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "./constants";

/**
 * Standard API Error Class for Syrian Ministry of Endowments Digital Library.
 * Fully compatible with the Backend Unified Error Response contract:
 * {
 *   success: false,
 *   code: "ERROR_CODE",
 *   message: "رسالة الخطأ بالعربية",
 *   data: null,
 *   errors: { field: ["error1", "error2"] } | null,
 *   meta: { requester_role: null }
 * }
 */
export class ApiError extends Error {
  constructor({
    status = 0,
    code = "UNKNOWN_ERROR",
    message = "حدث خطأ غير متوقع أثناء معالجة الطلب.",
    errors = null,
    meta = null,
    data = null,
  }) {
    super(message || "حدث خطأ غير متوقع أثناء معالجة الطلب.");
    this.name = "ApiError";
    this.status = status;
    this.code = code || `HTTP_${status}`;
    this.message = message || "حدث خطأ غير متوقع أثناء معالجة الطلب.";
    this.errors = errors;
    this.meta = meta;
    this.data = data;
  }

  /**
   * Helper to format all errors into an array of readable strings
   */
  get formattedErrors() {
    if (!this.errors) return [];
    if (Array.isArray(this.errors)) return this.errors.map(String);
    if (typeof this.errors === "object") {
      const list = [];
      for (const [key, val] of Object.entries(this.errors)) {
        if (!val) continue;
        if (Array.isArray(val)) {
          val.forEach((m) => list.push(String(m)));
        } else if (typeof val === "string") {
          list.push(val);
        } else if (val && typeof val === "object") {
          for (const subVal of Object.values(val)) {
            if (Array.isArray(subVal)) list.push(...subVal.map(String));
            else if (typeof subVal === "string") list.push(subVal);
          }
        }
      }
      return list;
    }
    return [String(this.errors)];
  }

  /**
   * Helper to get a clean error string for a specific field
   */
  getFieldError(fieldName) {
    if (!this.errors || typeof this.errors !== "object") return null;
    const val = this.errors[fieldName];
    if (!val) return null;
    if (Array.isArray(val)) return val.join("، ");
    return String(val);
  }
}

// Token Storage & Refresh Queue
let inMemoryToken = null;
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function onRefreshFailed(err) {
  refreshSubscribers.forEach((cb) => cb(null, err));
  refreshSubscribers = [];
}

export function getAccessToken() {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (stored) {
        inMemoryToken = stored;
        return stored;
      }
    } catch {
      // LocalStorage access may fail in private mode
    }
  }
  return null;
}

export function setAccessToken(token) {
  inMemoryToken = token;
  if (typeof window !== "undefined") {
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      }
    } catch {
      // Ignore storage errors
    }
  }
}

export function clearAuthData() {
  inMemoryToken = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch {
      // Ignore
    }
    window.dispatchEvent(new CustomEvent("auth-logout"));
  }
}

/**
 * Axios Instance Configuration
 * - withCredentials: true ensures HttpOnly refresh_token cookie is transmitted
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

/**
 * Safe Base64 decoding helper for browser and SSR
 */
function decodeBase64(str) {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    try {
      return window.atob(str);
    } catch {
      return "";
    }
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "base64").toString("binary");
  }
  return "";
}

/**
 * Decode JWT expiration time in milliseconds
 */
export function getTokenExpiration(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const jsonStr = decodeBase64(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(jsonStr);
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Check if JWT is expired or about to expire within offsetSeconds
 */
export function isTokenExpired(token, offsetSeconds = 60) {
  const exp = getTokenExpiration(token);
  if (!exp) return false;
  return Date.now() >= exp - offsetSeconds * 1000;
}

/**
 * Perform token refresh request against /accounts/refresh
 */
export async function refreshAccessToken() {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken, err) => {
        if (err) reject(err);
        else resolve(newToken);
      });
    });
  }

  isRefreshing = true;

  try {
    // In browser, use same-origin proxy /accounts/refresh to ensure browser sends HttpOnly cookie
    const refreshUrl =
      typeof window !== "undefined"
        ? "/accounts/refresh"
        : `${API_BASE_URL}/accounts/refresh`;

    const refreshResponse = await axios.post(
      refreshUrl,
      null,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      }
    );

    const refreshData = refreshResponse.data;
    const newAccess =
      refreshData?.data?.access ||
      refreshData?.access ||
      refreshData?.data?.access_token ||
      refreshData?.access_token;

    if (refreshResponse.status === 200 && newAccess) {
      setAccessToken(newAccess);
      isRefreshing = false;
      onRefreshed(newAccess);
      return newAccess;
    } else {
      throw new ApiError({
        status: refreshResponse.status,
        code: refreshData?.code || "REFRESH_FAILED",
        message: refreshData?.message || "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.",
      });
    }
  } catch (refreshError) {
    isRefreshing = false;
    onRefreshFailed(refreshError);
    clearAuthData();
    throw refreshError;
  }
}

/**
 * Request Interceptor: Attach JWT Bearer Token & Proactive Silent Refresh
 */
axiosInstance.interceptors.request.use(
  async (config) => {
    if (!config.skipAuth) {
      let token = getAccessToken();

      // Proactively refresh if token is expiring within 45 seconds (avoid 401 disruptions)
      if (
        token &&
        isTokenExpired(token, 45) &&
        !config.url?.includes("/accounts/login") &&
        !config.url?.includes("/accounts/refresh")
      ) {
        try {
          const freshToken = await refreshAccessToken();
          if (freshToken) {
            token = freshToken;
          }
        } catch {
          // If silent proactive refresh fails, proceed with current token and allow reactive 401 interceptor
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Auto Token Refresh and Unified Error Normalization
 */
axiosInstance.interceptors.response.use(
  (response) => {
    const data = response.data;

    // Check if the backend envelope explicitly returned success: false
    if (data && data.success === false) {
      return Promise.reject(
        new ApiError({
          status: response.status,
          code: data.code || `HTTP_${response.status}`,
          message: data.message || "فشلت العملية، يرجى مراجعة البيانات والمحاولة مجدداً.",
          errors: data.errors || null,
          meta: data.meta || null,
          data: data.data || null,
        })
      );
    }

    return data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Network / Offline Error
    if (!error.response) {
      return Promise.reject(
        new ApiError({
          status: 0,
          code: "NETWORK_ERROR",
          message: "تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً.",
        })
      );
    }

    const { status, data } = error.response;

    // Check for 401 Token Expiration (excluding login/refresh to avoid loops)
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/accounts/login") &&
      !originalRequest.url?.includes("/accounts/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const newAccess = await refreshAccessToken();
        if (newAccess) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Extract exact message from backend contract
    let extractedMessage = data?.message;
    if (!extractedMessage) {
      if (typeof data?.detail === "string") {
        extractedMessage = data.detail;
      } else if (typeof data?.error === "string") {
        extractedMessage = data.error;
      } else if (status === 401) {
        extractedMessage = "اسم المستخدم أو كلمة المرور غير صحيحة.";
      } else if (status === 403) {
        extractedMessage = "ليس لديك الصلاحية لتنفيذ هذا الإجراء.";
      } else if (status === 404) {
        extractedMessage = "المورد المطلوب غير موجود.";
      } else if (status === 429) {
        extractedMessage = "تم تجاوز حد الطلبات المسموح به، يرجى الانتظار قليلاً.";
      } else if (status >= 500) {
        extractedMessage = "حدث خطأ في الخادم، يرجى إعادة المحاولة لاحقاً.";
      } else {
        extractedMessage = "فشلت العملية، يرجى مراجعة البيانات والمحاولة مجدداً.";
      }
    }

    const extractedErrors =
      data?.errors ||
      (data && typeof data === "object" && !data.message && !data.detail && !data.code
        ? data
        : null);

    return Promise.reject(
      new ApiError({
        status,
        code: data?.code || `HTTP_${status}`,
        message: extractedMessage,
        errors: extractedErrors,
        meta: data?.meta || null,
        data: data?.data || null,
      })
    );
  }
);

/**
 * Standard API Client methods matching application architecture
 */
export const apiClient = {
  instance: axiosInstance,
  get: (url, config = {}) => axiosInstance.get(url, config),
  post: (url, data, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data, config = {}) => axiosInstance.put(url, data, config),
  patch: (url, data, config = {}) => axiosInstance.patch(url, data, config),
  delete: (url, config = {}) => axiosInstance.delete(url, config),
};
