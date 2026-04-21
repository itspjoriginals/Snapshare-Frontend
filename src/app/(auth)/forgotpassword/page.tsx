"use client";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";

interface FormData {
  email: string;
  password: string;
}

const Page = () => {
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [otp, setOtp] = React.useState("");
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=email, 2=otp, 3=password
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const Router = useRouter();

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
  };

  const sendOtp = async () => {
    if (!formData.email) { toast.error("Please enter your email"); return; }
    setSendingOtp(true);
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/sendotp", {
      method: "POST",
      body: JSON.stringify({ email: formData.email }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json();
    setSendingOtp(false);
    if (data.ok) {
      toast.success("OTP sent to your email");
      setOtpSent(true);
      setStep(2);
    } else {
      toast.error(data.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || !otp) {
      toast.error("Please fill all the fields");
      return;
    }
    setSubmitting(true);
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/changePassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email, password: formData.password, otp }),
      credentials: "include",
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.ok) {
      toast.success("Password changed successfully!");
      Router.push("/login");
    } else {
      toast.error(data.message);
    }
  };

  const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "Verify" },
    { n: 3, label: "Reset" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fp-root {
          min-height: 100vh;
          background: #050a12;
          font-family: 'DM Sans', sans-serif;
          color: #e8f4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .fp-root::before {
          content: '';
          position: fixed;
          top: -30%; left: -20%;
          width: 70vw; height: 70vw;
          background: radial-gradient(circle, rgba(20,70,160,0.2) 0%, transparent 65%);
          pointer-events: none;
        }
        .fp-root::after {
          content: '';
          position: fixed;
          bottom: -20%; right: -10%;
          width: 50vw; height: 50vw;
          background: radial-gradient(circle, rgba(0,180,150,0.1) 0%, transparent 65%);
          pointer-events: none;
        }

        canvas { position: fixed; inset: 0; pointer-events: none; z-index: 0; }

        .fp-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 440px;
          margin: 2rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(99,210,255,0.12);
          border-radius: 24px;
          padding: 2.5rem;
          backdrop-filter: blur(16px);
          box-shadow: 0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(99,210,255,0.08);
          animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* Top shimmer line */
        .fp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,210,255,0.4), transparent);
          border-radius: 100%;
        }

        /* Icon */
        .fp-icon-wrap {
          width: 60px; height: 60px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(30,90,180,0.4), rgba(0,180,150,0.25));
          border: 1px solid rgba(99,210,255,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.5rem;
          color: #63d2ff;
          box-shadow: 0 0 30px rgba(99,210,255,0.1);
        }

        .fp-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          text-align: center;
          letter-spacing: -0.02em;
          margin-bottom: 0.4rem;
        }
        .fp-subtitle {
          font-size: 0.85rem;
          color: rgba(232,244,255,0.45);
          text-align: center;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        /* Stepper */
        .stepper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 2rem;
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          position: relative;
        }
        .step-circle {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          border: 1.5px solid rgba(99,210,255,0.2);
          background: rgba(99,210,255,0.04);
          color: rgba(232,244,255,0.35);
          transition: all 0.4s ease;
          position: relative;
          z-index: 1;
        }
        .step-circle.active {
          border-color: #63d2ff;
          background: rgba(99,210,255,0.12);
          color: #63d2ff;
          box-shadow: 0 0 14px rgba(99,210,255,0.25);
        }
        .step-circle.done {
          border-color: #00c9a7;
          background: rgba(0,201,167,0.15);
          color: #00c9a7;
        }
        .step-label {
          font-size: 0.68rem;
          color: rgba(232,244,255,0.3);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: color 0.3s;
        }
        .step-item.active .step-label { color: #63d2ff; }
        .step-item.done .step-label { color: #00c9a7; }
        .step-line {
          width: 48px; height: 1px;
          background: rgba(99,210,255,0.12);
          margin: 0 4px;
          margin-bottom: 20px;
          transition: background 0.4s;
          position: relative;
        }
        .step-line.done { background: rgba(0,201,167,0.35); }

        /* Form fields */
        .fp-field {
          margin-bottom: 1.1rem;
          animation: fadeUp 0.4s ease both;
        }
        .fp-label {
          display: block;
          font-size: 0.78rem;
          color: rgba(232,244,255,0.5);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .fp-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .fp-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(99,210,255,0.12);
          border-radius: 12px;
          padding: 0.8rem 1rem;
          color: #e8f4ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.25s ease;
        }
        .fp-input::placeholder { color: rgba(232,244,255,0.2); }
        .fp-input:focus {
          border-color: rgba(99,210,255,0.45);
          background: rgba(99,210,255,0.05);
          box-shadow: 0 0 0 3px rgba(99,210,255,0.08);
        }
        .fp-input.with-btn { border-radius: 12px 0 0 12px; border-right: none; }

        .fp-eye-btn {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: rgba(232,244,255,0.3);
          cursor: pointer;
          padding: 0.25rem;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .fp-eye-btn:hover { color: #63d2ff; }

        .send-otp-btn {
          padding: 0 1.1rem;
          background: linear-gradient(135deg, rgba(30,90,180,0.6), rgba(0,180,150,0.4));
          border: 1px solid rgba(99,210,255,0.25);
          border-left: none;
          border-radius: 0 12px 12px 0;
          color: #63d2ff;
          font-size: 0.82rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s;
          letter-spacing: 0.02em;
          height: 100%;
          min-height: 44px;
        }
        .send-otp-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(30,90,180,0.85), rgba(0,180,150,0.6));
          color: #e8f4ff;
        }
        .send-otp-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* OTP sent badge */
        .otp-sent-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: #00c9a7;
          background: rgba(0,201,167,0.08);
          border: 1px solid rgba(0,201,167,0.2);
          border-radius: 100px;
          padding: 0.2rem 0.7rem;
          margin-top: 0.4rem;
          animation: fadeUp 0.3s ease both;
        }

        /* Submit button */
        .fp-submit {
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
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          margin-top: 0.5rem;
          position: relative;
          overflow: hidden;
        }
        .fp-submit::before {
          content: '';
          position: absolute; inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.25s;
        }
        .fp-submit:hover:not(:disabled)::before { background: rgba(255,255,255,0.1); }
        .fp-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(30,91,191,0.4);
        }
        .fp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Spinner */
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Back to login */
        .fp-back {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 1.5rem;
          font-size: 0.83rem;
          color: rgba(232,244,255,0.35);
          cursor: pointer;
          transition: color 0.2s;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          width: 100%;
        }
        .fp-back:hover { color: #63d2ff; }

        /* Info hint */
        .fp-hint {
          background: rgba(99,210,255,0.05);
          border: 1px solid rgba(99,210,255,0.12);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
          color: rgba(232,244,255,0.45);
          line-height: 1.6;
          margin-bottom: 1.25rem;
          display: flex;
          gap: 0.6rem;
          align-items: flex-start;
        }
        .fp-hint svg { flex-shrink: 0; color: #63d2ff; margin-top: 1px; }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .fp-card { padding: 2rem 1.5rem; margin: 1rem; }
        }
      `}</style>

      <div className="fp-root">
        <canvas ref={canvasRef} />

        <div className="fp-card">
          {/* Icon */}
          <div className="fp-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 28, height: 28 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>

          <h1 className="fp-title">Reset Password</h1>
          <p className="fp-subtitle">
            Verify your email with a one-time code, then set a new password.
          </p>

          {/* Stepper */}
          <div className="stepper">
            {steps.map((s, i) => (
              <React.Fragment key={s.n}>
                <div className={`step-item ${step === s.n ? "active" : step > s.n ? "done" : ""}`}>
                  <div className={`step-circle ${step === s.n ? "active" : step > s.n ? "done" : ""}`}>
                    {step > s.n ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : s.n}
                  </div>
                  <span className="step-label">{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`step-line ${step > s.n ? "done" : ""}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* STEP 1 — Email */}
          <div className="fp-field">
            <label className="fp-label" htmlFor="email">Email Address</label>
            <div className="fp-input-wrap">
              <input
                className="fp-input with-btn"
                type="email"
                name="email"
                id="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              <button
                className="send-otp-btn"
                onClick={sendOtp}
                disabled={sendingOtp}
              >
                {sendingOtp ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span className="spinner" /> Sending…
                  </span>
                ) : otpSent ? "Resend OTP" : "Send OTP"}
              </button>
            </div>
            {otpSent && (
              <div className="otp-sent-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                OTP sent — check your inbox
              </div>
            )}
          </div>

          {/* STEP 2 — OTP */}
          {otpSent && (
            <div className="fp-field" style={{ animationDelay: "0.05s" }}>
              {step >= 2 && (
                <div className="fp-hint">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                  Enter the 6-digit OTP we sent to <strong style={{ color: "#63d2ff" }}>&nbsp;{formData.email}</strong>
                </div>
              )}
              <label className="fp-label" htmlFor="otp">One-Time Password</label>
              <input
                className="fp-input"
                type="password"
                name="otp"
                id="otp"
                placeholder="••••••"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); if (e.target.value.length > 0) setStep(3); else setStep(2); }}
              />
            </div>
          )}

          {/* STEP 3 — New Password */}
          {otp.length > 0 && (
            <div className="fp-field" style={{ animationDelay: "0.1s" }}>
              <label className="fp-label" htmlFor="password">New Password</label>
              <div className="fp-input-wrap">
                <input
                  className="fp-input"
                  style={{ paddingRight: "2.75rem" }}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button className="fp-eye-btn" type="button" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 18, height: 18 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 18, height: 18 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Submit */}
          <button className="fp-submit" onClick={handleSubmit} disabled={submitting} style={{ marginTop: "1rem" }}>
            {submitting ? (
              <><span className="spinner" /> Updating password…</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 17, height: 17 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                Change Password
              </>
            )}
          </button>

          {/* Back to login */}
          <button className="fp-back" onClick={() => Router.push("/login")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Login
          </button>
        </div>
      </div>
    </>
  );
};

export default Page;