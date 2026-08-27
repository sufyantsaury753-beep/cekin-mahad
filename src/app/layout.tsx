import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: "E-Checkin & Pemilihan Kamar Digital | UPT Ma'had Al-Jami'ah UIN Siber Syekh Nurjati Cirebon",
  description: "Sistem Pemilihan Kamar Online, E-Tiket Barcode, dan E-Checkin Terdistribusi Ma'had Al-Jami'ah UIN Siber Syekh Nurjati Cirebon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
