const availablePlayerImages = import.meta.glob("../images/*.{png,jpg,jpeg,webp,svg,PNG,JPG,JPEG,WEBP,SVG}", {
  eager: true,
  import: "default"
});

const standardPlayerImage = availablePlayerImages["../images/standard.PNG"] || Object.values(availablePlayerImages)[0] || "";

const imageOptions = Object.keys(availablePlayerImages)
  .sort((a, b) => {
    if (a.includes("/standard.")) return -1;
    if (b.includes("/standard.")) return 1;
    return a.localeCompare(b);
  })
  .map((path) => ({
    value: path,
    label: path.split("/").pop()
  }));

function normalizePlayerName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function getPlayerImage(name, customImage) {
  if (typeof customImage === "string" && customImage.startsWith("data:")) {
    return customImage;
  }

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

export default function ActivePlayers({
  players,
  playerImages,
  newPlayerName,
  newPlayerImage,
  setNewPlayerName,
  addNewPlayer,
  handleNewPlayerImageChange,
  updatePlayerImage,
  removeActivePlayer,
  error
}) {
  return (
    <section className="panel panel-form">
      <div className="panel-heading panel-heading-center">
        <div>
          <h2>Spelare</h2>
          <p className="panel-subtitle">Lägg till, byt eller ta bort aktiva spelare.</p>
        </div>
      </div>

      <div className="form-grid">
        <input
          className="input-field"
          placeholder="Nytt spelarnamn"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
        />

        <div className="player-select-row">
          <label className="player-select-label" htmlFor="new-player-image">
            Välj bild från images
          </label>
          <select
            id="new-player-image"
            className="input-field player-image-select"
            value={newPlayerImage}
            onChange={handleNewPlayerImageChange}
          >
            <option value="">Standardbild</option>
            {imageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button onClick={addNewPlayer} type="button" className="button button-secondary">
          + Lägg till spelare
        </button>

        <div className="card card-secondary player-image-preview">
          <div className="player-info">
            <img className="player-avatar" src={getPlayerImage(newPlayerName || "standard", newPlayerImage)} alt="Förhandsvisning" />
            <span className="player-name">Förhandsvisning av vald bild</span>
          </div>
        </div>

        <div className="card card-secondary">
          <div className="card-heading">
            <h3>Spelartrupp</h3>
          </div>
          {players.length > 0 ? (
            <ul className="player-list">
              {players.map((player) => (
                <li key={player} className="player-item">
                  <div className="player-info">
                    <img className="player-avatar" src={getPlayerImage(player, playerImages?.[player])} alt={player} />
                    <span className="player-name">{player}</span>
                  </div>
                  <div className="player-actions">
                    <select
                      className="input-field player-image-select"
                      value={playerImages?.[player] || ""}
                      onChange={(e) => updatePlayerImage(player, e.target.value)}
                    >
                      <option value="">Standardbild</option>
                      {imageOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="button button-text"
                      onClick={() => removeActivePlayer(player)}
                    >
                      Ta bort
                    </button>
                  </div>
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
