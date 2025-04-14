
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

// Call the element loader for Capacitor features like camera
defineCustomElements(window);

// Wait for the deviceready event before bootstrapping the app
document.addEventListener('deviceready', () => {
  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}, false);

// Also handle scenario when not in native app
if (typeof (window as any).Capacitor === 'undefined') {
  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
