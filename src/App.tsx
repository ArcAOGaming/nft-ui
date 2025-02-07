import './App.css';
import { ThemeProvider, WalletProvider } from '@randaotoken/component-library';
import { Topbar } from './components/Topbar/Topbar';

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <Topbar />
        <main>
          {/* Main content will go here */}
        </main>
      </WalletProvider>
    </ThemeProvider>
  )
}

export default App
