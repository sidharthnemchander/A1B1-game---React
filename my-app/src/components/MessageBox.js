const MessageBox = ({ message }) => {
  if (!message) return null;
  return (
    <div id="message-box" className="show">
      {message}
    </div>
  );
};

export default MessageBox;
