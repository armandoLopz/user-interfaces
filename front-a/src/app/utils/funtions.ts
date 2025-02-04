import { AuthService } from '../services/auth/auth.service';
import { tokenRequest } from '../interfaces/interfaces.models';

export const loadingFuntion = (
  authService: AuthService,
  user: any,
  setLoading: (loading: boolean) => void
) => {
  setLoading(true);

  authService.login(user).subscribe({
    next: (response: tokenRequest) => {
      const accessToken = response?.access;

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        //router.navigate(['/admin']);
      } else {
        console.error('No se encontró el token en la respuesta.');
      }
    },
    error: (err) => {
      console.error('Error en login:', err);
      alert('Error en login: ' + (err.error?.message || 'Intenta de nuevo'));
      setLoading(false);
    },
    complete: () => {
      setLoading(false);
    }
  });
};
