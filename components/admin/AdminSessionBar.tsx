import { SessionUser } from './types';

type Props = {
  user: SessionUser;
  timeoutMinutes: number;
  onLogout: () => void;
};

export function AdminSessionBar({ user, timeoutMinutes, onLogout }: Props) {
  return (
    <section className="panel admin-session-bar">
      <div>
        <strong>{user.name || user.email}</strong>
      </div>
      <button className="btn btn-secondary" type="button" onClick={onLogout}>
        Cerrar sesión
      </button>
    </section>
  );
}
