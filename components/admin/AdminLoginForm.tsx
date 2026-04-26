type Props = {
  email: string;
  password: string;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function AdminLoginForm({
  email,
  password,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: Props) {
  return (
    <section className="panel admin-login-panel">
      <h2>Ingresar</h2>
      <form className="filters" onSubmit={onSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            className="input"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="admin-password">Contraseña</label>
          <input
            id="admin-password"
            className="input"
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            required
          />
        </div>

        {error ? <p className="admin-error">{error}</p> : null}

        <button className="btn btn-primary" type="submit">Iniciar sesión</button>
      </form>
    </section>
  );
}
