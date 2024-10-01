import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./assets/stylus/index.styl";

export function App() {
  const [valveState, setValveState] = useState({
    i: false,
    o: false,
    p: false,
    partialIndex: 0,
    airflow: false,
  });

  const partialsMap: { [key: string]: string[] } = {
    "000": ["C4", "G4", "C5", "E5", "G5", "C6"],
    "010": ["B3", "Gb4", "B4", "Eb5", "Gb5", "B5"],
    "100": ["Bb3", "F4", "Bb4", "D5", "F5", "Bb5"],
    "001": ["A3", "E4", "A4", "Db5", "E5", "A5"],
    "110": ["A3", "E4", "A4", "Db5", "E5", "A5"],
    "011": ["Ab3", "Eb4", "Ab4", "C5", "Eb5", "Ab5"],
    "101": ["G3", "D4", "G4", "B5", "D5", "G5"],
    "111": ["Gb3", "Db4", "Gb4", "Bb5", "Db5", "Gb5"],
  };

  const audioFiles: { [key: string]: string } = {
    "C6": "./assets/trumpet/C6.mp3",
    "B5": "./assets/trumpet/B5.mp3",
    "Bb5": "./assets/trumpet/Bb5.mp3",
    "A5": "./assets/trumpet/A5.mp3",
    "Ab5": "./assets/trumpet/Ab5.mp3",
    "G5": "./assets/trumpet/G5.mp3",
    "Gb5": "./assets/trumpet/Gb5.mp3",
    "F5": "./assets/trumpet/F5.mp3",
    "E5": "./assets/trumpet/E5.mp3",
    "Eb5": "./assets/trumpet/Eb5.mp3",
    "D5": "./assets/trumpet/D5.mp3",
    "Db5": "./assets/trumpet/Db5.mp3",
    "C5": "./assets/trumpet/C5.mp3",
    "B4": "./assets/trumpet/B4.mp3",
    "Bb4": "./assets/trumpet/Bb4.mp3",
    "A4": "./assets/trumpet/A4.mp3",
    "Ab4": "./assets/trumpet/Ab4.mp3",
    "G4": "./assets/trumpet/G4.mp3",
    "Gb4": "./assets/trumpet/Gb4.mp3",
    "F4": "./assets/trumpet/F4.mp3",
    "E4": "./assets/trumpet/E4.mp3",
    "Eb4": "./assets/trumpet/Eb4.mp3",
    "D4": "./assets/trumpet/D4.mp3",
    "Db4": "./assets/trumpet/Db4.mp3",
    "C4": "./assets/trumpet/C4.mp3",
    "B3": "./assets/trumpet/B3.mp3",
    "Bb3": "./assets/trumpet/Bb3.mp3",
    "A3": "./assets/trumpet/A3.mp3",
    "Ab3": "./assets/trumpet/Ab3.mp3",
    "G3": "./assets/trumpet/G3.mp3",
    "Gb3": "./assets/trumpet/F#3.mp3",
  };

  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const getNote = () => {
    const { i, o, p, partialIndex } = valveState;
    const valveCombination = `${i ? 1 : 0}${o ? 1 : 0}${p ? 1 : 0}`;
    const partials = partialsMap[valveCombination] || [];
    const clampedIndex = Math.min(Math.max(partialIndex, 0), partials.length - 1);
    return partials[clampedIndex];
  };

  const playNote = (note: number) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(audioFiles[note]);
    setCurrentAudio(audio);
    audio.loop = true;
    audio.play();
  };

  const stopNote = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        if (!valveState.airflow) {
          setValveState((prev) => ({ ...prev, airflow: true }));
          const note = getNote();
          if (note) {
            playNote(note);
          }
        }
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

      if (shouldAnimate) {
        const note = getNote();
        if (note && valveState.airflow) {
          playNote(note);
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
          stopNote();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [valveState, currentAudio]);

  return (
    <div>
      <h1>Trumpet Hero 🎺</h1>
      <div className="controls">
        <div>
          Press <strong>I</strong> for 1st Valve
        </div>
        <div>
          Press <strong>O</strong> for 2nd Valve
        </div>
        <div>
          Press <strong>P</strong> for 3rd Valve
        </div>
        <div>
          Press <strong>W</strong> to raise partial
        </div>
        <div>
          Press <strong>S</strong> to lower partial
        </div>
        <div>
          Press <strong>Space</strong> for airflow
        </div>
      </div>

      <div className="valves">
        <div id="valve1" className={`valve ${valveState.i ? "pressed" : ""}`}>I</div>
        <div id="valve2" className={`valve ${valveState.o ? "pressed" : ""}`}>O</div>
        <div id="valve3" className={`valve ${valveState.p ? "pressed" : ""}`}>P</div>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root") as HTMLDivElement;
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}