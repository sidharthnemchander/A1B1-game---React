const ErrorCircles = ({ errorCount }) => {
  return (
    <div
      className="error-circles-container"
      style={{
        display: "flex",
        justifyContent: "flex-end",
        position: "absolute",
        top: "10px",
        right: "-250px",
      }}
    >
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className={`error-circle ${index < errorCount ? "error-active" : ""}`}
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: index < errorCount ? "red" : "lightgray",
            margin: "0 5px",
            transition: "background-color 0.3s ease",
          }}
        />
      ))}
    </div>
  );
};

export default ErrorCircles;
