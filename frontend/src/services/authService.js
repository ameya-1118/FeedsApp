import API from "./api.js";

export const register = async (userData) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await API.post("/auth/verify-otp", { user: email, otp });
  return response.data;
};

export const login = async (email, password) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await API.post("/auth/forgot-password", { email });
  return response.data;
};

export const verifyResetOTP = async (email, otp) => {
  const response = await API.post("/auth/verify-reset-otp", { email, otp });
  return response.data;
};

export const resetPassword = async (email, password) => {
  const response = await API.post("/auth/reset-password", {
    email,
    password,
  });
  return response.data;
};

export const logout = async () => {
  const response = await API.post("/auth/logout");
  return response.data;
};

export const getAllUsers = async () => {
  const response = await API.get("/auth/users");
  return response.data;
};
