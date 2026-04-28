import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAppContext } from '../context/AppContext';
import '../styles/Login.css';

const API_BASE = 'http://localhost:8080';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { setCurrentUser } = useAppContext();
  const navigate = useNavigate();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(captcha);
    setCaptchaInput('');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser?.rememberMe) {
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Unable to restore saved login state', error);
      }
    }
    generateCaptcha();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSigningIn) return;
    const normalizedEmail = email.trim();
    const normalizedPassword = password;

    if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
      Swal.fire('Invalid captcha', 'Please enter the correct captcha.', 'error');
      generateCaptcha();
      return;
    }

    try {
      setIsSigningIn(true);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword })
      });
      const userData = await res.json();
      if (!res.ok || !userData || !userData.id) {
        throw new Error(userData.message || 'Invalid credentials');
      }

      const normalizedRole = userData.role?.toLowerCase();
      if (role === 'admin' && normalizedRole !== 'admin' && normalizedRole !== 'co-admin') {
        throw new Error('This account is not an admin account');
      }
      if (role === 'student' && normalizedRole !== 'student') {
        throw new Error('This account is not a student account');
      }

      const nextUser = { ...userData, rememberMe };

      setCurrentUser(nextUser);

      if (!nextUser.passwordChanged) {
        Swal.fire('Temporary password in use', 'This is a default password. Use Forgot Password to set your personal password.', 'info');
      }

      navigate(role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      console.error(err);
      Swal.fire('Login failed', err.message || 'Error connecting to backend', 'error');
      generateCaptcha();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (isResettingPassword) return;
    const emailPrompt = await Swal.fire({
      title: 'Reset Password',
      html: `
        <input id="reset-email" class="swal2-input" placeholder="Registered email" type="email" value="${email}">
      `,
      confirmButtonText: 'Send OTP',
      showCancelButton: true,
      preConfirm: () => {
        const enteredEmail = document.getElementById('reset-email').value;
        if (!enteredEmail) {
          Swal.showValidationMessage('Email is required');
        }
        return { enteredEmail };
      }
    });

    if (!emailPrompt.isConfirmed) return;

    try {
      setIsResettingPassword(true);
      const requestOtpRes = await fetch(`${API_BASE}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailPrompt.value.enteredEmail.trim(), role: role.toUpperCase() })
      });
      const otpData = await requestOtpRes.json();
      if (!requestOtpRes.ok) {
        throw new Error(otpData.message || 'Unable to send OTP');
      }

      const resetPrompt = await Swal.fire({
        title: 'Enter OTP and New Password',
        html: `
          <input id="reset-otp" class="swal2-input" placeholder="6-digit OTP" maxlength="6">
          <input id="reset-password" class="swal2-input" placeholder="New password with @" type="password">
        `,
        confirmButtonText: 'Update Password',
        showCancelButton: true,
        preConfirm: () => {
          const otp = document.getElementById('reset-otp').value;
          const newPassword = document.getElementById('reset-password').value;
          if (!otp || !newPassword) {
            Swal.showValidationMessage('OTP and new password are required');
            return null;
          }
          if (!newPassword.includes('@')) {
            Swal.showValidationMessage('Password must contain @');
            return null;
          }
          return { otp, newPassword };
        }
      });

      if (!resetPrompt.isConfirmed) return;

      const resetRes = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailPrompt.value.enteredEmail.trim(),
          role: role.toUpperCase(),
          otp: resetPrompt.value.otp,
          newPassword: resetPrompt.value.newPassword
        })
      });
      const resetText = await resetRes.text();
      if (!resetRes.ok) {
        throw new Error(resetText || 'Unable to reset password');
      }
      Swal.fire('Password updated', resetText, 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Reset failed', error.message || 'Could not reset password', 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="login-container">
      <button className="back-home-btn" onClick={() => navigate('/')}>Back to Home</button>
      <div className="login-card">
        <div className="role-toggle">
          <button className={`role-btn ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>Student</button>
          <button className={`role-btn ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>Admin</button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
          </div>
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Remember me
            </label>
            <button type="button" className="forgot-password" onClick={handleForgotPassword}>Forgot Password?</button>
          </div>
          <div className="form-group captcha-group">
            <label>Captcha Verification</label>
            <div className="captcha-container">
              <div className="captcha-display"><span className="captcha-text">{captchaCode}</span></div>
              <button type="button" className="captcha-refresh" onClick={generateCaptcha} title="Refresh Captcha">Refresh</button>
            </div>
            <input type="text" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Enter the captcha above" required maxLength={6} />
          </div>
          <button type="submit" className="login-btn" disabled={isSigningIn} style={{ opacity: isSigningIn ? 0.8 : 1, cursor: isSigningIn ? 'wait' : 'pointer' }}>
            {isSigningIn ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
