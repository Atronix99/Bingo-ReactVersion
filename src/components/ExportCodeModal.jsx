const ExportCodeModal = ({ isOpen, isClosing, code, onClose, onCopy }) => {
  if (!isOpen && !isClosing) return null;

  return (
    <div
      id="custom-popup"
      className={`popup-container main-popup ${isClosing ? 'hide' : 'show'}`}
      onClick={(e) => {
        if (e.target.id === 'custom-popup') onClose();
      }}
    >
      <div className="popup-content">
        <span className="close-btn" onClick={onClose} aria-label="Zamknij">
          &times;
        </span>
        <h3>Twój kod planszy:</h3>
        <p id="popup-board-code">{code}</p>
        <button type="button" className="btn-success-custom" onClick={onCopy}>
          Kopiuj i Zamknij
        </button>
      </div>
    </div>
  );
}

export default ExportCodeModal;