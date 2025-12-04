import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
}

export default function Layout({ children, headerTitle, headerSubtitle }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header title={headerTitle} subtitle={headerSubtitle} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
