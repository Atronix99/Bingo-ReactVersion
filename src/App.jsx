import { useCallback, useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { BOARD_SIZE, calculateWinIndices } from './utils/boardGenerator';
import buildBoardItems from './utils/boardGenerator';
import shuffle from './utils/shuffle';
import BingoBoard from './components/BingoBoard';
import AchievementsBar from './components/AchievementsBar';
import ImportExportBox from './components/ImportExportBox';
import ExportCodeModal from './components/ExportCodeModal';
import NotificationToast from './components/NotificationToast';
import TeamDrawModal from './components/TeamDrawModal';

const App = () => {
  const boardRef = useRef(null);
  const notificationTimerRef = useRef(null);
  const closePopupTimerRef = useRef(null);
  const hideToastTimerRef = useRef(null);

  const [allItems, setAllItems] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [selectedAchievements, setSelectedAchievements] = useState([]);

  const [difficulty, setDifficulty] = useState('normal');
  const [boardItems, setBoardItems] = useState([]);
  const [boardKey, setBoardKey] = useState(0);
  const [completedIndices, setCompletedIndices] = useState(new Set());
  const [winIndices, setWinIndices] = useState(new Set());

  const [exportCode, setExportCode] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportModalClosing, setIsExportModalClosing] = useState(false);

  const [toast, setToast] = useState({
    message: '',
    visible: false,
    hiding: false,
  });

  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);

  const closeNotification = useCallback(() => {
    setToast((prev) => {
      if (!prev.visible) return prev;
      return { ...prev, visible: false, hiding: true };
    });

    clearTimeout(hideToastTimerRef.current);
    hideToastTimerRef.current = setTimeout(() => {
      setToast({ message: '', visible: false, hiding: false });
    }, 400);
  }, []);

  const showNotification = useCallback(
    (message, duration = 3000) => {
      clearTimeout(notificationTimerRef.current);
      clearTimeout(hideToastTimerRef.current);

      setToast({ message, visible: true, hiding: false });

      notificationTimerRef.current = setTimeout(() => {
        closeNotification();
      }, duration);
    },
    [closeNotification]
  );

  const pickRandomAchievements = useCallback((sourceList) => {
    if (!Array.isArray(sourceList) || sourceList.length === 0) return [];
    return shuffle(sourceList).slice(0, 5);
  }, []);

  const generateBoard = useCallback(
    (
      fixedItems = null,
      modeOverride = null,
      itemsSource = allItems,
      achSource = allAchievements,
      fixedAchievements = null
    ) => {
      const modeToUse = modeOverride ?? difficulty;
      const result = buildBoardItems(itemsSource, modeToUse, fixedItems);

      if (result.error) {
        showNotification(result.error, 5000);
        return false;
      }

      setBoardItems(result.items);
      setCompletedIndices(new Set());
      setWinIndices(new Set());
      setBoardKey((prev) => prev + 1);

      if (Array.isArray(fixedAchievements) && fixedAchievements.length > 0 && Array.isArray(achSource)) {
        const matched = fixedAchievements
          .map((achName) => achSource.find((a) => a.name === achName))
          .filter(Boolean);
        setSelectedAchievements(matched.length > 0 ? matched : pickRandomAchievements(achSource));
      } else if (!fixedItems && modeToUse === 'normal') {
        setSelectedAchievements(pickRandomAchievements(achSource));
      }

      return true;
    },
    [allAchievements, allItems, difficulty, pickRandomAchievements, showNotification]
  );

  useEffect(() => {
    let isMounted = true;

    async function initData() {
      let loadedItems = [];
      let loadedAchievements = [];

      try {
        const response = await fetch('baza.json');
        if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
        const data = await response.json();
        loadedItems = data.map((item) => ({
          name: item.name.replace(/_/g, ' '),
          image: item.image,
          weight: item.difficulty,
        }));
      } catch (error) {
        console.error('Nie udało się wczytać przedmiotów z baza.json:', error);
        if (isMounted) {
          showNotification('Błąd krytyczny: Nie udało się wczytać przedmiotów z bazy!', 5000);
        }
      }

      try {
        const achResponse = await fetch('achievements.json');
        if (!achResponse.ok) throw new Error('Brak pliku JSON');
        loadedAchievements = await achResponse.json();
      } catch (error) {
        console.error('Błąd osiągnięć:', error);
      }

      if (!isMounted) return;

      setAllItems(loadedItems);
      setAllAchievements(loadedAchievements);
      setSelectedAchievements(pickRandomAchievements(loadedAchievements));

      const initialResult = buildBoardItems(loadedItems, 'normal', null);
      if (initialResult.error) {
        showNotification(initialResult.error, 5000);
      } else {
        setBoardItems(initialResult.items);
        setBoardKey((prev) => prev + 1);
      }
    }

    initData();

    return () => {
      isMounted = false;
      clearTimeout(notificationTimerRef.current);
      clearTimeout(closePopupTimerRef.current);
      clearTimeout(hideToastTimerRef.current);
    };
  }, [pickRandomAchievements, showNotification]);

  const handleDifficultyChange = (e) => {
    const nextMode = e.target.value;
    setDifficulty(nextMode);
    generateBoard(null, nextMode);
  };

  const handleToggleCell = (index) => {
    setCompletedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      setWinIndices(calculateWinIndices(next, BOARD_SIZE));
      return next;
    });
  };

  const handleExportBoard = () => {
    if (boardItems.length !== BOARD_SIZE * BOARD_SIZE) {
      showNotification('Plansza jest pusta lub niekompletna. Wygeneruj nową.', 3000);
      return;
    }

    const payload = {
      board: boardItems.map((item) => item.name),
      achievements: selectedAchievements.map((ach) => ach.name),
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));

    clearTimeout(closePopupTimerRef.current);
    setExportCode(encoded);
    setIsExportModalClosing(false);
    setIsExportModalOpen(true);
  };

  const closeExportModal = () => {
    setIsExportModalOpen(false);
    setIsExportModalClosing(true);
    clearTimeout(closePopupTimerRef.current);
    closePopupTimerRef.current = setTimeout(() => {
      setIsExportModalClosing(false);
    }, 400);
  };

  const handleCopyAndClose = () => {
    if (!exportCode) {
      showNotification('Brak kodu do skopiowania!', 2000);
      return;
    }

    const fallbackCopy = () => {
      const textarea = document.createElement('textarea');
      textarea.value = exportCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showNotification('Kod planszy skopiowany do schowka!');
      closeExportModal();
    };

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(exportCode)
        .then(() => {
          showNotification('Kod planszy został skopiowany do schowka!');
          closeExportModal();
        })
        .catch((err) => {
          console.error('Błąd podczas kopiowania do schowka:', err);
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  };

  const handleImportBoard = (encoded) => {
    const trimmed = encoded.trim();
    if (!trimmed) {
      showNotification('Wklej kod planszy do pola tekstowego, aby zaimportować.', 3000);
      return false;
    }

    try {
      const jsonString = decodeURIComponent(escape(atob(trimmed)));
      const parsed = JSON.parse(jsonString);

      if (
        parsed &&
        !Array.isArray(parsed) &&
        Array.isArray(parsed.board) &&
        parsed.board.length === BOARD_SIZE * BOARD_SIZE
      ) {
        const success = generateBoard(
          parsed.board,
          null,
          allItems,
          allAchievements,
          Array.isArray(parsed.achievements) ? parsed.achievements : null
        );
        if (success) {
          showNotification('Plansza i osiągnięcia zostały pomyślnie zaimportowane!');
          return true;
        }
        return false;
      }


      if (Array.isArray(parsed) && parsed.length === BOARD_SIZE * BOARD_SIZE) {
        const success = generateBoard(parsed);
        if (success) {
          showNotification('Plansza została pomyślnie zaimportowana!');
          return true;
        }
        return false;
      }

      showNotification('Błąd: Nieprawidłowy format kodu planszy.', 4000);
      return false;
    } catch (e) {
      console.error('Import Error:', e);
      showNotification('Błąd: Kod planszy jest uszkodzony lub nieprawidłowy.', 4000);
      return false;
    }
  };

  const handleDownloadBoardAsImage = () => {
    const boardEl = boardRef.current;
    if (!boardEl) return;

    const cells = boardEl.querySelectorAll('.item-cell');
    cells.forEach((cell) => {
      cell.style.opacity = '1';
      cell.style.transform = 'none';
      cell.style.transition = 'none';
      cell.classList.remove('animate-in');
    });

    html2canvas(boardEl, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#36393F',
    })
      .then((canvas) => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'minecraft_bingo_board.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        cells.forEach((cell) => {
          cell.style.opacity = '';
          cell.style.transform = '';
          cell.style.transition = '';
          cell.classList.add('animate-in');
        });

        showNotification('Plansza została pobrana jako obraz PNG.');
      })
      .catch((error) => {
        console.error('Błąd podczas generowania obrazu:', error);
        cells.forEach((cell) => {
          cell.style.opacity = '';
          cell.style.transform = '';
          cell.style.transition = '';
          cell.classList.add('animate-in');
        });
        showNotification('Wystąpił błąd podczas pobierania planszy jako obraz.', 4000);
      });
  };

  const achievementsKey = selectedAchievements.map((ach) => ach.name).join('|') || 'empty';

  return (
    <div className="bingo-app-wrapper">
      <div className="container text-center d-flex flex-column align-items-center justify-content-center py-4">
        <h1 className="bingo-title mb-2">Minecraft Bingo</h1>

        <div className="difficulty-select-group my-3 d-flex align-items-center gap-2">
          <label htmlFor="difficulty-select" className="m-0">
            Wybierz poziom trudności:
          </label>
          <select
            id="difficulty-select"
            className="form-select custom-select"
            value={difficulty}
            onChange={handleDifficultyChange}
          >
            <option value="normal">Normalny</option>
            <option value="easy">Łatwy</option>
          </select>
        </div>

        <BingoBoard
          boardRef={boardRef}
          items={boardItems}
          completedIndices={completedIndices}
          winIndices={winIndices}
          onToggleCell={handleToggleCell}
          boardKey={boardKey}
        />

        <div className="button-group mt-4">
          <button type="button" className="btn-discord" onClick={() => generateBoard()}>
            Generuj nową planszę
          </button>
          <button
            type="button"
            id="download-board-btn"
            className="btn-discord"
            onClick={handleDownloadBoardAsImage}
          >
            Pobierz planszę jako obraz
          </button>
        </div>

        <AchievementsBar key={achievementsKey} achievements={selectedAchievements} />

        <ImportExportBox onExport={handleExportBoard} onImport={handleImportBoard} />

        <button
          type="button"
          className="btn btn-link other-mode-link mt-3 text-decoration-none"
          onClick={() => setIsDrawModalOpen(true)}
        >
          Przejdź do Generatora Drużyn
        </button>
      </div>

      <ExportCodeModal
        isOpen={isExportModalOpen}
        isClosing={isExportModalClosing}
        code={exportCode}
        onClose={closeExportModal}
        onCopy={handleCopyAndClose}
      />

      <NotificationToast
        message={toast.message}
        visible={toast.visible}
        hiding={toast.hiding}
      />

      <TeamDrawModal isOpen={isDrawModalOpen} onClose={() => setIsDrawModalOpen(false)} />
    </div>
  );
}

export default App;