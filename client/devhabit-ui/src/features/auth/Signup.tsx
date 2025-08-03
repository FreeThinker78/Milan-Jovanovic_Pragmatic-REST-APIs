import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from './SignupForm';
import { register } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      setError(null);
      const response = await register({ name, email, password, confirmPassword });

      // Store tokens and redirect
      login(response.accessToken, response.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Signup error:', err);
    }
  };

  return <SignupForm onSubmit={handleSignup} error={error} />;
}
