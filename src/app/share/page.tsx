"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppSelector } from "@/redux/store";

interface S3UrlObject {
  filekey: string;
  signedUrl: string;
}

const Page = () => {
  const auth = useAppSelector((state) => state.authReducer);
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStep, setUploadStep] = useState<0 | 1 | 2 | 3>(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    setFile(f);
    if (!fileName) setFileName(f.name.replace(/\.[^/.]+$/, ""));
  }, [fileName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = () => { setFile(null); setFileName(""); };

  const viewFile = () => {
    if (file) window.open(URL.createObjectURL(file), "_blank");
  };

  const generatePostObjectUrl = async (): Promise<S3UrlObject | null> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/file/generatePostObjectUrl`, {
      method: "GET", credentials: "include",
    });
    const data = await res.json();
    if (data.ok) return data.data;
    toast.error("Failed to generate post object URL");
    return null;
  };

  const uploadToS3ByUrl = async (url: string): Promise<boolean> => {
    if (!file) return false;
    const res = await fetch(url, { method: "PUT", body: file });
    return res.ok;
  };

  const handleUpload = async () => {
    try {
      if (!file || !email || !fileName) {
        toast.error("Please fill all fields and upload a file");
        return;
      }
      setUploading(true);
      setUploadProgress(10);
      setUploadStep(1);

      const s3urlobj = await generatePostObjectUrl();
      if (!s3urlobj) { setUploading(false); setUploadStep(0); return; }

      setUploadProgress(35);
      setUploadStep(2);

      const { filekey, signedUrl } = s3urlobj;
      const uploaded = await uploadToS3ByUrl(signedUrl);
      if (!uploaded) {
        setUploading(false); setUploadStep(0);
        toast.error("Failed to upload file to S3");
        return;
      }

      setUploadProgress(75);
      setUploadStep(3);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/file/sharefile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiveremail: email.trim(),
          filename: fileName.trim(),
          filekey,
          fileType: file.type,
        }),
      });

      const data = await res.json();
      setUploadProgress(100);
      setUploading(false);
      setUploadStep(0);

      if (data.ok) {
        toast.success("File shared successfully!");
        router.push("/myfiles");
      } else {
        toast.error(data.message || "Failed to share file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false); setUploadStep(0);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (!auth.isAuth) router.push("/login");
  }, [auth, router]);

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📕';
    if (type.includes('video')) return '🎬';
    if (type.includes('audio')) return '🎵';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return '📊';
    return '📄';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const stepLabels = ['', 'Preparing…', 'Uploading to S3…', 'Sharing file…'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .up-root {
          min-height: 100vh;
          background: #050a12;
          font-family: 'DM Sans', sans-serif;
          color: #e8f4ff;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .up-root::before {
          content: '';
          position: fixed; top: -20%; right: -10%;
          width: 55vw; height: 55vw;
          background: radial-gradient(circle, rgba(20,70,160,0.2) 0%, transparent 65%);
          pointer-events: none;
        }
        .up-root::after {
          content: '';
          position: fixed; bottom: -15%; left: -10%;
          width: 48vw; height: 48vw;
          background: radial-gradient(circle, rgba(0,180,150,0.1) 0%, transparent 65%);
          pointer-events: none;
        }

        /* NAV */
        .up-nav {
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 2.5rem;
          background: rgba(5,10,18,0.75);
          border-bottom: 1px solid rgba(99,210,255,0.07);
          backdrop-filter: blur(16px);
          animation: fadeDown 0.6s ease both;
        }
        .up-brand {
          font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #63d2ff, #00c9a7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .up-brand span { color: #e8f4ff; -webkit-text-fill-color: #e8f4ff; }

        .nav-back-btn {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.5rem 1rem;
          border-radius: 100px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(99,210,255,0.1);
          color: rgba(232,244,255,0.6); font-size: 0.82rem;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
        }
        .nav-back-btn:hover { border-color: rgba(99,210,255,0.3); color: #63d2ff; }

        /* MAIN */
        .up-main {
          position: relative; z-index: 2;
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 3rem 2rem 5rem;
          gap: 2.5rem;
        }

        /* LEFT — form */
        .up-form-col {
          width: 100%; max-width: 480px;
          animation: fadeUp 0.6s ease both;
        }

        .up-page-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 700; letter-spacing: -0.02em;
          margin-bottom: 0.3rem;
        }
        .up-page-sub {
          font-size: 0.85rem; color: rgba(232,244,255,0.38);
          margin-bottom: 2rem; line-height: 1.6;
        }

        /* Card shell */
        .up-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(99,210,255,0.1);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(14px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(99,210,255,0.07);
          position: relative;
        }
        .up-card::before {
          content: '';
          position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,210,255,0.3), transparent);
        }

        /* Fields */
        .field { margin-bottom: 1.1rem; }
        .field-label {
          font-size: 0.76rem;
          color: rgba(232,244,255,0.42);
          letter-spacing: 0.06em; text-transform: uppercase; font-weight: 500;
          margin-bottom: 0.45rem; display: block;
        }
        .input-wrap { position: relative; display: flex; align-items: center; }
        .input-icon {
          position: absolute; left: 0.85rem;
          color: rgba(232,244,255,0.2); pointer-events: none;
          display: flex; align-items: center;
          transition: color 0.25s;
        }
        .input-wrap:focus-within .input-icon { color: #63d2ff; }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(99,210,255,0.1);
          border-radius: 12px;
          padding: 0.8rem 1rem 0.8rem 2.5rem;
          color: #e8f4ff; font-family: 'DM Sans', sans-serif; font-size: 0.93rem;
          outline: none; transition: all 0.25s;
        }
        .field-input::placeholder { color: rgba(232,244,255,0.16); }
        .field-input:focus {
          border-color: rgba(99,210,255,0.42);
          background: rgba(99,210,255,0.05);
          box-shadow: 0 0 0 3px rgba(99,210,255,0.07);
        }

        /* Divider */
        .section-divider {
          display: flex; align-items: center; gap: 0.75rem;
          margin: 1.5rem 0 1.25rem;
          font-size: 0.72rem; color: rgba(232,244,255,0.22);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .section-divider::before, .section-divider::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(99,210,255,0.08);
        }

        /* Dropzone */
        .dropzone {
          border: 1.5px dashed rgba(99,210,255,0.18);
          border-radius: 14px;
          padding: 2.5rem 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(99,210,255,0.02);
          position: relative; overflow: hidden;
        }
        .dropzone::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, rgba(99,210,255,0.04) 0%, transparent 70%);
          opacity: 0; transition: opacity 0.3s;
        }
        .dropzone:hover::before, .dropzone.drag-active::before { opacity: 1; }
        .dropzone:hover, .dropzone.drag-active {
          border-color: rgba(99,210,255,0.45);
          background: rgba(99,210,255,0.04);
          transform: scale(1.005);
        }
        .dropzone.drag-active { border-color: #63d2ff; }

        .dz-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(99,210,255,0.08);
          border: 1px solid rgba(99,210,255,0.14);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem; color: rgba(99,210,255,0.6);
          transition: all 0.3s;
        }
        .dropzone:hover .dz-icon, .dropzone.drag-active .dz-icon {
          background: rgba(99,210,255,0.14); color: #63d2ff;
          transform: translateY(-2px);
        }
        .dz-title { font-size: 0.9rem; color: rgba(232,244,255,0.7); font-weight: 500; margin-bottom: 0.3rem; }
        .dz-sub { font-size: 0.78rem; color: rgba(232,244,255,0.3); line-height: 1.5; }
        .dz-sub span {
          color: #63d2ff; font-weight: 500;
          background: rgba(99,210,255,0.08);
          padding: 0.1rem 0.5rem; border-radius: 4px;
          margin: 0 0.15rem;
        }
        .dz-drag-label {
          font-size: 0.92rem; color: #63d2ff; font-weight: 500;
          animation: pulse 1.2s ease infinite;
        }

        /* File preview card */
        .file-preview {
          background: rgba(99,210,255,0.04);
          border: 1px solid rgba(99,210,255,0.15);
          border-radius: 14px;
          padding: 1rem 1.1rem;
          display: flex; align-items: center; gap: 0.85rem;
          animation: fadeUp 0.3s ease both;
        }
        .fp-icon {
          width: 44px; height: 44px; border-radius: 11px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(99,210,255,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; flex-shrink: 0;
        }
        .fp-info { flex: 1; min-width: 0; }
        .fp-name {
          font-size: 0.87rem; font-weight: 500; color: #e8f4ff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 0.2rem;
        }
        .fp-meta { font-size: 0.74rem; color: rgba(232,244,255,0.35); }
        .fp-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .fp-btn {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(99,210,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: rgba(232,244,255,0.4); cursor: pointer;
          transition: all 0.2s;
        }
        .fp-btn:hover { border-color: rgba(99,210,255,0.3); color: #63d2ff; background: rgba(99,210,255,0.08); }
        .fp-btn.danger:hover { border-color: rgba(239,68,68,0.4); color: #f87171; background: rgba(239,68,68,0.08); }

        /* Submit btn */
        .up-submit {
          width: 100%; padding: 0.9rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #1e5bbf, #00c9a7);
          color: #fff; font-weight: 600; font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
          border: none; cursor: pointer; margin-top: 1.5rem;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          transition: all 0.25s; position: relative; overflow: hidden;
        }
        .up-submit::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(255,255,255,0); transition: background 0.25s;
        }
        .up-submit:hover:not(:disabled)::before { background: rgba(255,255,255,0.1); }
        .up-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(30,91,191,0.4); }
        .up-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* RIGHT — info panel */
        .up-info-col {
          width: 260px; flex-shrink: 0;
          display: none;
          flex-direction: column; gap: 1rem;
          animation: fadeUp 0.6s 0.15s ease both;
        }
        @media (min-width: 960px) { .up-info-col { display: flex; } }

        .info-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(99,210,255,0.08);
          border-radius: 16px; padding: 1.25rem;
          backdrop-filter: blur(12px);
        }
        .info-card-title {
          font-family: 'Syne', sans-serif; font-size: 0.82rem;
          font-weight: 600; letter-spacing: 0.04em;
          text-transform: uppercase; color: rgba(232,244,255,0.45);
          margin-bottom: 1rem;
        }
        .info-step {
          display: flex; gap: 0.75rem; margin-bottom: 0.9rem;
        }
        .info-step:last-child { margin-bottom: 0; }
        .info-step-num {
          width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
          background: rgba(99,210,255,0.08);
          border: 1px solid rgba(99,210,255,0.14);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.68rem; font-weight: 700; font-family: 'Syne', sans-serif;
          color: #63d2ff; margin-top: 1px;
        }
        .info-step-text { font-size: 0.8rem; color: rgba(232,244,255,0.42); line-height: 1.5; }
        .info-step-text strong { color: rgba(232,244,255,0.7); font-weight: 500; display: block; }

        .info-secure {
          display: flex; align-items: flex-start; gap: 0.6rem;
          font-size: 0.78rem; color: rgba(232,244,255,0.35); line-height: 1.5;
        }
        .info-secure svg { color: #00c9a7; flex-shrink: 0; margin-top: 2px; }

        /* UPLOAD OVERLAY */
        .upload-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(5,10,18,0.85);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.3s ease both;
        }
        .upload-modal {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(99,210,255,0.15);
          border-radius: 20px; padding: 2.5rem;
          text-align: center; width: 100%; max-width: 360px;
          animation: scaleIn 0.3s ease both;
          position: relative;
        }
        .upload-modal::before {
          content: '';
          position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,210,255,0.35), transparent);
        }
        .up-anim-icon {
          width: 60px; height: 60px; border-radius: 16px; margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, rgba(30,90,180,0.35), rgba(0,180,150,0.25));
          border: 1px solid rgba(99,210,255,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #63d2ff;
          animation: float 2s ease-in-out infinite;
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .up-modal-title {
          font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700;
          margin-bottom: 0.4rem;
        }
        .up-modal-step {
          font-size: 0.82rem; color: rgba(232,244,255,0.4);
          margin-bottom: 1.5rem; min-height: 1.2em;
        }
        /* Progress bar */
        .progress-track {
          width: 100%; height: 4px; border-radius: 2px;
          background: rgba(255,255,255,0.07); overflow: hidden;
          margin-bottom: 0.6rem;
        }
        .progress-fill {
          height: 100%; border-radius: 2px;
          background: linear-gradient(90deg, #1e5bbf, #00c9a7);
          transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .progress-pct {
          font-size: 0.75rem; color: rgba(232,244,255,0.3);
          font-family: 'Syne', sans-serif; font-weight: 600;
        }

        /* Step indicators */
        .upload-steps {
          display: flex; justify-content: center; gap: 0.5rem; margin-top: 1.5rem;
        }
        .up-step-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.12); transition: all 0.3s;
        }
        .up-step-dot.active {
          background: #63d2ff;
          box-shadow: 0 0 8px rgba(99,210,255,0.5);
          transform: scale(1.3);
        }
        .up-step-dot.done { background: #00c9a7; }

        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

        @media (max-width: 640px) {
          .up-nav { padding: 1rem 1.25rem; }
          .up-main { padding: 2rem 1.25rem 4rem; }
          .up-card { padding: 1.5rem; }
        }
      `}</style>

      <div className="up-root">
        {/* NAV */}
        <nav className="up-nav">
          <div className="up-brand">Snap<span>Share</span></div>
          <button className="nav-back-btn" onClick={() => router.push('/myfiles')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            My Files
          </button>
        </nav>

        <div className="up-main">
          {/* Form column */}
          <div className="up-form-col">
            <h1 className="up-page-title">Share a File</h1>
            <p className="up-page-sub">Upload to AWS S3 and deliver instantly to any email address.</p>

            <div className="up-card">
              {/* Receiver email */}
              <div className="field">
                <label className="field-label" htmlFor="email">Receiver&apos;s Email</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <input className="field-input" type="email" name="email" id="email" placeholder="recipient@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              {/* File name */}
              <div className="field">
                <label className="field-label" htmlFor="filename">File Name</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </span>
                  <input className="field-input" type="text" name="filename" id="filename" placeholder="e.g. Project Proposal" value={fileName} onChange={(e) => setFileName(e.target.value)} />
                </div>
              </div>

              <div className="section-divider">file attachment</div>

              {/* Dropzone / preview */}
              {file ? (
                <div className="file-preview">
                  <div className="fp-icon">{getFileIcon(file.type)}</div>
                  <div className="fp-info">
                    <div className="fp-name">{file.name}</div>
                    <div className="fp-meta">{formatSize(file.size)} · {file.type || 'Unknown type'}</div>
                  </div>
                  <div className="fp-actions">
                    <button className="fp-btn" title="Preview" onClick={viewFile}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                    <button className="fp-btn danger" title="Remove" onClick={removeFile}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`dropzone${isDragActive ? ' drag-active' : ''}`} {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div className="dz-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 26, height: 26 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  {isDragActive ? (
                    <div className="dz-drag-label">Drop it! 🎯</div>
                  ) : (
                    <>
                      <div className="dz-title">Drag & drop your file here</div>
                      <div className="dz-sub">or <span>click to browse</span> from your computer</div>
                    </>
                  )}
                </div>
              )}

              {/* Submit */}
              <button className="up-submit" type="button" onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <><span className="spinner" /> Sending…</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 16, height: 16 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                    Send File
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info panel */}
          <div className="up-info-col">
            <div className="info-card">
              <div className="info-card-title">How it works</div>
              {[
                { title: "Enter details", desc: "Add recipient email and a friendly file name." },
                { title: "Drop your file", desc: "Any format — PDF, image, video, archive." },
                { title: "Secure upload", desc: "File goes to AWS S3 via a signed URL." },
                { title: "Email notify", desc: "Recipient gets a notification via Nodemailer." },
              ].map((s, i) => (
                <div className="info-step" key={i}>
                  <div className="info-step-num">{i + 1}</div>
                  <div className="info-step-text"><strong>{s.title}</strong>{s.desc}</div>
                </div>
              ))}
            </div>

            <div className="info-card">
              <div className="info-card-title">Security</div>
              {[
                "AWS S3 signed URLs — direct upload, zero server relay",
                "JWT-authenticated — only logged-in users can share",
                "Files accessible only via time-limited S3 URLs",
              ].map((t, i) => (
                <div className="info-secure" key={i} style={{ marginBottom: i < 2 ? '0.75rem' : 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 13, height: 13 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upload progress overlay */}
        {uploading && (
          <div className="upload-overlay">
            <div className="upload-modal">
              <div className="up-anim-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 28, height: 28 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div className="up-modal-title">Sending your file</div>
              <div className="up-modal-step">{stepLabels[uploadStep]}</div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <div className="progress-pct">{uploadProgress}%</div>
              <div className="upload-steps">
                {[1, 2, 3].map(n => (
                  <div key={n} className={`up-step-dot${uploadStep === n ? ' active' : uploadStep > n ? ' done' : ''}`} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;