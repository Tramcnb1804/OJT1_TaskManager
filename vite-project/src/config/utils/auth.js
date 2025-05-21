// utils/auth.js
import Cookies from 'js-cookie';
export const getAuthToken = () => {
  return Cookies.get('access_token');
};
// utils/auth.js

export const getUserInfo = () => {
  const raw = localStorage.getItem("user_info");
  return raw ? JSON.parse(raw) : null;
};

export const isAdmin = () => {
  const user = getUserInfo();
  return user?.role === "admin";
};

export const login = (token, userInfo) => {
  localStorage.setItem("access_token", token);
  localStorage.setItem("user_info", JSON.stringify(userInfo));
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_info");
};
