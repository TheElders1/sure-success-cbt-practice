import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('[v0] Starting application...');
const rootElement = document.getElementById('root');
console.log('[v0] Root element:', rootElement);

ReactDOM.createRoot(rootElement!).render(<React.StrictMode><App /></React.StrictMode>);
