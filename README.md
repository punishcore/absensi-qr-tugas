# Dokumentasi Fitur Absensi QR

## Deskripsi Fitur

Fitur Absensi QR merupakan sistem pencatatan kehadiran yang memanfaatkan QR Code sebagai media absensi. Sistem terdiri dari dua peran utama, yaitu Admin dan Pengguna.

Admin bertugas membuat QR Code untuk sesi absensi tertentu, sedangkan pengguna melakukan pemindaian QR Code tersebut untuk mencatat kehadiran.

Sistem dibangun menggunakan Next.js sebagai framework frontend dan menggunakan Local Storage sebagai media penyimpanan data sementara tanpa memerlukan database.

---

# Tujuan

* Mempermudah proses absensi.
* Mengurangi proses input data secara manual.
* Mempercepat pencatatan kehadiran.
* Menyediakan riwayat absensi secara langsung pada perangkat pengguna.
* Memudahkan admin dalam membuat dan mengelola sesi absensi.

---

# Teknologi yang Digunakan

## Framework

* Next.js
* React

## Library QR Scanner

Library yang direkomendasikan adalah html5-qrcode.

### Alasan Pemilihan

* Mendukung pemindaian QR secara realtime.
* Mendukung berbagai jenis kamera perangkat.
* Mudah diintegrasikan dengan React dan Next.js.
* Memiliki dokumentasi yang lengkap.
* Stabil untuk penggunaan pada browser modern.

---

# Instalasi Dependensi

Untuk menambahkan fitur pemindaian QR ke dalam proyek, diperlukan instalasi package QR Scanner.

Menggunakan npm:

npm install html5-qrcode

Menggunakan pnpm:

pnpm add html5-qrcode

---

# Aktor Sistem

## Admin

Admin memiliki akses untuk:

* Login ke sistem.
* Membuat sesi absensi.
* Menghasilkan QR Code absensi.
* Melihat data kehadiran pengguna.
* Mengelola riwayat absensi.

## Pengguna

Pengguna memiliki akses untuk:

* Login ke sistem.
* Melakukan scan QR Code.
* Melihat riwayat absensi pribadi.

---

# Alur Sistem

## 1. Login

Pengguna maupun admin melakukan login ke dalam sistem menggunakan akun yang telah terdaftar.

---

## 2. Pembuatan Sesi Absensi

Admin membuat sesi absensi baru.

Contoh:

* Pertemuan 1
* Pertemuan 2
* Rapat Bulanan
* Seminar

Setelah sesi dibuat, sistem menghasilkan QR Code yang dapat dipindai oleh pengguna.

---

## 3. Pemindaian QR

Pengguna membuka halaman absensi dan mengaktifkan kamera perangkat.

QR Code yang telah dibuat oleh admin kemudian dipindai menggunakan kamera.

---

## 4. Validasi Data

Sistem melakukan validasi terhadap:

* Status login pengguna.
* Keberadaan sesi absensi.
* Format data QR.
* Riwayat absensi pengguna.

---

## 5. Pencatatan Kehadiran

Apabila validasi berhasil, sistem mencatat:

* ID Pengguna
* Nama Pengguna
* Nama Sesi
* Tanggal Absensi
* Waktu Absensi

Data tersebut kemudian disimpan ke Local Storage.

---

## 6. Riwayat Absensi

Pengguna dapat melihat daftar absensi yang pernah dilakukan.

Admin dapat melihat seluruh data absensi yang tercatat pada sistem.

---

# Penyimpanan Data

## Metode Penyimpanan

Data disimpan menggunakan Local Storage browser.

## Data yang Disimpan

### Data Pengguna

* ID Pengguna
* Nama Pengguna
* Informasi Login

### Data Sesi Absensi

* ID Sesi
* Nama Sesi
* Tanggal Pembuatan

### Data Kehadiran

* ID Pengguna
* Nama Pengguna
* ID Sesi
* Waktu Absensi

---

# Fitur Validasi yang Direkomendasikan

## Pencegahan Absensi Ganda

Sistem mencegah pengguna melakukan absensi lebih dari satu kali pada sesi yang sama.

---

## Validasi Login

Hanya pengguna yang telah login yang dapat melakukan absensi.

---

## Validasi QR

Sistem memastikan QR Code berasal dari sesi absensi yang dibuat oleh admin.

---

## Validasi Sesi

Sistem memastikan sesi absensi masih aktif dan dapat digunakan.

---

# Keterbatasan Sistem

* Data dapat dihapus dari browser.
* Data tidak tersinkronisasi antar perangkat.
* Keamanan masih terbatas.
* Tidak cocok untuk penggunaan skala besar atau produksi.

---

# Kesimpulan

Fitur Absensi QR memungkinkan proses pencatatan kehadiran dilakukan secara cepat melalui pemindaian QR Code yang dibuat oleh admin. Dengan adanya peran Admin dan Pengguna, proses absensi menjadi lebih terstruktur dan mendekati implementasi sistem absensi yang digunakan pada lingkungan kampus maupun perusahaan. Penyimpanan menggunakan Local Storage menjadikan sistem sederhana dan mudah dikembangkan untuk kebutuhan prototipe maupun pembelajaran.
