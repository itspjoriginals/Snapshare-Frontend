"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Link from 'next/link'

interface FormData {
  name: string,
  email: string,
  password: string,
}

const Page = () => {
  const Router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [sendingOtp, setSendingOtp] = useState<boolean>(false)
  const [otpSent, setOtpSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [otp, setOtp] = React.useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' })

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.2 + 0.3, a: Math.random() * 0.35 + 0.05 });
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
    if (name === 'password') calcStrength(value);
  };

  const calcStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    setPasswordStrength(score);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const sendOtp = async () => {
    if (!formData.email) { toast.error('Please enter your email'); return; }
    setSendingOtp(true);
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/sendotp', {
      method: 'POST',
      body: JSON.stringify({ email: formData.email }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json();
    setSendingOtp(false);
    if (data.ok) { toast.success('OTP sent'); setOtpSent(true); }
    else toast.error(data.message);
  };

  const generatePostObjectUrl = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/generatePostObjectUrl', {
      method: 'GET', credentials: 'include',
    });
    const data = await res.json();
    if (data.ok) { return data.data; }
    else { toast.error('Failed to generate post object url'); return null; }
  };

  const uploadToS3ByUrl = async (url: string) => {
    const res = await fetch(url, { method: 'PUT', body: imageFile });
    return res.ok;
  };

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password || !otp) {
      toast.error('Please fill all the fields'); return;
    }
    setSubmitting(true);
    const s3urlobj = await generatePostObjectUrl();
    if (!s3urlobj) { toast.error('Failed to upload image'); setSubmitting(false); return; }
    const filekey = s3urlobj.filekey;
    const s3url = s3urlobj.signedUrl;
    const uploaded = await uploadToS3ByUrl(s3url);
    if (!uploaded) { toast.error('Failed to upload image'); setSubmitting(false); return; }
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, otp, profilePic: filekey }),
      credentials: 'include'
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.ok) { toast.success('Signup successful'); Router.push('/login'); }
    else toast.error(data.message);
  };

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#00c9a7'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .su-root {
          min-height: 100vh;
          background: #050a12;
          font-family: 'DM Sans', sans-serif;
          color: #e8f4ff;
          display: flex;
          position: relative;
          overflow: hidden;
        }
        .su-root::before {
          content: '';
          position: fixed; top: -20%; right: -10%;
          width: 60vw; height: 60vw;
          background: radial-gradient(circle, rgba(20,70,160,0.2) 0%, transparent 65%);
          pointer-events: none;
        }
        .su-root::after {
          content: '';
          position: fixed; bottom: -15%; left: -10%;
          width: 50vw; height: 50vw;
          background: radial-gradient(circle, rgba(0,180,150,0.1) 0%, transparent 65%);
          pointer-events: none;
        }

        canvas { position: fixed; inset: 0; pointer-events: none; z-index: 0; }

        /* Left panel */
        .su-left {
          display: none;
          flex: 1;
          position: relative;
          z-index: 2;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          border-right: 1px solid rgba(99,210,255,0.07);
        }
        @media (min-width: 960px) { .su-left { display: flex; } }

        .su-brand {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #63d2ff, #00c9a7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .su-brand span { color: #e8f4ff; -webkit-text-fill-color: #e8f4ff; }

        .left-content { animation: fadeUp 0.8s 0.2s ease both; }
        .left-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 3vw, 2.8rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
        }
        .left-title .grad {
          background: linear-gradient(135deg, #63d2ff, #00c9a7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .left-sub {
          font-size: 0.88rem;
          color: rgba(232,244,255,0.4);
          line-height: 1.7;
          max-width: 320px;
          margin-bottom: 2.5rem;
        }

        /* Step list on left */
        .step-list {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          animation: fadeUp 0.8s 0.35s ease both;
        }
        .step-row {
          display: flex;
          align-items: flex-start;
          gap: 0.9rem;
        }
        .step-num {
          width: 26px; height: 26px;
          border-radius: 8px;
          background: rgba(99,210,255,0.08);
          border: 1px solid rgba(99,210,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          color: #63d2ff;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .step-text { font-size: 0.83rem; color: rgba(232,244,255,0.45); line-height: 1.5; }
        .step-text strong { color: rgba(232,244,255,0.75); font-weight: 500; display: block; margin-bottom: 0.1rem; }

        /* Right panel */
        .su-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          padding: 2rem 1.5rem;
        }

        .su-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(99,210,255,0.1);
          border-radius: 24px;
          padding: 2.5rem;
          backdrop-filter: blur(16px);
          box-shadow: 0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(99,210,255,0.08);
          animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
          position: relative;
        }
        .su-card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,210,255,0.35), transparent);
        }

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
        @media (min-width: 960px) { .mobile-brand { display: none; } }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.3rem;
        }
        .card-sub {
          font-size: 0.84rem;
          color: rgba(232,244,255,0.38);
          margin-bottom: 1.75rem;
          line-height: 1.5;
        }

        /* Avatar upload */
        .avatar-upload {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          border-radius: 14px;
          background: rgba(255,255,255,0.02);
          border: 1px dashed rgba(99,210,255,0.15);
          cursor: pointer;
          transition: all 0.25s;
          animation: fadeUp 0.4s ease both;
        }
        .avatar-upload:hover, .avatar-upload.drag-over {
          border-color: rgba(99,210,255,0.35);
          background: rgba(99,210,255,0.04);
        }
        .avatar-circle {
          width: 52px; height: 52px;
          border-radius: 50%;
          background: rgba(99,210,255,0.08);
          border: 1.5px solid rgba(99,210,255,0.15);
          display: flex; align-items: center; justify-content: center;
          color: rgba(99,210,255,0.5);
          overflow: hidden;
          flex-shrink: 0;
          transition: all 0.25s;
        }
        .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-text { flex: 1; }
        .avatar-title { font-size: 0.85rem; color: rgba(232,244,255,0.7); font-weight: 500; margin-bottom: 0.2rem; }
        .avatar-hint { font-size: 0.75rem; color: rgba(232,244,255,0.28); }

        /* Fields */
        .field { margin-bottom: 1rem; animation: fadeUp 0.4s ease both; }
        .field:nth-child(1) { animation-delay: 0.05s; }
        .field:nth-child(2) { animation-delay: 0.1s; }
        .field:nth-child(3) { animation-delay: 0.15s; }
        .field:nth-child(4) { animation-delay: 0.2s; }

        .field-label {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 0.45rem;
        }
        .field-label-text {
          font-size: 0.76rem;
          color: rgba(232,244,255,0.45);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .input-wrap { position: relative; display: flex; align-items: stretch; }
        .input-icon {
          position: absolute; left: 0.85rem;
          color: rgba(232,244,255,0.2);
          pointer-events: none;
          display: flex; align-items: center; height: 100%;
          transition: color 0.25s;
        }
        .input-wrap:focus-within .input-icon { color: #63d2ff; }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(99,210,255,0.1);
          border-radius: 12px;
          padding: 0.78rem 1rem 0.78rem 2.5rem;
          color: #e8f4ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.93rem;
          outline: none;
          transition: all 0.25s ease;
        }
        .field-input::placeholder { color: rgba(232,244,255,0.16); }
        .field-input:focus {
          border-color: rgba(99,210,255,0.45);
          background: rgba(99,210,255,0.05);
          box-shadow: 0 0 0 3px rgba(99,210,255,0.08);
        }
        .field-input.with-btn { border-radius: 12px 0 0 12px; border-right: none; }

        .send-otp-btn {
          padding: 0 1rem;
          background: rgba(99,210,255,0.08);
          border: 1px solid rgba(99,210,255,0.18);
          border-left: none;
          border-radius: 0 12px 12px 0;
          color: #63d2ff;
          font-size: 0.8rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s;
          min-height: 44px;
          letter-spacing: 0.01em;
        }
        .send-otp-btn:hover:not(:disabled) {
          background: rgba(99,210,255,0.16);
          color: #e8f4ff;
        }
        .send-otp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .otp-badge {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.73rem; color: #00c9a7;
          background: rgba(0,201,167,0.07);
          border: 1px solid rgba(0,201,167,0.18);
          border-radius: 100px;
          padding: 0.18rem 0.65rem;
          margin-top: 0.35rem;
          animation: fadeUp 0.3s ease both;
        }

        .eye-btn {
          position: absolute; right: 0.75rem;
          background: none; border: none;
          color: rgba(232,244,255,0.25);
          cursor: pointer; padding: 0.25rem;
          display: flex; align-items: center;
          height: 100%;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: #63d2ff; }

        /* Password strength */
        .strength-row {
          display: flex; gap: 4px; margin-top: 0.5rem;
        }
        .strength-bar {
          flex: 1; height: 3px; border-radius: 2px;
          background: rgba(255,255,255,0.07);
          transition: background 0.35s ease;
        }
        .strength-label {
          font-size: 0.7rem;
          margin-top: 0.3rem;
          transition: color 0.3s;
        }

        /* Submit */
        .su-submit {
          width: 100%;
          padding: 0.88rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #1e5bbf, #00c9a7);
          color: #fff;
          font-weight: 600;
          font-size: 0.93rem;
          font-family: 'DM Sans', sans-serif;
          border: none;
          cursor: pointer;
          margin-top: 0.75rem;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          transition: all 0.25s ease;
          position: relative; overflow: hidden;
          animation: fadeUp 0.4s 0.25s ease both;
        }
        .su-submit::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(255,255,255,0); transition: background 0.25s;
        }
        .su-submit:hover:not(:disabled)::before { background: rgba(255,255,255,0.1); }
        .su-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(30,91,191,0.4); }
        .su-submit:active:not(:disabled) { transform: translateY(0); }
        .su-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-nudge {
          margin-top: 1.6rem;
          text-align: center;
          font-size: 0.82rem;
          color: rgba(232,244,255,0.28);
          animation: fadeUp 0.4s 0.3s ease both;
        }
        .login-link {
          color: #63d2ff; text-decoration: none;
          font-weight: 500; margin-left: 0.3rem;
          transition: color 0.2s;
        }
        .login-link:hover { color: #00c9a7; }

        .secure-badge {
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          margin-top: 1.4rem;
          font-size: 0.71rem;
          color: rgba(232,244,255,0.18);
          letter-spacing: 0.04em;
          animation: fadeUp 0.4s 0.35s ease both;
        }
        .secure-badge svg { color: rgba(0,201,167,0.45); }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .su-card { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="su-root">
        <canvas ref={canvasRef} />

        {/* Left panel */}
        <div className="su-left">
          <div className="su-brand">Snap<span>Share</span></div>

          <div className="left-content">
            <h2 className="left-title">
              Start sharing in<br />
              <span className="grad">under 60 seconds.</span>
            </h2>
            <p className="left-sub">
              Create your free account and get instant access to secure file
              uploads, shareable links, and email delivery — powered by AWS S3.
            </p>

            <div className="step-list">
              {[
                { title: "Create your account", desc: "Fill in your details and verify your email with a one-time code." },
                { title: "Upload your files", desc: "Drag and drop any file type — stored securely on AWS S3." },
                { title: "Share instantly", desc: "Generate signed links or send files directly via email." },
              ].map((s, i) => (
                <div className="step-row" key={i}>
                  <div className="step-num">{i + 1}</div>
                  <div className="step-text">
                    <strong>{s.title}</strong>
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'rgba(232,244,255,0.18)', letterSpacing: '0.04em' }}>
            © {new Date().getFullYear()} SnapShare · Secured by AWS & JWT
          </div>
        </div>

        {/* Right panel — form */}
        <div className="su-right">
          <div className="su-card">
            <span className="mobile-brand">SnapShare</span>
            <h1 className="card-title">Create account</h1>
            <p className="card-sub">Join SnapShare — it's free, secure, and takes seconds.</p>

            {/* Avatar upload */}
            <div
              className={`avatar-upload${dragOver ? ' drag-over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f); }}
            >
              <div className="avatar-circle">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                )}
              </div>
              <div className="avatar-text">
                <div className="avatar-title">{imagePreview ? 'Profile photo selected ✓' : 'Upload profile photo'}</div>
                <div className="avatar-hint">Click or drag & drop · PNG, JPG up to 5MB</div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                id="image"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Name */}
            <div className="field">
              <div className="field-label">
                <span className="field-label-text">Full Name</span>
              </div>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </span>
                <input className="field-input" type="text" name="name" id="name" placeholder="Alex Johnson" value={formData.name} onChange={handleInputChange} autoComplete="name" />
              </div>
            </div>

            {/* Email + OTP send */}
            <div className="field">
              <div className="field-label">
                <span className="field-label-text">Email Address</span>
              </div>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </span>
                <input className="field-input with-btn" type="email" name="email" id="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} autoComplete="email" />
                <button className="send-otp-btn" onClick={sendOtp} disabled={sendingOtp}>
                  {sendingOtp ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} /> Sending
                    </span>
                  ) : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>
              {otpSent && (
                <div className="otp-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 11, height: 11 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  OTP sent — check your inbox
                </div>
              )}
            </div>

            {/* OTP */}
            <div className="field">
              <div className="field-label">
                <span className="field-label-text">One-Time Password</span>
              </div>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.459 7.459 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
                  </svg>
                </span>
                <input className="field-input" type="password" name="otp" id="otp" placeholder="••••••" value={otp} onChange={e => setOtp(e.target.value)} />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <div className="field-label">
                <span className="field-label-text">Password</span>
              </div>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </span>
                <input
                  className="field-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button className="eye-btn" type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 16, height: 16 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 16, height: 16 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password strength */}
              {formData.password.length > 0 && (
                <>
                  <div className="strength-row">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="strength-bar" style={{ background: passwordStrength >= n ? strengthColors[passwordStrength] : undefined }} />
                    ))}
                  </div>
                  <div className="strength-label" style={{ color: strengthColors[passwordStrength] }}>
                    {strengthLabels[passwordStrength]}
                  </div>
                </>
              )}
            </div>

            {/* Submit */}
            <button className="su-submit" type="button" onClick={handleSignup} disabled={submitting}>
              {submitting ? (
                <><span className="spinner" /> Creating account…</>
              ) : (
                <>
                  Create Account
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 16, height: 16 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>

            {/* Login nudge */}
            <div className="login-nudge">
              Already have an account?
              <Link href="/login" className="login-link">Sign in →</Link>
            </div>

            {/* Security note */}
            <div className="secure-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 12, height: 12 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              OTP verified · AWS S3 storage · JWT secured
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page