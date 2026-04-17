export default function Matches({ matches, getMatchOutcome, showAdminControls, removeMatch }) {
  return (
    <section className="panel">
      <div className="panel-heading panel-heading-center">
        <div>
          <h2>Matcher</h2>
        </div>
      </div>

      {matches.length === 0 ? (
        <p className="panel-subtitle">Inga matcher ännu.</p>
      ) : (
        <div className="match-list">
          {matches.map((match) => (
            <article key={match.id} className={`match-card ${getMatchOutcome(match)}`}>
              <div className="match-card-header">
                <div>
                  <strong>Manchester Kavaj - {match.opponent}</strong>
                  <div className="match-date">{match.date}</div>
                </div>
                <div className="match-card-header-actions">
                  <div className="match-score">{match.result}</div>
                  {showAdminControls && (
                    <button
                      type="button"
                      className="button button-text"
                      onClick={() => removeMatch(match.id)}
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              </div>
              <ul className="match-player-list">
                {match.players.map((player, index) => (
                  <li key={index}>
                    <span>{player.name}</span>
                    <span>⚽ {player.goals} | 🎯 {player.assists}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
