'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/app/components/AuthGuard';
import Navbar from '@/app/components/Navbar';
import { useAuth } from '@/app/context/AuthContext';
import { Session, Attendance } from '../types';
import type { Html5Qrcode } from 'html5-qrcode';

export default function UserPage() {
  const { user } = useAuth();
  const [personalHistory, setPersonalHistory] = useState<Attendance[]>([]);
  const [scannerActive, setScannerActive] = useState(false);
  const [manualSessionId, setManualSessionId] = useState('');
  
  // Status feedback
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Load history logs safely avoiding synchronous rendering path state changes
  useEffect(() => {
    if (!user) return;
    
    const storedAttendance = localStorage.getItem('qr_attendance');
    if (storedAttendance) {
      const allAttendance: Attendance[] = JSON.parse(storedAttendance);
      const userLogs = allAttendance.filter((a) => a.userId === user.id);
      // Defer state updates to avoid synchronous cascading renders warning
      setTimeout(() => {
        setPersonalHistory(userLogs);
      }, 0);
    }
  }, [user]);

  // Handle check-in logic wrapped in useCallback to maintain a stable reference
  const handleCheckIn = useCallback((sessionId: string) => {
    if (!user) return;

    const cleanSessionId = sessionId.trim();
    if (!cleanSessionId) return;

    // Load sessions to validate existence
    const storedSessions = localStorage.getItem('qr_sessions');
    const sessionsList: Session[] = storedSessions ? JSON.parse(storedSessions) : [];
    
    const session = sessionsList.find((s) => s.id === cleanSessionId);
    if (!session) {
      setStatus({
        success: false,
        message: `Sesi absensi dengan kode "${cleanSessionId}" tidak ditemukan atau tidak aktif.`,
      });
      return;
    }

    // Load overall attendance to check duplicates
    const storedAttendance = localStorage.getItem('qr_attendance');
    const attendanceList: Attendance[] = storedAttendance ? JSON.parse(storedAttendance) : [];

    const isAlreadyCheckedIn = attendanceList.some(
      (a) => a.userId === user.id && a.sessionId === cleanSessionId
    );

    if (isAlreadyCheckedIn) {
      setStatus({
        success: false,
        message: `Anda sudah melakukan absensi untuk sesi "${session.name}" sebelumnya.`,
      });
      return;
    }

    // Record attendance
    const newRecord: Attendance = {
      userId: user.id,
      userName: user.name,
      sessionId: session.id,
      sessionName: session.name,
      matkul: session.matkul || 'Mata Kuliah',
      timestamp: new Date().toISOString(),
    };

    const updatedAttendance = [newRecord, ...attendanceList];
    localStorage.setItem('qr_attendance', JSON.stringify(updatedAttendance));
    
    // Update local user logs
    setPersonalHistory((prev) => [newRecord, ...prev]);

    setStatus({
      success: true,
      message: `Absensi berhasil dicatat untuk sesi "${session.name}".`,
    });

    // Close scanner & clear form
    setScannerActive(false);
    setManualSessionId('');
  }, [user]);

  // HTML5 QR Scanner Effect - declared after dependencies are defined
  useEffect(() => {
    if (!scannerActive) return;

    let qrScanner: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        qrScanner = new Html5Qrcode('qr-reader');
        
        await qrScanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            handleCheckIn(decodedText);
          },
          () => {
            // Silence frame scan failures
          }
        );
      } catch {
        setStatus({
          success: false,
          message: 'Gagal mengaktifkan kamera. Pastikan izin kamera telah diberikan.',
        });
        setScannerActive(false);
      }
    };

    startScanner();

    return () => {
      if (qrScanner) {
        if (qrScanner.isScanning) {
          qrScanner.stop().catch((e: unknown) => console.error('Error stopping scanner:', e));
        }
      }
    };
  }, [scannerActive, handleCheckIn]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckIn(manualSessionId);
  };

  return (
    <AuthGuard allowedRoles={['user']}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Menu Absensi
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Pindai QR Code sesi absensi kelas atau kegiatan Anda secara langsung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Column: QR Scanner & Manual Input */}
            <div className="space-y-6">
              {/* Status Banner */}
              {status && (
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    status.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
                      : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {status.success ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="text-sm font-medium">{status.message}</div>
                  <button
                    onClick={() => setStatus(null)}
                    className="ml-auto text-current opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* QR Code Scan Panel */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col items-center">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Pindai QR Code</h2>
                
                {scannerActive ? (
                  <div className="w-full">
                    {/* Scanner element */}
                    <div
                      id="qr-reader"
                      className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-black"
                      style={{ width: '100%', maxWidth: '350px', margin: '0 auto' }}
                    ></div>
                    <button
                      onClick={() => setScannerActive(false)}
                      className="mt-4 w-full py-2.5 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-sm font-semibold text-zinc-700 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      Batal Scan
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 20h2M4 4h4v4H4V4zm0 12h4v4H4v-4zm12-12h4v4h-4V4z" />
                      </svg>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs">
                      Gunakan kamera perangkat untuk memindai QR Code absensi secara instan.
                    </p>
                    <button
                      onClick={() => setScannerActive(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-505 py-3 px-6 text-sm font-semibold text-white shadow-md transition-all dark:bg-emerald-500 dark:hover:bg-emerald-400 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Mulai Kamera
                    </button>
                  </div>
                )}
              </div>

              {/* Fallback Manual Input */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 uppercase tracking-wider">Input Kode Manual (Alternatif)</h3>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={manualSessionId}
                    onChange={(e) => setManualSessionId(e.target.value)}
                    placeholder="Contoh: SES-1234"
                    className="flex-1 rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-zinc-900 text-white py-2 px-4 text-sm font-semibold hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    Kirim
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Personal Attendance History */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Riwayat Kehadiran Saya</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Daftar kehadiran yang berhasil dicatat oleh perangkat Anda.</p>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {personalHistory.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-12">Belum ada riwayat kehadiran yang tercatat.</p>
                ) : (
                  <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead className="bg-zinc-50/50 dark:bg-zinc-950/20">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Kegiatan / Sesi</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tanggal & Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                      {personalHistory.map((item, index) => (
                        <tr key={index} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-zinc-900 dark:text-white">{item.matkul || 'Mata Kuliah'}</div>
                            <div className="text-xs text-zinc-550 dark:text-zinc-400">{item.sessionName}</div>
                            <div className="text-xs text-zinc-400 font-mono mt-0.5">{item.sessionId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                            {new Date(item.timestamp).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
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
        </main>
      </div>
    </AuthGuard>
  );
}
