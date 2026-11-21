const NotificationToast = ({ message, visible, hiding }) => {
  if (!visible && !hiding) return null;

  return (
    <div
      id="notification-popup"
      className={`popup-container notification-popup ${hiding ? 'hide' : 'show'}`}
    >
      <div className="notification-content">
        <p id="notification-message" className="m-0">
          {message}
        </p>
      </div>
    </div>
  );
}

export default NotificationToast;