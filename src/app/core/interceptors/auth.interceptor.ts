import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = sessionStorage.getItem('token');
  
  // Only attach JWT to our API endpoints, never leak to external URLs
  const isApiUrl = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api') || !req.url.startsWith('http');
  
  if (!authToken || !isApiUrl) {
    return next(req);
  }

  const authRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return next(authRequest);
};
