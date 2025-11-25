'use client';

import { useEffect, useState } from 'react';

export default function PortalHome() {
  const [clientName, setClientName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Construct backend URL dynamically to preserve subdomain
    // If we are on prueba.localhost:3002, we want to call prueba.localhost:3001
    const hostname = window.location.hostname;
    const backendUrl = `http://${hostname}:3001`;

    // Fetch health check to see if we are recognized as a portal
    fetch(`${backendUrl}/api/health`)
      .then(res => res.json())
      .then(data => {
        if (data.isPortal && data.client) {
          setClientName(data.client);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading Portal...</div>;

  if (!clientName) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold text-red-600">Portal Not Found</h1>
        <p className="mt-4">Please access this portal via a valid subdomain.</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Welcome to {clientName} Portal</h1>
        <div className="mt-8">
          <p>Login form will go here.</p>
        </div>
      </div>
    </main>
  );
}
