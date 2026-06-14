'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/app/components/AuthGuard';
import Navbar from '@/app/components/Navbar';
import { useAuth } from '@/app/context/AuthContext';
import { Session, Attendance, User } from '../types';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'sessions' | 'users'>('sessions');

  // Session states
  const [newSessionName, setNewSessionName] = useState('');
  const [newMatkulName, setNewMatkulName] = useState('');
  const [assignedGuruId, setAssignedGuruId] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('all');

  // User management form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'guru' | 'user'>('user');
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  useEffect(() => {
    const storedSessions = localStorage.getItem('qr_sessions');
    const storedAttendance = localStorage.getItem('qr_attendance');
    const storedUsers = localStorage.getItem('qr_users');

    // Defer state updates to avoid synchronous cascading renders warning
    setTimeout(() => {
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }
      if (storedAttendance) {
        setAttendance(JSON.parse(storedAttendance));
      }
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    }, 0);
  }, []);

  const teachers = users.filter((u) => u.role === 'guru');

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim() || !newMatkulName.trim()) return;

    const matchedGuru = users.find((u) => u.id === assignedGuruId);

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newSession: Session = {
      id: `SES-${randNum}`,
      name: newSessionName.trim(),
      matkul: newMatkulName.trim(),
      createdAt: new Date().toISOString(),
      guruId: assignedGuruId || undefined,
      guruName: matchedGuru ? matchedGuru.name : undefined,
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem('qr_sessions', JSON.stringify(updatedSessions));
    setNewSessionName('');
    setNewMatkulName('');
    setAssignedGuruId('');
  };

  const handleDeleteSession = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus sesi ini? Semua data riwayat absensi terkait juga akan dihapus.')) {
      const updatedSessions = sessions.filter((s) => s.id !== id);
      setSessions(updatedSessions);
      localStorage.setItem('qr_sessions', JSON.stringify(updatedSessions));

      // Cascade delete attendance logs for this session
      const updatedAttendance = attendance.filter((a) => a.sessionId !== id);
      setAttendance(updatedAttendance);
      localStorage.setItem('qr_attendance', JSON.stringify(updatedAttendance));
    }
  };

  const handleClearHistory = () => {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat absensi?')) {
      setAttendance([]);
      localStorage.setItem('qr_attendance', JSON.stringify([]));
    }
  };

  const handleShowQr = async (session: Session) => {
    setSelectedSession(session);
    try {
      // Generate QR Code with the session ID
      const dataUrl = await QRCode.toDataURL(session.id, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(dataUrl);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Gagal generate QR Code', err);
      alert('Gagal menghasilkan QR Code.');
    }
  };

  const handleDownloadQr = () => {
    if (!selectedSession || !qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR-${selectedSession.name.replace(/\s+/g, '-')}-${selectedSession.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered attendance data
  const filteredAttendance = attendance.filter((item) => {
    const matchesSearch =
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.matkul.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSession =
      selectedSessionFilter === 'all' || item.sessionId === selectedSessionFilter;

    return matchesSearch && matchesSession;
  });

  const handleToggleUserApproval = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('Anda tidak dapat menangguhkan akun Anda sendiri.');
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        return { ...u, approved: u.approved === false ? true : false };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('qr_users', JSON.stringify(updatedUsers));
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini secara permanen?')) {
      const updatedUsers = users.filter((u) => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('qr_users', JSON.stringify(updatedUsers));
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (!newUserName.trim() || !newUserUsername.trim() || !newUserPassword.trim()) {
      setUserError('Harap isi semua kolom data pengguna.');
      return;
    }

    const isDuplicate = users.some(
      (u) => u.username.toLowerCase() === newUserUsername.trim().toLowerCase()
    );

    if (isDuplicate) {
      setUserError('Username sudah digunakan.');
      return;
    }

    const prefix = newUserRole === 'admin' ? 'ADM' : newUserRole === 'guru' ? 'GRU' : 'USR';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `${prefix}${randNum}`;

    const newUser: User = {
      id: newId,
      name: newUserName.trim(),
      username: newUserUsername.trim(),
      password: newUserPassword,
      role: newUserRole,
      approved: true, // Auto approved when created by admin
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('qr_users', JSON.stringify(updatedUsers));

    setNewUserName('');
    setNewUserUsername('');
    setNewUserPassword('');
    setNewUserRole('user');
    setUserSuccess('Pengguna baru berhasil ditambahkan.');
  };

  // Generate and Download PDF Report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Laporan Kehadiran Mahasiswa (AbsenQR)', 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 26);
    doc.text(`Dicetak oleh: ${currentUser?.name || 'Admin'}`, 14, 32);
    
    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 36, 196, 36);

    // Table Headers
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Nama / NIM', 14, 44);
    doc.text('Mata Kuliah / Sesi', 75, 44);
    doc.text('Waktu Absensi', 145, 44);
    
    doc.line(14, 48, 196, 48);
    
    // Table Rows
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    let y = 56;

    filteredAttendance.forEach((item) => {
      // Check page break
      if (y > 280) {
        doc.addPage();
        y = 20;
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text('Nama / NIM', 14, y);
        doc.text('Mata Kuliah / Sesi', 75, y);
        doc.text('Waktu Absensi', 145, y);
        doc.line(14, y + 4, 196, y + 4);
        y += 12;
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
      }

      doc.text(`${item.userName} (${item.userId})`, 14, y);
      doc.text(`${item.matkul} - ${item.sessionName}`, 75, y);
      
      const formattedDate = new Date(item.timestamp).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(formattedDate, 145, y);
      
      y += 8;
    });

    doc.save(`Laporan-Absensi-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col">
        <Navbar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:truncate">
                Dashboard Admin
              </h1>
              <p className="mt-1 text-sm text-zinc-550 dark:text-zinc-400">
                Kelola sesi absensi, assign Guru/Dosen, kelola akun pengguna, dan pantau riwayat kehadiran.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-white dark:bg-zinc-900 overflow-hidden shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Sesi Absensi</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{sessions.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-650 dark:text-purple-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 overflow-hidden shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Absensi Pengguna</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{attendance.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 overflow-hidden shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Pengguna</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{users.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`shrink-0 border-b-2 py-4 px-1 text-sm font-semibold cursor-pointer transition-all ${
                  activeTab === 'sessions'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                }`}
              >
                Sesi & Kehadiran
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`shrink-0 border-b-2 py-4 px-1 text-sm font-semibold cursor-pointer transition-all ${
                  activeTab === 'users'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                }`}
              >
                Kelola Pengguna
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'sessions' ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left side: Buat Sesi & Sesi List */}
              <div className="lg:col-span-1 space-y-8">
                {/* Buat Sesi Baru Form */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Buat Sesi Baru</h2>
                  <form onSubmit={handleCreateSession} className="space-y-4">
                    <div>
                      <label htmlFor="newMatkulName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Nama Mata Kuliah
                      </label>
                      <input
                        id="newMatkulName"
                        type="text"
                        required
                        value={newMatkulName}
                        onChange={(e) => setNewMatkulName(e.target.value)}
                        placeholder="Contoh: Algoritma, Pemrograman Web"
                        className="block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="sessionName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Nama Sesi / Pertemuan
                      </label>
                      <input
                        id="sessionName"
                        type="text"
                        required
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        placeholder="Contoh: Pertemuan 1, UTS, Responsi"
                        className="block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="assignedGuru" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Pilih Guru / Dosen Pengajar
                      </label>
                      <select
                        id="assignedGuru"
                        value={assignedGuruId}
                        onChange={(e) => setAssignedGuruId(e.target.value)}
                        required
                        className="block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                      >
                        <option value="">-- Pilih Guru --</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} (@{t.username})</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full justify-center inline-flex items-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 focus:outline-none transition-all dark:bg-emerald-500 dark:hover:bg-emerald-400 cursor-pointer"
                    >
                      Buat Sesi & Assign
                    </button>
                  </form>
                </div>

                {/* Daftar Sesi */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Sesi Aktif ({sessions.length})</h2>
                  {sessions.length === 0 ? (
                    <p className="text-sm text-zinc-550 dark:text-zinc-400 text-center py-6">Belum ada sesi absensi.</p>
                  ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-[360px] overflow-y-auto pr-1">
                      {sessions.map((session) => (
                        <div key={session.id} className="py-4 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{session.matkul} - {session.name}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">ID: {session.id}</p>
                            {session.guruName && (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">👨‍🏫 Guru: {session.guruName}</p>
                            )}
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => handleShowQr(session)}
                              className="inline-flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
                              title="Tampilkan QR Code"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 20h2M4 4h4v4H4V4zm0 12h4v4H4v-4zm12-12h4v4h-4V4z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="inline-flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                              title="Hapus Sesi"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side: Riwayat Kehadiran */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 md:flex md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Riwayat Kehadiran Mahasiswa</h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Total riwayat tercatat: {filteredAttendance.length}</p>
                    </div>
                    <div className="flex gap-2">
                      {filteredAttendance.length > 0 && (
                        <button
                          onClick={generatePDFReport}
                          className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-500 cursor-pointer"
                        >
                          Cetak Laporan (PDF)
                        </button>
                      )}
                      {attendance.length > 0 && (
                        <button
                          onClick={handleClearHistory}
                          className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-650 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 cursor-pointer"
                        >
                          Hapus Semua
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Cari nama, NIM, mata kuliah..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <select
                        value={selectedSessionFilter}
                        onChange={(e) => setSelectedSessionFilter(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                      >
                        <option value="all">Semua Sesi</option>
                        {sessions.map((s) => (
                          <option key={s.id} value={s.id}>{s.matkul} - {s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="flex-1 overflow-x-auto">
                    {filteredAttendance.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-sm text-zinc-550 dark:text-zinc-400">Tidak ada riwayat absensi.</p>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                        <thead className="bg-zinc-50/30 dark:bg-zinc-950/30">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">Mahasiswa</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">Mata Kuliah / Sesi</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">Waktu</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                          {filteredAttendance.map((item, index) => (
                            <tr key={index} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">{item.userName}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{item.userId}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-zinc-900 dark:text-white">{item.matkul}</span>
                                <span className="block text-xs text-zinc-500 dark:text-zinc-400">{item.sessionName}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                {new Date(item.timestamp).toLocaleString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Kelola Pengguna Tab
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Tambah Pengguna Baru</h2>
                  
                  {userError && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 dark:bg-red-950/20 dark:text-red-400">
                      {userError}
                    </div>
                  )}

                  {userSuccess && (
                    <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-250 p-4 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                      {userSuccess}
                    </div>
                  )}

                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label htmlFor="newUserName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        id="newUserName"
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Contoh: Rian Pratama"
                        className="block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="newUserUsername" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Username
                      </label>
                      <input
                        id="newUserUsername"
                        type="text"
                        required
                        value={newUserUsername}
                        onChange={(e) => setNewUserUsername(e.target.value)}
                        placeholder="Contoh: rianp"
                        className="block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="newUserPassword" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Password
                      </label>
                      <input
                        id="newUserPassword"
                        type="password"
                        required
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Masukkan password"
                        className="block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        Peran Akun
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewUserRole('user')}
                          className={`flex items-center justify-center rounded-xl border py-2 px-1 text-xs font-semibold transition-all cursor-pointer ${
                            newUserRole === 'user'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/20'
                              : 'border-zinc-200 bg-transparent text-zinc-700 dark:border-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          Mhs
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewUserRole('guru')}
                          className={`flex items-center justify-center rounded-xl border py-2 px-1 text-xs font-semibold transition-all cursor-pointer ${
                            newUserRole === 'guru'
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20'
                              : 'border-zinc-200 bg-transparent text-zinc-700 dark:border-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          Guru
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewUserRole('admin')}
                          className={`flex items-center justify-center rounded-xl border py-2 px-1 text-xs font-semibold transition-all cursor-pointer ${
                            newUserRole === 'admin'
                              ? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-950/20'
                              : 'border-zinc-200 bg-transparent text-zinc-700 dark:border-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full justify-center inline-flex items-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 focus:outline-none transition-all dark:bg-emerald-500 cursor-pointer"
                    >
                      Simpan User
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Daftar Pengguna Terdaftar</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-semibold">Total pengguna: {users.length}</p>
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    {users.length === 0 ? (
                      <p className="text-sm text-zinc-500 text-center py-12">Belum ada pengguna.</p>
                    ) : (
                      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                        <thead className="bg-zinc-50/30 dark:bg-zinc-950/30">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Profil Pengguna</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Peran</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                          {users.map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">{item.name}</div>
                                <div className="text-xs text-zinc-500">@{item.username} • ID: {item.id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                    : item.role === 'guru'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}>
                                  {item.role === 'admin' ? 'Admin' : item.role === 'guru' ? 'Guru' : 'Mhs'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.approved !== false
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20'
                                }`}>
                                  {item.approved !== false ? 'Disetujui' : 'Menunggu Approval'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                <div className="flex justify-center gap-2">
                                  {item.id !== currentUser?.id && (
                                    <>
                                      <button
                                        onClick={() => handleToggleUserApproval(item.id)}
                                        className={`inline-flex items-center justify-center rounded-xl px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
                                          item.approved !== false
                                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                        }`}
                                      >
                                        {item.approved !== false ? 'Suspend' : 'Approve'}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteUser(item.id)}
                                        className="inline-flex items-center justify-center rounded-xl bg-red-50 text-red-655 px-2.5 py-1.5 text-xs font-semibold hover:bg-red-100 cursor-pointer"
                                      >
                                        Hapus
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* QR CODE MODAL */}
        {isModalOpen && selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl flex flex-col items-center">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-500 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white text-center mb-1">{selectedSession.matkul}</h3>
              <p className="text-sm font-medium text-zinc-550 dark:text-zinc-400 text-center mb-1">{selectedSession.name}</p>
              <p className="text-xs text-zinc-400 font-mono text-center mb-6">ID Sesi: {selectedSession.id}</p>
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-zinc-100 flex items-center justify-center mb-6">
                {qrCodeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrCodeUrl} alt="Session QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent font-semibold"></div>
                  </div>
                )}
              </div>
              <div className="w-full flex gap-3">
                <button onClick={handleDownloadQr} className="flex-1 justify-center inline-flex items-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 cursor-pointer">
                  Unduh QR
                </button>
                <button onClick={() => setIsModalOpen(false)} className="flex-1 justify-center inline-flex items-center rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
