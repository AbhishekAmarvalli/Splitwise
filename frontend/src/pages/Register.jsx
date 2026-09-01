import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function validateName(name) {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length > 255) return 'Name must be at most 255 characters';
  return '';
}

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

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = (field, value) => {
    switch (field) {
      case 'name': return validateName(value);
      case 'email': return validateEmail(value);
      case 'password': return validatePassword(value);
      default: return '';
    }
  };

  const handleChange = (field, value) => {
    if (field === 'name') setName(value);
    else if (field === 'email') setEmail(value);
    else setPassword(value);
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
    }
  };

  const handleBlur = (field) => {
    const value = field === 'name' ? name : field === 'email' ? email : password;
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setErrors({ name: nameErr, email: emailErr, password: passwordErr });
    setTouched({ name: true, email: true, password: true });
    if (nameErr || emailErr || passwordErr) return;

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      toast.success('Account created!');
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
          <h1>💸 SplitWise Clone</h1>
          <p>Create an account to start splitting expenses</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="John Doe"
              maxLength={255}
              required
              className={touched.name && errors.name ? 'field-error' : ''}
            />
            {touched.name && errors.name && (
              <span className="field-error-msg">{errors.name}</span>
            )}
          </div>
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
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
