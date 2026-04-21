"use client"
import { useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Home() {
  const auth = useAppSelector((state) => state.authReducer);
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; vx: number; vy: number;
      radius: number; alpha: number;
    }[] = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,210,255,${p.alpha})`;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,210,255,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 1.323 11.096" />
        </svg>
      ),
      title: "Cloud Upload",
      desc: "Instantly upload files to AWS S3 with signed URLs and AES-256 encryption.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Z" />
        </svg>
      ),
      title: "Instant Sharing",
      desc: "Share files via secure links or send directly to emails with one click.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
      title: "JWT Security",
      desc: "Protected routes, OTP verification, and JWT-based auth keep your files safe.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
        </svg>
      ),
      title: "File Dashboard",
      desc: "Manage, preview, and organize all your uploads from a clean dashboard.",
    },
  ];

  const stats = [
    { value: "256-bit", label: "Encryption" },
    { value: "99.9%", label: "Uptime" },
    { value: "∞", label: "File Types" },
    { value: "< 1s", label: "Upload Speed" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .snap-root {
          min-height: 100vh;
          background: #050a12;
          font-family: 'DM Sans', sans-serif;
          color: #e8f4ff;
          overflow-x: hidden;
          position: relative;
        }

        /* Radial ambient glows */
        .snap-root::before {
          content: '';
          position: fixed;
          top: -20%;
          left: -10%;
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, rgba(30,90,180,0.18) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .snap-root::after {
          content: '';
          position: fixed;
          bottom: -10%;
          right: -10%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(0,180,160,0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        canvas { position: fixed; inset: 0; z-index: 1; pointer-events: none; }

        .content { position: relative; z-index: 2; }

        /* NAV */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 3rem;
          border-bottom: 1px solid rgba(99,210,255,0.08);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(5,10,18,0.7);
          animation: fadeDown 0.7s ease both;
        }
        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.4rem;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #63d2ff, #00c9a7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nav-logo span { color: #e8f4ff; -webkit-text-fill-color: #e8f4ff; }
        .nav-pill {
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.35rem 0.9rem;
          border-radius: 100px;
          border: 1px solid rgba(99,210,255,0.25);
          color: #63d2ff;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* HERO */
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 7rem 2rem 4rem;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: 100px;
          background: rgba(99,210,255,0.08);
          border: 1px solid rgba(99,210,255,0.2);
          font-size: 0.78rem;
          color: #63d2ff;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 2rem;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #63d2ff;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2.8rem, 7vw, 5.5rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          max-width: 800px;
          margin-bottom: 1.5rem;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .hero-title .grad {
          background: linear-gradient(135deg, #63d2ff 0%, #00c9a7 50%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 1.1rem;
          font-weight: 300;
          color: rgba(232,244,255,0.6);
          max-width: 520px;
          line-height: 1.7;
          margin-bottom: 2.5rem;
          animation: fadeUp 0.7s 0.3s ease both;
        }

        .cta-group {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.7s 0.4s ease both;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 2rem;
          border-radius: 100px;
          background: linear-gradient(135deg, #1e6bbf, #00c9a7);
          color: #fff;
          font-weight: 500;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.25s;
        }
        .btn-primary:hover::before { background: rgba(255,255,255,0.12); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(30,107,191,0.45); }
        .btn-primary:active { transform: translateY(0); }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 2rem;
          border-radius: 100px;
          background: transparent;
          color: rgba(232,244,255,0.8);
          font-weight: 400;
          font-size: 0.95rem;
          border: 1px solid rgba(99,210,255,0.2);
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-secondary:hover {
          border-color: rgba(99,210,255,0.5);
          color: #63d2ff;
          background: rgba(99,210,255,0.05);
        }

        /* STATS */
        .stats-row {
          display: flex;
          justify-content: center;
          gap: 2.5rem;
          flex-wrap: wrap;
          padding: 3rem 2rem;
          animation: fadeUp 0.7s 0.5s ease both;
        }
        .stat-item {
          text-align: center;
        }
        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(135deg, #63d2ff, #00c9a7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label {
          font-size: 0.78rem;
          color: rgba(232,244,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 0.25rem;
        }
        .stat-divider {
          width: 1px;
          background: rgba(99,210,255,0.12);
          align-self: stretch;
        }

        /* FEATURES */
        .section {
          padding: 4rem 2rem 6rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .section-label {
          text-align: center;
          font-size: 0.75rem;
          color: #63d2ff;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 0.75rem;
          animation: fadeUp 0.6s ease both;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 700;
          text-align: center;
          margin-bottom: 3rem;
          letter-spacing: -0.02em;
          animation: fadeUp 0.6s 0.1s ease both;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }
        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(99,210,255,0.1);
          border-radius: 16px;
          padding: 1.75rem;
          transition: all 0.3s ease;
          animation: fadeUp 0.6s ease both;
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,210,255,0.3), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-card:hover {
          border-color: rgba(99,210,255,0.25);
          background: rgba(99,210,255,0.05);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .feature-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(99,210,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #63d2ff;
          margin-bottom: 1rem;
        }
        .feature-title {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        .feature-desc {
          font-size: 0.88rem;
          color: rgba(232,244,255,0.5);
          line-height: 1.65;
        }

        /* AUTHENTICATED WELCOME CARD */
        .welcome-card {
          max-width: 560px;
          margin: 0 auto;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(99,210,255,0.15);
          border-radius: 24px;
          padding: 3rem;
          text-align: center;
          backdrop-filter: blur(12px);
          animation: scaleIn 0.5s ease both;
          position: relative;
          overflow: hidden;
        }
        .welcome-card::before {
          content: '';
          position: absolute;
          top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(99,210,255,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .avatar {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1e6bbf, #00c9a7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: white;
          margin: 0 auto 1.5rem;
          box-shadow: 0 0 0 4px rgba(99,210,255,0.12), 0 0 30px rgba(30,107,191,0.3);
        }
        .welcome-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .welcome-sub {
          font-size: 0.9rem;
          color: rgba(232,244,255,0.45);
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .quick-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .quick-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 12px;
          background: rgba(99,210,255,0.05);
          border: 1px solid rgba(99,210,255,0.1);
          cursor: pointer;
          transition: all 0.25s ease;
          font-size: 0.82rem;
          color: rgba(232,244,255,0.7);
          font-family: 'DM Sans', sans-serif;
        }
        .quick-action:hover {
          background: rgba(99,210,255,0.1);
          border-color: rgba(99,210,255,0.3);
          color: #e8f4ff;
          transform: translateY(-2px);
        }
        .quick-action svg { color: #63d2ff; }

        /* FOOTER */
        .footer {
          border-top: 1px solid rgba(99,210,255,0.08);
          padding: 2rem 3rem;
          text-align: center;
          font-size: 0.8rem;
          color: rgba(232,244,255,0.25);
        }
        .footer span { color: rgba(99,210,255,0.5); }

        /* ANIMATIONS */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Stagger feature cards */
        .feature-card:nth-child(1) { animation-delay: 0.15s; }
        .feature-card:nth-child(2) { animation-delay: 0.25s; }
        .feature-card:nth-child(3) { animation-delay: 0.35s; }
        .feature-card:nth-child(4) { animation-delay: 0.45s; }

        @media (max-width: 640px) {
          .nav { padding: 1.2rem 1.5rem; }
          .hero { padding: 5rem 1.5rem 3rem; }
          .stats-row { gap: 1.5rem; }
          .stat-divider { display: none; }
          .quick-actions { grid-template-columns: 1fr; }
          .welcome-card { padding: 2rem 1.5rem; margin: 0 1rem; }
        }
      `}</style>

      <div className="snap-root">
        <canvas ref={canvasRef} />

        <div className="content">
          {/* NAV */}
          <nav className="nav">
            <div className="nav-logo">Snap<span>Share</span></div>
            <div className="nav-pill">Secure File Sharing</div>
          </nav>

          {!auth.isAuth ? (
            <>
              {/* HERO */}
              <section className="hero">
                <div className="hero-badge">
                  <span className="badge-dot" />
                  Now with AWS S3 Signed URLs
                </div>

                <h1 className="hero-title">
                  Share Files with{" "}
                  <span className="grad">Zero Friction.</span>{" "}
                  Maximum Security.
                </h1>

                <p className="hero-sub">
                  SnapShare lets you upload, manage, and share files instantly — backed by
                  AWS S3, JWT authentication, and end-to-end encryption. Your files, your control.
                </p>

                <div className="cta-group">
                  <button className="btn-primary" onClick={() => router.push("/login")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                    Get Started Free
                  </button>
                  <button className="btn-secondary" onClick={() => router.push("/login")}>
                    Already have an account?
                  </button>
                </div>
              </section>

              {/* STATS */}
              <div className="stats-row">
                {stats.map((s, i) => (
                  <div key={i} style={{ display: "contents" }}>
                    {i > 0 && <div className="stat-divider" />}
                    <div className="stat-item">
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FEATURES */}
              <section className="section">
                <p className="section-label">Why SnapShare</p>
                <h2 className="section-title">Everything you need to share files safely</h2>
                <div className="features-grid">
                  {features.map((f, i) => (
                    <div key={i} className="feature-card">
                      <div className="feature-icon">{f.icon}</div>
                      <div className="feature-title">{f.title}</div>
                      <div className="feature-desc">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            /* AUTHENTICATED VIEW */
            <section className="section" style={{ paddingTop: "6rem" }}>
              <div className="welcome-card">
                <div className="avatar">
                  {auth.user?.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <div className="welcome-name">
                  Welcome back, {auth.user?.name?.split(" ")[0]} 👋
                </div>
                <p className="welcome-sub">
                  Your personal file vault is ready. Upload, manage, and share your
                  files securely — all in one place.
                </p>

                <button
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => router.push("/myfiles")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                  </svg>
                  Open My Files
                </button>

                <div className="quick-actions">
                  <button className="quick-action" onClick={() => router.push("/myfiles")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 20, height: 20 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    Upload File
                  </button>
                  <button className="quick-action" onClick={() => router.push("/myfiles")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 20, height: 20 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Z" />
                    </svg>
                    Share a File
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* FOOTER */}
          <footer className="footer">
            © {new Date().getFullYear()} <span>SnapShare</span> · Built with Next.js, AWS S3 & ❤️
          </footer>
        </div>
      </div>
    </>
  );
}