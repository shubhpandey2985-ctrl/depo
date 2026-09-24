import { useState } from 'react';
import { login } from '../../services/authService';
import { Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (
    user: {
      id: string;
      name: string;
      email: string;
      profession: string;
      role: 'Admin' | 'User';
      mustChangePassword: boolean;
    },
    password: string
  ) => void;
}

export default function Login({
  onLogin,
}: LoginProps) {

  const [role, setRole] =
    useState<'Admin' | 'User'>('Admin');

  const [email, setEmail] =
    useState('admin@deeptech.com');

  const [password, setPassword] =
    useState('123456');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const handleRoleChange = (
    newRole: 'Admin' | 'User'
  ) => {

    setRole(newRole);

    setError('');

    if (newRole === 'Admin') {
      setEmail('admin@deeptech.com');
    } else {
      setEmail('');
    }

    setPassword('');
  };

  const handleLogin = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError('');
    setLoading(true);

    try {

      const user =
        await login(email, password);

      if (!user) {
        setError(
          'Invalid email or password'
        );
        return;
      }

      if (user.role !== role) {
        setError(
          `This account is registered as ${user.role}. Please select the ${user.role} tab.`
        );
        return;
      }

      // Pass the authenticated user and
      // password to App.tsx for the
      // temporary-password change flow.
      onLogin(user, password);

    } catch (error) {

      console.error(
        'Login failed:',
        error
      );

      setError(
        'Unable to connect to the backend.'
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">

          <div className="login-icon">
            <Sparkles size={24} />
          </div>

          <h1>
            DeepTech
          </h1>

          <p>
            Innovation Centre
          </p>

        </div>

        <div className="login-role-tabs">

          <button
            type="button"
            className={
              role === 'Admin'
                ? 'active'
                : ''
            }
            onClick={() =>
              handleRoleChange('Admin')
            }
          >
            Admin
          </button>

          <button
            type="button"
            className={
              role === 'User'
                ? 'active'
                : ''
            }
            onClick={() =>
              handleRoleChange('User')
            }
          >
            User
          </button>

        </div>

        <form onSubmit={handleLogin}>

          <div className="form-group">

            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              required
              disabled={loading}
            />

          </div>

          <div className="form-group">

            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              required
              disabled={loading}
            />

          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : 'Sign in'}
          </button>

        </form>

      </div>

    </div>
  );
}