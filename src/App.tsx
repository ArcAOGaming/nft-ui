import { useState } from 'react';
import './App.css';
import { ThemeProvider, WalletProvider } from '@randaotoken/component-library';
import { Topbar } from './components/Topbar/Topbar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Home } from './pages/Home/Home';
import { Collections } from './pages/Collections/Collections';
import { Profile } from './pages/Profile/Profile';
import { Address } from './pages/Address/Address';
import { Send } from './pages/Send';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'collections' | 'profile' | 'address' | 'send'>('home');

  const handleNavigate = (page: 'home' | 'collections' | 'profile' | 'address' | 'send') => {
    setCurrentPage(page);
    setIsSidebarOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'collections':
        return <Collections />;
      case 'profile':
        return <Profile />;
      case 'address':
        return <Address />;
      case 'send':
        return <Send />;
      case 'home':
        return <Home />;
      default:
        return <Home />;
    }
  };

  return (
    <ThemeProvider>
      <WalletProvider>
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activePage={currentPage}
          onNavigate={handleNavigate}
        />
        <main>
          {renderPage()}
        </main>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;
