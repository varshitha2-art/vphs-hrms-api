/**
 * VPHS Services Pvt. Ltd. - HRMS Mobile Configuration
 *
 * Dedicated mobile service and configuration file for API endpoints,
 * session settings, and application constants.
 */

export const AppConfig = {
  appName: 'VPHS Services Pvt. Ltd.',
  shortName: 'VPHS HRMS',
  tagline: 'Facility Management & HR ERP Mobile Portal',
  supportEmail: 'hr@vphsservices.com',
  supportPhone: '+91 80 1234 5678',

  api: {
    // Production REST API endpoint
    baseUrl: 'https://vphs-hrms-api.onrender.com',
    auth: {
      login: '/api/auth/login',
      me: '/api/auth/me',
      logout: '/api/auth/logout',
    },
    timeoutMs: 20000,
  },

  storageKeys: {
    authToken: 'vphs_hrms_token',
    authUser: 'vphs_hrms_user_profile',
    lastUsername: 'vphs_hrms_saved_username',
  },
} as const;

export type AppConfigType = typeof AppConfig;
