import { authService } from "./authService";
import { profileService } from "./profileService";

export const userService = {
  /**
   * Fetch current user identity
   */
  async getCurrentUser() {
    return await authService.getCurrentUser();
  },

  /**
   * Fetch user full profile
   */
  async getProfile() {
    return await profileService.getProfile();
  },

  /**
   * Update personal profile details
   */
  async updateProfile(data) {
    return await profileService.updateProfile(data);
  },

  /**
   * Change user password
   */
  async changePassword(data) {
    return await profileService.changePassword(data);
  },
};
