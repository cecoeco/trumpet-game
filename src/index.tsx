import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import * as Tone from "tone";

import "./index.styl";

export function App() {
  const [valveState, setValveState] = useState({
    i: false,
    o: false,
    p: false,
    partialIndex: 0,
    airflow: false,
  });

  const partialsMap: { [key: string]: number[] } = {
    "000": [60, 67, 72, 76, 79],
    "100": [59, 66, 71, 75, 78],
    "010": [57, 64, 69, 73, 76],
    "110": [55, 62, 67, 71, 74],
    "101": [53, 60, 65, 69, 72],
    "011": [52, 59, 64, 68, 71],
    "111": [50, 57, 62, 66, 69],
  };

  const synth = new Tone.Synth().toDestination();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Start the Tone.js audio context on a key press
      if (e.code === "Space" && Tone.context.state !== "running") {
        Tone.start();
      }

      let shouldAnimate = false;

      if (e.key === "i") {
        setValveState((prev) => ({ ...prev, i: true }));
        shouldAnimate = true;
      } else if (e.key === "o") {
        setValveState((prev) => ({ ...prev, o: true }));
        shouldAnimate = true;
      } else if (e.key === "p") {
        setValveState((prev) => ({ ...prev, p: true }));
        shouldAnimate = true;
      }

      if (e.key === "w") {
        setValveState((prev) => ({ ...prev, partialIndex: prev.partialIndex + 1 }));
      }

      if (e.key === "s") {
        setValveState((prev) => ({ ...prev, partialIndex: prev.partialIndex - 1 }));
      }

      if (e.key === " ") {
        if (!valveState.airflow) {
          setValveState((prev) => ({ ...prev, airflow: true }));
          const note = getNote();
          if (note) {
            playNote(note); // Play note when space is pressed
          }
        }
      }

      if (shouldAnimate) {
        const note = getNote();
        if (note && valveState.airflow) {
          playNote(note); // Play note when valves are activated and airflow is on
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "i") {
        setValveState((prev) => ({ ...prev, i: false }));
      } else if (e.key === "o") {
        setValveState((prev) => ({ ...prev, o: false }));
      } else if (e.key === "p") {
        setValveState((prev) => ({ ...prev, p: false }));
      }

      if (e.key === " ") {
        if (valveState.airflow) {
          setValveState((prev) => ({ ...prev, airflow: false }));
          stopNote(); // Stop the note when releasing the space bar
        }
      }
    };

    const getNote = () => {
      const { i, o, p, partialIndex } = valveState;
      const valveCombination = `${i ? 1 : 0}${o ? 1 : 0}${p ? 1 : 0}`;
      const partials = partialsMap[valveCombination] || [];
      const clampedIndex = Math.min(Math.max(partialIndex, 0), partials.length - 1);

      return partials[clampedIndex];
    };

    const playNote = (note: number) => {
      synth.triggerAttack(Tone.Frequency(note, "midi"));
    };

    const stopNote = () => {
      synth.triggerRelease();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [valveState]);

  return (
    <div>
      <h1>Trumpet Hero 🎺</h1>
      <div className="controls">
        <div>Press <strong>I</strong> for 1st Valve</div>
        <div>Press <strong>O</strong> for 2nd Valve</div>
        <div>Press <strong>P</strong> for 3rd Valve</div>
        <div>Press <strong>W</strong> to raise partial</div>
        <div>Press <strong>S</strong> to lower partial</div>
        <div>Press <strong>Space</strong> for airflow</div>
      </div>

      <div className="valves">
        <div id="valve1" className={`valve ${valveState.i ? "pressed" : ""}`}></div>
        <div id="valve2" className={`valve ${valveState.o ? "pressed" : ""}`}></div>
        <div id="valve3" className={`valve ${valveState.p ? "pressed" : ""}`}></div>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root") as HTMLDivElement;

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
