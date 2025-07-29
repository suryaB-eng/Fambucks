'use client';

import { useState } from 'react';

export default function RegisterForm() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // 🛡 Password strength checker
  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return 'Weak';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password))
      return 'Strong';
    return 'Medium';
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill out all fields.');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Invalid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);


    try {

      console.log(`${formData}`)
      // 📤 Send registration request
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // 🔐 Auto-login by saving JWT to localStorage or cookies
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) throw new Error(loginData.message || 'Login failed');

      // You can also set JWT in localStorage or handle auth state globally
      localStorage.setItem('token', loginData.token);

      setSuccess('Registration successful! Logged in.');
      setFormData({ name: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />
      <div className="text-sm">
        Password strength:{" "}
        <span
          className={`font-semibold ${
            passwordStrength === 'Strong'
              ? 'text-green-600'
              : passwordStrength === 'Medium'
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}
        >
          {passwordStrength}
        </span>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
    </form>
  );
}
