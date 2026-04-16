import { useEffect, useState } from "react";
import { matches as initialMatches } from "./data";
import MatchForm from "./MatchForm.jsx";
import ActivePlayers from "./ActivePlayers.jsx";
import "./App.css";

export default function App() {
  const defaultSeason = "2026";
  const [seasons, setSeasons] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("korpen-season-data");
      if (saved) {
        return JSON.parse(saved).seasons || [defaultSeason];
      }
    }
    return [defaultSeason];
  });
  const [selectedSeason, setSelectedSeason] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("korpen-season-data");
      if (saved) {
        return JSON.parse(saved).selectedSeason || defaultSeason;
      }
    }
    return defaultSeason;
  });
  const [seasonData, setSeasonData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("korpen-season-data");
      if (saved) {
        return JSON.parse(saved).seasonData || {};
      }
    }

    const names = initialMatches.flatMap((match) => match.players.map((player) => player.name));
    const initialPlayers = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));

    return {
      [defaultSeason]: {
        matches: initialMatches,
        players: initialPlayers
      }
    };
  });
  const [newSeasonName, setNewSeasonName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [form, setForm] = useState({
    opponent: "",
    date: "",
    ownGoals: 0,
    opponentGoals: 0,
    players: []
  });
  const [playerInput, setPlayerInput] = useState({
    name: "",
    goals: 0,
    assists: 0
  });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("stats");

  const currentSeason = seasonData[selectedSeason] || { matches: [], players: [] };
  const currentMatches = currentSeason.matches || [];
  const currentPlayers = currentSeason.players || [];

  useEffect(() => {
    setForm((prev) => ({ ...prev, players: [] }));

    if (!currentPlayers.includes(playerInput.name)) {
      setPlayerInput((prev) => ({ ...prev, name: currentPlayers[0] || "" }));
    }

    setError("");
  }, [selectedSeason, currentPlayers]);

  function calculateStats(matches) {
    const stats = {};

    matches.forEach((match) => {
      match.players.forEach((p) => {
        if (!stats[p.name]) {
          stats[p.name] = {
            name: p.name,
            goals: 0,
            assists: 0,
            points: 0,
            matches: 0
          };
        }

        stats[p.name].goals += Number(p.goals);
        stats[p.name].assists += Number(p.assists);
        stats[p.name].matches += 1;
        stats[p.name].points = stats[p.name].goals + stats[p.name].assists;
      });
    });

    return Object.values(stats);
  }

  const playerStats = calculateStats(currentMatches);
  const sortedStats = [...playerStats].sort((a, b) => {
    if (b.goals !== a.goals) {
      return b.goals - a.goals;
    }
    return b.assists - a.assists;
  });

  function addPlayer() {
    if (!playerInput.name || !currentPlayers.includes(playerInput.name)) return;
    if (form.players.some((player) => player.name === playerInput.name)) {
      setError("Spelaren finns redan i matchen.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      players: [
        ...prev.players,
        {
          name: playerInput.name,
          goals: playerInput.goals,
          assists: playerInput.assists
        }
      ]
    }));

    setPlayerInput((prev) => ({ ...prev, goals: 0, assists: 0 }));
    setError("");
  }

  function addNewPlayer() {
    if (!newPlayerName.trim()) return;
    const normalized = newPlayerName.trim();
    if (currentPlayers.includes(normalized)) {
      setError("Spelaren finns redan i listan.");
      return;
    }

    setSeasonData((prev) => ({
      ...prev,
      [selectedSeason]: {
        ...prev[selectedSeason],
        players: [...(prev[selectedSeason]?.players || []), normalized].sort((a, b) => a.localeCompare(b))
      }
    }));
    setNewPlayerName("");
    setError("");
    setPlayerInput((prev) => ({
      ...prev,
      name: prev.name || normalized
    }));
  }

  function addSeason() {
    if (!newSeasonName.trim()) return;
    const normalized = newSeasonName.trim();
    if (seasons.includes(normalized)) {
      setError("Säsongen finns redan.");
      return;
    }

    setSeasons((prev) => [...prev, normalized]);
    setSeasonData((prev) => ({
      ...prev,
      [normalized]: {
        matches: [],
        players: []
      }
    }));
    setSelectedSeason(normalized);
    setNewSeasonName("");
    setError("");
  }

  function removeMatch(matchId) {
    setSeasonData((prev) => ({
      ...prev,
      [selectedSeason]: {
        ...prev[selectedSeason],
        matches: (prev[selectedSeason]?.matches || []).filter((match) => match.id !== matchId)
      }
    }));
  }

  function changePlayerStat(field, delta) {
    setPlayerInput((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta)
    }));
  }

  function removePlayer(index) {
    setForm((prev) => ({
      ...prev,
      players: prev.players.filter((_, i) => i !== index)
    }));
  }

  function getMatchOutcome(match) {
    const [own, opponent] = match.result
      .split("-")
      .map((value) => Number(value.trim()));

    if (Number.isNaN(own) || Number.isNaN(opponent)) {
      return "";
    }

    if (own > opponent) return "win";
    if (own === opponent) return "draw";
    return "loss";
  }

  function submitMatch() {
    if (!form.opponent.trim() || !form.date) {
      setError("Fyll i motståndare och datum.");
      return;
    }
    if (!currentPlayers.length) {
      setError("Lägg till spelare under fliken Spelare först.");
      return;
    }

    if (form.players.length === 0) {
      setError("Lägg till minst en spelare till matchen.");
      return;
    }

    const nextId = Math.max(0, ...currentMatches.map((m) => m.id)) + 1;
    const newMatch = {
      id: nextId,
      opponent: form.opponent.trim(),
      date: form.date,
      result: `${form.ownGoals}-${form.opponentGoals}`,
      players: form.players
    };

    setSeasonData((prev) => ({
      ...prev,
      [selectedSeason]: {
        ...prev[selectedSeason],
        matches: [newMatch, ...(prev[selectedSeason]?.matches || [])]
      }
    }));
    setForm({ opponent: "", date: "", ownGoals: 0, opponentGoals: 0, players: [] });
    setPlayerInput({ name: "", goals: 0, assists: 0 });
    setError("");
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "korpen-season-data",
        JSON.stringify({ seasons, selectedSeason, seasonData })
      );
    }
  }, [seasons, selectedSeason, seasonData]);


  return (
    <div className="app-container">
      <div className="season-bar">
        <div className="season-control">
          <label htmlFor="season-select">Säsong</label>
          <select
            id="season-select"
            className="input-field"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>
        <div className="season-control season-add">
          <label htmlFor="new-season">Lägg till säsong</label>
          <div className="season-add-row">
            <input
              id="new-season"
              className="input-field"
              type="text"
              value={newSeasonName}
              onChange={(e) => setNewSeasonName(e.target.value)}
              placeholder="Lägg till ny säsong"
            />
            <button type="button" className="button" onClick={addSeason}>
              Lägg till
            </button>
          </div>
        </div>
      </div>

      <header className="hero-header">
        <div>
          <p className="eyebrow">Korpen Stats</p>
          <h1 className="app-title">Manchester Kavaj</h1>
          <p className="intro-text">Stats för Manchester Kavaj i Korpen.</p>
        </div>
      </header>

      <div className="tab-nav">
        <button
          className={activeTab === "stats" ? "tab-button active" : "tab-button"}
          type="button"
          onClick={() => setActiveTab("stats")}
        >
          Stats
        </button>
        <button
          className={activeTab === "add" ? "tab-button active" : "tab-button"}
          type="button"
          onClick={() => setActiveTab("add")}
        >
          Lägg till match
        </button>
        <button
          className={activeTab === "players" ? "tab-button active" : "tab-button"}
          type="button"
          onClick={() => setActiveTab("players")}
        >
          Spelare
        </button>
      </div>

      {activeTab === "stats" ? (
        <>
          <section className="panel">
            <h2>Spelarstatistik</h2>
            <div className="table-wrapper">
              <table className="stat-table">
                <thead>
                  <tr>
                    <th>Spelare🏃‍♂️</th>
                    <th>Mål ⚽</th>
                    <th>Assist 🎯</th>
                    <th>Poäng ⚽+🎯</th>
                    <th>Matcher📊</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((p) => (
                    <tr key={p.name}>
                      <td>{p.name}</td>
                      <td>{p.goals}</td>
                      <td>{p.assists}</td>
                      <td>{p.points}</td>
                      <td>{p.matches}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading panel-heading-center">
              <div>
                <h2>Matcher</h2>
              </div>
            </div>
            <div className="match-list">
              {currentMatches.map((match) => (
                <article key={match.id} className={`match-card ${getMatchOutcome(match)}`}>
                  <div className="match-card-header">
                    <div>
                      <strong>Manchester Kavaj - {match.opponent}</strong>
                      <div className="match-date">{match.date}</div>
                    </div>
                    <div className="match-card-header-actions">
                      <div className="match-score">{match.result}</div>
                      <button
                        type="button"
                        className="button button-text"
                        onClick={() => removeMatch(match.id)}
                      >
                        Ta bort
                      </button>
                    </div>
                  </div>
                  <ul className="match-player-list">
                    {match.players.map((p, i) => (
                      <li key={i}>
                        <span>{p.name}</span>
                        <span>⚽ {p.goals} | 🎯 {p.assists}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : activeTab === "add" ? (
        <MatchForm
          form={form}
          setForm={setForm}
          playerInput={playerInput}
          setPlayerInput={setPlayerInput}
          players={currentPlayers}
          error={error}
          addPlayer={addPlayer}
          changePlayerStat={changePlayerStat}
          removePlayer={removePlayer}
          submitMatch={submitMatch}
        />
      ) : (
        <ActivePlayers
          players={currentPlayers}
          newPlayerName={newPlayerName}
          setNewPlayerName={setNewPlayerName}
          addNewPlayer={addNewPlayer}
          error={error}
        />
      )}
    </div>
  );
}