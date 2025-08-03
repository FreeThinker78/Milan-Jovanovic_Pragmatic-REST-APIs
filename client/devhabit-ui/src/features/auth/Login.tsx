import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

interface LocationState {
  from?: Location;
}

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: loginContext } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await login({ email, password });

      // Store tokens and redirect
      loginContext(response.accessToken, response.refreshToken);

      // Redirect to the page they tried to visit or dashboard
      const state = location.state as LocationState;
      const destination = state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  return <LoginForm onSubmit={handleLogin} error={error} />;
}
