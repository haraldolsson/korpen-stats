const availablePlayerImages = import.meta.glob("../images/*.{png,jpg,jpeg,webp,svg,PNG,JPG,JPEG,WEBP,SVG}", {
  eager: true,
  import: "default"
});

const standardPlayerImage = availablePlayerImages["../images/standard.PNG"] || Object.values(availablePlayerImages)[0] || "";

function normalizePlayerName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function getPlayerImage(name, customImage) {
  if (customImage && availablePlayerImages[customImage]) {
    return availablePlayerImages[customImage];
  }

  const normalized = normalizePlayerName(name);
  const candidates = [
    `../images/${normalized}.png`,
    `../images/${normalized}.jpg`,
    `../images/${normalized}.jpeg`,
    `../images/${normalized}.webp`,
    `../images/${normalized}.svg`,
    `../images/${normalized}.PNG`,
    `../images/${normalized}.JPG`,
    `../images/${normalized}.JPEG`,
    `../images/${normalized}.WEBP`,
    `../images/${normalized}.SVG`
  ];

  const match = candidates.find((path) => availablePlayerImages[path]);
  return match ? availablePlayerImages[match] : standardPlayerImage;
}

export default function Matches({ matches, getMatchOutcome, showAdminControls, removeMatch, playerImages }) {
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
                    <div className="match-player-info">
                      <img
                        className="match-player-avatar"
                        src={getPlayerImage(player.name, playerImages?.[player.name])}
                        alt={player.name}
                      />
                      <span>{player.name}</span>
                    </div>
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
