'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/app/components/templates/DashboardLayout';
import { useAuth } from '@/app/context/AuthContext';
import { Session, Attendance } from '../types';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Button } from '@/app/components/atoms/Button';
import { Input } from '@/app/components/atoms/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/atoms/Card';
import { Modal } from '@/app/components/molecules/Modal';
import { StatCard } from '@/app/components/molecules/StatCard';

export default function GuruPage() {
  const { user: currentUser } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('all');

  useEffect(() => {
    const storedSessions = localStorage.getItem('qr_sessions');
    const storedAttendance = localStorage.getItem('qr_attendance');

    // Defer state updates to avoid synchronous cascading renders warning
    setTimeout(() => {
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }
      if (storedAttendance) {
        setAttendance(JSON.parse(storedAttendance));
      }
    }, 0);
  }, []);

  // Filter sessions assigned to this Guru/Teacher
  const mySessions = sessions.filter((s) => s.guruId === currentUser?.id);
  const mySessionIds = mySessions.map((s) => s.id);

  // Filter attendance logs matching Guru/Teacher sessions
  const myAttendance = attendance.filter((a) => mySessionIds.includes(a.sessionId));

  const handleShowQr = async (session: Session) => {
    setSelectedSession(session);
    try {
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

  // Filtered attendance data for UI list
  const filteredAttendance = myAttendance.filter((item) => {
    const matchesSearch =
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.matkul.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSession =
      selectedSessionFilter === 'all' || item.sessionId === selectedSessionFilter;

    return matchesSearch && matchesSession;
  });

  // Generate and Download PDF Report specifically for this Guru
  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Laporan Kehadiran Mahasiswa (Kelas Dosen/Guru)', 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 26);
    doc.text(`Guru/Dosen: ${currentUser?.name || 'Pengajar'}`, 14, 32);
    
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

    doc.save(`Laporan-Absensi-Guru-${currentUser?.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <DashboardLayout 
      allowedRoles={['guru']}
      title="Dashboard Guru / Dosen"
      description={`Selamat datang kembali, ${currentUser?.name}. Tampilkan QR Code pertemuan dan pantau kehadiran mahasiswa Anda.`}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 mb-8">
        <StatCard
          title="Mata Kuliah Diampu"
          value={mySessions.length}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconTextColor="text-blue-600 dark:text-blue-400"
        />
        
        <StatCard
          title="Total Kehadiran Mahasiswa"
          value={myAttendance.length}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left side: Daftar Sesi */}
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Kelas & Sesi Saya ({mySessions.length})</h2>
              {mySessions.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-6">Belum ada sesi mengampu yang ditugaskan.</p>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-[400px] overflow-y-auto pr-1">
                  {mySessions.map((session) => (
                    <div key={session.id} className="py-4 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{session.matkul}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{session.name}</p>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">ID: {session.id}</p>
                      </div>
                      <button
                        onClick={() => handleShowQr(session)}
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-2.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
                        title="Tampilkan QR Code Absensi"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 20h2M4 4h4v4H4V4zm0 12h4v4H4v-4zm12-12h4v4h-4V4z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side: Riwayat Kehadiran */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 md:flex md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Daftar Hadir Mahasiswa</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total riwayat terdeteksi: {filteredAttendance.length}</p>
              </div>
              {filteredAttendance.length > 0 && (
                <Button onClick={generatePDFReport} className="mt-2 md:mt-0">
                  Cetak Laporan PDF
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  type="text"
                  placeholder="Cari mahasiswa, NIM, matkul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <select
                  value={selectedSessionFilter}
                  onChange={(e) => setSelectedSessionFilter(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3.5 text-sm text-zinc-900 shadow-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                >
                  <option value="all">Semua Sesi Mengajar</option>
                  {mySessions.map((s) => (
                    <option key={s.id} value={s.id}>{s.matkul} - {s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto">
              {filteredAttendance.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Tidak ada mahasiswa absen untuk filter ini.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                  <thead className="bg-zinc-50/30 dark:bg-zinc-950/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Mahasiswa</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Mata Kuliah / Sesi</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Waktu Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredAttendance.map((item, index) => (
                      <tr key={index} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-zinc-900 dark:text-white">{item.userName}</div>
                          <div className="text-xs text-zinc-500 font-mono">{item.userId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-zinc-900 dark:text-white">{item.matkul}</span>
                          <span className="block text-xs text-zinc-500">{item.sessionName}</span>
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
          </Card>
        </div>
      </div>

      {/* QR CODE MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedSession && (
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white text-center mb-1">{selectedSession.matkul}</h3>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 text-center mb-1">{selectedSession.name}</p>
            <p className="text-xs text-zinc-400 font-mono text-center mb-6">Tunjukkan QR ini ke Mahasiswa</p>
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
              <Button onClick={handleDownloadQr} className="flex-1">
                Unduh QR
              </Button>
              <Button onClick={() => setIsModalOpen(false)} variant="secondary" className="flex-1">
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
