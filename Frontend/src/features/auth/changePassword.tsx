import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { saveApiCredentials } from '../../services/api';

interface ChangePasswordProps {
  email: string;
  currentPassword: string;
  onPasswordChanged: (newPassword: string) => void;
}

export default function ChangePassword({
  email,
  currentPassword,
  onPasswordChanged,
}: ChangePasswordProps) {

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError('');

    if (!newPassword.trim()) {
      setError('Enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError(
        'New password must contain at least 6 characters'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword === currentPassword) {
      setError(
        'New password must be different from the temporary password'
      );
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        'http://localhost:8080/api/auth/change-password',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization:
              `Basic ${btoa(
                `${email}:${currentPassword}`
              )}`,
          },

          body: JSON.stringify({
            newPassword,
          }),
        }
      );

      if (!response.ok) {

        let message =
          'Failed to change password';

        try {

          const errorData =
            await response.json();

          if (errorData?.error) {
            message = errorData.error;
          }

        } catch {}

        throw new Error(message);
      }

      /*
       * The old Basic Auth password is no longer valid.
       * Store the new credentials for future API requests.
       */
      saveApiCredentials(
        email,
        newPassword
      );

      onPasswordChanged(
        newPassword
      );

    } catch (err) {

      console.error(
        'Password change failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to change password'
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
            Change your password
          </h1>

          <p>
            Your account was created with
            a temporary password.
          </p>

          <p>
            Please create a new password
            before continuing.
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label htmlFor="new-password">
              New password
            </label>

            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="Enter new password"
              disabled={loading}
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="confirm-password">
              Confirm new password
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Re-enter new password"
              disabled={loading}
              required
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
              ? 'Changing password...'
              : 'Change password'}
          </button>

        </form>

      </div>

    </div>
  );
}