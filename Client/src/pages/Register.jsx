import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/utils/apiService';
import AuthShell from '@/components/AuthShell';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/components/ui/input-group';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Create username from email if not provided
      const username = formData.username || formData.email.split('@')[0];

      const response = await authAPI.register({
        fullName: formData.fullName,
        username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      // Auto-login after successful registration
      if (response.data) {
        const loginResponse = await authAPI.login({
          email: formData.email,
          password: formData.password
        });

        if (loginResponse.data?.accessToken) {
          localStorage.setItem('token', loginResponse.data.accessToken);
        }
        if (loginResponse.data?.user) {
          localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
        }

        // Notify app of auth change
        window.dispatchEvent(new Event('authChange'));
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const invalid = error ? true : undefined;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join DriveShare and start renting, hosting, or exchanging today."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Log in
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
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              autoComplete="name"
              placeholder="Jordan Mehta"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={invalid}>
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
              />
            </Field>

            <Field data-invalid={invalid}>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                autoComplete="tel"
                placeholder="98765 43210"
              />
            </Field>
          </div>

          <Field data-invalid={invalid}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
                aria-invalid={invalid}
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
            <FieldDescription>Use at least 6 characters.</FieldDescription>
          </Field>

          <Field data-invalid={invalid}>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
            <Input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Re-enter your password"
              aria-invalid={invalid}
            />
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Spinner data-icon="inline-start" />}
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  );
};

export default Register;
