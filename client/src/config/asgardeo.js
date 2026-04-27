export const asgardeoConfig = {
  signInRedirectURL: import.meta.env.VITE_ASGARDEO_SIGN_IN_REDIRECT,
  signOutRedirectURL: import.meta.env.VITE_ASGARDEO_SIGN_OUT_REDIRECT,
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID,
  baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL,
  scope: ["openid", "profile", "email"],
};
