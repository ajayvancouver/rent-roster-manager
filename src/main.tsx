
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

// Call the element loader for Capacitor features like camera
defineCustomElements(window);

// Create root instance once
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
const root = createRoot(rootElement);

// Handle both native and web environments
const renderApp = () => {
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

// Wait for the deviceready event in Capacitor environment
if (typeof (window as any).Capacitor !== 'undefined') {
  document.addEventListener('deviceready', renderApp, false);
} else {
  // Standard web environment
  renderApp();
}
