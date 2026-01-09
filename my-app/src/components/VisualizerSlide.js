import { useEffect, useMemo, useState } from "react";

function generateSteps(row1, row2, events) {
  const steps = [];

  for (let r2 = 0; r2 < row2.length; r2++) {
    for (let r1 = 0; r1 < row1.length; r1++) {
      const key = `${r1}-${r2}`;

      if (events[key]) {
        steps.push({
          r1,
          r2,
          color: events[key].color,
          add: events[key].add,
        });
      } else {
        steps.push({
          r1,
          r2,
          color: "gray",
        });
      }
    }
  }

  return steps;
}

export default function VisualizerSlide({ config, playing, restartSignal }) {
  const { row1, row2, events } = config;

  const steps = useMemo(
    () => generateSteps(row1, row2, events),
    [row1, row2, events]
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [aCount, setACount] = useState(0);
  const [bCount, setBCount] = useState(0);

  useEffect(() => {
    setStepIndex(0);
    setACount(0);
    setBCount(0);
  }, [restartSignal]);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length) return;

    const timer = setTimeout(() => {
      const step = steps[stepIndex];

      if (step.add === "A") setACount((a) => a + 1);
      if (step.add === "B") setBCount((b) => b + 1);

      setStepIndex((i) => i + 1);
    }, 600);

    return () => clearTimeout(timer);
  }, [stepIndex, playing, steps]);

  const activeStep = steps[stepIndex - 1];

  return (
    <div className="visualizer">
      {/* ROW 1 */}
      <div className="row">
        {row1.map((letter, i) => {
          const isActive = activeStep && activeStep.r1 === i;

          const color = isActive ? activeStep.color : "default";

          return (
            <div key={i} className={`tile ${color}`}>
              {letter}
            </div>
          );
        })}
      </div>

      {/* ROW 2 */}
      <div className="row">
        {row2.map((letter, i) => {
          const isActive = activeStep && activeStep.r2 === i;

          const color = isActive ? activeStep.color : "default";

          return (
            <div key={i} className={`tile ${color}`}>
              {letter}
            </div>
          );
        })}
      </div>

      {/* HINT BOX */}
      <div className="hint-box">
        {stepIndex < steps.length ? (
          <>
            A{aCount} B{bCount}
          </>
        ) : (
          <>
            Final Hint: A{aCount} B{bCount}
          </>
        )}
      </div>
      <p className="text-hint">
        <strong>Row 1 :</strong> Hidden word <br /> <strong>Row 2 :</strong>{" "}
        User Word
      </p>
    </div>
  );
}
