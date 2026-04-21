"use client"
import React, { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { logIn, logOut } from '@/redux/features/auth-slice';

interface FormData {
  email: string;
  password: string;
}

const Page = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = React.useState<FormData>({
    email: '',
    password: ''
  });

  // Particle canvas — consistent with design system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random() * 0.35 + 0.05,
      });
    }
    let animId: number;
    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,210,255,${p.a})`; ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getUserData = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/getuser', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      credentials: 'include'
    })
    const data = await res.json()
    if (data.ok) {
      dispatch(logIn(data.data))
      router.push('/myfiles')
    } else {
      dispatch(logOut())
    }
  }

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Please fill all the fields')
      return
    }
    setLoading(true)
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: formData.email, password: formData.password }),
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      credentials: 'include'
    })
    const data = await res.json()
    setLoading(false)
    if (data.ok) {
      toast.success('Login successful')
      getUserData()
    } else {
      toast.error(data.message)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background: #050a12;
          font-family: 'DM Sans', sans-serif;
          color: #e8f4ff;
          display: flex;
          position: relative;
          overflow: hidden;
        }

        /* Ambient glows */
        .login-root::before {
          content: '';
          position: fixed;
          top: -20%; left: -10%;
          width: 60vw; height: 60vw;
          background: radial-gradient(circle, rgba(20,70,160,0.22) 0%, transparent 65%);
          pointer-events: none;
        }
        .login-root::after {
          content: '';
          position: fixed;
          bottom: -15%; right: -5%;
          width: 45vw; height: 45vw;
          background: radial-gradient(circle, rgba(0,180,150,0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        canvas { position: fixed; inset: 0; pointer-events: none; z-index: 0; }

        /* Split layout */
        .login-left {
          display: none;
          flex: 1;
          position: relative;
          z-index: 2;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          border-right: 1px solid rgba(99,210,255,0.07);
        }
        @media (min-width: 900px) { .login-left { display: flex; } }

        .login-brand {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #63d2ff, #00c9a7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .login-brand span { color: #e8f4ff; -webkit-text-fill-color: #e8f4ff; }

        .left-hero {
          animation: fadeUp 0.8s 0.2s ease both;
        }
        .left-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
        }
        .left-hero-title .grad {
          background: linear-gradient(135deg, #63d2ff, #00c9a7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .left-hero-sub {
          font-size: 0.9rem;
          color: rgba(232,244,255,0.45);
          line-height: 1.7;
          max-width: 340px;
        }

        /* Trust badges */
        .trust-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          animation: fadeUp 0.8s 0.35s ease both;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.83rem;
          color: rgba(232,244,255,0.5);
        }
        .trust-dot {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: rgba(99,210,255,0.08);
          border: 1px solid rgba(99,210,255,0.12);
          display: flex; align-items: center; justify-content: center;
          color: #63d2ff;
          flex-shrink: 0;
        }

        /* Right panel — form */
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          padding: 2rem;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(99,210,255,0.1);
          border-radius: 24px;
          padding: 2.5rem;
          backdrop-filter: blur(16px);
          box-shadow: 0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(99,210,255,0.08);
          animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
          position: relative;
        }
        .login-card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,210,255,0.35), transparent);
          border-radius: 100%;
        }

        /* Mobile brand */
        .mobile-brand {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #63d2ff, #00c9a7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1.5rem;
          display: block;
        }
        @media (min-width: 900px) { .mobile-brand { display: none; } }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.65rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.35rem;
        }
        .card-sub {
          font-size: 0.85rem;
          color: rgba(232,244,255,0.4);
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        /* Social-style divider (aesthetic only) */
        .divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.73rem;
          color: rgba(232,244,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(99,210,255,0.1);
        }

        /* Fields */
        .field {
          margin-bottom: 1.1rem;
          animation: fadeUp 0.4s ease both;
        }
        .field:nth-child(1) { animation-delay: 0.05s; }
        .field:nth-child(2) { animation-delay: 0.12s; }

        .field-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .field-label-text {
          font-size: 0.78rem;
          color: rgba(232,244,255,0.5);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 0.85rem;
          color: rgba(232,244,255,0.2);
          pointer-events: none;
          transition: color 0.25s;
          display: flex;
          align-items: center;
        }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(99,210,255,0.1);
          border-radius: 12px;
          padding: 0.8rem 1rem 0.8rem 2.6rem;
          color: #e8f4ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.25s ease;
        }
        .field-input::placeholder { color: rgba(232,244,255,0.18); }
        .field-input:focus {
          border-color: rgba(99,210,255,0.45);
          background: rgba(99,210,255,0.05);
          box-shadow: 0 0 0 3px rgba(99,210,255,0.08);
        }
        .field-input:focus + .input-focused-icon,
        .input-wrap:focus-within .input-icon {
          color: #63d2ff;
        }
        .eye-btn {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: rgba(232,244,255,0.25);
          cursor: pointer;
          padding: 0.25rem;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: #63d2ff; }

        /* Forgot link */
        .forgot-link {
          font-size: 0.78rem;
          color: rgba(99,210,255,0.6);
          text-decoration: none;
          transition: color 0.2s;
          letter-spacing: 0.01em;
        }
        .forgot-link:hover { color: #63d2ff; }

        /* Submit */
        .submit-btn {
          width: 100%;
          padding: 0.9rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #1e5bbf, #00c9a7);
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
          border: none;
          cursor: pointer;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
          animation: fadeUp 0.4s 0.2s ease both;
        }
        .submit-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.25s;
        }
        .submit-btn:hover:not(:disabled)::before { background: rgba(255,255,255,0.1); }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(30,91,191,0.4);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Signup nudge */
        .signup-nudge {
          margin-top: 1.75rem;
          text-align: center;
          font-size: 0.83rem;
          color: rgba(232,244,255,0.3);
          animation: fadeUp 0.4s 0.3s ease both;
        }
        .signup-link {
          color: #63d2ff;
          text-decoration: none;
          font-weight: 500;
          margin-left: 0.3rem;
          transition: color 0.2s;
        }
        .signup-link:hover { color: #00c9a7; }

        /* Secure badge */
        .secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 1.5rem;
          font-size: 0.73rem;
          color: rgba(232,244,255,0.2);
          letter-spacing: 0.04em;
          animation: fadeUp 0.4s 0.4s ease both;
        }
        .secure-badge svg { color: rgba(0,201,167,0.5); }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .login-card { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="login-root">
        <canvas ref={canvasRef} />

        {/* Left decorative panel */}
        <div className="login-left">
          <div className="login-brand">Snap<span>Share</span></div>

          <div className="left-hero">
            <h2 className="left-hero-title">
              Your files,<br />
              <span className="grad">always within reach.</span>
            </h2>
            <p className="left-hero-sub">
              Sign in to access your personal file vault — upload, manage,
              and share securely from anywhere in the world.
            </p>
          </div>

          <div className="trust-list">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg>, text: "JWT-protected sessions with HttpOnly cookies" },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 1.323 11.096"/></svg>, text: "Files stored on AWS S3 with signed URLs" },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>, text: "OTP email verification for password resets" },
            ].map((item, i) => (
              <div className="trust-item" key={i}>
                <div className="trust-dot">{item.icon}</div>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-right">
          <div className="login-card">
            <span className="mobile-brand">SnapShare</span>

            <h1 className="card-title">Welcome back</h1>
            <p className="card-sub">Sign in to continue to your dashboard</p>

            <div className="divider">secure login</div>

            {/* Email */}
            <div className="field">
              <div className="field-label">
                <span className="field-label-text">Email Address</span>
              </div>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                  </svg>
                </span>
                <input
                  className="field-input"
                  type="email"
                  name="email"
                  id="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <div className="field-label">
                <span className="field-label-text">Password</span>
                <Link href="/forgotpassword" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                  </svg>
                </span>
                <input
                  className="field-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                  style={{ paddingRight: "2.75rem" }}
                />
                <button className="eye-btn" type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:17,height:17}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:17,height:17}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button className="submit-btn" type="button" onClick={handleLogin} disabled={loading}>
              {loading ? (
                <><span className="spinner" /> Signing in…</>
              ) : (
                <>
                  Sign In
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{width:16,height:16}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>
                  </svg>
                </>
              )}
            </button>

            {/* Signup nudge */}
            <div className="signup-nudge">
              Don&apos;t have an account?
              <Link href="/signup" className="signup-link">Create one free →</Link>
            </div>

            {/* Security footnote */}
            <div className="secure-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:12,height:12}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>
              </svg>
              256-bit encrypted · JWT secured · AWS S3 storage
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page