export default function ActivePlayers({
  players,
  newPlayerName,
  setNewPlayerName,
  addNewPlayer,
  error
}) {
  return (
    <section className="panel panel-form">
      <div className="panel-heading panel-heading-center">
        <div>
          <h2>Spelare</h2>
          <p className="panel-subtitle">Lägg till en aktiv spelare.</p>
        </div>
      </div>

      <div className="form-grid">
        <input
          className="input-field"
          placeholder="Nytt spelarnamn"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
        />

        <button onClick={addNewPlayer} type="button" className="button button-secondary">
          + Lägg till spelare
        </button>

        <div className="card card-secondary">
          <div className="card-heading">
            <h3>Spelartrupp</h3>
          </div>
          {players.length > 0 ? (
            <ul className="player-list">
              {players.map((player) => (
                <li key={player} className="player-item">
                  <span>{player}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="error-message">Lägg till minst en spelare först.</div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </section>
  );
}
