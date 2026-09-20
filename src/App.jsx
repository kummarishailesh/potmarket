 //app.js
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, Heart, Star, Menu, Filter, Truck, Shield, RotateCcw, X, Package, Sprout, FileText, Image, File, MessageSquare, ShoppingBag, Layout, Palette, Puzzle, Settings, Check, Sun, Moon, MapPin, LogOut } from 'lucide-react';

// Animated Bubble Background Component
const BubbleBackground = ({ theme }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background Image or Gradient */}
      {theme.backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${theme.backgroundImage})`,
            filter: 'brightness(0.8) blur(0.5px)'
          }}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.background}`}></div>
      )}

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>

      {/* Animated Bubbles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full opacity-15 animate-bubble-${i % 4 + 1}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 80 + 40}px`,
            height: `${Math.random() * 80 + 40}px`,
            background: `radial-gradient(circle, ${theme.bubbleColors[i % 6]}25, ${theme.bubbleColorsDark[i % 6]}15)`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 10 + 20}s`,
          }}
        />
      ))}
    </div>
  );
};

// Theme Selector Component
const ThemeSelector = ({ currentTheme, onThemeChange, onClose, theme, onOpenCustomPicker, availableThemes }) => {
  const allThemes = { ...availableThemes.default, ...availableThemes.custom };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className={`${theme.cardBg} dark:bg-[#0b1220] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Choose Theme</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(allThemes).map(([key, themeData]) => (
            <div
              key={key}
              onClick={() => onThemeChange(key)}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105 ${
                currentTheme === key
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {currentTheme === key && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  ✓
                </div>
              )}

              <div className="text-center mb-3">
                <div className="text-3xl mb-2">{themeData.icon}</div>
                <h3 className={`font-semibold ${theme.textPrimary}`}>{themeData.name}</h3>
              </div>

              

              {/* Theme Preview */}
              <div className="space-y-2">
                {themeData.backgroundImage && (
                  <div
                    className="h-16 rounded bg-cover bg-center relative overflow-hidden"
                    style={{ backgroundImage: `url(${themeData.backgroundImage})` }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    <div className="relative h-full flex items-center justify-center">
                      <div className="text-white text-xs font-medium">{themeData.name} Theme</div>
                    </div>
                  </div>
                )}
                <div className={`h-8 rounded bg-gradient-to-r ${themeData.headerBg} flex items-center justify-center`}>
                  <div className="text-white text-xs font-medium">Header</div>
                </div>
                <div className={`h-12 rounded ${themeData.cardBg} border flex items-center justify-center`}>
                  <div className="text-xs text-gray-600">Card Content</div>
                </div>
                <div className="flex space-x-1">
                  {themeData.bubbleColors.slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onOpenCustomPicker}
            className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Create Custom Theme
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Color Picker Component
const CustomColorPicker = ({ onColorChange, onCreateTheme, onClose }) => {
  const [themeName, setThemeName] = useState('');
  const [colors, setColors] = useState({
    primary: '#10B981',
    secondary: '#059669',
    accent: '#34D399',
    background: '#ffffff'
  });

  const handleColorChange = (colorType, value) => {
    setColors(prev => ({ ...prev, [colorType]: value }));
  };

  const handleCreateTheme = () => {
    if (!themeName.trim()) {
      alert('Please enter a theme name');
      return;
    }

    const customTheme = {
      name: themeName,
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: `from-${colors.background.replace('#', '')}-50 to-${colors.primary.replace('#', '')}-50`,
      backgroundImage: null,
      bubbleColors: [colors.primary, colors.secondary, colors.accent, colors.primary, colors.secondary, colors.accent],
      bubbleColorsDark: [colors.secondary, colors.primary, colors.accent, colors.secondary, colors.primary, colors.accent],
      headerBg: `from-${colors.primary.replace('#', '')}-700 to-${colors.primary.replace('#', '')}-600`,
      cardBg: 'bg-white',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-600',
      icon: 'theme'
    };

    onCreateTheme(customTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#0b1220] rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Custom Theme</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl dark:text-gray-300">Close</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Theme Name</label>
            <input
              type="text"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="My Custom Theme"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Primary Color</label>
            <input
              type="color"
              value={colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-full h-10 border rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Secondary Color</label>
            <input
              type="color"
              value={colors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="w-full h-10 border rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Accent Color</label>
            <input
              type="color"
              value={colors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              className="w-full h-10 border rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Background Color</label>
            <input
              type="color"
              value={colors.background}
              onChange={(e) => handleColorChange('background', e.target.value)}
              className="w-full h-10 border rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleCreateTheme}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 active:scale-95 active:shadow-lg transition"
          >
            Create Theme
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Configuration - Update these values for your business
const BUSINESS_CONFIG = {
  RAZORPAY_KEY_ID: 'YOUR_RAZORPAY_KEY_ID',
  BUSINESS_NAME: 'PotMarket'
};

const isGatewayPayment = paymentMethod => ['online', 'upi'].includes(String(paymentMethod || '').toLowerCase());

// Theme Configuration
const THEMES = {
  default: {
    name: 'Default',
    primary: '#10B981',
    secondary: '#059669',
    accent: '#34D399',
    background: 'from-blue-50 via-purple-50 to-pink-50',
    backgroundImage: null,
    bubbleColors: ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'],
    bubbleColorsDark: ['#1E40AF', '#7C3AED', '#BE185D', '#059669', '#D97706', '#DC2626'],
    headerBg: 'from-green-700 to-green-600',
    cardBg: 'bg-white',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    icon: '🪴'
  },
  drama: {
    name: 'Drama',
    primary: '#26cadcff',
    secondary: '#B91C1C',
    accent: '#6344efff',
    background: 'from-red-50 via-rose-50 to-pink-50',
    backgroundImage: 'https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    bubbleColors: ['#DC2626', '#B91C1C', '#EF4444', '#F87171', '#FCA5A5', '#FED7D7'],
    bubbleColorsDark: ['#991B1B', '#7F1D1D', '#B91C1C', '#DC2626', '#EF4444', '#F87171'],
    headerBg: 'from-red-700 to-red-600',
    cardBg: 'bg-red-50',
    textPrimary: 'text-red-900',
    textSecondary: 'text-red-700',
    icon: '🪴'
  },
  cricket: {
    name: 'Cricket',
    primary: '#059669',
    secondary: '#047857',
    accent: '#10B981',
    background: 'from-green-50 via-emerald-50 to-teal-50',
    backgroundImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    bubbleColors: ['#059669', '#047857', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
    bubbleColorsDark: ['#065F46', '#064E3B', '#047857', '#059669', '#10B981', '#34D399'],
    headerBg: 'from-green-700 to-green-600',
    cardBg: 'bg-green-50',
    textPrimary: 'text-green-900',
    textSecondary: 'text-green-700',
    icon: '🪴'
  },
  culture: {
    name: 'Culture',
    primary: '#7C3AED',
    secondary: '#6D28D9',
    accent: '#8B5CF6',
    background: 'from-purple-50 via-violet-50 to-indigo-50',
    backgroundImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    bubbleColors: ['#7C3AED', '#6D28D9', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
    bubbleColorsDark: ['#581C87', '#4C1D95', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA'],
    headerBg: 'from-purple-700 to-purple-600',
    cardBg: 'bg-purple-50',
    textPrimary: 'text-purple-900',
    textSecondary: 'text-purple-700',
    icon: '🪴'
  },
  food: {
    name: 'Food',
    primary: '#EA580C',
    secondary: '#C2410C',
    accent: '#F97316',
    background: 'from-orange-50 via-yellow-50 to-amber-50',
    backgroundImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    bubbleColors: ['#EA580C', '#C2410C', '#F97316', '#FB923C', '#FDBA74', '#FED7AA'],
    bubbleColorsDark: ['#9A3412', '#7C2D12', '#C2410C', '#EA580C', '#F97316', '#FB923C'],
    headerBg: 'from-orange-700 to-orange-600',
    cardBg: 'bg-orange-50',
    textPrimary: 'text-orange-900',
    textSecondary: 'text-orange-700',
    icon: '🪴'
  },
  theater: {
    name: 'Theater',
    primary: '#7C2D12',
    secondary: '#5B1F0F',
    accent: '#92400E',
    background: 'from-amber-50 via-red-50 to-rose-50',
    backgroundImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    bubbleColors: ['#7C2D12', '#5B1F0F', '#92400E', '#B45309', '#D97706', '#F59E0B'],
    bubbleColorsDark: ['#451A03', '#3D1302', '#5B1F0F', '#7C2D12', '#92400E', '#B45309'],
    headerBg: 'from-amber-700 to-amber-600',
    cardBg: 'bg-amber-50',
    textPrimary: 'text-amber-900',
    textSecondary: 'text-amber-700',
    icon: '🪴'
  },
  stadium: {
    name: 'Stadium',
    primary: '#166534',
    secondary: '#14532D',
    accent: '#16A34A',
    background: 'from-green-50 via-emerald-50 to-lime-50',
    backgroundImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    bubbleColors: ['#166534', '#14532D', '#16A34A', '#22C55E', '#4ADE80', '#86EFAC'],
    bubbleColorsDark: ['#0F3D1F', '#0A2A14', '#14532D', '#166534', '#16A34A', '#22C55E'],
    headerBg: 'from-lime-700 to-lime-600',
    cardBg: 'bg-lime-50',
    textPrimary: 'text-lime-900',
    textSecondary: 'text-lime-700',
    icon: '🪴'
  },
  cuisine: {
    name: 'Cuisine',
    primary: '#9F1239',
    secondary: '#7F1D35',
    accent: '#BE185D',
    background: 'from-rose-50 via-pink-50 to-fuchsia-50',
    backgroundImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    bubbleColors: ['#9F1239', '#7F1D35', '#BE185D', '#DB2777', '#EC4899', '#F472B6'],
    bubbleColorsDark: ['#6B0F2D', '#4F0A1F', '#7F1D35', '#9F1239', '#BE185D', '#DB2777'],
    headerBg: 'from-rose-700 to-rose-600',
    cardBg: 'bg-rose-50',
    textPrimary: 'text-rose-900',
    textSecondary: 'text-rose-700',
    icon: '🪴'
  },
  ceramic: {
    name: 'Ceramic',
    primary: '#8B4513',
    secondary: '#654321',
    accent: '#A0522D',
    background: 'from-amber-50 via-orange-50 to-yellow-50',
    backgroundImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    bubbleColors: ['#8B4513', '#654321', '#A0522D', '#CD853F', '#D2691E', '#DEB887'],
    bubbleColorsDark: ['#5D2A0C', '#4A1F0A', '#654321', '#8B4513', '#A0522D', '#CD853F'],
    headerBg: 'from-amber-700 to-amber-600',
    cardBg: 'bg-amber-50',
    textPrimary: 'text-amber-900',
    textSecondary: 'text-amber-700',
    icon: '🪴'
  }
};

// Requirements: PNG format, 300x300px or larger, clear and scannable

const LoginForm = ({ onLogin, onForgotPassword, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await onLogin(email, password)) {
      setError('');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 active:scale-95 active:shadow-lg transition"
      >
        Login
      </button>
      <button type="button" onClick={onForgotPassword} className="w-full text-sm text-green-700 hover:underline">Forgot password?</button>
      <p className="text-center text-sm">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-green-600 hover:underline"
        >
          Register here
        </button>
      </p>
    </form>
  );
};

const ForgotPasswordForm = ({ onRequestOtp, onReset, onBackToLogin }) => {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [otp, setOtp] = useState(Array(6).fill('')); const [step, setStep] = useState('email'); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async event => { event.preventDefault(); setBusy(true); setError(''); const result = step === 'email' ? await onRequestOtp(email) : await onReset(email, otp.join(''), password); if (result === true && step === 'email') setStep('reset'); else if (result !== true) setError(typeof result === 'string' ? result : 'Unable to reset password'); else onBackToLogin(); setBusy(false); };
  const updateOtp = (index, value) => { const digit = value.replace(/\D/g, '').slice(-1); setOtp(current => current.map((item, itemIndex) => itemIndex === index ? digit : item)); if (digit && index < 5) document.getElementById(`reset-otp-${index + 1}`)?.focus(); };
  return <form onSubmit={submit} className="space-y-4"><h3 className="text-lg font-semibold text-slate-900">{step === 'email' ? 'Reset your password' : 'Set a new password'}</h3>{step === 'email' ? <><label className="block text-sm font-medium">Account email<input type="email" value={email} onChange={event => setEmail(event.target.value)} className="w-full px-3 py-2 border rounded-lg mt-1" required /></label><p className="text-xs text-slate-500">We will send a 6-digit reset code to this email.</p></> : <><div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-800">Reset code sent to <strong>{email}</strong></div><label className="block text-sm font-medium">Enter reset code</label><div className="flex gap-2">{otp.map((digit, index) => <input key={index} id={`reset-otp-${index}`} value={digit} onChange={event => updateOtp(index, event.target.value)} inputMode="numeric" maxLength="1" className="w-full h-11 text-center text-lg font-bold border rounded-lg" required />)}</div><label className="block text-sm font-medium">New password<input type="password" value={password} onChange={event => setPassword(event.target.value)} className="w-full px-3 py-2 border rounded-lg mt-1" minLength="8" required /></label></>}{error && <p className="text-red-500 text-sm">{error}</p>}<button type="submit" disabled={busy} className="w-full bg-green-600 text-white py-2 rounded-lg disabled:opacity-60">{busy ? 'Please wait…' : step === 'email' ? 'Send reset code' : 'Reset password'}</button><button type="button" onClick={onBackToLogin} className="w-full text-sm text-green-700 hover:underline">Back to login</button></form>;
};

const ENTRY_POT_IMAGES = [
  'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/2446b85d-848f-42f9-8d6c-bebd705da30a.png',
  'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/6759ea0d-c4f0-4a57-858c-f759b1d79e18.png',
  'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/d9661d7a-f9f4-4403-9b8c-166c2a286433.png',
  'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/94c93ba0-2de1-4943-a137-5cfc2c23040c.png'
];

const ConsumerEntryPage = ({ onLogin, onRequestOtp, onRegister, onRequestPasswordOtp, onResetPassword }) => {
  const [registering, setRegistering] = useState(false); const [forgotPassword, setForgotPassword] = useState(false);
  return <main className="consumer-entry min-h-screen bg-slate-950 flex items-center justify-center p-6"><div className="entry-pot-wall" aria-hidden="true" /><section className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-2xl"><div className="hidden md:flex flex-col justify-between bg-emerald-950/80 text-white p-12"><div><div className="entry-logo"><span className="entry-pot-shape" /><Sprout size={27} strokeWidth={2.5} /></div><p className="mt-8 text-sm uppercase tracking-[0.25em] text-emerald-200">PotMarket</p><h1 className="mt-3 text-4xl font-bold leading-tight">Thoughtful pots for meaningful spaces.</h1><p className="mt-5 text-emerald-100 leading-7">Sign in to keep your orders, wishlist, and delivery updates together.</p></div><p className="text-sm text-emerald-200">A calmer way to shop handcrafted planters.</p></div><div className="p-8 sm:p-12"><div className="md:hidden flex items-center gap-3 mb-8"><div className="entry-logo entry-logo-small"><span className="entry-pot-shape" /><Sprout size={21} /></div><strong className="text-xl text-emerald-900">PotMarket</strong></div><p className="text-xs uppercase tracking-[0.22em] text-emerald-700">Welcome back</p><h2 className="mt-2 text-3xl font-bold text-slate-900">{forgotPassword ? 'Recover your account' : registering ? 'Create your account' : 'Sign in to PotMarket'}</h2><p className="mt-2 mb-7 text-sm text-slate-500">{forgotPassword ? 'Reset your password securely by email.' : registering ? 'Save your details and follow every order.' : 'Your products and orders are waiting for you.'}</p>{forgotPassword ? <ForgotPasswordForm onRequestOtp={onRequestPasswordOtp} onReset={onResetPassword} onBackToLogin={() => setForgotPassword(false)} /> : registering ? <RegisterForm onRequestOtp={onRequestOtp} onRegister={onRegister} onSwitchToLogin={() => setRegistering(false)} /> : <LoginForm onLogin={onLogin} onForgotPassword={() => setForgotPassword(true)} onSwitchToRegister={() => setRegistering(true)} />}</div></section></main>;
};

const RegisterForm = ({ onRequestOtp, onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [step, setStep] = useState('details');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const result = step === 'details' ? await onRequestOtp(name, email, phone, password) : await onRegister(name, email, phone, password, otp.join(''));
    if (result === true && step === 'details') {
      setStep('otp');
    } else if (result === true) {
      setError('');
    } else {
      setError(typeof result === 'string' ? result : 'Registration failed');
    }
    setBusy(false);
  };
  const updateOtp = (index, value) => { const digit = value.replace(/\D/g, '').slice(-1); setOtp(current => current.map((item, itemIndex) => itemIndex === index ? digit : item)); if (digit && index < 5) document.getElementById(`register-otp-${index + 1}`)?.focus(); };
  const handleOtpKey = (event, index) => { if (event.key === 'Backspace' && !otp[index] && index > 0) document.getElementById(`register-otp-${index - 1}`)?.focus(); };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      {step === 'details' && <div>
        <label className="block text-sm font-medium mb-1">Mobile number</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className="w-full px-3 py-2 border rounded-lg" required />
      </div>}
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      {step === 'details' ? <p className="text-xs text-slate-500">After submitting, a 6-digit OTP will be sent to your email.</p> : <>
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-800">OTP sent to <strong>{email}</strong></div>
        <label className="block text-sm font-medium">Enter email OTP</label>
        <div className="flex gap-2">{otp.map((digit, index) => <input key={index} id={`register-otp-${index}`} value={digit} onChange={event => updateOtp(index, event.target.value)} onKeyDown={event => handleOtpKey(event, index)} inputMode="numeric" maxLength="1" className="w-full h-12 text-center text-xl font-bold border rounded-lg" aria-label={`OTP digit ${index + 1}`} required />)}</div>
        <button type="button" className="text-sm text-emerald-700 hover:underline" onClick={() => { setStep('details'); setOtp(Array(6).fill('')); }}>Change details / resend OTP</button>
      </>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={busy} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 active:scale-95 active:shadow-lg transition disabled:opacity-60">{busy ? 'Please wait…' : step === 'details' ? 'Send OTP to email' : 'Verify OTP and create account'}</button>
      <p className="text-center text-sm">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-green-600 hover:underline"
        >
          Login here
        </button>
      </p>
    </form>
  );
};


const PotMarket = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'flower pot', price: 2499, originalPrice: 3999, rating: 2.4, reviews: 234, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/2446b85d-848f-42f9-8d6c-bebd705da30a.png', category: 'culture', discount: 38, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Medium' },
    { id: 2, name: ' lord shiva Pot', price: 599, originalPrice: 899, rating: 4.3, reviews: 156, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/638e77bc-6ed4-4d73-9868-f15ca9988b08.png', category: 'god', discount: 33, inStock: true, delivery: '2 days', prime: false, size: 'Small' },
    { id: 3, name: 'Modern india Planter', price: 1899, originalPrice: 2899, rating: 4.7, reviews: 89, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/6759ea0d-c4f0-4a57-858c-f759b1d79e18.png', category: 'soil of indian', discount: 35, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Large' },
    { id: 4, name: 'pot maker Planter', price: 799, originalPrice: 1299, rating: 4.4, reviews: 445, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/d9661d7a-c4ea-428c-a8cd-d8680bc7ec2f.png', category: 'traditional', discount: 38, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Medium' },
    { id: 5, name: 'milestone tajmahal Planter', price: 3499, originalPrice: 4999, rating: 4.6, reviews: 67, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/2fe9d342-f394-422a-b98f-51dc67b30f9b.png', category: 'milestone', discount: 30, inStock: true, delivery: '3 days', prime: false, size: 'Large' },
    { id: 6, name: 'dhoni worldcup pot', price: 1299, originalPrice: 1999, rating: 4.8, reviews: 312, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/a1a04106-db4c-4973-9cc2-42a348d776b1.png', category: 'milestone', discount: 35, inStock: true, delivery: '5 days', prime: false, size: 'Small' },
    { id: 7, name: 'family homepot Planter', price: 1699, originalPrice: 2499, rating: 4.2, reviews: 178, image: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/9dabac0e-fafe-4c81-837c-8f554373d27e.png', category: 'family', discount: 32, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Large' },
    { id: 8, name: 'modern planter', price: 9, originalPrice: 1999, rating: 3.9, reviews: 312, image: 'https://5.imimg.com/data5/SELLER/Default/2022/10/JB/DJ/QF/115491097/beautiful-marble-flower-pot-with-inlay-design.jpg', category: 'traditional', discount: 35, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Small' },
    { id: 9, name: 'india family pot', price: 1299, originalPrice: 1999, rating: 3.3, reviews: 312, image: 'https://www.shutterstock.com/image-photo/different-pottery-products-traditional-fair-600nw-2325690337.jpg', category: 'family', discount: 35, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Medium' },
    { id: 10, name: 'stone pot', price: 2959, originalPrice: 6500, rating: 4.9, reviews: 312, image: 'https://thumbs.dreamstime.com/b/beautiful-colorful-hand-made-clay-pottery-three-handmade-pots-displayed-blue-fabric-surface-against-light-background-402243296.jpg', category: 'culture', discount: 35, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Large' },
    { id: 11, name: 'desin pot', price: 3999, originalPrice: 5909, rating: 1.0, reviews: 312, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGJoHanoK_ftO9QIOv86JditXRHvaTlmKPqwOJoUWr8_QrwLC4fbOzlr22nTu7QmgSkVk&usqp=CAU', category: 'culture', discount: 35, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Small' },
    { id: 12, name: 'peral pot design', price: 4339, originalPrice: 7999, rating: 2.1, reviews: 312, image: 'https://i.pinimg.com/originals/de/5e/c5/de5ec5ca7a05132dfb645dba06598d22.jpg', category: 'culture', discount: 35, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Medium' },
    { id: 13, name: 'hanuman pot', price: 2199, originalPrice: 3569, rating: 4.1, reviews: 312, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/407fd18d-7a3a-4488-b6bc-e7644e2bd990.png', category: 'god', discount: 30, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Medium' },
    { id: 14, name: 'load ganesha pot', price: 2999, originalPrice: 2499, rating: 3.5, reviews: 312, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/94c93ba0-2de1-4943-a137-5cfc2c23040c.png', category: 'god', discount: 35, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Large'  },
    { id: 15, name: 'radha_krishna', price: 1509, originalPrice: 3950, rating: 4.3, reviews: 312, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/2ea72bd7-ecd2-4277-a6eb-c305a21647cb.png', category: 'god', discount: 30, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Medium' },
    { id: 16, name: 'red fort pot', price: 2499, originalPrice: 1250, rating: 3.4, reviews: 312, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/1d0a3e47-f9f4-4403-9b8c-166c2a286433.png', category: 'soil of indian', discount: 30, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Small' },
    { id: 17, name: 'indian army pot', price: 29, originalPrice: 5559, rating: 5.0, reviews: 312, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/06d85161-799d-434b-9a4c-bea3bae282a8.png', category: 'soil of indian', discount: 30, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Medium' },
    { id: 18, name: 'together pot', price: 2749, originalPrice: 3669, rating: 4.0, reviews: 312, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/8a215aa2-5232-493f-a3cd-384d67b22e94.png', category: 'family', discount: 30, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Small' },
    { id: 19, name: 'dance on pot', price: 449, originalPrice: 1999, rating: 4.3, reviews: 312, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/26905ff0-806b-4129-aaa3-17b2e3047326.png', category: 'traditional', discount: 30, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Large' },
    { id: 20, name: 'chandryaan-3 pot', price: 6449, originalPrice: 6449, rating: 4.3, reviews: 312, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/96391d7d-0264-4446-9be9-d37db2525682.png', category: 'milestone', discount: 30, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Medium' },
    { id: 21, name: 'peacock pot', price: 5489, originalPrice: 9999, rating: 4.3, reviews: 312, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/745da9e2-d4e1-4f70-af50-5ff522fc299e.png', category: 'soil of indian', discount: 30, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Large' },
    { id: 22, name: 'poeration_sindoor', price: 1549, originalPrice: 2979, rating: 4.3, reviews: 312, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/d1ce9a4b-8e3e-490f-84be-73c83b3e51da.png', category: 'milestone', discount: 30, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Small' },
    { id: 23, name: 'bananaleaf pot', price: 1659, originalPrice: 2659, rating: 4.3, reviews: 312, image: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/8e213149-c4e6-48a0-a36c-6f0f72d17f21.png', category: 'traditional', discount: 30, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Medium'  },
    { id: 24, name: 'joint family', price: 4659, originalPrice: 6599, rating: 4.3, reviews: 312, image: 'https://i.pinimg.com/236x/3c/ce/dc/3ccedc175520e1f79c8517c23bee0ca9.jpg', category: 'family', discount: 30, inStock: true, delivery: 'Tomorrow', prime: true, size: 'Medium'  },
  ]);
  const getOrderItemImage = item => item?.image || products.find(product => String(product.id) === String(item?.id))?.image || '';
  useEffect(() => { fetch('/api/products').then(response => response.ok ? response.json() : null).then(async result => { if (result?.products?.length) { setProducts(current => [...current.filter(product => !result.products.some(managed => String(managed.id) === String(product.id))), ...result.products]); return; } const bootstrap = await fetch('/api/products/bootstrap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ products }) }); const seeded = bootstrap.ok ? await bootstrap.json() : null; if (seeded?.products?.length) setProducts(current => [...current.filter(product => !seeded.products.some(managed => String(managed.id) === String(product.id))), ...seeded.products]); }).catch(() => {}); }, []);

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedRating, setSelectedRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('address'); // 'address', 'payment', 'confirmation'
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // User state (moved before theme code to avoid hoisting issues)
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showEntryLogin, setShowEntryLogin] = useState(() => !localStorage.getItem('user-session'));

  // Use relative API base so Vite dev server can proxy '/api' to the backend.
  // In production the backend serves the same origin so '/api' works there as well.
  const API_BASE = '/api';

  const fetchThemes = async () => {
    try {
      const response = await fetch(`${API_BASE}/themes`);
      const data = await response.json();
      if (!response.ok || !data || typeof data !== 'object') {
        throw new Error('Theme API returned an invalid response');
      }
      return { default: Object.keys(data.default || {}).length ? data.default : THEMES, custom: data.custom || {} };
    } catch (error) {
      console.error('Failed to fetch themes:', error);
      return { default: THEMES, custom: {} };
    }
  };

  const fetchUserTheme = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/themes/user/${userId}`);
      const data = await response.json();
      return response.ok && typeof data.theme === 'string' ? data.theme : 'default';
    } catch (error) {
      console.error('Failed to fetch user theme:', error);
      return 'default';
    }
  };

  const saveUserTheme = async (userId, themeKey) => {
    try {
      await fetch(`${API_BASE}/themes/user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeKey })
      });
    } catch (error) {
      console.error('Failed to save user theme:', error);
    }
  };

  const createCustomTheme = async (themeData) => {
    try {
      const response = await fetch(`${API_BASE}/themes/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeData)
      });
      const data = await response.json();
      return data.theme;
    } catch (error) {
      console.error('Failed to create custom theme:', error);
      return null;
    }
  };

  // Theme state with backend persistence
  const [currentTheme, setCurrentTheme] = useState('default');
  const [availableThemes, setAvailableThemes] = useState({ default: THEMES, custom: {} });
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Load themes and user preferences on mount
  useEffect(() => {
    const loadThemesAndPreferences = async () => {
      const themes = await fetchThemes();
      setAvailableThemes(themes);

      // Use user ID if logged in, otherwise use a default user ID
      const userId = user?.id || 'guest';
      const userTheme = await fetchUserTheme(userId);
      setCurrentTheme(userTheme);
    };

    loadThemesAndPreferences();
  }, [user]);

  // Function to change theme
  const changeTheme = async (themeKey) => {
    const allThemes = { ...availableThemes.default, ...availableThemes.custom };
    if (allThemes[themeKey]) {
      setCurrentTheme(themeKey);
      const userId = user?.id || 'guest';
      await saveUserTheme(userId, themeKey);
    }
  };

  // Function to create custom theme
  const handleCreateCustomTheme = async (themeData) => {
    const newTheme = await createCustomTheme(themeData);
    if (newTheme) {
      setAvailableThemes(prev => ({
        ...prev,
        custom: { ...prev.custom, [newTheme.id]: newTheme }
      }));
      setCurrentTheme(newTheme.id);
      const userId = user?.id || 'guest';
      await saveUserTheme(userId, newTheme.id);
    }
  };

  // Get current theme object
  const theme = useMemo(() => {
    const defaultThemes = availableThemes?.default || THEMES;
    const customThemes = availableThemes?.custom || {};
    return {
      ...(defaultThemes[currentTheme] || defaultThemes.default || THEMES.default),
      ...(customThemes[currentTheme] || {})
    };
  }, [availableThemes, currentTheme]);

  // Theme selector state
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Dark mode state (persisted)
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('darkMode') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
    } catch (e) {
      // ignore (e.g., SSR or restricted storage)
    }
  }, [darkMode]);

  // Apply theme changes to document/body if needed
  useEffect(() => {
    // Update CSS custom properties for theme colors
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
    document.documentElement.style.setProperty('--theme-accent', theme.accent);
  }, [theme]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelOrder, setShowCancelOrder] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [animatingButton, setAnimatingButton] = useState(null);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [currentView, setCurrentView] = useState('home');

  // Admin states
  const [posts, setPosts] = useState([]);
  const [pages, setPages] = useState([]);
  const [comments, setComments] = useState([]);
  const [media, setMedia] = useState([]);
  const [plugins, setPlugins] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [availablePlugins, setAvailablePlugins] = useState([]);
  const [pluginSettings, setPluginSettings] = useState({});
  const [showPluginSettings, setShowPluginSettings] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState(null);

  useEffect(() => {
    const hasOpenOverlay = showDashboard || showOrders || showWishlist || showCart || showCheckout ||
      showOrderDetails || showCancelOrder || showTrackingModal || showOrderConfirmation || showLogin ||
      showRegister || showThemeSelector || showCustomPicker || showCreatePost || showCreatePage ||
      showPluginSettings || Boolean(selectedProduct);
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;

    if (hasOpenOverlay) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [showDashboard, showOrders, showWishlist, showCart, showCheckout, showOrderDetails, showCancelOrder, showTrackingModal, showOrderConfirmation, showLogin, showRegister, showThemeSelector, showCustomPicker, showCreatePost, showCreatePage, showPluginSettings, selectedProduct]);

  // Get WooCommerce settings
  const wooSettings = pluginSettings[1] || {}; // WooCommerce plugin ID is 1

  const loadRazorpayScript = async () => {
    if (window.Razorpay) return true;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'));
      document.body.appendChild(script);
    });
    return true;
  };

  const openRazorpayCheckout = async ({ key, amount, name, description, orderId, customer, contact, email, onSuccess, onFailure }) => {
    await loadRazorpayScript();
    return new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        key,
        amount,
        currency: 'INR',
        name,
        description,
        order_id: orderId,
        handler: function(response) {
          resolve(response);
          if (onSuccess) onSuccess(response);
        },
        prefill: { name: customer || '', contact: contact || '', email: email || '' },
        theme: { color: '#10B981' },
        modal: {
          ondismiss: function() {
            reject(new Error('Razorpay checkout was cancelled.'));
            if (onFailure) onFailure(new Error('Razorpay checkout was cancelled.'));
          }
        }
      });
      razorpay.on('payment.failed', function(error) {
        reject(new Error(error?.error?.description || 'Payment failed. Please try again.'));
        if (onFailure) onFailure(error);
      });
      razorpay.open();
    });
  };

  const openOrderInvoice = (order, options = {}) => {
    const { preventAlert = false, openInNewTab = true } = options;
    if (!order?.id || String(order.id).startsWith('ord_local_')) return null;
    const email = order.customerEmail || order.shippingAddress?.email || user?.email || '';
    if (!email) {
      if (!preventAlert) alert('An email address is required to download the invoice.');
      return null;
    }
    const invoiceUrl = `${API_BASE}/orders/${encodeURIComponent(order.id)}/invoice?email=${encodeURIComponent(email)}`;
    if (openInNewTab) {
      window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
    }
    return invoiceUrl;
  };

  const verifyCardPayment = async () => ({ success: false, message: 'Manual payment verification is disabled.' });
  const verifyUpiPayment = async () => ({ success: false, message: 'Manual payment verification is disabled.' });

  // Check backend health on mount
  const checkBackendHealth = async () => {
    try {
      const response = await fetch('/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✓ Backend is running:', data);
        return true;
      }
    } catch (error) {
      console.warn('⚠ Backend health check failed:', error.message);
      console.warn('Make sure to run: npm start');
    }
    return false;
  };

  // Helper: quick test to create a dummy order (useful during development)
  // Show test button only in development by default. If you want to enable it in prod, set this to true.
  const SHOW_TEST_API_BUTTON = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development';

  const testApiOrder = async () => {
    try {
      const body = {
        customerEmail: 'devtest@example.com',
        customerName: 'Dev Tester',
        items: [{ id: 'p1', name: 'Dev Pot', price: 99, quantity: 1 }],
        total: 99,
        paymentMethod: 'cod'
      };
      const res = await fetch(`${API_BASE}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

      // Safely handle empty/non-JSON responses to avoid "Unexpected end of JSON input"
      const text = await res.text();
      let parsed = null;
      if (text && text.length > 0) {
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          // not JSON — keep raw text
          parsed = text;
        }
      }

      if (res.ok) {
        alert('Test order response: ' + (parsed ? JSON.stringify(parsed) : 'No content'));
      } else {
        alert(`Test order failed: ${res.status} ${res.statusText}` + (parsed ? ' — ' + JSON.stringify(parsed) : ''));
      }
    } catch (err) {
      console.error('testApiOrder error', err);
      alert('Test order failed: ' + (err.message || err));
    }
  };

  // Load wishlist, orders and user from storage on mount
  useEffect(() => {
    checkBackendHealth();

    const session = loadUser();
    if (session) {
      loadCart();
      loadWishlist();
      loadOrders();
      loadUserData(session.id);
    } else {
      clearUserState();
    }
    // attempt to send any pending orders saved during offline/backend failures
    (async () => {
      try {
        const pending = JSON.parse(localStorage.getItem('pending-orders') || '[]');
        if (pending && pending.length > 0) {
          for (const p of pending) {
            const pendingPaymentMethod = String(p.orderData?.paymentMethod || '').toLowerCase();
            if (pendingPaymentMethod !== 'cod' && !(isGatewayPayment(pendingPaymentMethod) && p.orderData?.paymentVerified === true)) continue;
            try {
              const res = await fetch(`${API_BASE}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p.orderData) });
              // handle empty/non-JSON responses safely
              const text = await res.text();
              let body = null;
              if (text && text.length > 0) {
                try { body = JSON.parse(text); } catch (pe) { body = text; }
              }
              if (res.ok) {
                // update any local orders that matched the timestamp by replacing ord_local_... with backend id
                const storedOrders = JSON.parse(localStorage.getItem('user-orders') || '[]');
                const idx = storedOrders.findIndex(o => (o._backendError || (o.id && o.id.startsWith('ord_local_'))) );
                if (idx !== -1) {
                  storedOrders[idx].id = (body && body.orderId) || storedOrders[idx].id;
                  storedOrders[idx].status = (body && body.status) || 'Created';
                  storedOrders[idx].paymentVerified = (body && body.paymentVerified) || false;
                }
                localStorage.setItem('user-orders', JSON.stringify(storedOrders));
                // remove pending entry
                const newPending = JSON.parse(localStorage.getItem('pending-orders') || '[]').filter(q => q !== p);
                localStorage.setItem('pending-orders', JSON.stringify(newPending));
              }
            } catch (e) {
              console.warn('Retry pending order failed:', e && e.message ? e.message : e);
            }
          }
        }
      } catch (e) {
        console.warn('Error processing pending orders:', e.message || e);
      }
    })();
    loadRecentSearches();
    loadAdminData();
  }, []);

  const loadWishlist = async () => {
    try {
      const stored = localStorage.getItem('user-wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (error) {
      console.log('No existing wishlist found');
    }
  };

  const loadCart = async () => {
    try {
      const stored = localStorage.getItem('user-cart');
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (error) {
      console.log('No existing cart found');
    }
  };

  const loadUser = () => {
    try {
      const stored = localStorage.getItem('user-session');
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);
        setIsLoggedIn(true);
        setShowEntryLogin(false);
        return userData;
      }
    } catch (error) {
      console.log('No user session found');
    }
    return false;
  };

  const loadUserData = async userId => {
    if (!userId) return false;
    try {
      const response = await fetch(`${API_BASE.replace('/api', '')}/api/users/${userId}/data`, { credentials: 'include' });
      const result = await response.json();
      if (!response.ok || !result.success) return false;
      const data = result.data || {};
      const nextCart = Array.isArray(data.cart) ? data.cart : [];
      const nextWishlist = Array.isArray(data.wishlist) ? data.wishlist : [];
      const nextOrders = (Array.isArray(data.orders) ? data.orders : []).filter(order => !(String(order.id || '').startsWith('ord_local_') && ['card', 'upi'].includes(String(order.paymentMethod || '').toLowerCase()) && order.paymentVerified !== true));
      setCart(nextCart);
      setWishlist(nextWishlist);
      setOrders(nextOrders);
      localStorage.setItem('user-cart', JSON.stringify(nextCart));
      localStorage.setItem('user-wishlist', JSON.stringify(nextWishlist));
      localStorage.setItem('user-orders', JSON.stringify(nextOrders));
      return true;
    } catch (error) {
      console.warn('Failed to sync account data:', error.message);
      return false;
    }
  };

  useEffect(() => {
    if (!user?.id) return undefined;
    const sync = () => loadUserData(user.id);
    window.addEventListener('focus', sync);
    const interval = window.setInterval(sync, 5000);
    return () => {
      window.removeEventListener('focus', sync);
      window.clearInterval(interval);
    };
  }, [user?.id]);

  const clearUserState = () => {
    setUser(null);
    setIsLoggedIn(false);
    setShowEntryLogin(true);
    setOrders([]);
    setCart([]);
    setWishlist([]);
    setSelectedOrder(null);
    setOrderToCancel(null);
    setTrackingOrder(null);
    setShowOrderDetails(false);
    setShowCancelOrder(false);
    setShowTrackingModal(false);
    setShowDashboard(false);
    setShowLogin(false);
    setShowRegister(false);
    setCurrentView('home');
    ['user-session', 'user-orders', 'user-cart', 'user-wishlist', 'pending-orders', 'recentSearches'].forEach(key => localStorage.removeItem(key));
  };

  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.log('No recent searches found');
    }
  };
  const saveWishlist = async (newWishlist) => {
    try {
      localStorage.setItem('user-wishlist', JSON.stringify(newWishlist));
    } catch (error) {
      console.error('Failed to save wishlist:', error);
    }
  };

  const saveCart = async (newCart) => {
    try {
      localStorage.setItem('user-cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const stored = localStorage.getItem('user-orders');
      if (stored) {
        setOrders(JSON.parse(stored));
      }
    } catch (error) {
      console.log('No existing orders found');
    }
  };

  const loadAdminData = () => {
    try {
      const storedPosts = localStorage.getItem('admin-posts');
      const storedPages = localStorage.getItem('admin-pages');
      const storedComments = localStorage.getItem('admin-comments');
      const storedMedia = localStorage.getItem('admin-media');
      const storedPlugins = localStorage.getItem('admin-plugins');
      const storedPluginSettings = localStorage.getItem('admin-plugin-settings');

      if (storedPosts) setPosts(JSON.parse(storedPosts));
      if (storedPages) setPages(JSON.parse(storedPages));
      if (storedComments) setComments(JSON.parse(storedComments));
      if (storedMedia) setMedia(JSON.parse(storedMedia));
      if (storedPlugins) setPlugins(JSON.parse(storedPlugins));
      if (storedPluginSettings) setPluginSettings(JSON.parse(storedPluginSettings));

      // Initialize with sample data if empty
      if (!storedPosts || JSON.parse(storedPosts).length === 0) {
        const samplePosts = [
          { id: 1, title: 'Welcome to PotMarket', content: 'Welcome to our amazing pot market...', status: 'published', author: 'Admin', date: new Date().toISOString() },
          { id: 2, title: 'Plant Care Tips', content: 'Here are some tips for caring for your plants...', status: 'draft', author: 'Admin', date: new Date().toISOString() }
        ];
        setPosts(samplePosts);
        localStorage.setItem('admin-posts', JSON.stringify(samplePosts));
      }

      if (!storedPages || JSON.parse(storedPages).length === 0) {
        const samplePages = [
          { id: 1, title: 'About Us', content: 'Learn more about PotMarket...', status: 'published', slug: 'about' },
          { id: 2, title: 'Contact', content: 'Get in touch with us...', status: 'published', slug: 'contact' }
        ];
        setPages(samplePages);
        localStorage.setItem('admin-pages', JSON.stringify(samplePages));
      }

      if (!storedPlugins || JSON.parse(storedPlugins).length === 0) {
        const samplePlugins = [
          { id: 1, name: 'WooCommerce', version: '8.0.0', status: 'active', description: 'E-commerce plugin for WordPress', installed: true },
          { id: 2, name: 'Yoast SEO', version: '20.0', status: 'active', description: 'SEO optimization plugin', installed: true },
          { id: 3, name: 'Contact Form 7', version: '5.7', status: 'inactive', description: 'Contact form plugin', installed: true }
        ];
        setPlugins(samplePlugins);
        localStorage.setItem('admin-plugins', JSON.stringify(samplePlugins));
      }

      // Initialize available plugins for download
      const availablePluginsData = [
        {
          id: 101,
          name: 'WooCommerce',
          version: '8.0.0',
          description: 'Complete e-commerce solution for WordPress',
          author: 'Automattic',
          rating: 4.8,
          downloads: '5M+',
          size: '25.3 MB',
          lastUpdated: '2024-01-15',
          compatible: true,
          installed: false
        },
        {
          id: 102,
          name: 'Yoast SEO',
          version: '20.0',
          description: 'Improve your WordPress SEO',
          author: 'Team Yoast',
          rating: 4.7,
          downloads: '300M+',
          size: '12.1 MB',
          lastUpdated: '2024-01-10',
          compatible: true,
          installed: false
        },
        {
          id: 103,
          name: 'Contact Form 7',
          version: '5.7',
          description: 'Just another contact form plugin',
          author: 'Takayuki Miyoshi',
          rating: 4.5,
          downloads: '100M+',
          size: '8.5 MB',
          lastUpdated: '2024-01-05',
          compatible: true,
          installed: false
        },
        {
          id: 104,
          name: 'Elementor',
          version: '3.15.0',
          description: 'The most advanced frontend drag & drop page builder',
          author: 'Elementor.com',
          rating: 4.6,
          downloads: '200M+',
          size: '45.2 MB',
          lastUpdated: '2024-01-12',
          compatible: true,
          installed: false
        },
        {
          id: 105,
          name: 'WooCommerce Stripe Payment Gateway',
          version: '7.4.0',
          description: 'Accept payments with Stripe',
          author: 'WooCommerce',
          rating: 4.4,
          downloads: '10M+',
          size: '2.1 MB',
          lastUpdated: '2024-01-08',
          compatible: true,
          installed: false
        }
      ];
      setAvailablePlugins(availablePluginsData);

    } catch (error) {
      console.log('No existing admin data found');
    }
  };

  const saveAdminData = (type, data) => {
    try {
      localStorage.setItem(`admin-${type}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
    }
  };

  // Admin CRUD functions
  const createPost = (postData) => {
    const newPost = {
      id: Date.now(),
      ...postData,
      author: user?.name || 'Admin',
      date: new Date().toISOString()
    };
    const updatedPosts = [...posts, newPost];
    setPosts(updatedPosts);
    saveAdminData('posts', updatedPosts);
    return newPost;
  };

  const updatePost = (id, postData) => {
    const updatedPosts = posts.map(post =>
      post.id === id ? { ...post, ...postData } : post
    );
    setPosts(updatedPosts);
    saveAdminData('posts', updatedPosts);
  };

  const deletePost = (id) => {
    const updatedPosts = posts.filter(post => post.id !== id);
    setPosts(updatedPosts);
    saveAdminData('posts', updatedPosts);
  };

  const createPage = (pageData) => {
    const newPage = {
      id: Date.now(),
      ...pageData,
      status: 'published'
    };
    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    saveAdminData('pages', updatedPages);
    return newPage;
  };

  const updatePage = (id, pageData) => {
    const updatedPages = pages.map(page =>
      page.id === id ? { ...page, ...pageData } : page
    );
    setPages(updatedPages);
    saveAdminData('pages', updatedPages);
  };

  const deletePage = (id) => {
    const updatedPages = pages.filter(page => page.id !== id);
    setPages(updatedPages);
    saveAdminData('pages', updatedPages);
  };

  const togglePluginStatus = (id) => {
    const updatedPlugins = plugins.map(plugin =>
      plugin.id === id
        ? { ...plugin, status: plugin.status === 'active' ? 'inactive' : 'active' }
        : plugin
    );
    setPlugins(updatedPlugins);
    saveAdminData('plugins', updatedPlugins);
  };

  const installPlugin = (pluginData) => {
    // Simulate download/install process
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPlugin = {
          id: Date.now(),
          ...pluginData,
          status: 'inactive',
          installed: true
        };
        const updatedPlugins = [...plugins, newPlugin];
        setPlugins(updatedPlugins);
        saveAdminData('plugins', updatedPlugins);

        // Update available plugins to mark as installed
        const updatedAvailable = availablePlugins.map(p =>
          p.id === pluginData.id ? { ...p, installed: true } : p
        );
        setAvailablePlugins(updatedAvailable);

        resolve(newPlugin);
      }, 2000); // Simulate 2 second download
    });
  };

  const uninstallPlugin = (id) => {
    const updatedPlugins = plugins.filter(plugin => plugin.id !== id);
    setPlugins(updatedPlugins);
    saveAdminData('plugins', updatedPlugins);

    // Update available plugins to mark as not installed
    const updatedAvailable = availablePlugins.map(p =>
      plugins.find(installed => installed.id === id && installed.name === p.name)
        ? { ...p, installed: false }
        : p
    );
    setAvailablePlugins(updatedAvailable);
  };

  const updatePluginSettings = (pluginId, settings) => {
    const updatedSettings = { ...pluginSettings, [pluginId]: settings };
    setPluginSettings(updatedSettings);
    localStorage.setItem('admin-plugin-settings', JSON.stringify(updatedSettings));
  };

  const getPluginSettings = (pluginId) => {
    return pluginSettings[pluginId] || {};
  };

  // Comment management helpers were removed because they were not used anywhere in the UI.
  // If you need to re-enable comment CRUD later, move these implementations to a small
  // admin utility module and import them where needed.

  const categories = ['all', 'culture', 'god', 'soil of indian', 'traditional', 'milestone', 'family'];

  const addToCart = (product) => {
    setAnimatingButton(product.id);
    setTimeout(() => setAnimatingButton(null), 600);
    
    const existing = cart.find(item => item.id === product.id);
    const updatedCart = existing
      ? cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];

    setCart(updatedCart);
    saveCart(updatedCart);

    // Persist to backend if logged in
    if (isLoggedIn && user && user.id) {
      fetch(`${API_BASE.replace('/api','')}/api/users/${user.id}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cart: updatedCart })
      }).catch(err => console.warn('Failed to persist cart:', err));
    }
  };

  const removeFromCart = (productId) => {
    const updated = cart.filter(item => item.id !== productId);
    setCart(updated);
    saveCart(updated);
    if (isLoggedIn && user && user.id) {
      fetch(`${API_BASE.replace('/api','')}/api/users/${user.id}/data`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ cart: updated })
      }).catch(err => console.warn('Failed to persist cart:', err));
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      const updated = cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
      setCart(updated);
      saveCart(updated);
      if (isLoggedIn && user && user.id) {
        fetch(`${API_BASE.replace('/api','')}/api/users/${user.id}/data`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ cart: updated })
        }).catch(err => console.warn('Failed to persist cart:', err));
      }
    }
  };

  // Verify order payment via backend and update frontend state
  const verifyOrderPayment = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE.replace('/api','')}/api/orders/${orderId}/verify-payment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        // update selectedOrder and orders list
        if (selectedOrder && selectedOrder.id === data.orderId) {
          setSelectedOrder(prev => ({ ...prev, paymentVerified: true, status: data.status || 'Confirmed' }));
        }
        const updatedOrders = orders.map(o => o.id === data.orderId ? { ...o, paymentVerified: true, status: data.status || 'Confirmed' } : o);
        setOrders(updatedOrders);
        localStorage.setItem('user-orders', JSON.stringify(updatedOrders));
        return { success: true, message: 'Payment verified and order updated.' };
      }
      return { success: false, message: data.message || 'Verification failed' };
    } catch (err) {
      console.error('verifyOrderPayment error', err);
      return { success: false, message: err.message || 'Error during verification' };
    }
  };

  const toggleWishlist = (product) => {
    let newWishlist;
    if (wishlist.find(item => item.id === product.id)) {
      newWishlist = wishlist.filter(item => item.id !== product.id);
    } else {
      newWishlist = [...wishlist, product];
    }
    setWishlist(newWishlist);
    saveWishlist(newWishlist);
    if (isLoggedIn && user && user.id) {
      fetch(`${API_BASE.replace('/api','')}/api/users/${user.id}/data`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ wishlist: newWishlist })
      }).catch(err => console.warn('Failed to persist wishlist:', err));
    }
  };

  const filteredProducts = products
    .filter(p => 
      (selectedCategory === 'all' || p.category === selectedCategory) &&
      p.price >= priceRange[0] && p.price <= priceRange[1] &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedSize === 'all' || p.size === selectedSize) &&
      (selectedRating === 0 || Math.round(p.rating) === selectedRating)
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return b.discount - a.discount;
      return 0;
    });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartSavings = cart.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);

  // Auth functions
  const login = (email, password) => {
    clearUserState();
    return fetch(`${API_BASE.replace('/api','')}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    .then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Login failed');
      }
      return res.json();
    })
    .then(async (result) => {
      if (result && result.user) {
        setUser(result.user);
        setIsLoggedIn(true);
        setShowEntryLogin(false);
        localStorage.setItem('user-session', JSON.stringify(result.user));
        setShowLogin(false);

        await loadUserData(result.user.id);

        return true;
      }
      return false;
    })
    .catch(err => {
      console.warn('Login error:', err);
      return false;
    });
  };

  const requestRegistrationOtp = (name, email, phone, password) => {
    return fetch(`${API_BASE.replace('/api','')}/api/auth/register/request-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name, email, phone, password }) }).then(async response => { if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.message || 'Unable to send OTP'); } return true; }).catch(error => { console.warn('OTP request error:', error); return error.message || 'Unable to send OTP'; });
  };

  const requestPasswordOtp = email => fetch(`${API_BASE.replace('/api','')}/api/auth/password/request-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email }) }).then(async response => { if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.message || 'Unable to send reset code'); } return true; }).catch(error => error.message || 'Unable to send reset code');
  const resetPassword = (email, otp, password) => fetch(`${API_BASE.replace('/api','')}/api/auth/password/reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, otp, password }) }).then(async response => { if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.message || 'Unable to reset password'); } return true; }).catch(error => error.message || 'Unable to reset password');

  const register = (name, email, phone, password, otp) => {
    clearUserState();
    return fetch(`${API_BASE.replace('/api','')}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name, email, phone, password, otp })
    })
    .then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Registration failed');
      }
      return res.json();
    })
    .then(result => {
      if (result && result.user) {
        setUser(result.user);
        setIsLoggedIn(true);
        setShowEntryLogin(false);
        localStorage.setItem('user-session', JSON.stringify(result.user));
        setShowRegister(false);
        return true;
      }
      return false;
    })
    .catch(err => {
      console.warn('Register error:', err);
      return err.message || 'Registration failed';
    });
  };

  const logout = () => {
    // notify backend to clear cookie (best-effort)
    try {
      fetch(`${API_BASE.replace('/api','')}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (e) { /* ignore */ }
    clearUserState();
  };

  const removeRecentSearch = (searchToRemove) => {
    const updatedSearches = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };


  // Form Components
  const PostForm = ({ initialData, onSubmit, onCancel }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [status, setStatus] = useState(initialData?.status || 'draft');

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({ title, content, status });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your post content here..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:scale-95 active:shadow-lg transition"
          >
            {initialData ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>
    );
  };

  const PageForm = ({ initialData, onSubmit, onCancel }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [slug, setSlug] = useState(initialData?.slug || '');

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({ title, content, slug });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="page-slug"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your page content here..."
            required
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:scale-95 active:shadow-lg transition"
          >
            {initialData ? 'Update Page' : 'Create Page'}
          </button>
        </div>
      </form>
    );
  };

  // Plugin Settings Form Component
  const PluginSettingsForm = ({ plugin, currentSettings, onSave, onCancel }) => {
    const [settings, setSettings] = useState(currentSettings);

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(settings);
    };

    const updateSetting = (key, value) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    };

    const renderWooCommerceSettings = () => (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">WooCommerce General Settings</h3>
          <p className="text-sm text-blue-700">Configure your e-commerce store settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
            <input
              type="text"
              value={settings.storeName || 'PotMarket'}
              onChange={(e) => updateSetting('storeName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Currency</label>
            <select
              value={settings.currency || 'INR'}
              onChange={(e) => updateSetting('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Location</label>
            <select
              value={settings.location || 'IN'}
              onChange={(e) => updateSetting('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="EU">European Union</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Calculation</label>
            <select
              value={settings.taxCalculation || 'customer'}
              onChange={(e) => updateSetting('taxCalculation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="customer">Customer shipping address</option>
              <option value="store">Store address</option>
              <option value="none">No tax</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight Unit</label>
            <select
              value={settings.weightUnit || 'kg'}
              onChange={(e) => updateSetting('weightUnit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="g">Gram (g)</option>
              <option value="lbs">Pound (lbs)</option>
              <option value="oz">Ounce (oz)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Success Status</label>
            <select
              value={settings.paymentSuccessStatus || 'completed'}
              onChange={(e) => updateSetting('paymentSuccessStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="on-hold">On Hold</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Payment Methods</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableCod || false}
                onChange={(e) => updateSetting('enableCod', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable Cash on Delivery</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableCard || true}
                onChange={(e) => updateSetting('enableCard', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable Credit/Debit Cards</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableUpi || true}
                onChange={(e) => updateSetting('enableUpi', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable UPI Payments</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">UPI Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">UPI VPA ID</label>
              <input
                type="text"
                value={settings.upiVpaId || ''}
                onChange={(e) => updateSetting('upiVpaId', e.target.value)}
                placeholder="yourname@upi"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">UPI Address</label>
              <input
                type="text"
                value={settings.upiAddress || ''}
                onChange={(e) => updateSetting('upiAddress', e.target.value)}
                placeholder="yourname@upi"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">UPI Transaction ID</label>
              <input
                type="text"
                value={settings.upiTransactionId || ''}
                onChange={(e) => updateSetting('upiTransactionId', e.target.value)}
                placeholder="TXN123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.requireUpi || false}
                  onChange={(e) => updateSetting('requireUpi', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require UPI for payments</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Payment Button Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PayNow Button Text (Desktop)</label>
              <input
                type="text"
                value={settings.paynowButtonText || 'Pay Now'}
                onChange={(e) => updateSetting('paynowButtonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PayNow Button Text (Mobile)</label>
              <input
                type="text"
                value={settings.paynowButtonTextMobile || 'Pay Now'}
                onChange={(e) => updateSetting('paynowButtonTextMobile', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Popup Theme</label>
              <select
                value={settings.popupTheme || 'light'}
                onChange={(e) => updateSetting('popupTheme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Email Settings</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">"From" Name</label>
            <input
              type="text"
              value={settings.fromName || 'PotMarket'}
              onChange={(e) => updateSetting('fromName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">"From" Email Address</label>
            <input
              type="email"
              value={settings.fromEmail || 'noreply@potmarket.com'}
              onChange={(e) => updateSetting('fromEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Heading</label>
            <input
              type="text"
              value={settings.emailHeading || 'Order Confirmation'}
              onChange={(e) => updateSetting('emailHeading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
            <input
              type="text"
              value={settings.emailSubject || 'Your PotMarket Order Confirmation'}
              onChange={(e) => updateSetting('emailSubject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Body Text</label>
            <textarea
              value={settings.emailBodyText || 'Thank you for your order! Your order has been successfully placed and will be processed shortly.'}
              onChange={(e) => updateSetting('emailBodyText', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Theme Settings</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website Theme</label>
            <select
              value={settings.theme || currentTheme}
              onChange={(e) => {
                updateSetting('theme', e.target.value);
                changeTheme(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(THEMES).map(([key, themeData]) => (
                <option key={key} value={key}>
                  {themeData.icon} {themeData.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose a theme to change the website's appearance and colors</p>
          </div>
        </div>
      </div>
    );

    const renderYoastSettings = () => (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-900 mb-2">Yoast SEO Settings</h3>
          <p className="text-sm text-green-700">Optimize your site for search engines</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website Type</label>
            <select
              value={settings.websiteType || 'organization'}
              onChange={(e) => updateSetting('websiteType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="organization">Organization</option>
              <option value="person">Person</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
            <input
              type="text"
              value={settings.organizationName || 'PotMarket'}
              onChange={(e) => updateSetting('organizationName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Meta Description</label>
            <textarea
              rows={3}
              value={settings.defaultMetaDesc || 'Your one-stop shop for beautiful pots and planters'}
              onChange={(e) => updateSetting('defaultMetaDesc', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableXmlSitemap || true}
                onChange={(e) => updateSetting('enableXmlSitemap', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable XML sitemap</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableBreadcrumbs || true}
                onChange={(e) => updateSetting('enableBreadcrumbs', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable breadcrumbs</span>
            </label>
          </div>
        </div>
      </div>
    );

    const renderContactFormSettings = () => (
      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-purple-900 mb-2">Contact Form 7 Settings</h3>
          <p className="text-sm text-purple-700">Configure contact form behavior</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Sender Email</label>
            <input
              type="email"
              value={settings.senderEmail || 'wordpress@potmarket.com'}
              onChange={(e) => updateSetting('senderEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mail Subject</label>
            <input
              type="text"
              value={settings.mailSubject || '[PotMarket] Contact Form'}
              onChange={(e) => updateSetting('mailSubject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableAjax || true}
                onChange={(e) => updateSetting('enableAjax', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Use AJAX for form submission</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableValidation || true}
                onChange={(e) => updateSetting('enableValidation', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable form validation</span>
            </label>
          </div>
        </div>
      </div>
    );

    const renderDefaultSettings = () => (
      <div className="space-y-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{plugin.name} Settings</h3>
          <p className="text-sm text-gray-700">Configure plugin-specific settings</p>
        </div>

        <div className="text-center py-8 text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No specific settings available for this plugin.</p>
          <p className="text-sm mt-2">Plugin settings will be available in future updates.</p>
        </div>
      </div>
    );

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {plugin.name === 'WooCommerce' && renderWooCommerceSettings()}
        {plugin.name === 'Yoast SEO' && renderYoastSettings()}
        {plugin.name === 'Contact Form 7' && renderContactFormSettings()}
        {!['WooCommerce', 'Yoast SEO', 'Contact Form 7'].includes(plugin.name) && renderDefaultSettings()}

        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:scale-95 active:shadow-lg transition"
          >
            Save Settings
          </button>
        </div>
      </form>
    );
  };

  // Admin View Components
  const AdminView = () => {
    const renderAdminContent = () => {
      switch (currentView) {
        case 'posts':
          return <PostsAdmin />;
        case 'pages':
          return <PagesAdmin />;
        case 'comments':
          return <CommentsAdmin />;
        case 'media':
          return <MediaAdmin />;
        case 'woocommerce':
          return <WooCommerceAdmin />;
        case 'templates':
          return <TemplatesAdmin />;
        case 'appearance':
          return <AppearanceAdmin />;
        case 'plugins':
          return <PluginsAdmin />;
        case 'settings':
          return <SettingsAdmin />;
        default:
          return <PostsAdmin />;
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#05060a]">
        <div className="bg-white dark:bg-transparent border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentView.charAt(0).toUpperCase() + currentView.slice(1)} Admin
              </h1>
              <button
                onClick={() => setCurrentView('home')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Back to Store
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {renderAdminContent()}
        </div>
      </div>
    );
  };

  const PostsAdmin = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Posts</h2>
        <button
          onClick={() => setShowCreatePost(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 active:shadow-lg transition"
        >
          Add New Post
        </button>
      </div>

      <div className="bg-white dark:bg-[#0b1220] rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map(post => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{post.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(post.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    onClick={() => {
                      setEditingItem(post);
                      setShowCreatePost(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this post?')) {
                        deletePost(post.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const PagesAdmin = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pages</h2>
        <button
          onClick={() => setShowCreatePage(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 active:shadow-lg transition"
        >
          Add New Page
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
            {pages.map(page => (
              <tr key={page.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{page.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">/{page.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {page.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    onClick={() => {
                      setEditingItem(page);
                      setShowCreatePage(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this page?')) {
                        deletePage(page.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CommentsAdmin = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Comments</h2>
      <div className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">No comments yet.</p>
        ) : (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Total comments: {comments.length}</p>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {comments.slice().reverse().map(c => (
                <li key={c.id} className="border rounded p-2">
                  <div className="text-sm text-gray-800 dark:text-gray-100">{c.content || c.comment || '—'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300">by {c.author || c.name || 'Anonymous'} • {new Date(c.date).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const MediaAdmin = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Media Library</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 active:shadow-lg transition">
          Add New Media
        </button>
      </div>
      <div className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300 col-span-full text-center py-8">No media files found</p>
          ) : (
            media.map(item => (
              <div key={item.id} className="border rounded-lg p-2">
                <img src={item.url} alt={item.name} className="w-full h-20 object-cover rounded" />
                <p className="text-xs mt-1 truncate">{item.name}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const WooCommerceAdmin = () => {
    const wooSettings = getPluginSettings(1); // WooCommerce plugin ID is 1

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">WooCommerce</h2>
          <button
            onClick={() => {
              const wooPlugin = plugins.find(p => p.name === 'WooCommerce');
              if (wooPlugin) {
                setSelectedPlugin(wooPlugin);
                setShowPluginSettings(true);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 active:shadow-lg transition"
          >
            WooCommerce Settings
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Products</h3>
            <p className="text-2xl font-bold text-green-600">{products.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">Total products</p>
          </div>
          <div className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Orders</h3>
            <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">Total orders</p>
          </div>
          <div className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Revenue</h3>
            <p className="text-2xl font-bold text-purple-600">
              {wooSettings.currency === 'USD' ? '$' :
               wooSettings.currency === 'EUR' ? '€' :
               wooSettings.currency === 'GBP' ? '£' : '₹'}
              {orders.reduce((sum, order) => sum + order.total, 0)}
            </p>
            <p className="text-sm text-gray-500">Total revenue</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Store Settings</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Currency:</span>
                <span className="text-sm font-medium">
                  {wooSettings.currency === 'INR' ? 'Indian Rupee (₹)' :
                   wooSettings.currency === 'USD' ? 'US Dollar ($)' :
                   wooSettings.currency === 'EUR' ? 'Euro (€)' :
                   wooSettings.currency === 'GBP' ? 'British Pound (£)' : 'Indian Rupee (₹)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Location:</span>
                <span className="text-sm font-medium">
                  {wooSettings.location === 'IN' ? 'India' :
                   wooSettings.location === 'US' ? 'United States' :
                   wooSettings.location === 'UK' ? 'United Kingdom' :
                   wooSettings.location === 'EU' ? 'European Union' : 'India'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Weight Unit:</span>
                <span className="text-sm font-medium">
                  {wooSettings.weightUnit === 'kg' ? 'Kilogram (kg)' :
                   wooSettings.weightUnit === 'g' ? 'Gram (g)' :
                   wooSettings.weightUnit === 'lbs' ? 'Pound (lbs)' :
                   wooSettings.weightUnit === 'oz' ? 'Ounce (oz)' : 'Kilogram (kg)'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cash on Delivery:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  wooSettings.enableCod ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {wooSettings.enableCod ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Credit/Debit Cards:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  wooSettings.enableCard ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {wooSettings.enableCard !== false ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">UPI Payments:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  wooSettings.enableUpi !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {wooSettings.enableUpi !== false ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
          {orders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="text-sm font-medium">Order #{order.id}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.date).toLocaleDateString()} • {order.items?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {wooSettings.currency === 'USD' ? '$' :
                       wooSettings.currency === 'EUR' ? '€' :
                       wooSettings.currency === 'GBP' ? '£' : '₹'}
                      {order.total}
                    </p>
                    <p className="text-xs text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const TemplatesAdmin = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Templates</h2>
      <div className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6">
        <p className="text-gray-500 dark:text-gray-300">Template management coming soon...</p>
      </div>
    </div>
  );

  const AppearanceAdmin = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Appearance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Themes</h3>
          <p className="text-gray-500 dark:text-gray-300">Current theme: PotMarket Theme</p>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Customize
          </button>
        </div>
        <div className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Menus</h3>
          <p className="text-gray-500 dark:text-gray-300">Manage navigation menus</p>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Edit Menus
          </button>
        </div>
      </div>
    </div>
  );

  const PluginsAdmin = () => {
    const [activeTab, setActiveTab] = useState('installed');
    const [installingPlugin, setInstallingPlugin] = useState(null);

    const handleInstallPlugin = async (plugin) => {
      setInstallingPlugin(plugin.id);
      try {
        await installPlugin(plugin);
        alert(`${plugin.name} has been installed successfully!`);
      } catch (error) {
        alert('Failed to install plugin. Please try again.');
      } finally {
        setInstallingPlugin(null);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Plugins</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('installed')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'installed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Installed ({plugins.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'available'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Add New
            </button>
          </div>
        </div>

        {activeTab === 'installed' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plugin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                {plugins.map(plugin => (
                  <tr key={plugin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{plugin.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">{plugin.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{plugin.version}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        plugin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {plugin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className={`mr-3 ${plugin.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        onClick={() => togglePluginStatus(plugin.id)}
                      >
                        {plugin.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => {
                          setSelectedPlugin(plugin);
                          setShowPluginSettings(true);
                        }}
                      >
                        Settings
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to uninstall ${plugin.name}?`)) {
                            uninstallPlugin(plugin.id);
                          }
                        }}
                      >
                        Uninstall
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'available' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePlugins.map(plugin => (
              <div key={plugin.id} className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6 border dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{plugin.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">by {plugin.author}</p>
                  </div>
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">{plugin.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{plugin.description}</p>

                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div>Version: {plugin.version}</div>
                  <div>Downloads: {plugin.downloads}</div>
                  <div>Size: {plugin.size}</div>
                  <div>Last updated: {new Date(plugin.lastUpdated).toLocaleDateString()}</div>
                </div>

                {plugin.installed ? (
                  <div className="text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      ✓ Installed
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleInstallPlugin(plugin)}
                    disabled={installingPlugin === plugin.id}
                    className={`w-full py-2 px-4 rounded-lg text-white font-medium transition ${
                      installingPlugin === plugin.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {installingPlugin === plugin.id ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Installing...
                      </span>
                    ) : (
                      'Install Now'
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SettingsAdmin = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>
      <div className="bg-white dark:bg-[#0b1220] dark:text-gray-200 rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Title</label>
            <input
              type="text"
              defaultValue="PotMarket"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Description</label>
            <textarea
              rows={3}
              defaultValue="Your one-stop shop for beautiful pots and planters"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
            <input
              type="email"
              defaultValue="admin@potmarket.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    // Position the dashboard to start aligned with the Filters sidebar (sticky top-24)
    <aside className={`${showDashboard ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-20 sm:top-24 bottom-0 w-[min(78vw,16rem)] sm:w-64 bg-white shadow-2xl z-40 transition-transform duration-300 ease-in-out flex flex-col` }>
      <div className="p-3 sm:p-4 border-b">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          {/* Icon + title to mirror Filters header */}
          <h2 className="font-bold text-base sm:text-lg flex items-center gap-1.5 sm:gap-2 text-green-700">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            Dashboard
          </h2>
        </div>
        {isLoggedIn && (
          <p className="text-xs sm:text-sm text-gray-600 mt-0 truncate">Welcome, {user.name}</p>
        )}
      </div>

      {/* Close button placed inside the white dashboard panel above the options so it appears beside the options list */}
      <div className="px-3 sm:px-4">
        <div className="flex justify-end -mt-1 sm:-mt-2 mb-1 sm:mb-2">
          <button
            onClick={() => setShowDashboard(false)}
            aria-label="Close dashboard"
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-gray-800" />
          </button>
        </div>
      </div>

      <nav className="px-3 sm:px-4 space-y-1 sm:space-y-2 overflow-y-auto flex-1 dashboard-nav">
        <button
          onClick={() => {
            setCurrentView('home');
            setShowDashboard(false);
          }}
          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left text-sm sm:text-base transition ${
            currentView === 'home'
              ? 'bg-green-100 text-green-700 font-semibold'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Home</span>
        </button>

        {isLoggedIn && (
          <>
            <button
              onClick={() => {
                setCurrentView('orders');
                setShowOrders(true);
                setShowDashboard(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                currentView === 'orders'
                  ? 'bg-green-100 text-green-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>My Orders</span>
              {orders.filter(order => order.status !== 'Cancelled').length > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {orders.filter(order => order.status !== 'Cancelled').length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                const trackableOrders = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Delivered');
                const lastOrder = trackableOrders.length > 0 ? trackableOrders[0] : (orders.length > 0 ? orders[0] : null);
                if (lastOrder) {
                  setTrackingOrder(lastOrder);
                  setShowTrackingModal(true);
                } else {
                  setShowOrders(true);
                }
                setShowDashboard(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition hover:bg-gray-100 text-gray-700"
            >
              <Truck className="w-5 h-5" />
              <span>Track Order</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('wishlist');
                setShowWishlist(true);
                setShowDashboard(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                currentView === 'wishlist'
                  ? 'bg-green-100 text-green-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setCurrentView('cart');
                setShowCart(true);
                setShowDashboard(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                currentView === 'cart'
                  ? 'bg-green-100 text-green-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setCurrentView('profile');
                setShowDashboard(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                currentView === 'profile'
                  ? 'bg-green-100 text-green-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Star className="w-5 h-5" />
              <span>My Profile</span>
            </button>
          </>
        )}

        {/* Admin Sections */}
        <div className="pt-4 border-t">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Admin Panel</h3>

          <button
            onClick={() => {
              setCurrentView('posts');
              setShowDashboard(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'posts'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Posts</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('media');
              setShowDashboard(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'media'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Image className="w-5 h-5" />
            <span>Media</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('pages');
              setShowDashboard(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'pages'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <File className="w-5 h-5" />
            <span>Pages</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('comments');
              setShowDashboard(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'comments'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Comments</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('woocommerce');
              setShowDashboard(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'woocommerce'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>WooCommerce</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('templates');
              setShowDashboard(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'templates'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Layout className="w-5 h-5" />
            <span>Templates</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('appearance');
              setShowDashboard(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'appearance'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Palette className="w-5 h-5" />
            <span>Appearance</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('plugins');
              setShowDashboard(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'plugins'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Puzzle className="w-5 h-5" />
            <span>Plugins</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('settings');
              setShowDashboard(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'settings'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>

        {isLoggedIn && (
          <div className="pt-4 mt-4 border-t">
            <button
              onClick={() => {
                logout();
                setShowDashboard(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {!isLoggedIn && (
          <div className="pt-4 border-t">
            <button
              onClick={() => {
                setShowLogin(true);
                setShowDashboard(false);
              }}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 active:scale-95 active:shadow-lg transition mb-2"
            >
              Login
            </button>
            <button
              onClick={() => {
                setShowRegister(true);
                setShowDashboard(false);
              }}
              className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Register
            </button>
          </div>
        )}
      </nav>
    </aside>
  );

  // Check if current view is an admin view
  const adminViews = ['posts', 'pages', 'comments', 'media', 'woocommerce', 'templates', 'appearance', 'plugins', 'settings'];
  const isAdminView = adminViews.includes(currentView);

  if (showEntryLogin && !isLoggedIn && !isAdminView) return <ConsumerEntryPage onLogin={login} onRequestOtp={requestRegistrationOtp} onRegister={register} onRequestPasswordOtp={requestPasswordOtp} onResetPassword={resetPassword} />;

  return (
    <div className={`min-h-screen relative ${theme.cardBg} dark:bg-[#05060a]`}>
      {/* Animated Bubble Background */}
      <BubbleBackground theme={theme} />

      <div className="relative z-10">
        {isAdminView ? (
          <AdminView />
        ) : (
          <>
            {/* Dashboard */}
            <Dashboard />

          {/* Dashboard Overlay for Mobile */}
          {showDashboard && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setShowDashboard(false)}
            />
          )}

          {/* Header */}
          <header style={darkMode ? { background: 'linear-gradient(90deg,#0f172a,#111827)' } : undefined} className={`custom-dark bg-gradient-to-r ${theme.headerBg} text-white sticky top-0 z-50 shadow-lg`}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
              <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="cursor-pointer" onClick={() => setShowDashboard(!showDashboard)} title="Menu">
                    <Menu className="w-6 h-6" />
                  </div>
                  <h1 className="text-lg sm:text-2xl font-bold inline-flex items-center whitespace-nowrap">{theme.icon} {BUSINESS_CONFIG.BUSINESS_NAME}</h1>
                </div>

                

                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  {isLoggedIn ? (
                    <span className="hidden lg:inline text-sm truncate max-w-40">Hello, {user.name}</span>
                  ) : (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowLogin(true)}
                        className="text-sm bg-green-800 hover:bg-green-900 active:scale-95 active:shadow-lg px-3 py-1 rounded transition"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => setShowRegister(true)}
                        className="text-sm bg-green-800 hover:bg-green-900 active:scale-95 active:shadow-lg px-3 py-1 rounded transition"
                      >
                        Register
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3 sm:gap-5 ml-0 sm:ml-2">
                    <div
                      className="relative cursor-pointer hover:scale-110 transition p-1"
                      onClick={() => setShowWishlist(!showWishlist)}
                      title="Wishlist"
                    >
                      <Heart className="w-6 h-6" />
                      {wishlist.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {wishlist.length}
                        </span>
                      )}
                    </div>
                    <div
                      className="relative cursor-pointer hover:scale-110 transition p-1"
                      onClick={() => setShowOrders(!showOrders)}
                      title="Orders"
                    >
                      <Package className="w-6 h-6" />
                      {orders.filter(o => o.status !== 'Cancelled').length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {orders.filter(o => o.status !== 'Cancelled').length}
                        </span>
                      )}
                    </div>
                    <div
                      className="relative cursor-pointer hover:scale-110 transition p-1"
                      onClick={() => setShowCart(!showCart)}
                      title="Cart"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cart.length}
                        </span>
                      )}
                    </div>

                    <div
                      className="relative cursor-pointer hover:scale-110 transition p-1 hidden sm:block"
                      onClick={() => setShowThemeSelector(true)}
                      title="Change Theme"
                    >
                      <Palette className="w-6 h-6" />
                    </div>

                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      title={darkMode ? 'Switch to light' : 'Switch to dark'}
                      className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md hover:scale-105 transition bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 text-white dark:from-purple-500 dark:to-purple-300 dark:hover:from-purple-600 dark:hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-400 text-sm"
                      aria-pressed={darkMode}
                    >
                      {darkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
                      <span className="hidden sm:inline text-white">{darkMode ? 'Light' : 'Dark'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Big Search Bar - placed on its own row under header controls */}
              <div className="w-full mt-2 sm:mt-3">
                <div className="max-w-4xl mx-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for pots, planters, and more..."
                      className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-gray-800 pr-11 shadow-md text-sm sm:text-base"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchTerm.trim()) {
                          const updatedSearches = [
                            searchTerm.trim(),
                            ...recentSearches.filter(s => s !== searchTerm.trim())
                          ].slice(0, 4);
                          setRecentSearches(updatedSearches);
                          localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
                        }
                      }}
                    />
                    {recentSearches.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-10">
                        {recentSearches.map((search, index) => (
                          <div key={index} className="flex justify-between items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                            <span onClick={() => setSearchTerm(search)} className="cursor-pointer flex-grow">{search}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeRecentSearch(search); }} className="ml-2 text-gray-400 hover:text-gray-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Search className="absolute right-4 top-3 w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-2 sm:gap-4 mt-2 sm:mt-3 overflow-x-auto pb-1.5 sm:pb-2 categories-row">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentView('home');
                    }}
                    className={`category-btn ${selectedCategory === cat ? 'selected' : ''}`}
                    aria-pressed={selectedCategory === cat}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </header>

      {/* Trust Badges */}
      <div className="bg-white dark:bg-transparent border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 grid grid-cols-3 gap-1 sm:gap-2 text-[10px] sm:text-sm">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center">
            <Truck className="w-5 h-5 text-green-600 shrink-0" />
            <span>Free Delivery</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center">
            <Shield className="w-5 h-5 text-green-600 shrink-0" />
            <span>Secure Payment</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center">
            <RotateCcw className="w-5 h-5 text-green-600 shrink-0" />
            <span>Easy Returns</span>
          </div>
        </div>
      </div>

      {/* Payment Pending Notification */}
      {orders.some(order => order.status === 'Pending Payment' || order.status === 'Payment Pending') && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mx-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-800">
                  <strong>Payment Verification Required:</strong> You have {orders.filter(order => order.status === 'Pending Payment' || order.status === 'Payment Pending').length} order(s) waiting for payment verification.
                  Please complete payment in the provider checkout. Your order updates automatically after server verification.
                </p>
              </div>
            </div>
            <div className="ml-4">
              <button
                onClick={() => setShowOrders(true)}
                className="bg-orange-500 hover:bg-orange-600 active:scale-95 active:shadow-lg text-white px-3 py-1 rounded text-sm font-medium transition"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 min-w-0 transition-all duration-300 ${showDashboard ? 'lg:ml-64' : ''}`}>
  {/* Filters Sidebar */}
  <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white dark:bg-transparent rounded-lg shadow p-2.5 sm:p-4 h-fit sticky top-20 md:top-24`}>
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              Filters
            </h3>
            <button onClick={() => setShowFilters(false)} className="md:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 sm:mb-6">
            <h4 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">Price Range</h4>
            <input
              type="range"
              min="0"
              max="10000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              className="w-full"
            />
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>₹0</span>
              <span>₹{priceRange[1]}</span>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <h4 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">Size</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {['all', 'Small', 'Medium', 'Large'].map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full border transition ${
                    selectedSize === size
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <h4 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">Rating</h4>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={0}
                  checked={selectedRating === 0}
                  onChange={(e) => setSelectedRating(Number(e.target.value))}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="ml-2 text-xs sm:text-sm text-gray-700">All Ratings</span>
              </label>
              {[5, 4, 3, 2, 1].map(rating => (
                <label key={rating} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={selectedRating === rating}
                    onChange={(e) => setSelectedRating(Number(e.target.value))}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-gray-700 flex items-center">
                    {rating} <Star className="w-4 h-4 text-yellow-400 fill-current ml-1" /> stars
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">Sort By</h4>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border rounded px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Discount</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-gray-600 min-w-0">
              Showing {filteredProducts.length} results
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {currentView === 'order-confirmation' && selectedOrder ? (
            <div className="min-h-0 sm:min-h-[70vh] bg-white dark:bg-[#0b1220] rounded-lg shadow p-3 sm:p-6 md:p-10">
              <div className="max-w-4xl mx-auto">
                <div className="text-center border-b pb-4 sm:pb-7 mb-4 sm:mb-7">
                  <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl sm:text-3xl">✓</div>
                  <h2 className="text-xl sm:text-3xl font-bold mb-2">Order acknowledged</h2>
                  <p className="text-xs sm:text-base text-gray-600 dark:text-gray-300">Thank you for shopping with {BUSINESS_CONFIG.BUSINESS_NAME}. Your order has been recorded successfully.</p>
                  <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-x-3 sm:gap-x-6 gap-y-1 sm:gap-y-2 text-[10px] sm:text-sm text-gray-600 dark:text-gray-300">
                    <span>Order ID: <strong className="font-mono text-gray-900 dark:text-gray-100">{selectedOrder.id}</strong></span>
                    <span>Placed: <strong className="text-gray-900 dark:text-gray-100">{new Date(selectedOrder.orderDate || selectedOrder.createdAt || Date.now()).toLocaleString()}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-7">
                  <div className="border rounded-lg p-2.5 sm:p-4"><p className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 mb-1">Order status</p><p className="text-sm sm:text-base font-semibold capitalize">{selectedOrder.status || 'Pending'}</p></div>
                  <div className="border rounded-lg p-2.5 sm:p-4"><p className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 mb-1">Payment status</p><p className="text-sm sm:text-base font-semibold">{selectedOrder.paymentVerified || selectedOrder.paymentStatus === 'Paid' ? 'Paid / Verified' : selectedOrder.paymentMethod === 'cod' ? 'Pay on delivery' : 'Payment pending'}</p></div>
                  <div className="border rounded-lg p-2.5 sm:p-4"><p className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 mb-1">Payment method</p><p className="text-sm sm:text-base font-semibold uppercase">{selectedOrder.paymentMethod || '—'}</p></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-7">
                  <div className="border rounded-lg p-2.5 sm:p-4"><h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Customer</h3><p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{selectedOrder.customerName || selectedOrder.shippingAddress?.name || user?.name || 'Customer'}<br />{selectedOrder.customerEmail || selectedOrder.shippingAddress?.email || user?.email || '—'}<br />{selectedOrder.shippingAddress?.phone || shippingAddress.phone || '—'}</p></div>
                  <div className="border rounded-lg p-2.5 sm:p-4"><h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Delivery address</h3><p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{selectedOrder.shippingAddress?.name}<br />{selectedOrder.shippingAddress?.address}<br />{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}</p></div>
                </div>

                {/* If this order was saved locally due to a backend error, show a banner and a retry action */}
                {(selectedOrder._backendError || selectedOrder._error) && (
                  <div className="mb-4 p-3 rounded border-l-4 border-yellow-400 bg-yellow-50 text-yellow-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Order not yet submitted to server</div>
                        <div className="text-sm">This order was saved locally because of a network or backend error. It will be retried automatically, or you can retry now.</div>
                      </div>
                      <div className="ml-4">
                        <button onClick={async () => {
                          try {
                            // Attempt to resend this order to backend
                            const orderData = {
                              customerEmail: selectedOrder.customerEmail || selectedOrder.shippingAddress?.email || '',
                              customerName: selectedOrder.customerName || selectedOrder.shippingAddress?.name || '',
                              items: selectedOrder.items || [],
                              total: selectedOrder.total || 0,
                              shippingAddress: selectedOrder.shippingAddress || {},
                              paymentMethod: selectedOrder.paymentMethod || 'cod'
                            };
                            const r = await fetch(`${API_BASE}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
                            if (!r.ok) {
                              const txt = await r.text();
                              alert('Retry failed: ' + (txt || r.statusText));
                              return;
                            }
                            const json = await r.json();
                            // Update selected order with backend id/status
                            setSelectedOrder(prev => ({ ...prev, id: json.orderId || prev.id, status: json.status || 'Created', paymentVerified: json.paymentVerified || false }));
                            // Update orders list
                            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? ({ ...o, id: json.orderId || o.id, status: json.status || 'Created', paymentVerified: json.paymentVerified || false }) : o));
                            // Remove from pending-orders if present
                            const pending = JSON.parse(localStorage.getItem('pending-orders') || '[]');
                            const filtered = pending.filter(p => JSON.stringify(p.orderData) !== JSON.stringify(orderData));
                            localStorage.setItem('pending-orders', JSON.stringify(filtered));
                            alert('Order submitted to server successfully.');
                          } catch (err) {
                            console.error('Retry order error', err);
                            alert('Retry failed: ' + (err.message || err));
                          }
                        }} className="px-3 py-1 bg-blue-600 text-white rounded">Retry Now</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base font-semibold mb-2">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map(it => (
                      <div key={it.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded flex items-center justify-center shrink-0">
                            {getOrderItemImage(it) ? <img src={getOrderItemImage(it)} alt={it.name} className="w-full h-full object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'flex'; }} /> : null}
                            <span className="hidden items-center justify-center text-[10px] text-gray-400">No image</span>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-medium truncate">{it.name}</div>
                            <div className="text-[10px] sm:text-xs text-gray-500">Qty: {it.quantity}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm sm:text-base font-semibold">₹{it.price * it.quantity}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500">₹{it.price} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4 sm:mb-6 text-right">
                  <p className="text-base sm:text-lg font-semibold">Total: ₹{selectedOrder.total}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-shrink-0">
                    <button onClick={() => { setCurrentView('orders'); }} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Back to Orders</button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedOrder.id && !String(selectedOrder.id).startsWith('ord_local_') && (
                      <>
                        <button onClick={() => openOrderInvoice(selectedOrder)} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">View invoice</button>
                        <button onClick={() => openOrderInvoice(selectedOrder)} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200">Download invoice PDF</button>
                      </>
                    )}
                    {!selectedOrder.paymentVerified && isGatewayPayment(selectedOrder.paymentMethod) && <span className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm text-amber-700 bg-amber-50 rounded">Payment status updates automatically</span>}
                    <button onClick={() => { setCurrentView('home'); }} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700">Continue Shopping</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-5">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`${theme.cardBg} dark:bg-[#0b1220] rounded-lg shadow hover:shadow-xl transition cursor-pointer overflow-hidden border`}
              >
                <div 
                  className="relative bg-gray-50 aspect-square lg:aspect-[4/3] flex items-center justify-center"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden items-center justify-center text-gray-400 text-sm">
                    No image
                  </div>
                  {product.prime && (
                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-blue-500 text-white text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                      PRIME
                    </div>
                  )}
                  {product.discount > 0 && (
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                      {product.discount}% OFF
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-white rounded-full p-1.5 sm:p-2 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300"
                  >
                    <Heart
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                        wishlist.find(item => item.id === product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-1.5 sm:p-5">
                  <h3 className="font-semibold mb-1 truncate text-[10px] sm:text-base">{product.name}</h3>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center bg-green-600 text-white px-1 sm:px-2 py-0.5 rounded text-[9px] sm:text-xs gap-0.5 sm:gap-1">
                      <span>{product.rating}</span>
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                    <span className="text-[9px] sm:text-xs text-gray-500">({product.reviews})</span>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] sm:text-2xl font-bold">₹{product.price}</span>
                      <span className="text-[10px] sm:text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                    </div>
                    <p className="text-[9px] sm:text-xs text-green-600">Save ₹{product.originalPrice - product.price}</p>
                  </div>

                  <div className="text-[9px] sm:text-xs text-gray-600 mb-1.5 sm:mb-3 truncate">
                    {product.inStock ? (
                      <span className="text-green-600">✓ In Stock - Delivery by {product.delivery}</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    disabled={!product.inStock}
                    className={`w-full py-1 sm:py-2 rounded-md sm:rounded-lg font-semibold text-[9px] sm:text-base transition-all duration-300 shadow-md text-white ${
                      animatingButton === product.id
                        ? 'bg-blue-500'
                        : product.inStock
                          ? 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg active:scale-95'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {animatingButton === product.id ? <><span className="sm:hidden">Added</span><span className="hidden sm:inline">Added to cart</span></> : <><span className="sm:hidden">Add</span><span className="hidden sm:inline">Add to Cart</span></>}
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{BUSINESS_CONFIG.BUSINESS_NAME}</h3>
              <p className="text-gray-400 mb-4">Your trusted source for beautiful pots and planters. Quality craftsmanship and unique designs for your home and garden.</p>
              <div className="flex space-x-4">
                <a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Facebook</a>
                <a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Instagram</a>
                <a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Twitter</a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setCurrentView('home')} className="text-gray-400 hover:text-white transition text-left">Home</button></li>
                <li><button onClick={() => setCurrentView('home')} className="text-gray-400 hover:text-white transition text-left">Products</button></li>
                <li><button onClick={() => setCurrentView('home')} className="text-gray-400 hover:text-white transition">About Us</button></li>
                <li><button onClick={() => setCurrentView('home')} className="text-gray-400 hover:text-white transition">Contact</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li><button onClick={() => {}} className="text-gray-400 hover:text-white transition text-left">Shipping Info</button></li>
                <li><button onClick={() => {}} className="text-gray-400 hover:text-white transition text-left">Returns</button></li>
                <li><button onClick={() => {}} className="text-gray-400 hover:text-white transition text-left">Size Guide</button></li>
                <li><button onClick={() => {}} className="text-gray-400 hover:text-white transition text-left">FAQ</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <p>📧 kummarishailesh@gmail.com</p>
                <p>📞 +91 9866852823</p>
                <p>📍 India</p>
                <div className="mt-2">
                  { (typeof SHOW_TEST_API_BUTTON !== 'undefined' ? SHOW_TEST_API_BUTTON : false) && (
                    <button onClick={testApiOrder} className="px-3 py-1 bg-green-600 text-white rounded">Test API Order</button>
                  ) }
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {BUSINESS_CONFIG.BUSINESS_NAME}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Wishlist Sidebar */}
      {showWishlist && (
  <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-20 dark:bg-opacity-30 z-50" onClick={() => setShowWishlist(false)}>
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-md ${theme.cardBg} dark:bg-[#0b1220] shadow-2xl overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`sticky top-0 ${theme.cardBg} dark:bg-[#0b1220] border-b dark:border-gray-700 p-4 flex items-center justify-between`}>
              <h2 className={`text-xl font-bold ${theme.textPrimary}`}>My Wishlist ({wishlist.length})</h2>
              <button onClick={() => setShowWishlist(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {wishlist.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className={theme.textSecondary}>Your wishlist is empty</p>
                <p className="text-sm mt-2 text-gray-500">Add items you love to your wishlist!</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {wishlist.map(item => (
                  <div key={item.id} className="flex gap-4 border rounded-lg p-3 hover:shadow-md transition bg-white">
                    <div className="w-20 h-20 bg-gray-50 rounded flex items-center justify-center flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm mb-1 ${theme.textPrimary}`}>{item.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-xs gap-1">
                          <span>{item.rating}</span>
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                        <span className="text-xs text-gray-500">({item.reviews})</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-lg font-bold ${theme.textPrimary}`}>₹{item.price}</span>
                        <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        disabled={!item.inStock}
                    className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 shadow-md text-white ${
                      animatingButton === item.id
                        ? 'bg-blue-500'
                        : item.inStock
                          ? 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg active:scale-95'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                      >
                        {animatingButton === item.id ? 'Added to cart' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
        )}
        {wishlist.length > 0 && orders.filter(order => order.status !== 'Cancelled').length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className={theme.textSecondary}>No active orders</p>
                </div>
            ) : (
              null
            )}

            {/* Canceled Orders Section */}
            {orders.filter(order => order.status === 'Cancelled').length > 0 && (
              <div className="p-4 space-y-4 border-t">
                <h3 className={`text-lg font-bold ${theme.textPrimary}`}>
                  Canceled Orders ({orders.filter(order => order.status === 'Cancelled').length})
                </h3>
                {orders.filter(order => order.status === 'Cancelled').map(order => (
                  <div key={order.id} className="border rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className={`text-sm ${theme.textSecondary}`}>Order #{order.id}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        Cancelled
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      {order.items.slice(0, 1).map(item => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-12 h-12 bg-white rounded flex items-center justify-center flex-shrink-0">
                            {getOrderItemImage(item) ? <img src={getOrderItemImage(item)} alt={item.name} className="max-w-full max-h-full object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'flex'; }} /> : null}
                            <span className="hidden items-center justify-center text-[10px] text-gray-400">No image</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium truncate ${theme.textPrimary}`}>{item.name}</h4>
                            {order.items.length > 1 && <p className="text-xs text-gray-500">+{order.items.length - 1} more items</p>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-semibold ${theme.textPrimary}`}>Total: ₹{order.total}</span>
                        <button onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); setShowOrders(false); }} className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
  <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-20 dark:bg-opacity-30 z-50" onClick={() => setShowCart(false)}>
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-md ${theme.cardBg} dark:bg-[#0b1220] shadow-2xl overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`sticky top-0 ${theme.cardBg} dark:bg-[#0b1220] border-b dark:border-gray-700 p-4 flex items-center justify-between`}>
              <h2 className={`text-xl font-bold ${theme.textPrimary}`}>Shopping Cart ({cart.length})</h2>
              <button onClick={() => setShowCart(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className={theme.textSecondary}>Your cart is empty</p>
                <p className="text-sm mt-2 text-gray-500">Add some pots to get started!</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 border rounded-lg p-3 bg-white">
                    <div className="w-20 h-20 bg-gray-50 rounded flex items-center justify-center flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm mb-1 ${theme.textPrimary}`}>{item.name}</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-lg font-bold ${theme.textPrimary}`}>₹{item.price}</span>
                        <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className={theme.textPrimary}>Subtotal:</span>
                    <span className={theme.textPrimary}>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between mb-4 text-green-600">
                    <span>You save:</span>
                    <span>₹{cartSavings}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        setShowLogin(true);
                        return;
                      }
                      setShowCheckout(true);
                      setShowCart(false);
                    }}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 active:scale-95 active:shadow-lg transition"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${theme.cardBg} dark:bg-[#0b1220] rounded-lg w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="p-3 sm:p-6 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className={`text-xl sm:text-2xl font-bold ${theme.textPrimary}`}>Checkout</h2>
                <button onClick={() => setShowCheckout(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-5 sm:mb-8 overflow-x-auto">
                <div className="flex items-center space-x-2 sm:space-x-4 min-w-max text-xs sm:text-sm">
                  <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                    checkoutStep === 'address' ? 'bg-green-600 text-white' :
                    ['payment', 'confirmation'].includes(checkoutStep) ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    1
                  </div>
                  <span className={`text-sm ${checkoutStep === 'address' ? 'text-green-600 font-semibold' : theme.textSecondary}`}>
                    Address
                  </span>
                  <div className="w-4 sm:w-8 h-px bg-gray-300"></div>
                  <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                    checkoutStep === 'payment' ? 'bg-green-600 text-white' :
                    checkoutStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    2
                  </div>
                  <span className={`text-sm ${checkoutStep === 'payment' ? 'text-green-600 font-semibold' : theme.textSecondary}`}>
                    Payment
                  </span>
                  <div className="w-4 sm:w-8 h-px bg-gray-300"></div>
                  <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                    checkoutStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    3
                  </div>
                  <span className={`text-sm ${checkoutStep === 'confirmation' ? 'text-green-600 font-semibold' : theme.textSecondary}`}>
                    Confirm
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                {/* Main Content */}
                <div>
                  {checkoutStep === 'address' && (
                    <div>
                      <h3 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${theme.textPrimary}`}>Shipping Address</h3>
                      <form className="space-y-3 sm:space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme.textPrimary}`}>Full Name</label>
                          <input
                            type="text"
                            value={shippingAddress.name}
                            onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme.textPrimary}`}>Phone Number</label>
                          <input
                            type="tel"
                            value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Enter your phone number"
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme.textPrimary}`}>Address</label>
                          <textarea
                            value={shippingAddress.address}
                            onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Enter your complete address"
                            rows="3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${theme.textPrimary}`}>City</label>
                            <input
                              type="text"
                              value={shippingAddress.city}
                              onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="City"
                              required
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${theme.textPrimary}`}>State</label>
                            <input
                              type="text"
                              value={shippingAddress.state}
                              onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="State"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Pincode</label>
                          <input
                            type="text"
                            value={shippingAddress.pincode}
                            onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Enter pincode"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (shippingAddress.name && shippingAddress.phone && shippingAddress.address &&
                                shippingAddress.city && shippingAddress.state && shippingAddress.pincode) {
                              setCheckoutStep('payment');
                            } else {
                              alert('Please fill in all address fields');
                            }
                          }}
                          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 active:scale-95 active:shadow-lg transition"
                        >
                          Continue to Payment
                        </button>
                      </form>
                    </div>
                  )}

                  {checkoutStep === 'payment' && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Payment Method</h3>
                      <div className="space-y-2.5 sm:space-y-4">
                        <div
                          onClick={() => setPaymentMethod('online')}
                          className={`border rounded-lg p-4 cursor-pointer transition ${
                            paymentMethod === 'online' ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                            <input
                              type="radio"
                              checked={paymentMethod === 'online'}
                              onChange={() => setPaymentMethod('online')}
                              className="w-4 h-4 text-green-600"
                            />
                            <div>
                              <div className="text-sm sm:text-base font-semibold">Online payment via Razorpay</div>
                              <div className="text-xs sm:text-sm text-gray-600">Cards, UPI, net banking, wallets and more</div>
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() => setPaymentMethod('cod')}
                          className={`border rounded-lg p-4 cursor-pointer transition ${
                            paymentMethod === 'cod' ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <input
                              type="radio"
                              checked={paymentMethod === 'cod'}
                              onChange={() => setPaymentMethod('cod')}
                              className="w-4 h-4 text-green-600"
                            />
                            <div>
                              <div className="text-sm sm:text-base font-semibold">Cash on Delivery</div>
                              <div className="text-xs sm:text-sm text-gray-600">Pay when you receive your order</div>
                            </div>
                          </div>
                        </div>

                        {paymentMethod === 'online' && <p className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-600">Razorpay securely handles cards, UPI, wallets and net banking. Your card and UPI details stay with Razorpay.</p>}

                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                          <button
                            onClick={() => setCheckoutStep('address')}
                            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 active:scale-95 active:shadow-lg transition"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => {
                              if (!paymentMethod) {
                                alert('Please select a payment method');
                                return;
                              }

                              setCheckoutStep('confirmation');
                            }}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 active:scale-95 active:shadow-lg transition"
                          >
                            Review Order
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 'confirmation' && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Order Confirmation</h3>
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center gap-2 text-green-800 mb-2">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <span className="font-semibold">Order Ready!</span>
                          </div>
                          <p className="text-green-700 text-sm">
                            Your order has been placed successfully. You will receive a confirmation email shortly.
                          </p>
                        </div>

                        <div className="border rounded-lg p-3 sm:p-4">
                          <h4 className="text-sm sm:text-base font-semibold mb-2">Shipping Address</h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {shippingAddress.name}<br />
                            {shippingAddress.address}<br />
                            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}<br />
                            Phone: {shippingAddress.phone}
                          </p>
                        </div>

                        <div className="border rounded-lg p-3 sm:p-4">
                          <h4 className="text-sm sm:text-base font-semibold mb-2">Payment Method</h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {paymentMethod === 'online' && 'Online payment via Razorpay checkout'}
                            {paymentMethod === 'upi' && 'UPI via Razorpay checkout'}
                            {paymentMethod === 'cod' && 'Cash on Delivery'}
                          </p>
                          {isGatewayPayment(paymentMethod) && <p className="mt-3 text-xs sm:text-sm text-gray-600">Press Place Order to open the Razorpay checkout. Complete the payment and the order will be verified automatically.</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={() => setCheckoutStep('payment')}
                            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 active:scale-95 active:shadow-lg transition"
                          >
                            Back
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                // Validate user is logged in
                                if (!user || !user.email || !user.name) {
                                  alert('Please log in before placing an order.');
                                  return;
                                }

                                // Validate shipping address
                                if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
                                  alert('Please fill in all shipping address fields.');
                                  return;
                                }

                                // Validate cart is not empty
                                if (!cart || cart.length === 0) {
                                  alert('Your cart is empty. Please add items before placing an order.');
                                  return;
                                }

                                // Validate payment method is selected
                                if (!paymentMethod) {
                                  alert('Please select a payment method.');
                                  return;
                                }

                                // Ensure we have an email for order confirmation. Prompt guest users if missing.
                                const resolvedEmail = (user && user.email) || shippingAddress.email || window.prompt('Please enter your email for order confirmation (we will not spam):');
                                if (!resolvedEmail) {
                                  alert('We need an email address to place the order. Please provide one to continue.');
                                  return;
                                }

                                let transactionId = null;
                                let paymentVerified = paymentMethod === 'cod';
                                let paymentOrderId = null;
                                let razorpaySignature = null;

                                if (isGatewayPayment(paymentMethod)) {
                                  const paymentResponse = await fetch(`${API_BASE}/payments/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId: user.id, customerName: user.name, customerEmail: user.email, customerPhone: shippingAddress.phone, shippingAddress, paymentMethod, items: cart }) });
                                  const paymentResult = await paymentResponse.json().catch(() => ({}));
                                  if (!paymentResponse.ok || !paymentResult.success || !paymentResult.payment?.razorpay_order_id) {
                                    alert(paymentResult.message || 'Unable to start secure payment. The order was not placed.');
                                    return;
                                  }
                                  try {
                                    const razorpayPayment = await openRazorpayCheckout({
                                      key: paymentResult.payment.key_id || BUSINESS_CONFIG.RAZORPAY_KEY_ID,
                                      amount: Number(paymentResult.payment.amount || 0),
                                      name: BUSINESS_CONFIG.BUSINESS_NAME,
                                      description: 'Order payment',
                                      orderId: paymentResult.payment.razorpay_order_id,
                                      customer: user?.name || shippingAddress.name,
                                      contact: shippingAddress.phone,
                                      email: user?.email || shippingAddress.email || resolvedEmail,
                                      onSuccess: async () => {},
                                      onFailure: () => {}
                                    });
                                    paymentOrderId = paymentResult.payment.razorpay_order_id;
                                    transactionId = razorpayPayment.razorpay_payment_id || null;
                                    razorpaySignature = razorpayPayment.razorpay_signature || null;
                                    paymentVerified = true;
                                  } catch (paymentError) {
                                    alert(paymentError.message || 'Razorpay payment failed. The order was not placed.');
                                    return;
                                  }
                                }
                                // Create order object for backend
                                const orderData = {
                                  userId: user?.id || null,
                                  customerEmail: resolvedEmail,
                                  customerName: (user && user.name) || shippingAddress.name || 'Guest',
                                  items: cart.map(item => ({
                                    id: item.id,
                                    name: item.name,
                                    image: item.image,
                                    price: item.price,
                                    quantity: item.quantity
                                  })),
                                  total: cartTotal,
                                  shippingAddress: {...shippingAddress, email: resolvedEmail},
                                  paymentMethod,
                                  paymentVerified,
                                  transactionId,
                                  paymentOrderId,
                                  razorpayPaymentId: transactionId,
                                  razorpaySignature: paymentMethod === 'online' && transactionId ? razorpaySignature : undefined
                                };

                                try {
                                  console.log('Placing order with data:', orderData);
                                  console.log('API endpoint:', `${API_BASE}/orders`);

                                  // Send order to backend API
                                  const response = await fetch(`${API_BASE}/orders`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(orderData)
                                  });

                                  console.log('Response status:', response.status, response.statusText);

                                  if (!response.ok) {
                                    const errorText = await response.text();
                                    console.error('Backend error response:', errorText);
                                    throw new Error(`Backend error: ${response.status} ${response.statusText}`);
                                  }

                                  const result = await response.json();
                                  console.log('Order response:', result);

                                  if (result.success) {
                                    // Create local order object for frontend display
                                    const newOrder = {
                                      id: result.orderId,
                                      items: [...cart],
                                      total: result.total,
                                      savings: cartSavings,
                                      shippingAddress: {...shippingAddress},
                                      customerName: orderData.customerName,
                                      customerEmail: orderData.customerEmail,
                                      paymentMethod,
                                      status: result.status,
                                      orderStatus: result.status || 'Pending',
                                      paymentStatus: result.paymentVerified ? 'Paid' : 'Pending',
                                      paymentVerified: result.paymentVerified,
                                      orderDate: new Date().toISOString(),
                                      userId: user.id,
                                      ...(paymentMethod === 'card' && {
                                        paymentDetails: {
                                          transactionId,
                                          amount: result.total
                                        }
                                      })
                                    };

                                    // Save order locally for frontend display
                                    let updatedOrders = [...orders, newOrder];
                                    setOrders(updatedOrders);
                                    localStorage.setItem('user-orders', JSON.stringify(updatedOrders));

                                    // Handle different payment methods
                                    if (paymentMethod === 'cod') {
                                      alert('Order confirmed!');
                                    } else if (isGatewayPayment(paymentMethod)) {
                                      alert('Payment confirmed and order placed successfully.');
                                    }

                                    // Navigate to a dedicated order confirmation page and open the invoice immediately.
                                    const confirmedOrder = { ...newOrder };
                                    setSelectedOrder(confirmedOrder);
                                    setCurrentView('order-confirmation');
                                    setTimeout(() => {
                                      openOrderInvoice(confirmedOrder, { preventAlert: true });
                                    }, 250);

                                    // Clear cart and reset form
                                    setCart([]);
                                    setShowCheckout(false);
                                    setCheckoutStep('address');
                                    setShippingAddress({
                                      name: '', phone: '', address: '', city: '', state: '', pincode: ''
                                    });
                                    setPaymentMethod('');
                                  } else {
                                    console.warn('Backend returned failure creating order:', result.message);
                                    alert(result.message || 'Payment or order verification failed. The order was not placed.');
                                    return;
                                  }
                                } catch (error) {
                                  console.error('Error placing order (network/backend):', error);
                                  alert(error.message || 'Payment verification failed or the payment service is unavailable. The order was not placed.');
                                  return;
                                }
                              } catch (error) {
                                console.error('Validation error:', error);
                                alert(`Error: ${error.message}`);
                              }
                            }}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 active:scale-95 active:shadow-lg transition"
                          >
                            {isGatewayPayment(paymentMethod) ? 'Place Order & Pay via Razorpay' : 'Place Order'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="lg:sticky lg:top-6">
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 min-w-0">
                    <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-12 h-12 bg-white rounded flex items-center justify-center flex-shrink-0">
                            {getOrderItemImage(item) ? <img
                              src={getOrderItemImage(item)}
                              alt={item.name}
                              className="max-w-full max-h-full object-contain"
                              onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'flex'; }}
                            /> : null}
                            <span className="hidden items-center justify-center text-[10px] text-gray-400">No image</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{item.name}</h4>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-₹{cartSavings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>₹{cartTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {showOrders && (
  <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-20 dark:bg-opacity-30 z-50" onClick={() => setShowOrders(false)}>
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-md ${theme.cardBg} dark:bg-[#0b1220] shadow-2xl overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`sticky top-0 ${theme.cardBg} dark:bg-[#0b1220] border-b dark:border-gray-700 p-4 flex items-center justify-between`}>
              <h2 className={`text-xl font-bold ${theme.textPrimary}`}>My Orders ({orders.filter(order => order.status !== 'Cancelled').length})</h2>
              <button onClick={() => setShowOrders(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className={theme.textSecondary}>No orders yet</p>
                <p className="text-sm mt-2 text-gray-500">Your order history will appear here</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {orders.filter(order => order.status !== 'Cancelled').map(order => (
                  <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className={`text-sm ${theme.textSecondary}`}>Order #{order.id}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt || order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Payment Pending' || order.status === 'Pending Payment' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Arrived to Station' ? 'bg-indigo-100 text-indigo-800' :
                        ['Delivered', 'Completed'].includes(order.status) ? 'bg-green-100 text-green-800' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      {order.items.slice(0, 1).map(item => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center flex-shrink-0">
                            {getOrderItemImage(item) ? <img
                              src={getOrderItemImage(item)}
                              alt={item.name}
                              className="max-w-full max-h-full object-contain"
                              onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'flex'; }}
                            /> : null}
                            <span className="hidden items-center justify-center text-[10px] text-gray-400">No image</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium truncate ${theme.textPrimary}`}>{item.name}</h4>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 1 && (
                        <p className="text-xs text-gray-500 pl-2 pt-1">+{order.items.length - 1} more item(s)</p>
                      )}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-semibold ${theme.textPrimary}`}>Total: ₹{order.total}</span>
                        <div className="flex gap-2 flex-wrap">
                          {order.id && !String(order.id).startsWith('ord_local_') && (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                openOrderInvoice(order, { preventAlert: true });
                              }}
                              className="bg-indigo-500 hover:bg-indigo-600 active:scale-95 active:shadow-lg text-white px-4 py-2 rounded text-sm font-medium transition"
                            >
                              Invoice
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                              setShowOrders(false);
                            }}
                            className="bg-green-500 hover:bg-green-600 active:scale-95 active:shadow-lg text-white px-4 py-2 rounded text-sm font-medium transition"
                          >
                            View Details
                          </button>
                          {order.status !== 'Cancelled' && (
                            <button
                              onClick={() => {
                                setTrackingOrder(order);
                                setShowTrackingModal(true);
                                setShowOrders(false);
                              }}
                              className="bg-purple-500 hover:bg-purple-600 active:scale-95 active:shadow-lg text-white px-4 py-2 rounded text-sm font-medium transition"
                            >
                              Track Order
                            </button>
                          )}
                          {(order.status === 'Payment Pending' || order.status === 'Pending Payment') && order.paymentMethod.toLowerCase() !== 'cod' && <span className="text-xs text-amber-700">Awaiting provider confirmation</span>}
                          {order.status !== 'Cancelled' && !['Delivered', 'Completed'].includes(order.status) && order.status !== 'Payment Pending' && order.status !== 'Pending Payment' && (
                            <button
                              onClick={() => {
                                setOrderToCancel(order);
                                setShowCancelOrder(true);
                              }}
                              className="bg-red-500 hover:bg-red-600 active:scale-95 active:shadow-lg text-white px-4 py-2 rounded text-sm font-medium transition"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${theme.cardBg} dark:bg-[#0b1220] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Order Details</h2>
                  <p className={theme.textSecondary}>Order #{selectedOrder.id}</p>
                </div>
                <button onClick={() => setShowOrderDetails(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Order Status and Date */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className={`font-semibold ${theme.textPrimary}`}>
                      {new Date(selectedOrder.createdAt || selectedOrder.orderDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Status</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedOrder.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'Arrived to Station' ? 'bg-indigo-100 text-indigo-800' :
                      ['Delivered', 'Completed'].includes(selectedOrder.status) ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.status}
                    </div>
                    {selectedOrder.status === 'Cancelled' && selectedOrder.cancelReason && (
                      <p className="text-xs text-red-600 mt-1">Reason: {selectedOrder.cancelReason}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Items */}
                <div>
                  <h3 className={`text-xl font-semibold mb-4 ${theme.textPrimary}`}>Items Ordered ({selectedOrder.items.length})</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex gap-4 border rounded-lg p-4 hover:shadow-md transition">
                        <div className="w-20 h-20 bg-gray-50 rounded flex items-center justify-center flex-shrink-0">
                          {getOrderItemImage(item) ? <img
                            src={getOrderItemImage(item)}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'flex'; }}
                          /> : null}
                          <span className="hidden items-center justify-center text-[10px] text-gray-400">No image</span>
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold mb-1 ${theme.textPrimary}`}>{item.name}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-xs gap-1">
                              <span>{item.rating}</span>
                              <Star className="w-3 h-3 fill-current" />
                            </div>
                            <span className="text-xs text-gray-500">({item.reviews})</span>
                          </div>
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className={`text-lg font-bold ${theme.textPrimary}`}>₹{item.price}</span>
                            <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                            <span className="text-green-600 text-sm font-semibold">{item.discount}% off</span>
                          </div>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className={`text-sm font-semibold ${theme.textPrimary}`}>Subtotal: ₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                  {/* Price Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className={`font-semibold mb-4 ${theme.textPrimary}`}>Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={theme.textPrimary}>Subtotal ({selectedOrder.items.length} items)</span>
                        <span className={theme.textPrimary}>₹{selectedOrder.total + selectedOrder.savings}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{selectedOrder.savings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme.textPrimary}>Shipping</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                        <span className={theme.textPrimary}>Total</span>
                        <span className={theme.textPrimary}>₹{selectedOrder.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className={`font-semibold mb-4 ${theme.textPrimary}`}>Shipping Address</h4>
                    <div className="text-sm text-gray-700">
                      <p className={`font-medium ${theme.textPrimary}`}>{selectedOrder.shippingAddress.name}</p>
                      <p className={theme.textPrimary}>{selectedOrder.shippingAddress.address}</p>
                      <p className={theme.textPrimary}>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                      <p className={theme.textPrimary}>Phone: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className={`font-semibold mb-4 ${theme.textPrimary}`}>Payment Method</h4>
                    <div className="text-sm text-gray-700">
                      <p className={`font-medium ${theme.textPrimary}`}>
                        {selectedOrder.paymentMethod === 'online' && 'Online payment via Razorpay'}
                        {selectedOrder.paymentMethod === 'upi' && 'UPI via Razorpay'}
                        {selectedOrder.paymentMethod === 'cod' && 'Cash on Delivery'}
                      </p>
                      {selectedOrder.paymentMethod === 'cod' && (
                        <p className="text-xs text-gray-600 mt-1">Pay when you receive your order</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {(selectedOrder.status === 'Payment Pending' || selectedOrder.status === 'Pending Payment') && selectedOrder.paymentMethod.toLowerCase() !== 'cod' && <span className="flex-1 text-center py-3 text-sm text-amber-700 bg-amber-50 rounded-lg">Awaiting provider confirmation</span>}
                    <button
                      onClick={() => {
                        // Could add reorder functionality here
                        alert('Reorder functionality coming soon!');
                      }}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 active:scale-95 active:shadow-lg transition"
                    >
                      Reorder
                    </button>
                    <button
                      onClick={() => setShowOrderDetails(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 active:scale-95 active:shadow-lg transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelOrder && orderToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1220] rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-red-600">Cancel Order</h2>
                <button onClick={() => setShowCancelOrder(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-200 mb-2">Order #{orderToCancel.id}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Please tell us why you want to cancel this order:</p>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for cancellation:</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select a reason</option>
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Found better price elsewhere">Found better price elsewhere</option>
                    <option value="Delivery delay">Delivery delay</option>
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Quality concerns">Quality concerns</option>
                    <option value="Payment issues">Payment issues</option>
                    <option value="Other">Other (please specify)</option>
                  </select>
                </div>

                {cancelReason === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Please specify:</label>
                    <textarea
                      value={customCancelReason}
                      onChange={(e) => setCustomCancelReason(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows="3"
                      placeholder="Please provide details about why you're canceling..."
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelOrder(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 active:scale-95 active:shadow-lg transition"
                >
                  Keep Order
                </button>
                <button
                  onClick={() => {
                    if (!cancelReason) {
                      alert('Please select a cancellation reason');
                      return;
                    }
                    if (cancelReason === 'Other' && !customCancelReason.trim()) {
                      alert('Please provide details for the cancellation reason');
                      return;
                    }

                    // Update order status
                    const finalReason = cancelReason === 'Other' ? customCancelReason : cancelReason;
                    fetch(`${API_BASE}/orders/${orderToCancel.id}/cancel`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ customerEmail: orderToCancel.customerEmail || user?.email, reason: finalReason })
                    }).then(async response => {
                      const result = await response.json().catch(() => ({}));
                      if (!response.ok) throw new Error(result.message || 'Cancellation failed');
                      const updatedOrders = orders.map(order => order.id === orderToCancel.id ? { ...order, ...(result.order || {}), status: 'Cancelled', cancelReason: finalReason, cancelledAt: new Date().toISOString() } : order);
                      setOrders(updatedOrders);
                      localStorage.setItem('user-orders', JSON.stringify(updatedOrders));
                      setShowCancelOrder(false);
                      setOrderToCancel(null);
                      setCancelReason('');
                      setCustomCancelReason('');
                      alert('Order has been cancelled successfully');
                    }).catch(error => alert(error.message));
                  }}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {showTrackingModal && trackingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${theme.cardBg} dark:bg-[#0b1220] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Track Order</h2>
                  <p className={theme.textSecondary}>Order #{trackingOrder.id}</p>
                </div>
                <button onClick={() => setShowTrackingModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['Confirmed', 'Shipped', 'Arrived to Station', 'Delivered', 'Completed'].includes(trackingOrder.status) ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h4 className={`font-semibold ${theme.textPrimary}`}>Order Confirmed</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(trackingOrder.createdAt || trackingOrder.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="ml-5 border-l-2 border-dashed border-gray-300 h-12"></div>

                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['Shipped', 'Arrived to Station', 'Delivered', 'Completed'].includes(trackingOrder.status) ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                    {['Shipped', 'Arrived to Station', 'Delivered', 'Completed'].includes(trackingOrder.status) ? <Check className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
                  </div>
                  <div className="ml-4">
                    <h4 className={`font-semibold ${theme.textPrimary}`}>Shipped</h4>
                    {['Shipped', 'Arrived to Station', 'Delivered', 'Completed'].includes(trackingOrder.status) ? (
                      <p className="text-sm text-gray-500">
                        Your order is on its way! (Est. delivery: {new Date(new Date(trackingOrder.createdAt || trackingOrder.orderDate).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Waiting for shipment</p>
                    )}
                  </div>
                </div>

                <div className="ml-5 border-l-2 border-dashed border-gray-300 h-12"></div>

                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['Arrived to Station', 'Delivered', 'Completed'].includes(trackingOrder.status) ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                    {['Arrived to Station', 'Delivered', 'Completed'].includes(trackingOrder.status) ? <Check className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                  </div>
                  <div className="ml-4">
                    <h4 className={`font-semibold ${theme.textPrimary}`}>Arrived to Station</h4>
                    {['Arrived to Station', 'Delivered', 'Completed'].includes(trackingOrder.status) ? (
                      <p className="text-sm text-gray-500">Your order has arrived at the local station</p>
                    ) : (
                      <p className="text-sm text-gray-500">Order is in transit</p>
                    )}
                  </div>
                </div>

                <div className="ml-5 border-l-2 border-dashed border-gray-300 h-12"></div>

                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['Delivered', 'Completed'].includes(trackingOrder.status) ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                    {['Delivered', 'Completed'].includes(trackingOrder.status) ? <Check className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                  </div>
                  <div className="ml-4">
                    <h4 className={`font-semibold ${theme.textPrimary}`}>{trackingOrder.status === 'Completed' ? 'Task Completed' : 'Delivered'}</h4>
                    {['Delivered', 'Completed'].includes(trackingOrder.status) ? (
                      <p className="text-sm text-gray-500">
                        {trackingOrder.status === 'Completed' ? 'The order process has been completed.' : `Delivered on ${new Date(new Date(trackingOrder.createdAt || trackingOrder.orderDate).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}`}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Your order has not been delivered yet</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setShowTrackingModal(false);
                    setShowOrders(true);
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Back to My Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:scale-110 transition z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="h-96 bg-gray-50 flex items-center justify-center">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center justify-center text-gray-400 text-lg">
                  No image available
                </div>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center bg-green-600 text-white px-3 py-1 rounded gap-1">
                  <span>{selectedProduct.rating}</span>
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-gray-500">({selectedProduct.reviews} reviews)</span>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold">₹{selectedProduct.price}</span>
                  <span className="text-xl text-gray-500 line-through">₹{selectedProduct.originalPrice}</span>
                  <span className="text-green-600 font-semibold">{selectedProduct.discount}% off</span>
                </div>
                <p className="text-green-600">You save ₹{selectedProduct.originalPrice - selectedProduct.price}</p>
              </div>
              <div className="mb-6">
                <p className={selectedProduct.inStock ? 'text-green-600' : 'text-red-600'}>
                  {selectedProduct.inStock ? `✓ In Stock - Delivery by ${selectedProduct.delivery}` : 'Out of Stock'}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={!selectedProduct.inStock}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    selectedProduct.inStock
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    toggleWishlist(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Heart className={`w-5 h-5 ${wishlist.find(item => item.id === selectedProduct.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1220] rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold dark:text-gray-100">Login</h2>
                <button onClick={() => setShowLogin(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <LoginForm
                onLogin={login}
                onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1220] rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold dark:text-gray-100">Register</h2>
                <button onClick={() => setShowRegister(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <RegisterForm onRegister={register} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
            </div>
          </div>
        </div>
      )}

        </>
      )}

      {/* Create/Edit Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1220] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingItem ? 'Edit Post' : 'Create New Post'}</h2>
                <button onClick={() => { setShowCreatePost(false); setEditingItem(null); }}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <PostForm
                initialData={editingItem}
                onSubmit={(postData) => {
                  if (editingItem) {
                    updatePost(editingItem.id, postData);
                  } else {
                    createPost(postData);
                  }
                  setShowCreatePost(false);
                  setEditingItem(null);
                }}
                onCancel={() => { setShowCreatePost(false); setEditingItem(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Page Modal */}
      {showCreatePage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1220] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingItem ? 'Edit Page' : 'Create New Page'}</h2>
                <button onClick={() => { setShowCreatePage(false); setEditingItem(null); }}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <PageForm
                initialData={editingItem}
                onSubmit={(pageData) => {
                  if (editingItem) {
                    updatePage(editingItem.id, pageData);
                  } else {
                    createPage(pageData);
                  }
                  setShowCreatePage(false);
                  setEditingItem(null);
                }}
                onCancel={() => { setShowCreatePage(false); setEditingItem(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Plugin Settings Modal */}
      {showPluginSettings && selectedPlugin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1220] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{selectedPlugin.name} Settings</h2>
                <button onClick={() => { setShowPluginSettings(false); setSelectedPlugin(null); }}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <PluginSettingsForm
                plugin={selectedPlugin}
                currentSettings={getPluginSettings(selectedPlugin.id)}
                onSave={(settings) => {
                  updatePluginSettings(selectedPlugin.id, settings);
                  setShowPluginSettings(false);
                  setSelectedPlugin(null);
                  alert('Settings saved successfully!');
                }}
                onCancel={() => { setShowPluginSettings(false); setSelectedPlugin(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Popup */}
      {showOrderConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1220] rounded-lg p-8 text-center dark:text-gray-200">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your purchase. A confirmation email has been sent to your address.
            </p>
            <button
              onClick={() => setShowOrderConfirmation(false)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={changeTheme}
          onClose={() => setShowThemeSelector(false)}
          theme={theme}
          onOpenCustomPicker={() => setShowCustomPicker(true)}
          availableThemes={availableThemes}
        />
      )}

      {/* Custom Color Picker Modal */}
      {showCustomPicker && (
        <CustomColorPicker
          onCreateTheme={handleCreateCustomTheme}
          onClose={() => setShowCustomPicker(false)}
        />
      )}
      </div>
    </div>
  );
};

export default PotMarket;