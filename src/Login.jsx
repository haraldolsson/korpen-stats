export default function Login({
  authLoading,
  authUser,
  authError,
  authEmail,
  authPassword,
  setAuthEmail,
  setAuthPassword,
  handleSignIn,
  handleSignOut,
  isAdmin
}) {
  return (
    <section className="panel">
      <div className="panel-heading panel-heading-center">
        <div>
          <h2>Admin</h2>
          <p>Logga in för att hantera matcher och spelare.</p>
        </div>
        <a href="/" className="button button-secondary">
          Till stats
        </a>
      </div>
      {authLoading ? (
        <div className="auth-status">Kontrollerar inloggning...</div>
      ) : authUser ? (
        <div className="auth-status">
          Inloggad som <strong>{authUser.email}</strong>
          {isAdmin ? " (admin)" : " (endast läsning)"}
          <button type="button" className="button button-secondary" onClick={handleSignOut}>
            Logga ut
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSignIn}>
          <input
            className="input-field"
            type="email"
            placeholder="E-post"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
          />
          <input
            className="input-field"
            type="password"
            placeholder="Lösenord"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
          />
          <button type="submit" className="button button-primary">
            Logga in
          </button>
          {authError && <div className="error-message">{authError}</div>}
        </form>
      )}
    </section>
  );
}
