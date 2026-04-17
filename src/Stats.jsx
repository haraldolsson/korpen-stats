export default function Stats({ stats }) {
  return (
    <section className="panel">
      <h2>Spelarstatistik</h2>
      {stats.length === 0 ? (
        <p className="panel-subtitle">Ingen statistik ännu.</p>
      ) : (
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
              {stats.map((player) => (
                <tr key={player.name}>
                  <td>{player.name}</td>
                  <td>{player.goals}</td>
                  <td>{player.assists}</td>
                  <td>{player.points}</td>
                  <td>{player.matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
