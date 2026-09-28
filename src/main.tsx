import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('TaskFlow update available.');
  },
  onOfflineReady() {
    console.log('TaskFlow is ready to work offline.');
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
