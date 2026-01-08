import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import { useState } from "react";

import "./HelpSlider.css";
import VisualizerSlide from "./VisualizerSlide";

const slides = [
  {
    row1: ["S", "T", "O", "R", "M"],
    row2: ["G", "L", "O", "B", "E"],
    events: {
      "2-2": { color: "green", add: "A" },
    },
  },

  {
    row1: ["S", "I", "G", "H", "T"],
    row2: ["G", "R", "O", "U", "P"],
    events: {
      "2-0": { color: "yellow", add: "B" },
    },
  },

  {
    row1: ["L", "O", "O", "P", "S"],
    row2: ["I", "N", "F", "R", "A"],
    events: {},
  },

  {
    row1: ["D", "I", "C", "E", "S"],
    row2: ["S", "L", "O", "W", "S"],
    events: {
      "4-0": { color: "yellow", add: "B" },
      "4-4": { color: "green", add: "A" },
    },
  },

  {
    row1: ["M", "A", "G", "M", "A"],
    row2: ["M", "A", "M", "B", "A"],
    events: {
      "0-0": { color: "green", add: "A" },
      "0-2": { color: "green", add: "B" },
      "3-0": { color: "yellow", add: "B" },
      "1-1": { color: "green", add: "A" },
      "4-1": { color: "yellow", add: "B" },
      "3-2": { color: "yellow", add: "B" },
      "1-4": { color: "yellow", add: "B" },
      "4-4": { color: "green", add: "A" },
    },
  },
];

export default function HelpSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  return (
    <div
      id="help-slider"
      style={{
        maxWidth: "800px",
        margin: "auto",
        padding: "20px",
      }}
    >
      <Splide
        options={{
          type: "slide",
          perPage: 1,
          arrows: true,
          pagination: true,
          drag: true,
          speed: 700,
        }}
        onMoved={(_, newIndex) => {
          setActiveIndex(newIndex);
          setPlaying(false);
          setRestartKey((k) => k + 1);
        }}
        aria-label="How to Play"
      >
        {slides.map((slide, index) => (
          <SplideSlide key={index}>
            <VisualizerSlide
              config={slide}
              playing={playing && index === activeIndex}
              restartSignal={restartKey}
            />
          </SplideSlide>
        ))}
      </Splide>
      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <button
          onClick={() => setPlaying((p) => !p)}
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <button
            onClick={() => setPlaying((p) => !p)}
            style={{ marginRight: "10px" }}
          >
            {playing ? "Pause" : "Play"}
          </button>

          <button
            onClick={() => {
              setPlaying(false);
              setRestartKey((k) => k + 1);
            }}
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}
