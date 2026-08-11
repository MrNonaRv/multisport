import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress known non-actionable Firebase warnings/errors
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (
    msg.includes('Could not reach Cloud Firestore backend') ||
    msg.includes('Using maximum backoff delay') ||
    msg.includes('resource-exhausted') ||
    (args[0] && args[0].code === 'unavailable') ||
    (args[0] && args[0].code === 'resource-exhausted')
  ) {
    return;
  }
  originalConsoleError(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

