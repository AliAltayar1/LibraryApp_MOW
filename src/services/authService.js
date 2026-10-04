import { apiClient, setAccessToken, clearAuthData } from "@/lib/apiClient";

export const authService = {
  /**
   * Fetch list of active governorates for registration and assignment.
   * Public endpoint: GET /accounts/governorates
   */
  async getGovernorates() {
    const response = await apiClient.get("/accounts/governorates", {
      skipAuth: true,
    });

    console.log("Governorates response:", response);
    return response.data || [];
  },

  /**
   * Self-registration for new readers.
   * Public endpoint: POST /accounts/register
   * Rules:
   * - Role is ALWAYS READER (do NOT send role).
   * - Governorate is required (integer id).
   * - Library is NOT sent.
   * - password and password2 must match.
   */
  async register({
    username,
    email,
    first_name,
    last_name,
    password,
    password2,
    governorate,
  }) {
    const payload = {
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      password,
      password2,
      governorate: parseInt(governorate, 10),
    };

    const response = await apiClient.post("/accounts/register", payload, {
      skipAuth: true,
    });
    return response;
  },

  /**
   * Log in user with identifier (username or email) and password.
   * Server sends access token in body and refresh_token in HttpOnly cookie.
   * Public endpoint: POST /accounts/login
   */
  async login({ identifier, username, password }) {
    const userIdentifier = identifier || username;
    const response = await apiClient.post(
      "/accounts/login",
      {
        identifier: userIdentifier.trim().toLowerCase(),
        password,
      },
      { skipAuth: true },
    );

    if (response?.data?.access) {
      setAccessToken(response.data.access);
    }

    return response.data;
  },

  /**
   * Refresh JWT access token using HttpOnly refresh_token cookie.
   * POST /accounts/refresh
   */
  async refresh() {
    const response = await apiClient.post("/accounts/refresh", null, {
      skipAuth: true,
    });

    if (response?.data?.access) {
      setAccessToken(response.data.access);
    }

    return response.data;
  },

  /**
   * Log out user. Blacklists refresh token on server and removes cookie.
   * POST /accounts/logout
   */
  async logout() {
    try {
      await apiClient.post("/accounts/logout", null);
    } catch (err) {
      console.warn("Logout request completed with notice:", err);
    } finally {
      clearAuthData();
    }
  },

  /**
   * Fetch current authenticated user identity and role from DB.
   * Protected endpoint: GET /accounts/me
   */
  async getCurrentUser() {
    const response = await apiClient.get("/accounts/me");
    return response.data;
  },
};
