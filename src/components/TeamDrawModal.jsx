import { useState } from 'react';
import shuffle from '../utils/shuffle';

const TeamDrawModal = ({ isOpen, onClose }) => {
  const [playersText, setPlayersText] = useState('');
  const [teamSize, setTeamSize] = useState(2);
  const [resultMode, setResultMode] = useState('initial');
  const [message, setMessage] = useState(
    'Wprowadź graczy i wylosuj drużyny lub pojedynczą osobę.'
  );
  const [teamsData, setTeamsData] = useState([]);
  const [winner, setWinner] = useState('');

  if (!isOpen) return null;

  const getPlayers = () =>
    playersText
      .split('\n')
      .map((player) => player.trim())
      .filter((player) => player.length > 0);

  const handleDrawTeams = () => {
    const players = getPlayers();
    const parsedSize = parseInt(teamSize, 10);

    if (players.length === 0) {
      setResultMode('error');
      setMessage('Wprowadź graczy, aby móc losować drużyny!');
      return;
    }

    if (isNaN(parsedSize) || parsedSize < 1) {
      setResultMode('error');
      setMessage('Rozmiar drużyny musi być liczbą większą niż 0!');
      return;
    }

    const shuffled = shuffle(players);
    const createdTeams = [];
    let teamNumber = 1;

    for (let i = 0; i < shuffled.length; i += parsedSize) {
      createdTeams.push({
        number: teamNumber,
        members: shuffled.slice(i, i + parsedSize),
      });
      teamNumber++;
    }

    setTeamsData(createdTeams);
    setResultMode('teams');
    if (players.length % parsedSize !== 0) {
      setMessage(
        `Uwaga: Niektórzy gracze zostali dobrani do mniejszych drużyn lub pominięci w pełnych. Liczba graczy: ${players.length}, Rozmiar drużyny: ${parsedSize}.`
      );
    } else {
      setMessage('');
    }
  };

  const handleDrawSingle = () => {
    const players = getPlayers();
    if (players.length === 0) {
      setResultMode('error');
      setMessage('Wprowadź graczy, aby móc losować jedną osobę!');
      return;
    }

    const shuffled = shuffle(players);
    setWinner(shuffled[0]);
    setResultMode('single');
    setMessage('');
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 2100 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content draw-modal-content text-light border-0 shadow-lg">
          <div className="modal-header border-secondary">
            <h1 className="modal-title h4 m-0 draw-title w-100 text-center">
              Generator Drużyn i Losowanie
            </h1>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Zamknij"
              onClick={onClose}
            />
          </div>

          <div className="modal-body p-4">
            <div className="mb-3 text-start">
              <label htmlFor="player-input" className="form-label fw-bold">
                Wprowadź listę graczy (po jednym na linię):
              </label>
              <textarea
                id="player-input"
                rows="7"
                className="form-control custom-input"
                placeholder={'Gracz 1\nGracz 2\nGracz 3...'}
                value={playersText}
                onChange={(e) => setPlayersText(e.target.value)}
              />

              <label htmlFor="team-size" className="form-label fw-bold mt-3">
                Liczba osób w drużynie:
              </label>
              <input
                id="team-size"
                type="number"
                min="1"
                className="form-control custom-input"
                style={{ width: '90px' }}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
              />
            </div>

            <div className="button-group mb-4">
              <button type="button" className="btn-discord" onClick={handleDrawTeams}>
                Losuj Drużyny
              </button>
              <button type="button" className="btn-discord" onClick={handleDrawSingle}>
                Losuj Jedną Osobę
              </button>
            </div>

            <div className="results-section text-start">
              <h2 className="h5 pb-2 mb-3 border-bottom border-secondary">Wyniki Losowania</h2>
              <div id="results">
                {resultMode === 'initial' && message}
                {resultMode === 'error' && (
                  <span className="text-warning fw-bold">{message}</span>
                )}
                {resultMode === 'teams' && (
                  <>
                    {teamsData.map((team) => (
                      <div key={team.number}>
                        <span className="team-name">Drużyna {team.number}:</span>{' '}
                        {team.members.join(', ')}
                      </div>
                    ))}
                    {message && (
                      <div className="mt-2">
                        <span className="team-name" style={{ color: '#FAA61A' }}>
                          Uwaga:
                        </span>{' '}
                        {message.replace(/^Uwaga:\s*/, '')}
                      </div>
                    )}
                  </>
                )}
                {resultMode === 'single' && (
                  <>
                    <span className="team-name">Zwycięzca losowania:</span>
                    <div className="single-winner fs-5 fw-bold mt-1">{winner}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer border-secondary justify-content-center">
            <button
              type="button"
              className="btn btn-link text-decoration-none back-link m-0"
              onClick={onClose}
            >
              Powrót do Bingo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamDrawModal;