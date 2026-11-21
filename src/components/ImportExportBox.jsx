import { useState } from 'react';

const ImportExportBox = ({ onExport, onImport }) => {
  const [codeInput, setCodeInput] = useState('');

  const handleImportClick = () => {
    const imported = onImport(codeInput);
    if (imported) {
      setCodeInput('');
    }
  };

  const handleExportClick = () => {
    setCodeInput('');
    onExport();
  };

  return (
    <div className="import-export-section mt-4 p-3 rounded-3 text-start">
      <h2 className="h5 mb-3">Udostępnianie planszy</h2>
      <textarea
        id="board-code-input"
        rows="3"
        className="form-control custom-input"
        placeholder="Wklej tutaj kod planszy, aby ją zaimportować..."
        value={codeInput}
        onChange={(e) => setCodeInput(e.target.value)}
      />
      <div className="button-group share-buttons mt-2">
        <button type="button" className="btn-discord" onClick={handleExportClick}>
          Eksportuj kod
        </button>
        <button type="button" className="btn-discord" onClick={handleImportClick}>
          Importuj kod
        </button>
      </div>
    </div>
  );
}

export default ImportExportBox;