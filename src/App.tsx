import { useState } from 'react';
import './App.css';
import { ThemeProvider, WalletProvider } from '@randaotoken/component-library';
import { Topbar } from './components/Topbar/Topbar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Home } from './pages/Home/Home';
import { Collections } from './pages/Collections/Collections';
import { Profile } from './pages/Profile/Profile';
import { Address } from './pages/Address/Address';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
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
