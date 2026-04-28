import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/Register.css';

const API_BASE = 'https://student-achievement-api.onrender.com';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rollNumber: '',
    department: '',
    cohort: '',
    role: 'STUDENT',
    otp: ''
  });
  const [errors, setErrors] = useState({});
  const [otpStage, setOtpStage] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Valid email is required';
    if (!/^[6-9][0-9]{9}$/.test(formData.phone)) nextErrors.phone = 'Enter a valid 10-digit phone number';
    if (!formData.rollNumber.trim()) nextErrors.rollNumber = 'Roll number is required';
    if (!formData.department) nextErrors.department = 'Department is required';
    if (!formData.cohort.trim()) nextErrors.cohort = 'Cohort is required';
    if (!formData.role) nextErrors.role = 'Role is required';
    return nextErrors;
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    if (isRequestingOtp) return;
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsRequestingOtp(true);
      const response = await fetch(`${API_BASE}/auth/request-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          rollNumber: formData.rollNumber,
          department: formData.department,
          cohort: formData.cohort
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Unable to send OTP');
      }
      setOtpStage(true);
      Swal.fire(
        'OTP generated',
        result.message,
        'success'
      );
    } catch (error) {
      console.error(error);
      Swal.fire('Registration failed', error.message || 'Unable to contact backend', 'error');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const verifyOtpAndRegister = async (e) => {
    e.preventDefault();
    if (isVerifyingOtp) return;
    if (!/^[0-9]{6}$/.test(formData.otp)) {
      setErrors({ otp: 'Enter a valid 6-digit OTP' });
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const response = await fetch(`${API_BASE}/auth/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          otp: formData.otp
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Unable to verify OTP');
      }
      Swal.fire('Registration completed', result.message, 'success').then(() => navigate('/login'));
    } catch (error) {
      console.error(error);
      Swal.fire('OTP verification failed', error.message || 'Unable to complete registration', 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="register-container">
      <button className="back-to-home" onClick={() => navigate('/')}>Back to Home</button>
      <div className="register-card">
        <div className="register-header">
          <h1>Create Your Account</h1>
          <p>
            {otpStage
              ? 'Enter the 6-digit OTP sent for your registration request'
              : 'Register as a student or admin using OTP verification with your email and phone number'}
          </p>
        </div>

        {!otpStage ? (
          <form onSubmit={requestOtp}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@college.edu"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={errors.role ? 'error' : ''}
                >
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Admin</option>
                </select>
                {errors.role && <span className="error-text">{errors.role}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Roll Number *</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="e.g., 2400030764"
                  className={errors.rollNumber ? 'error' : ''}
                />
                {errors.rollNumber && <span className="error-text">{errors.rollNumber}</span>}
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={errors.department ? 'error' : ''}
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="MECH">Mechanical Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="EEE">Electrical Engineering (EEE)</option>
                  <option value="Administration">Administration</option>
                </select>
                {errors.department && <span className="error-text">{errors.department}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Cohort/Year *</label>
                <input
                  type="text"
                  name="cohort"
                  value={formData.cohort}
                  onChange={handleChange}
                  placeholder="e.g., 2024-2028"
                  className={errors.cohort ? 'error' : ''}
                />
                {errors.cohort && <span className="error-text">{errors.cohort}</span>}
              </div>
            </div>

            <button type="submit" className="register-btn" disabled={isRequestingOtp} style={{ opacity: isRequestingOtp ? 0.8 : 1, cursor: isRequestingOtp ? 'wait' : 'pointer' }}>
              {isRequestingOtp ? 'Sending OTP...' : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtpAndRegister}>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Enter OTP *</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className={errors.otp ? 'error' : ''}
                />
                {errors.otp && <span className="error-text">{errors.otp}</span>}
              </div>
            </div>
            <button type="submit" className="register-btn" disabled={isVerifyingOtp} style={{ opacity: isVerifyingOtp ? 0.8 : 1, cursor: isVerifyingOtp ? 'wait' : 'pointer' }}>
              {isVerifyingOtp ? 'Verifying OTP...' : 'Verify OTP and Register'}
            </button>
            <div className="login-link">
              Need a new OTP?
              <button type="button" onClick={() => setOtpStage(false)}>Go back</button>
            </div>
          </form>
        )}

        <div className="login-link">
          Already have an account?
          <button onClick={() => navigate('/login')}>Login here</button>
        </div>
      </div>
    </div>
  );
};

export default Register;

