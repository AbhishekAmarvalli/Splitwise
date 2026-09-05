import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FriendshipCharacters from '../components/FriendshipCharacters';
import toast from 'react-hot-toast';

function validateEmail(email) {
  if (!email.trim()) return 'Email is required';
  if (email.length > 255) return 'Email must be at most 255 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return '';
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 128) return 'Password must be at most 128 characters';
  return '';
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = (field, value) => {
    switch (field) {
      case 'email': return validateEmail(value);
      case 'password': return validatePassword(value);
      default: return '';
    }
  };

  const handleChange = (field, value) => {
    if (field === 'email') setEmail(value);
    else setPassword(value);
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
    }
  };

  const handleBlur = (field) => {
    const value = field === 'email' ? email : password;
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setErrors({ email: emailErr, password: passwordErr });
    setTouched({ email: true, password: true });
    if (emailErr || passwordErr) return;

    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <FriendshipCharacters variant="wave" size={160} />
          <h1>💸 SplitWise Clone</h1>
          <p>Sign in to manage your shared expenses</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="you@example.com"
              maxLength={255}
              required
              className={touched.email && errors.email ? 'field-error' : ''}
            />
            {touched.email && errors.email && (
              <span className="field-error-msg">{errors.email}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              minLength={6}
              maxLength={128}
              required
              className={touched.password && errors.password ? 'field-error' : ''}
            />
            {touched.password && errors.password && (
              <span className="field-error-msg">{errors.password}</span>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
        <div className="demo-credentials">
          <p><strong>Demo accounts:</strong></p>
          <p>alice@example.com / password123</p>
          <p>bob@example.com / password123</p>
        </div>
      </div>
    </div>
  );
}
