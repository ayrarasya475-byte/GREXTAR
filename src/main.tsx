import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(_: Error) {
    return {hasError: true};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans">
          <h1 className="text-xl font-black mb-4 uppercase tracking-[0.2em] text-rose-500">Kernel Panic</h1>
          <p className="text-[10px] text-zinc-500 uppercase font-bold text-center max-w-sm mb-6">
            An unrecoverable system error has occurred. Please refresh the terminal session.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl"
          >
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global Error Caught:", { message, source, lineno, colno, error });
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
