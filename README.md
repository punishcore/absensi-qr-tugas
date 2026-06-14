# Dokumentasi Fitur Absensi QR

## Deskripsi Fitur

Fitur Absensi QR merupakan sistem pencatatan kehadiran yang memanfaatkan QR Code sebagai media identifikasi pengguna. Pengguna cukup melakukan pemindaian QR menggunakan kamera perangkat untuk mencatat kehadiran secara otomatis.

Sistem dibangun menggunakan Next.js sebagai framework frontend dan menggunakan Local Storage sebagai media penyimpanan data sementara tanpa memerlukan database.

---

# Tujuan

* Mempermudah proses absensi.
* Mengurangi proses input data secara manual.
* Mempercepat pencatatan kehadiran.
* Menyediakan riwayat absensi secara langsung pada perangkat pengguna.

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

# Alur Sistem

## 1. Membuka Halaman Absensi

Pengguna membuka halaman absensi melalui aplikasi web.

## 2. Aktivasi Kamera

Sistem meminta izin akses kamera kepada pengguna.

## 3. Pemindaian QR

Kamera melakukan pemindaian terhadap QR Code yang diberikan.

## 4. Pembacaan Data

Sistem membaca informasi yang tersimpan di dalam QR Code.

## 5. Validasi Data

Data yang berhasil dipindai diperiksa untuk memastikan format sesuai dengan kebutuhan sistem.

## 6. Penyimpanan Data

Data absensi yang valid disimpan ke Local Storage browser.

## 7. Menampilkan Riwayat

Data yang tersimpan dapat ditampilkan kembali pada halaman riwayat absensi.

---

# Struktur Data Absensi

Setiap data absensi minimal memiliki informasi:

* ID Pengguna
* Nama Pengguna
* Waktu Absensi

Informasi tersebut diperoleh dari QR Code dan ditambahkan dengan waktu pemindaian saat proses absensi berlangsung.

---

# Penyimpanan Data

## Metode Penyimpanan

Data disimpan menggunakan Local Storage browser.

## Keuntungan

* Tidak memerlukan database.
* Implementasi sederhana.
* Cocok untuk prototipe dan tugas akademik.
* Dapat digunakan secara offline setelah aplikasi dimuat.

## Kekurangan

* Data dapat dihapus oleh pengguna.
* Data hanya tersedia pada perangkat yang sama.
* Tidak mendukung sinkronisasi antar perangkat.
* Kurang aman untuk penggunaan produksi.

---

# Fitur Validasi yang Direkomendasikan

## Pencegahan Absensi Ganda

Sistem memeriksa apakah pengguna telah melakukan absensi sebelumnya sebelum menyimpan data baru.

## Pembatasan Absensi Harian

Sistem dapat membatasi satu pengguna hanya dapat melakukan absensi satu kali dalam satu hari.

## Validasi Format QR

QR Code harus memiliki struktur data yang sesuai dengan format yang ditentukan sistem.

---

# Riwayat Absensi

Fitur riwayat memungkinkan pengguna melihat seluruh data absensi yang tersimpan pada Local Storage.

Informasi yang ditampilkan meliputi:

* ID Pengguna
* Nama Pengguna
* Tanggal Absensi
* Waktu Absensi

---

# Kesimpulan

Fitur Absensi QR berbasis Next.js dengan penyimpanan Local Storage merupakan solusi sederhana untuk kebutuhan prototipe, demonstrasi, maupun tugas akademik. Sistem memungkinkan proses absensi dilakukan secara cepat melalui pemindaian QR Code tanpa memerlukan infrastruktur backend yang kompleks.
