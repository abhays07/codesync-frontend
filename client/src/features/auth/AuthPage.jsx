import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser, registerUser, sendRegistrationOtp } from '../../api/services/authService';
import AnimatedGridBackground from '../../components/ui/AnimatedGridBackground';

export default function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://3.108.1.211.nip.io:9000/api/v1/auth';

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    fullName: '',
    email: '',
    passwordHash: '',
    role: 'DEVELOPER',
    provider: 'LOCAL',
  });

  const isLogin = mode === 'login';
  const title = isLogin ? 'Welcome Back' : 'Create Your Account';
  const handleOAuthLogin = (provider) => {
    // FORCE absolute URL to ensure we leave the Netlify domain and hit the AWS Gateway directly
    const GATEWAY_URL = "http://3.108.1.211.nip.io:9000";
    window.location.href = `${GATEWAY_URL}/api/v1/auth/oauth2/authorization/${provider}`;
  };
  const cardKey = useMemo(() => `${location.pathname}-${mode}`, [location.pathname, mode]);

  const onLoginFieldChange = (e) => setLoginForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const onRegisterFieldChange = (e) => setRegisterForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    const loadingId = toast.loading('Authenticating...');
    try {
      const responseData = await loginUser({
        username: loginForm.username,
        passwordHash: loginForm.password, // Mapped to backend entity field
      });

      const { token, userId, username, email, avatarUrl } = responseData;
      let userEmail = email;
      if (!userEmail && token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userEmail = payload.email || payload.sub || undefined; 
        } catch (e) {
          console.error("Could not parse JWT for email", e);
        }
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ userId, username, email: userEmail, avatarUrl }));

      toast.success(`Welcome, ${username}!`, { id: loadingId });
      navigate('/dashboard');
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Invalid credentials.';
      toast.error(errMsg, { id: loadingId });
    } finally { setSubmitting(false); }
  }

  const validatePassword = (password) => {
    if (!password || password.length < 8) return "Password must be at least 8 characters long";
    if (!/.*[A-Z].*/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/.*[a-z].*/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/.*\d.*/.test(password)) return "Password must contain at least one number";
    if (!/.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?].*/.test(password)) return "Password must contain at least one special character";
    return null;
  };

  async function handleSendRegistrationOtp(event) {
    event.preventDefault();
    const pwdError = validatePassword(registerForm.password);
    if (pwdError) return toast.error(pwdError);
    setSubmitting(true);
    const loadingId = toast.loading('Sending OTP...');
    try {
      await sendRegistrationOtp(registerForm.email, registerForm.username);
      toast.success('OTP sent to your email!', { id: loadingId });
      setOtpSent(true);
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to send OTP.';
      toast.error(errMsg, { id: loadingId });
    } finally { setSubmitting(false); }
  }

  async function handleVerifyAndRegister(event) {
    event.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");
    setSubmitting(true);
    const loadingId = toast.loading('Verifying and creating account...');
    try {
      await registerUser({...registerForm, passwordHash: registerForm.password}, otp);
      toast.success('Account created! Please login.', { id: loadingId });
      navigate('/login');
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Registration failed.';
      toast.error(errMsg, { id: loadingId });
    } finally { setSubmitting(false); }
  }

  return (
    <main className="relative min-h-[calc(100vh-65px)] overflow-hidden px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <AnimatedGridBackground />
      <div className="relative mx-auto grid w-full max-w-5xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-extrabold text-white">CodeSync <span className="text-[#9290C3]">Auth</span></h1>
          <p className="mt-4 text-gray-400 leading-relaxed">Secure, mentorship-driven access to your collaborative microservices workspace.</p>
          <div className="mt-8 flex gap-2 p-1 bg-[#070F2B]/60 border border-[#535C91] rounded-xl w-fit">
            <Link to="/login" className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-[#9290C3] text-[#070F2B]' : 'text-gray-400 hover:text-white'}`}>Login</Link>
            <Link to="/register" className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-[#9290C3] text-[#070F2B]' : 'text-gray-400 hover:text-white'}`}>Register</Link>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.section key={cardKey} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1B1A55]/40 border border-[#535C91] p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
            <form onSubmit={isLogin ? handleLoginSubmit : (otpSent ? handleVerifyAndRegister : handleSendRegistrationOtp)} className="space-y-4">
              {/* Form Fields Mapping */}
              {!isLogin && (
                <input name="fullName" disabled={otpSent} placeholder="Full Name" required onChange={onRegisterFieldChange} className="w-full bg-[#070F2B]/80 border border-[#535C91] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#9290C3] disabled:opacity-50" />
              )}
              <input name="username" disabled={!isLogin && otpSent} placeholder="Username" required onChange={isLogin ? onLoginFieldChange : onRegisterFieldChange} className="w-full bg-[#070F2B]/80 border border-[#535C91] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#9290C3] disabled:opacity-50" />
              {!isLogin && (
                <input name="email" type="email" disabled={otpSent} placeholder="Email Address" required onChange={onRegisterFieldChange} className="w-full bg-[#070F2B]/80 border border-[#535C91] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#9290C3] disabled:opacity-50" />
              )}
              <div className="relative">
                <input 
                  name="password" 
                  disabled={!isLogin && otpSent}
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  required 
                  onChange={isLogin ? onLoginFieldChange : onRegisterFieldChange} 
                  className="w-full bg-[#070F2B]/80 border border-[#535C91] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#9290C3] disabled:opacity-50" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {!isLogin && otpSent && (
                <div className="pt-2 animate-pulse-once">
                  <input 
                    name="otp" 
                    value={otp}
                    placeholder="Enter 6-digit OTP" 
                    required 
                    onChange={(e) => setOtp(e.target.value)} 
                    maxLength={6}
                    className="w-full bg-[#070F2B] border border-[#9290C3]/50 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#9290C3] text-center tracking-widest" 
                  />
                  <p className="text-xs text-gray-400 text-center mt-2">OTP sent to {registerForm.email}</p>
                </div>
              )}
              
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={submitting} className="w-full bg-[#9290C3] text-[#070F2B] font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                {submitting ? 'Processing...' : isLogin ? 'Sign In' : (otpSent ? 'Verify & Register' : 'Send OTP')} <ArrowRight size={18} />
              </motion.button>

              {!isLogin && otpSent && (
                 <button type="button" onClick={() => setOtpSent(false)} className="w-full text-xs text-gray-400 hover:text-white mt-1">Change Email / Edit Details</button>
              )}
            </form>

            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className="w-full border-t border-[#535C91]/50"></div>
                <span className="absolute bg-[#1B1A55] px-4 text-xs text-gray-500 uppercase tracking-widest">Or Continue With</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SocialBtn icon={<GoogleIcon />} label="Google" onClick={() => handleOAuthLogin('google')} />
                <SocialBtn icon={<GitHubIcon />} label="GitHub" onClick={() => handleOAuthLogin('github')} />
              </div>
            </div>
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  );
}

const SocialBtn = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex items-center justify-center gap-2 py-2.5 border border-[#535C91] bg-[#070F2B]/40 rounded-xl text-white text-sm hover:bg-[#1B1A55] transition-all">
    {icon} {label}
  </button>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);