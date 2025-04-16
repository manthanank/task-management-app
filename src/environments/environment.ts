export const environment = {
  production: false,
  apiUrl:
    window.location.hostname === 'localhost'
      ? 'http://localhost:3000/api'
      : 'https://task-management-app-8t3d.vercel.app/api',
  trackingApiUrl: 'https://visitor-tracking-api.vercel.app/api/visit',
};
