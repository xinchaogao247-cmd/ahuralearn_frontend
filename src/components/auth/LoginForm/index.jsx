import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '../../../api/user/user';
import Logo from '../../common/Logo';
import authErrorImage from '../../../assets/images/emptyStates/auth_error.png';
import styles from './LoginForm.module.css';
import { showToast } from '../../common/toast';

export default function LoginForm() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [showErrorState, setShowErrorState] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorText) setErrorText('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setErrorText('Please enter both username and password.');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9]{4,}$/;
    if (!usernameRegex.test(formData.username)) {
      setErrorText('Username must be at least 4 characters long and only contain letters and numbers.');
      return;
    }

    // Validate password format
    if (formData.password.length < 6) {
      setErrorText('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setShowErrorState(false);
    try {
      const { accessToken, refreshToken } = await login(formData);
      showToast('Login Successful!', "success");
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      navigate('/homepage');
    } catch (error) {
      if (error.isBusinessError) {
        showToast(error.message || 'Login failed', "error");
        setErrorText('Login failed, please check your information and try again.');
      } else {
        // No business error
        setShowErrorState(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showErrorState) {
    return (
      <div className={styles.formBox}>
        <div className={styles.emptyStateContainer}>
          <img
            src={authErrorImage}
            alt="Authentication Error"
            className={styles.emptyStateImage}
          />
          <h2 className={styles.emptyStateTitle}>Oops! Something went wrong</h2>
          <p className={styles.emptyStateDescription}>
            We encountered a problem while trying to log you in. Please check your network and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formBox}>
      <Logo />
      <div className={styles.formHeader}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Please enter your information to log in</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <div className={styles.labelWrapper}>
            <label className={styles.label}>Username</label>
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className={styles.inputField}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <div className={styles.labelWrapper}>
            <label className={styles.label}>Password</label>
          </div>
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={styles.inputField}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.togglePasswordBtn}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        {errorText && <p className={styles.errorText}>{errorText}</p>}
        <button type="submit" disabled={isLoading} className={styles.submitBtn}>
          {isLoading ? 'LOGGING IN...' : 'Sign in'}
        </button>
      </form>
      <div className={styles.bottomLinkText}>
        Don't have an account yet?{' '}
        <Link to="/signup" className={styles.bottomLink}>Create an account</Link>
      </div>
    </div>
  );
}
