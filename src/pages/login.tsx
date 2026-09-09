import { useState } from 'react';
import { login } from '../services/authService';
import { Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (user: {
    name: string;
    email: string;
    role: 'Admin' | 'User';
  }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    const user = login(email, password);

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    onLogin(user);
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-brand">
          <div>DeepTech</div>
          <span>innovation centre</span>
        </div>

        <div className="login-icon">
          <Sparkles />
        </div>

        <h1>Welcome back</h1>

        <p className="login-subtitle">
          Sign in to manage your innovation centre resources.
        </p>

        <form onSubmit={handleLogin}>

          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
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
          >
            Sign in
          </button>

        </form>

        <div className="demo-credentials">

          <p>Demo accounts</p>

          <span>
            Admin: admin@deeptech.com / 123456
          </span>

          <span>
            User: user@deeptech.com / 123456
          </span>

        </div>

      </div>

    </div>
  );
}