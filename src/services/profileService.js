import { apiClient } from "@/lib/apiClient";

export const profileService = {
  /**
   * Fetch complete profile of currently authenticated user.
   */
  async getProfile() {
    const response = await apiClient.get("/accounts/profile");
    return response.data;
  },

  /**
   * Partially update editable personal profile fields:
   * (first_name, last_name, email, phone, address, gender, age)
   */
  async updateProfile(data) {
    const payload = {};

    if (data.email !== undefined) payload.email = data.email;
    if (data.first_name !== undefined) payload.first_name = data.first_name;
    if (data.last_name !== undefined) payload.last_name = data.last_name;

    const profileFields = {};
    if (data.address !== undefined) profileFields.address = data.address;
    if (data.phone !== undefined) profileFields.phone = data.phone;
    if (data.gender !== undefined && data.gender !== "") {
      profileFields.gender = data.gender;
    }
    if (data.age !== undefined && data.age !== null && data.age !== "") {
      profileFields.age = parseInt(data.age, 10);
    }

    if (Object.keys(profileFields).length > 0) {
      payload.profile = profileFields;
    }

    const response = await apiClient.patch("/accounts/profile", payload);
    return response.data;
  },

  /**
   * Change password of current authenticated user.
   */
  async changePassword({ current_password, new_password, new_password_confirm }) {
    const response = await apiClient.post("/accounts/change_password", {
      current_password,
      new_password,
      new_password_confirm,
    });
    return response;
  },
};
