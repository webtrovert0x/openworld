import type { Metadata } from 'next';
import './globals.css';
import Web3Provider from '../context/Web3Provider';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'OpenWorld | NFT Marketplace on Botchain',
  description: 'Institutional-grade NFT marketplace, trading engine, and launchpad on Botchain Testnet (Chain ID: 968). Native BOT settlements, zero escrow risks, and royalty enforcement.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090a0f] text-slate-100 antialiased min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
        <Web3Provider>
          <Navbar />
          <div className="flex-1 w-full">
            {children}
          </div>
          <Footer />
        </Web3Provider>
      </body>
    </html>
  );
}
