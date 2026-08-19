import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/utils/apiService';
import AuthShell from '@/components/AuthShell';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/components/ui/input-group';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);

      // Store token and user data
      if (response.data?.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
      }
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Notify app of auth change
      window.dispatchEvent(new Event('authChange'));

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your bookings, cars, and exchanges."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-foreground hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertCircleIcon />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={error ? true : undefined}
            />
          </Field>

          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={error ? true : undefined}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Spinner data-icon="inline-start" />}
            {loading ? 'Logging in…' : 'Log in'}
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  );
};

export default Login;
