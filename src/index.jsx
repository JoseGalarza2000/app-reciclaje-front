import './custom.scss';
import React from 'react';
import reportWebVitals from './reportWebVitals';
import App from './app';
import { ThemeProviderBootstrap } from './components/themeContext';
import { createRoot } from 'react-dom/client';
import { AlertProvider } from './components/alertContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <AlertProvider>{/* provider de alertas, para hacer uso en toda la web */}
    <ThemeProviderBootstrap> {/* provider de tema, para hacer uso en toda la web */}
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ThemeProviderBootstrap>
  </AlertProvider>
);

serviceWorkerRegistration.register();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
