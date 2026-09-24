import { useState } from 'react';
import { login, type AuthUser } from '../../services/authService';
import { Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (
    user: AuthUser,
    password: string
  ) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<'Admin' | 'User'>('Admin');
  const [email, setEmail] = useState('admin@deeptech.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole: 'Admin' | 'User') => {
    setRole(newRole);
    setError('');

    if (newRole === 'Admin') {
      setEmail('admin@deeptech.com');
      setPassword('123456');
    } else {
      setEmail('user@deeptech.com');
      setPassword('123456');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      if (!user) {
        setError('Invalid email or password');
        return;
      }

      if (user.role !== role) {
        setError(
          `This account is registered as ${user.role}. Please select the ${user.role} tab.`
        );
        return;
      }

      onLogin(user, password);
    } catch (error) {
      console.error('Login failed:', error);
      setError('Unable to connect to the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div>DeepTech</div>
          <span>INNOVATION CENTRE</span>
        </div>

        <div className="login-icon">
          <Sparkles />
        </div>

        <h1>Welcome back</h1>

        <p className="login-subtitle">
          Sign in to manage your innovation centre resources.
        </p>

        <div className="login-role-toggle">
          <button
            type="button"
            className={`login-role-btn ${
              role === 'Admin' ? 'active' : ''
            }`}
            onClick={() => handleRoleChange('Admin')}
          >
            Admin
          </button>

          <button
            type="button"
            className={`login-role-btn ${
              role === 'User' ? 'active' : ''
            }`}
            onClick={() => handleRoleChange('User')}
          >
            User
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </label>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="demo-credentials">
          <p>DEMO ACCOUNTS</p>
          <span>Admin: admin@deeptech.com / 123456</span>
          <span>User: user@deeptech.com / 123456</span>
        </div>
      </div>
    </div>
  );
}