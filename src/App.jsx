import { useEffect, useState } from "react";
import MatchForm from "./MatchForm.jsx";
import ActivePlayers from "./ActivePlayers.jsx";
import Login from "./Login.jsx";
import "./App.css";

import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [seasonData, setSeasonData] = useState({});
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const normalizedPath =
    typeof window !== "undefined" ? window.location.pathname.replace(/\/+$/, "") || "/" : "/";
  const isAdminRoute = normalizedPath === "/admin";
  const isAdmin = authUser?.email === "harald.billebjer@gmail.com";
  const showAdminControls = isAdminRoute && isAdmin;
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

  useEffect(() => {
    if (selectedSeason && seasons.includes(selectedSeason)) {
      return;
    }

    setSelectedSeason(seasons[0] || "");
  }, [seasons, selectedSeason]);

  useEffect(() => {
    async function loadFromFirestore() {
      try {
        const docRef = doc(db, "korpenData", "app");
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          const loadedSeasons = Array.isArray(data.seasons) ? data.seasons : [];
          const loadedSeasonData = data.seasonData && typeof data.seasonData === "object" ? data.seasonData : {};
          const nextSelectedSeason =
            typeof data.selectedSeason === "string" && loadedSeasons.includes(data.selectedSeason)
              ? data.selectedSeason
              : loadedSeasons[0] || "";

          setSeasons(loadedSeasons);
          setSelectedSeason(nextSelectedSeason);
          setSeasonData(loadedSeasonData);
        } else {
          await setDoc(docRef, {
            seasons: [],
            selectedSeason: "",
            seasonData: {}
          });
        }
      } catch (loadError) {
        console.error("Firebase load error:", loadError);
      } finally {
        setRemoteLoaded(true);
      }
    }

    loadFromFirestore();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      setAuthUser(user);
      setAuthLoading(false);
      if (user) setAuthError("");
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && !showAdminControls && activeTab !== "stats") {
      setActiveTab("stats");
    }
  }, [authLoading, showAdminControls, activeTab]);

  useEffect(() => {
    if (!remoteLoaded) return;

    async function saveToFirestore() {
      try {
        const docRef = doc(db, "korpenData", "app");
        await setDoc(docRef, {
          seasons,
          selectedSeason,
          seasonData
        });
      } catch (saveError) {
        console.error("Firebase save error:", saveError);
      }
    }

    saveToFirestore();
  }, [seasons, selectedSeason, seasonData, remoteLoaded]);

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
    if (!showAdminControls) {
      setError("Endast admin kan göra ändringar.");
      return;
    }
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
    if (!showAdminControls) {
      setError("Endast admin kan göra ändringar.");
      return;
    }
    if (!selectedSeason) {
      setError("Lägg till en säsong först.");
      return;
    }
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
    if (!showAdminControls) {
      setError("Endast admin kan göra ändringar.");
      return;
    }
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
    if (!showAdminControls) {
      setError("Endast admin kan göra ändringar.");
      return;
    }
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
    if (!showAdminControls) {
      setError("Endast admin kan göra ändringar.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      players: prev.players.filter((_, i) => i !== index)
    }));
  }

  function handleSignIn(event) {
    event.preventDefault();
    setAuthError("");

    signInWithEmailAndPassword(getAuth(), authEmail, authPassword).catch((signInError) => {
      console.error("Sign-in error", signInError);
      setAuthError("Fel e-post eller lösenord.");
    });
  }

  async function handleSignOut() {
    try {
      await signOut(getAuth());
    } catch (signOutError) {
      console.error("Sign-out error", signOutError);
    }
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
    if (!showAdminControls) {
      setError("Endast admin kan göra ändringar.");
      return;
    }

    if (!selectedSeason) {
      setError("Lägg till en säsong först.");
      return;
    }

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



  return (
    <div className="app-container">
      {isAdminRoute && (
        <div className="auth-bar">
          <Login
            authLoading={authLoading}
            authUser={authUser}
            authError={authError}
            authEmail={authEmail}
            authPassword={authPassword}
            setAuthEmail={setAuthEmail}
            setAuthPassword={setAuthPassword}
            handleSignIn={handleSignIn}
            handleSignOut={handleSignOut}
            isAdmin={isAdmin}
          />
        </div>
      )}

      <div className="season-bar">
        <div className="season-control">
          <label htmlFor="season-select">Säsong</label>
          <select
            id="season-select"
            className="input-field"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            disabled={!seasons.length}
          >
            {!seasons.length && <option value="">Ingen säsong än</option>}
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>
        {showAdminControls && (
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
        )}
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
        {showAdminControls && (
          <button
            className={activeTab === "add" ? "tab-button active" : "tab-button"}
            type="button"
            onClick={() => setActiveTab("add")}
          >
            Lägg till match
          </button>
        )}
        {showAdminControls && (
          <button
            className={activeTab === "players" ? "tab-button active" : "tab-button"}
            type="button"
            onClick={() => setActiveTab("players")}
          >
            Spelare
          </button>
        )}
      </div>

      {activeTab === "stats" ? (
        <>
          <section className="panel">
            <h2>Spelarstatistik</h2>
            <div className="table-wrapper">
              <table className="stat-table">
                <thead>
                  <tr>
                    <th>Spelare</th>
                    <th>Mål</th>
                    <th>Assist</th>
                    <th>Poäng</th>
                    <th>Matcher</th>
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