import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import React from "react";
import "./HelpSlider.css";

const HelpSlider = () => {
  const imagePaths = Array.from(
    { length: 8 },
    (_, index) => `${process.env.PUBLIC_URL}/photo${index + 1}.png`
  );

  return (
    <div
      id="image-slider"
      style={{
        display: "block",
        maxWidth: "800px",
        margin: "auto",
        padding: "20px",
      }}
    >
      <Splide
        options={{
          type: "loop",
          perPage: 1,
          autoplay: true,
          interval: 3000,
          pauseOnHover: true,
          arrows: true,
          pagination: true,
          drag: true,
          speed: 1000,
          easing: "ease",
        }}
        aria-label="Help Slider"
      >
        {imagePaths.map((path, index) => (
          <SplideSlide key={index}>
            <div className="slide-container">
              <img
                src={path}
                alt={`Slide ${index + 1}`}
                onError={(e) => (e.target.style.display = "none")}
                className="slide-image"
              />
              <div className="slide-overlay"></div>
              <div className="slide-content">
                <h2
                  style={{
                    fontFamily: "papyrus",
                    textAlign: "center",
                    color: "white",
                    marginBottom: "10px",
                  }}
                >
                  {index === 0 &&
                    "Welcome to the A1B1 game! Your goal is to GUESS THE HIDDEN WORD."}
                  {index === 1 &&
                    "If a guessed letter is in the correct position, you get an A1."}
                  {index === 2 &&
                    "If a guessed letter is in the word but the wrong position, you get a B1."}
                  {index === 3 && "If no letters match, a 0 is displayed."}
                  {index === 4 &&
                    "If a letter appears twice in your guess but once in the word, A1B1 is shown."}
                  {index === 5 &&
                    "If a letter from your guess is in the hidden word twice, you get an A1B1."}
                  {index === 6 &&
                    "You have three extra guesses to check letter positions."}
                  {index === 7 &&
                    "You get 10 normal attempts and 3 guesses. Good luck, nerd!"}
                </h2>
              </div>
            </div>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
};

export default HelpSlider;
