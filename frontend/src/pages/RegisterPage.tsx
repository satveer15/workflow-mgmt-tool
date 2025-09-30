import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts';
import { Button, Input, Select, Card } from '../components';
import './AuthPages.css';

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
}

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Role validation
    if (!role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (): string => {
    if (!password) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSuccess(false);

    if (!validateForm()) return;

    try {
      await register({ username, email, password, role });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Registration failed');
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Sign up to get started with Workflow Management</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            placeholder="Enter your username"
            fullWidth
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="Enter your email"
            fullWidth
            required
          />

          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Enter your password"
              fullWidth
              required
            />
            {password && (
              <div className={`password-strength password-strength-${passwordStrength}`}>
                <div className="password-strength-bar"></div>
                <span className="password-strength-text">
                  {passwordStrength === 'weak' && '⚠️ Weak'}
                  {passwordStrength === 'medium' && '✓ Medium'}
                  {passwordStrength === 'strong' && '✓✓ Strong'}
                </span>
              </div>
            )}
          </div>

          <Select
            label="Role"
            value={role}
            onChange={setRole}
            error={errors.role}
            placeholder="Select your role"
            options={[
              { value: 'EMPLOYEE', label: 'Employee' },
              { value: 'MANAGER', label: 'Manager' },
              { value: 'ADMIN', label: 'Admin' },
            ]}
            fullWidth
            required
          />

          {apiError && <div className="auth-error">{apiError}</div>}
          {success && (
            <div className="auth-success">
              ✓ Registration successful! Redirecting to login...
            </div>
          )}

          <Button type="submit" fullWidth loading={isLoading} disabled={success}>
            {success ? 'Success!' : 'Create Account'}
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Login here
          </Link>
        </div>
      </Card>
    </div>
  );
};
