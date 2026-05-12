'use client';

import '../css/admin.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      router.push('/admin');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <main className="admin-main login-page">
      <div className="login-page__shell">
        <div className="login-page__intro">
          <span className="admin-panel-eyebrow">Panel privado</span>
          <h1>Ingresar a Retro Remeras</h1>
          <p>Acceso exclusivo para administrar productos, categorías y contenido visual del sitio.</p>
        </div>

        <AdminLoginForm
          email={email}
          password={password}
          error={error}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
        />

        {loading ? <p className="login-page__status">Autenticando...</p> : null}
      </div>
    </main>
  );
}
