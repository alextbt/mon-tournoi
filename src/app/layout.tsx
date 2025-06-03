import './globals.css';
import { Poppins } from 'next/font/google';
import Navbar from '@/components/Navbar';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export const metadata = {
  title: 'Grand Tournoi de l’Été',
  description: 'Un seul grand gagnant à la fin du tournoi !',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={poppins.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
