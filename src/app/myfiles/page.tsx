"use client"
import React, { useEffect, useState } from 'react'
import { useAppSelector } from '@/redux/store';
import { useRouter } from 'next/navigation';

interface File {
  createdAt: string;
  filename: string;
  fileurl: string;
  fileType: string | null;
  receiveremail: string;
  senderemail: string;
  sharedAt: string;
  updatedAt: string;
  _id: string;
}

const Page = () => {
  const auth = useAppSelector((state) => state.authReducer);
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const router = useRouter();

  const getAllFiles = async () => {
    setLoading(true);
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/file/getfiles", {
      method: "GET", credentials: "include",
    });
    const resjson = await res.json();
    if (resjson.ok) setAllFiles(resjson.data);
    setLoading(false);
  };

  const getImageUrls3 = async (key: string): Promise<string | null> => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/file/gets3urlbykey/" + key, {
      method: "GET", credentials: "include",
    });
    const data = await res.json();
    return data.ok ? data.data.signedUrl : null;
  };

  useEffect(() => { getAllFiles(); }, []);
  useEffect(() => {
    if (auth.isAuth === false) {
      router.push("/login");
    }
  }, [auth.isAuth]);

  const getFileIcon = (type: string | null) => {
    if (!type) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📕';
    if (type.includes('video')) return '🎬';
    if (type.includes('audio')) return '🎵';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return '📊';
    return '📄';
  };

  const getTypeBadgeColor = (type: string | null) => {
    if (!type) return { bg: 'rgba(255,255,255,0.06)', color: 'rgba(232,244,255,0.4)' };
    if (type.includes('image')) return { bg: 'rgba(99,210,255,0.1)', color: '#63d2ff' };
    if (type.includes('pdf')) return { bg: 'rgba(239,68,68,0.12)', color: '#f87171' };
    if (type.includes('video')) return { bg: 'rgba(168,85,247,0.12)', color: '#c084fc' };
    if (type.includes('audio')) return { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24' };
    if (type.includes('zip') || type.includes('rar')) return { bg: 'rgba(249,115,22,0.1)', color: '#fb923c' };
    return { bg: 'rgba(0,201,167,0.1)', color: '#00c9a7' };
  };

  const uniqueTypes = ['all', ...Array.from(new Set(allFiles.map(f => f.fileType?.split('/')[0] ?? 'unknown')))];

  const filtered = allFiles
    .sort((a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime())
    .filter(f => {
      const matchSearch =
        f.filename.toLowerCase().includes(search.toLowerCase()) ||
        f.senderemail.toLowerCase().includes(search.toLowerCase()) ||
        f.receiveremail.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || (f.fileType ?? '').includes(filterType);
      return matchSearch && matchType;
    });

  const isSentByMe = (file: File) => file.senderemail === auth.user?.email;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .mf-root {
          min-height: 100vh;
          background: #050a12;
          font-family: 'DM Sans', sans-serif;
          color: #e8f4ff;
          position: relative;
          overflow-x: hidden;
        }
        .mf-root::before {
          content: '';
          position: fixed; top: -20%; left: -10%;
          width: 55vw; height: 55vw;
          background: radial-gradient(circle, rgba(20,70,160,0.18) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
        }
        .mf-root::after {
          content: '';
          position: fixed; bottom: -15%; right: -10%;
          width: 45vw; height: 45vw;
          background: radial-gradient(circle, rgba(0,180,150,0.1) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
        }

        /* NAV */
        .mf-nav {
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 2.5rem;
          background: rgba(5,10,18,0.75);
          border-bottom: 1px solid rgba(99,210,255,0.07);
          backdrop-filter: blur(16px);
          animation: fadeDown 0.6s ease both;
        }
        .mf-brand {
          font-family: 'Syne', sans-serif;
          font-size: 1.3rem; font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #63d2ff, #00c9a7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .mf-brand span { color: #e8f4ff; -webkit-text-fill-color: #e8f4ff; }

        .mf-nav-right { display: flex; align-items: center; gap: 0.75rem; }
        .nav-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #1e6bbf, #00c9a7);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700; color: #fff;
          border: 1.5px solid rgba(99,210,255,0.2);
          cursor: pointer;
        }
        .nav-upload-btn {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.5rem 1.1rem;
          border-radius: 100px;
          background: linear-gradient(135deg, #1e5bbf, #00c9a7);
          color: #fff; font-size: 0.82rem; font-weight: 600;
          border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.25s;
        }
        .nav-upload-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(30,91,191,0.35); }

        /* MAIN CONTENT */
        .mf-main {
          position: relative; z-index: 2;
          max-width: 1200px; margin: 0 auto;
          padding: 2.5rem 2rem 4rem;
        }

        /* Header */
        .mf-header {
          margin-bottom: 2rem;
          animation: fadeUp 0.6s ease both;
        }
        .mf-header-top {
          display: flex; align-items: flex-end;
          justify-content: space-between; flex-wrap: wrap; gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .mf-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          font-weight: 700; letter-spacing: -0.02em;
        }
        .mf-title-sub {
          font-size: 0.85rem; color: rgba(232,244,255,0.4);
          margin-top: 0.25rem; font-weight: 300;
        }

        /* Stats row */
        .mf-stats {
          display: flex; gap: 1rem; flex-wrap: wrap;
          margin-bottom: 1.75rem;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .stat-pill {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.55rem 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(99,210,255,0.08);
          border-radius: 100px;
          font-size: 0.8rem; color: rgba(232,244,255,0.5);
        }
        .stat-pill strong {
          font-family: 'Syne', sans-serif;
          color: #e8f4ff; font-size: 0.85rem; font-weight: 600;
        }

        /* Search + filter row */
        .mf-controls {
          display: flex; gap: 0.75rem; flex-wrap: wrap;
          animation: fadeUp 0.6s 0.15s ease both;
        }
        .mf-search-wrap {
          flex: 1; min-width: 220px;
          position: relative; display: flex; align-items: center;
        }
        .mf-search-icon {
          position: absolute; left: 0.85rem;
          color: rgba(232,244,255,0.25); pointer-events: none;
          display: flex; align-items: center;
        }
        .mf-search {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(99,210,255,0.1);
          border-radius: 12px;
          padding: 0.7rem 1rem 0.7rem 2.5rem;
          color: #e8f4ff;
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
          outline: none; transition: all 0.25s;
        }
        .mf-search::placeholder { color: rgba(232,244,255,0.18); }
        .mf-search:focus {
          border-color: rgba(99,210,255,0.4);
          background: rgba(99,210,255,0.04);
          box-shadow: 0 0 0 3px rgba(99,210,255,0.07);
        }

        .mf-filter-btn {
          padding: 0.7rem 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(99,210,255,0.1);
          border-radius: 12px;
          color: rgba(232,244,255,0.5); font-size: 0.82rem;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
          white-space: nowrap;
        }
        .mf-filter-btn:hover, .mf-filter-btn.active {
          border-color: rgba(99,210,255,0.3);
          color: #63d2ff;
          background: rgba(99,210,255,0.06);
        }
        .mf-filter-btn.active {
          background: rgba(99,210,255,0.1);
        }

        /* File grid */
        .mf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        /* File card */
        .file-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(99,210,255,0.08);
          border-radius: 16px;
          padding: 1.25rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          cursor: default;
          animation: fadeUp 0.4s ease both;
        }
        .file-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,210,255,0.2), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .file-card:hover::before { opacity: 1; }
        .file-card:hover {
          border-color: rgba(99,210,255,0.2);
          background: rgba(99,210,255,0.04);
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.3);
        }

        /* Card header */
        .fc-header {
          display: flex; align-items: flex-start; gap: 0.85rem;
          margin-bottom: 1rem;
        }
        .fc-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(99,210,255,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; flex-shrink: 0;
        }
        .fc-info { flex: 1; min-width: 0; }
        .fc-name {
          font-weight: 500; font-size: 0.88rem;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 0.3rem; color: #e8f4ff;
        }
        .fc-type-badge {
          display: inline-block;
          font-size: 0.68rem; font-weight: 500;
          padding: 0.18rem 0.6rem; border-radius: 100px;
          letter-spacing: 0.04em; text-transform: uppercase;
        }

        /* Direction badge */
        .fc-direction {
          font-size: 0.68rem;
          padding: 0.2rem 0.65rem; border-radius: 100px;
          font-weight: 500; letter-spacing: 0.03em;
          flex-shrink: 0; margin-top: 2px;
        }
        .fc-direction.sent {
          background: rgba(99,210,255,0.08); color: #63d2ff;
          border: 1px solid rgba(99,210,255,0.2);
        }
        .fc-direction.received {
          background: rgba(0,201,167,0.08); color: #00c9a7;
          border: 1px solid rgba(0,201,167,0.2);
        }

        /* Card meta rows */
        .fc-meta { display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 1rem; }
        .fc-meta-row {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.78rem; color: rgba(232,244,255,0.38);
        }
        .fc-meta-row svg { flex-shrink: 0; color: rgba(99,210,255,0.4); }
        .fc-meta-val {
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          color: rgba(232,244,255,0.6);
        }

        /* Card footer */
        .fc-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 0.85rem;
          border-top: 1px solid rgba(99,210,255,0.07);
        }
        .fc-date {
          font-size: 0.73rem; color: rgba(232,244,255,0.28);
          display: flex; align-items: center; gap: 0.35rem;
        }
        .fc-view-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          background: rgba(99,210,255,0.08);
          border: 1px solid rgba(99,210,255,0.15);
          color: #63d2ff; font-size: 0.78rem; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
        }
        .fc-view-btn:hover {
          background: rgba(99,210,255,0.16);
          color: #e8f4ff;
          transform: scale(1.03);
        }
        .fc-view-btn.loading { opacity: 0.6; cursor: not-allowed; }

        /* Spinner inline */
        .btn-spinner {
          width: 12px; height: 12px;
          border: 1.5px solid rgba(99,210,255,0.3);
          border-top-color: #63d2ff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Empty state */
        .mf-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 5rem 2rem; text-align: center;
          animation: fadeUp 0.5s ease both;
        }
        .empty-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: rgba(99,210,255,0.05);
          border: 1px solid rgba(99,210,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: rgba(99,210,255,0.3); margin-bottom: 1.25rem;
          font-size: 2rem;
        }
        .empty-title {
          font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 600;
          margin-bottom: 0.5rem; color: rgba(232,244,255,0.6);
        }
        .empty-sub { font-size: 0.83rem; color: rgba(232,244,255,0.28); line-height: 1.6; }

        /* Skeleton loader */
        .skeleton-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(99,210,255,0.06);
          border-radius: 16px; padding: 1.25rem;
          animation: pulse 1.8s ease infinite;
        }
        .skel { background: rgba(255,255,255,0.05); border-radius: 6px; }
        .skel-icon { width: 44px; height: 44px; border-radius: 12px; }
        .skel-line { height: 10px; margin-bottom: 6px; }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.45; }
        }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }

        /* Stagger cards */
        .file-card:nth-child(1) { animation-delay: 0.05s; }
        .file-card:nth-child(2) { animation-delay: 0.1s; }
        .file-card:nth-child(3) { animation-delay: 0.15s; }
        .file-card:nth-child(4) { animation-delay: 0.2s; }
        .file-card:nth-child(5) { animation-delay: 0.25s; }
        .file-card:nth-child(6) { animation-delay: 0.3s; }

        @media (max-width: 640px) {
          .mf-nav { padding: 1rem 1.25rem; }
          .mf-main { padding: 1.75rem 1.25rem 3rem; }
          .mf-header-top { flex-direction: column; align-items: flex-start; }
          .mf-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="mf-root">
        {/* NAV */}
        <nav className="mf-nav">
          <div className="mf-brand">Snap<span>Share</span></div>
          <div className="mf-nav-right">
            <button className="nav-upload-btn" onClick={() => router.push('/share')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 14, height: 14 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              Upload
            </button>
            <div className="nav-avatar">
              {auth.user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
          </div>
        </nav>

        <main className="mf-main">
          {/* Header */}
          <div className="mf-header">
            <div className="mf-header-top">
              <div>
                <h1 className="mf-title">My Files</h1>
                <p className="mf-title-sub">All your uploaded and received files in one place</p>
              </div>
            </div>

            {/* Stats */}
            {!loading && (
              <div className="mf-stats">
                {[
                  { label: 'Total Files', value: allFiles.length },
                  { label: 'Sent', value: allFiles.filter(f => f.senderemail === auth.user?.email).length },
                  { label: 'Received', value: allFiles.filter(f => f.receiveremail === auth.user?.email).length },
                ].map((s, i) => (
                  <div className="stat-pill" key={i}>
                    <strong>{s.value}</strong> {s.label}
                  </div>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="mf-controls">
              <div className="mf-search-wrap">
                <span className="mf-search-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </span>
                <input
                  className="mf-search"
                  type="text"
                  placeholder="Search by filename or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {uniqueTypes.slice(0, 5).map(type => (
                <button
                  key={type}
                  className={`mf-filter-btn${filterType === type ? ' active' : ''}`}
                  onClick={() => setFilterType(type)}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="mf-grid">
            {loading ? (
              // Skeleton loaders
              Array.from({ length: 6 }).map((_, i) => (
                <div className="skeleton-card" key={i}>
                  <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1rem' }}>
                    <div className="skel skel-icon" />
                    <div style={{ flex: 1 }}>
                      <div className="skel skel-line" style={{ width: '70%' }} />
                      <div className="skel skel-line" style={{ width: '40%' }} />
                    </div>
                  </div>
                  <div className="skel skel-line" style={{ width: '90%' }} />
                  <div className="skel skel-line" style={{ width: '60%' }} />
                  <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(99,210,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skel skel-line" style={{ width: '35%' }} />
                    <div className="skel skel-line" style={{ width: '22%', borderRadius: 8 }} />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="mf-empty">
                <div className="empty-icon">
                  {search ? '🔍' : '📂'}
                </div>
                <div className="empty-title">{search ? 'No results found' : 'No files yet'}</div>
                <div className="empty-sub">
                  {search
                    ? `No files match "${search}". Try a different search term.`
                    : 'Files you upload or receive will appear here.'}
                </div>
              </div>
            ) : (
              filtered.map((file) => {
                const badgeColor = getTypeBadgeColor(file.fileType);
                const sent = isSentByMe(file);
                return (
                  <div className="file-card" key={file._id}>
                    <div className="fc-header">
                      <div className="fc-icon">{getFileIcon(file.fileType)}</div>
                      <div className="fc-info">
                        <div className="fc-name" title={file.filename}>{file.filename}</div>
                        <span
                          className="fc-type-badge"
                          style={{ background: badgeColor.bg, color: badgeColor.color }}
                        >
                          {file.fileType ?? 'Unknown'}
                        </span>
                      </div>
                      <span className={`fc-direction ${sent ? 'sent' : 'received'}`}>
                        {sent ? '↑ Sent' : '↓ Received'}
                      </span>
                    </div>

                    <div className="fc-meta">
                      <div className="fc-meta-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 13, height: 13 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                        <span style={{ color: 'rgba(232,244,255,0.28)', marginRight: 3 }}>From</span>
                        <span className="fc-meta-val">{file.senderemail}</span>
                      </div>
                      <div className="fc-meta-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 13, height: 13 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        <span style={{ color: 'rgba(232,244,255,0.28)', marginRight: 3 }}>To</span>
                        <span className="fc-meta-val">{file.receiveremail}</span>
                      </div>
                    </div>

                    <div className="fc-footer">
                      <div className="fc-date">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 11, height: 11 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {new Date(file.sharedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <button
                        className={`fc-view-btn${viewingId === file._id ? ' loading' : ''}`}
                        disabled={viewingId === file._id}
                        onClick={async () => {
                          setViewingId(file._id);
                          const s3Url = await getImageUrls3(file.fileurl);
                          if (s3Url) window.open(s3Url, "_blank");
                          setViewingId(null);
                        }}
                      >
                        {viewingId === file._id ? (
                          <><span className="btn-spinner" /> Opening…</>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            View File
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Page;