import { Home } from './pages/Home';
import { AuthLayout } from './components/AuthLayout';
import { Toaster } from 'react-hot-toast';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import './index.css';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <AuthLayout>
        <Home />
      </AuthLayout>
      <PWAInstallPrompt />
    </>
  );
}

export default App;
