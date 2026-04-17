import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";


export default function MatchForm({
  form,
  setForm,
  players,
  playerInput,
  setPlayerInput,
  error,
  addPlayer,
  changePlayerStat,
  removePlayer,
  submitMatch
}) {
  return (
    <section className="panel panel-form">
      <div className="panel-heading panel-heading-center">
        <div>
          <h2>Lägg till match</h2>
          <p className="panel-subtitle">Fyll i motståndare, datum och spelarna som gjort mål och assists.</p>
        </div>
      </div>

      <div className="form-grid">
        <input
          className="input-field"
          placeholder="Motståndare"
          value={form.opponent}
          onChange={(e) => setForm({ ...form, opponent: e.target.value })}
        />

        <input
          className="input-field"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <div className="result-grid">
          <div className="stat-input-row">
            <label className="stat-label">Mål för oss</label>
            <div className="stat-controls">
              <button
                type="button"
                className="button button-text"
                onClick={() => setForm((prev) => ({ ...prev, ownGoals: Math.max(0, prev.ownGoals - 1) }))}
              >
                −
              </button>
              <span className="stat-value">{form.ownGoals}</span>
              <button
                type="button"
                className="button button-text"
                onClick={() => setForm((prev) => ({ ...prev, ownGoals: prev.ownGoals + 1 }))}
              >
                +
              </button>
            </div>
          </div>

          <div className="stat-input-row">
            <label className="stat-label">Motståndarens mål</label>
            <div className="stat-controls">
              <button
                type="button"
                className="button button-text"
                onClick={() => setForm((prev) => ({ ...prev, opponentGoals: Math.max(0, prev.opponentGoals - 1) }))}
              >
                −
              </button>
              <span className="stat-value">{form.opponentGoals}</span>
              <button
                type="button"
                className="button button-text"
                onClick={() => setForm((prev) => ({ ...prev, opponentGoals: prev.opponentGoals + 1 }))}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="result-preview">Resultat: {form.ownGoals}-{form.opponentGoals}</div>

        <div className="card card-secondary">
          <div className="card-heading">
            <h3>Lägg till spelare</h3>
            <p>Välj en spelare från listan och lägg till mål och assists.</p>
          </div>

          <div className="form-grid">
            {players.length > 0 ? (
              <select
                className="input-field"
                value={playerInput.name}
                onChange={(e) => setPlayerInput({ ...playerInput, name: e.target.value })}
              >
                <option value="">Välj spelare</option>
                {players.map((player) => (
                  <option key={player} value={player}>
                    {player}
                  </option>
                ))}
              </select>
            ) : (
              <div className="error-message">Lägg till spelare under fliken Spelare först.</div>
            )}

            <div className="stat-input-row">
              <label className="stat-label">Mål</label>
              <div className="stat-controls">
                <button
                  type="button"
                  className="button button-text"
                  onClick={() => changePlayerStat("goals", -1)}
                >
                  −
                </button>
                <span className="stat-value">{playerInput.goals}</span>
                <button
                  type="button"
                  className="button button-text"
                  onClick={() => changePlayerStat("goals", 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="stat-input-row">
              <label className="stat-label">Assist</label>
              <div className="stat-controls">
                <button
                  type="button"
                  className="button button-text"
                  onClick={() => changePlayerStat("assists", -1)}
                >
                  −
                </button>
                <span className="stat-value">{playerInput.assists}</span>
                <button
                  type="button"
                  className="button button-text"
                  onClick={() => changePlayerStat("assists", 1)}
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={addPlayer}
              type="button"
              className="button button-secondary"
              disabled={!players.length || !playerInput.name}
            >
              + Lägg till spelare
            </button>
          </div>

          {form.players.length > 0 && (
            <div className="player-preview">
              <p className="player-preview-title">Matchtrupp</p>
              <ul className="player-list">
                {form.players.map((p, i) => (
                  <li key={i} className="player-item">
                    <span>{p.name}</span>
                    <span className="player-stats">⚽ {p.goals} | 🎯 {p.assists}</span>
                    <button
                      className="button button-text"
                      type="button"
                      onClick={() => removePlayer(i)}
                    >
                      Ta bort
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button onClick={submitMatch} type="button" className="button button-primary submit-button">
          Spara match
        </button>
      </div>
    </section>
    
  );
}
