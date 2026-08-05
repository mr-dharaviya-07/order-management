import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { CustomToast } from './components/CustomToast';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<div className="shell py-10">Something went wrong. Please refresh.</div>}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          containerStyle={{
            top: 24,
            right: 24,
          }}
        >
          {(t) => <CustomToast t={t} />}
        </Toaster>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
