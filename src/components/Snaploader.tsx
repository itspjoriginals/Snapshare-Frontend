"use client"
import React, { useEffect, useState } from 'react'

interface SnapLoaderProps {
    message?: string
}

export const SnapLoader: React.FC<SnapLoaderProps> = ({ message = 'Loading…' }) => {
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400&display=swap');

        .snap-loader-root {
          position: fixed; inset: 0; z-index: 9999;
          background: #050a12;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 2rem;
          font-family: 'DM Sans', sans-serif;
        }

        /* Ambient glows */
        .snap-loader-root::before {
          content: '';
          position: absolute; top: -20%; left: -10%;
          width: 60vw; height: 60vw;
          background: radial-gradient(circle, rgba(20,70,160,0.22) 0%, transparent 65%);
          pointer-events: none;
        }
        .snap-loader-root::after {
          content: '';
          position: absolute; bottom: -15%; right: -5%;
          width: 50vw; height: 50vw;
          background: radial-gradient(circle, rgba(0,180,150,0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        /* Logo */
        .sl-brand {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem; font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #63d2ff, #00c9a7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: sl-pulse-brand 2.4s ease-in-out infinite;
          position: relative; z-index: 1;
        }
        .sl-brand span { color: #e8f4ff; -webkit-text-fill-color: #e8f4ff; }

        @keyframes sl-pulse-brand {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }

        /* Orbit ring */
        .sl-orbit-wrap {
          position: relative; z-index: 1;
          width: 96px; height: 96px;
          display: flex; align-items: center; justify-content: center;
        }

        .sl-ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 1.5px solid transparent;
          animation: sl-spin 1.6s linear infinite;
        }
        .sl-ring-1 {
          border-top-color: #63d2ff;
          border-right-color: rgba(99,210,255,0.25);
          border-bottom-color: transparent;
          border-left-color: transparent;
          animation-duration: 1.4s;
        }
        .sl-ring-2 {
          inset: 10px;
          border-top-color: transparent;
          border-right-color: #00c9a7;
          border-bottom-color: rgba(0,201,167,0.2);
          border-left-color: transparent;
          animation-duration: 1.8s;
          animation-direction: reverse;
        }
        .sl-ring-3 {
          inset: 22px;
          border-top-color: rgba(99,210,255,0.5);
          border-right-color: transparent;
          border-bottom-color: rgba(99,210,255,0.15);
          border-left-color: transparent;
          animation-duration: 2.2s;
        }

        @keyframes sl-spin { to { transform: rotate(360deg); } }

        /* Center dot */
        .sl-center-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: linear-gradient(135deg, #63d2ff, #00c9a7);
          box-shadow: 0 0 12px rgba(99,210,255,0.6);
          animation: sl-dot-pulse 1.4s ease-in-out infinite;
          position: relative; z-index: 2;
        }
        @keyframes sl-dot-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }

        /* Dots progress */
        .sl-dots {
          display: flex; gap: 7px;
          position: relative; z-index: 1;
        }
        .sl-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(99,210,255,0.2);
          animation: sl-dot-wave 1.4s ease-in-out infinite;
        }
        .sl-dot:nth-child(1) { animation-delay: 0s; }
        .sl-dot:nth-child(2) { animation-delay: 0.18s; }
        .sl-dot:nth-child(3) { animation-delay: 0.36s; }
        .sl-dot:nth-child(4) { animation-delay: 0.54s; }
        .sl-dot:nth-child(5) { animation-delay: 0.72s; }

        @keyframes sl-dot-wave {
          0%, 100% { background: rgba(99,210,255,0.15); transform: scale(1); }
          50% { background: #63d2ff; transform: scale(1.5); box-shadow: 0 0 6px rgba(99,210,255,0.5); }
        }

        /* Message */
        .sl-message {
          font-size: 0.82rem; font-weight: 300;
          color: rgba(232,244,255,0.3);
          letter-spacing: 0.07em;
          text-transform: uppercase;
          position: relative; z-index: 1;
          animation: sl-fade-in 0.6s ease both;
        }

        /* Particle dots (static, CSS-only) */
        .sl-particles {
          position: absolute; inset: 0;
          overflow: hidden; pointer-events: none;
        }
        .sl-particle {
          position: absolute;
          width: 2px; height: 2px; border-radius: 50%;
          background: rgba(99,210,255,0.4);
          animation: sl-float linear infinite;
        }
        .sl-particle:nth-child(1)  { left: 12%; top: 20%; animation-duration: 8s;  animation-delay: 0s; }
        .sl-particle:nth-child(2)  { left: 28%; top: 70%; animation-duration: 11s; animation-delay: 1s; }
        .sl-particle:nth-child(3)  { left: 55%; top: 15%; animation-duration: 9s;  animation-delay: 2s; }
        .sl-particle:nth-child(4)  { left: 72%; top: 60%; animation-duration: 13s; animation-delay: 0.5s; }
        .sl-particle:nth-child(5)  { left: 85%; top: 30%; animation-duration: 7s;  animation-delay: 3s; }
        .sl-particle:nth-child(6)  { left: 40%; top: 85%; animation-duration: 10s; animation-delay: 1.5s; }
        .sl-particle:nth-child(7)  { left: 8%;  top: 55%; animation-duration: 12s; animation-delay: 2.5s; }
        .sl-particle:nth-child(8)  { left: 62%; top: 40%; animation-duration: 8s;  animation-delay: 4s; }
        .sl-particle:nth-child(9)  { left: 90%; top: 75%; animation-duration: 14s; animation-delay: 0.8s; }
        .sl-particle:nth-child(10) { left: 35%; top: 10%; animation-duration: 9s;  animation-delay: 3.5s; }
        .sl-particle:nth-child(odd)  { background: rgba(0,201,167,0.35); }

        @keyframes sl-float {
          0%   { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          33%  { transform: translateY(-18px) translateX(8px); opacity: 0.7; }
          66%  { transform: translateY(-8px) translateX(-6px); opacity: 0.3; }
          100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
        }

        @keyframes sl-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Fade-out transition class */
        .snap-loader-root.sl-exit {
          animation: sl-fade-out 0.4s ease forwards;
        }
        @keyframes sl-fade-out {
          to { opacity: 0; pointer-events: none; }
        }
      `}</style>

            <div className="snap-loader-root">
                {/* Floating particles */}
                <div className="sl-particles">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div className="sl-particle" key={i} />
                    ))}
                </div>

                {/* Brand */}
                <div className="sl-brand">Snap<span>Share</span></div>

                {/* Orbit rings */}
                <div className="sl-orbit-wrap">
                    <div className="sl-ring sl-ring-1" />
                    <div className="sl-ring sl-ring-2" />
                    <div className="sl-ring sl-ring-3" />
                    <div className="sl-center-dot" />
                </div>

                {/* Wave dots */}
                <div className="sl-dots">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div className="sl-dot" key={i} />
                    ))}
                </div>

                {/* Message */}
                <div className="sl-message">{message}</div>
            </div>
        </>
    )
}


/**
 * usePageLoader — shows loader until auth hydration + initial data fetch settle.
 * Usage: const loading = usePageLoader(auth.isAuth !== undefined)
 */
export const usePageLoader = (ready: boolean, minMs = 800) => {
    const [show, setShow] = useState(true)

    useEffect(() => {
        if (!ready) return
        const t = setTimeout(() => setShow(false), minMs)
        return () => clearTimeout(t)
    }, [ready, minMs])

    return show
}

export default SnapLoader