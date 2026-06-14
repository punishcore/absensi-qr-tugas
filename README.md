# Dokumentasi Fitur Absensi QR

## Deskripsi Fitur

Fitur Absensi QR merupakan sistem pencatatan kehadiran yang memanfaatkan QR Code sebagai media absensi. Sistem terdiri dari tiga peran utama: **Admin**, **Guru (Dosen/Pengajar)**, dan **Mahasiswa (User)**.

Admin dapat membuat sesi absensi dan mata kuliah lalu mengalokasikannya ke Guru terkait. Guru dapat memproyeksikan QR Code kepada mahasiswa agar mahasiswa memindai kode tersebut dan mencatatkan kehadirannya. Laporan kehadiran mahasiswa juga dapat diunduh langsung ke dalam berkas PDF.

Sistem dibangun menggunakan Next.js sebagai framework frontend dan menggunakan Local Storage sebagai media penyimpanan data sementara tanpa memerlukan database backend.

---

# Tujuan

* Mempermudah proses absensi dengan QR Code secara instan.
* Menyediakan hak akses dosen/guru untuk mengontrol penayangan QR Code secara terpisah.
* Mengurangi penyalahgunaan pembuatan akun dengan membatasi pendaftaran mandiri (hanya untuk Mahasiswa).
* Menyediakan fitur pembuatan laporan kehadiran siap cetak dalam format dokumen PDF.
* Menyediakan riwayat absensi secara langsung pada perangkat mahasiswa.

---

# Teknologi yang Digunakan

* **Framework**: Next.js 16 (App Router) & React 19
* **Library QR Code Generator (Offline)**: `qrcode`
* **Library QR Scanner**: `html5-qrcode`
* **Library PDF Exporter (Client-side)**: `jspdf`

---

# Aktor & Hak Akses Sistem

## 1. Admin (Administrator)
* Login ke sistem.
* Mengelola Pengguna (Menyetujui pendaftaran baru mahasiswa, menangguhkan/suspend akses akun, menghapus akun).
* Mendaftarkan akun Admin baru atau Guru baru secara langsung (otomatis berstatus disetujui/aktif).
* Membuat sesi absensi baru beserta nama mata kuliah dan mengalokasikannya ke Guru/Dosen tertentu.
* Melihat riwayat seluruh absensi mahasiswa, melakukan pencarian/filter sesi, dan mengunduh Laporan Kehadiran Gabungan (PDF).
* Menghapus seluruh riwayat data kehadiran.

## 2. Guru / Dosen (Pengajar)
* Login ke sistem.
* Melihat daftar sesi/mata kuliah yang ditugaskan kepada dirinya.
* Menampilkan QR Code sesi terpilih secara popup agar mahasiswa dapat melakukan scan di kelas.
* Mengunduh file gambar QR Code sesi.
* Memantau daftar riwayat kehadiran mahasiswa khusus pada kelas/mata kuliah yang diajar.
* Mengunduh Laporan Kehadiran Kelas Pengajar dalam format PDF.

## 3. Mahasiswa (User/Pengguna)
* Mendaftar akun baru secara mandiri (status awal: Menunggu Persetujuan Admin).
* Login ke sistem setelah disetujui oleh Admin.
* Melakukan scan QR Code menggunakan kamera perangkat (melalui `html5-qrcode`).
* Memasukkan kode sesi secara manual jika kamera perangkat bermasalah.
* Melihat riwayat kehadiran pribadi yang sukses dicatat.

---

# Akun Demo Bawaan (Auto-Seeded)

Jika sistem mendeteksi Local Storage kosong pada kunjungan pertama, data pengguna akan diisi otomatis dengan akun default berikut:
1. **Admin**: Username `admin` / Password `admin` (Role: Admin)
2. **Guru**: Username `guru` / Password `guru` (Role: Guru)
3. **Mahasiswa**: Username `user` / Password `user` (Role: Mahasiswa / User)

---

# Alur Sistem

## 1. Alur Registrasi & Approval Mahasiswa
1. Mahasiswa membuka halaman pendaftaran di `/register`. Halaman pendaftaran mandiri ini hanya diperuntukkan bagi mahasiswa.
2. Akun mahasiswa baru didaftarkan dengan status `approved: false` (belum disetujui).
3. Admin masuk ke Dashboard, membuka tab **Kelola Pengguna**, lalu mengklik tombol **Approve** untuk menyetujui mahasiswa bersangkutan.
4. Mahasiswa baru dapat melakukan login setelah statusnya diubah menjadi **Disetujui**.

## 2. Alur Pembuatan Kelas & Penugasan Guru
1. Admin membuat sesi baru dengan mengisi **Nama Mata Kuliah**, **Pertemuan/Sesi**, dan memilih **Guru** yang mengajar dari dropdown list.
2. Sesi absensi tersimpan dengan mencatat ID dan nama Guru yang ditunjuk.
3. Guru masuk ke dashboard `/guru`, lalu sesi mata kuliah tersebut langsung muncul di daftar kelas yang diampu.

## 3. Penayangan QR Code & Scan Absensi
1. Guru mengklik ikon QR Code pada sesi di dashboard miliknya.
2. QR Code ditampilkan di layar kelas atau diunduh untuk dibagikan.
3. Mahasiswa membuka rute `/user`, mengaktifkan kamera scanner, lalu mengarahkan ke QR Code Guru.
4. Sistem melakukan validasi (apakah sesi valid, apakah mahasiswa sudah pernah absen di sesi tersebut) dan mencatat kehadiran.

---

# Penyimpanan Data (Local Storage)

## 1. Data Pengguna (`qr_users`)
* `id` (NIM/NIP otomatis dengan awalan ADM, GRU, atau USR)
* `name` (Nama Lengkap)
* `username`
* `password`
* `role` ('admin' | 'guru' | 'user')
* `approved` (boolean)

## 2. Data Sesi Absensi (`qr_sessions`)
* `id` (SES-XXXX)
* `name` (Nama Sesi / Pertemuan)
* `matkul` (Nama Mata Kuliah)
* `createdAt` (Waktu Pembuatan)
* `guruId` (ID Guru pengajar)
* `guruName` (Nama Guru pengajar)

## 3. Data Kehadiran (`qr_attendance`)
* `userId` (ID Mahasiswa)
* `userName` (Nama Mahasiswa)
* `sessionId` (ID Sesi)
* `sessionName` (Nama Sesi)
* `matkul` (Nama Mata Kuliah)
* `timestamp` (Waktu Absen)

---

# Fitur Cetak PDF (jsPDF)

Sistem menyertakan tombol **Cetak Laporan (PDF)** di Dashboard Admin dan Dashboard Guru. 
* Laporan mencakup Kop Laporan yang rapi, waktu cetak, nama pencetak, garis pembatas, serta tabel kehadiran yang memuat Nama Mahasiswa, NIM, Mata Kuliah, Pertemuan, dan Waktu Absensi.
* Didukung fitur *Auto Page Break* jika data kehadiran melebihi satu halaman kertas.
* Seluruh berkas dihasilkan langsung secara offline di browser klien dan tersimpan sebagai file `.pdf`.
