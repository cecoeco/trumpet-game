import { useState, useEffect } from "react";

export function App() {
  const [valveState, setValveState] = useState({
    i: false,
    o: false,
    p: false,
    partialIndex: 0,
    airflow: false,
  });

  const partialsMap: { [key: string]: string[] } = {
    "000": ["C4", "G4", "C5", "E5", "G5", "C6"], // 0 steps
    "010": ["B3", "Gb4", "B4", "Eb5", "Gb5", "B5"], // 0.5 steps
    "100": ["Bb3", "F4", "Bb4", "D5", "F5", "Bb5"], // 1 step
    "001": ["A3", "E4", "A4", "Db5", "E5", "A5"], // 1.5 steps
    "110": ["A3", "E4", "A4", "Db5", "E5", "A5"], // 1.5 steps
    "011": ["Ab3", "Eb4", "Ab4", "C5", "Eb5", "Ab5"], // 2 steps
    "101": ["G3", "D4", "G4", "B5", "D5", "G5"], // 2.5 steps
    "111": ["Gb3", "Db4", "Gb4", "Bb5", "Db5", "Gb5"], // 3 steps
  };

  const audioFiles: { [key: string]: string } = {
    C6: "/src/assets/trumpet/C6.mp3",
    B5: "/src/assets/trumpet/B5.mp3",
    Bb5: "/src/assets/trumpet/Bb5.mp3",
    A5: "/src/assets/trumpet/A5.mp3",
    Ab5: "/src/assets/trumpet/Ab5.mp3",
    G5: "/src/assets/trumpet/G5.mp3",
    Gb5: "/src/assets/trumpet/Gb5.mp3",
    F5: "/src/assets/trumpet/F5.mp3",
    E5: "/src/assets/trumpet/E5.mp3",
    Eb5: "/src/assets/trumpet/Eb5.mp3",
    D5: "/src/assets/trumpet/D5.mp3",
    Db5: "/src/assets/trumpet/Db5.mp3",
    C5: "/src/assets/trumpet/C5.mp3",
    B4: "/src/assets/trumpet/B4.mp3",
    Bb4: "/src/assets/trumpet/Bb4.mp3",
    A4: "/src/assets/trumpet/A4.mp3",
    Ab4: "/src/assets/trumpet/Ab4.mp3",
    G4: "/src/assets/trumpet/G4.mp3",
    Gb4: "/src/assets/trumpet/Gb4.mp3",
    F4: "/src/assets/trumpet/F4.mp3",
    E4: "/src/assets/trumpet/E4.mp3",
    Eb4: "/src/assets/trumpet/Eb4.mp3",
    D4: "/src/assets/trumpet/D4.mp3",
    Db4: "/src/assets/trumpet/Db4.mp3",
    C4: "/src/assets/trumpet/C4.mp3",
    B3: "/src/assets/trumpet/B3.mp3",
    Bb3: "/src/assets/trumpet/Bb3.mp3",
    A3: "/src/assets/trumpet/A3.mp3",
    Ab3: "/src/assets/trumpet/Ab3.mp3",
    G3: "/src/assets/trumpet/G3.mp3",
    Gb3: "/src/assets/trumpet/Gb3.mp3",
  };

  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const getNote = () => {
    const { i, o, p, partialIndex } = valveState;
    const valveCombination = `${i ? 1 : 0}${o ? 1 : 0}${p ? 1 : 0}`;
    const partials = partialsMap[valveCombination] || [];
    const clampedIndex = Math.min(Math.max(partialIndex, 0), partials.length - 1);
    return partials[clampedIndex];
  };

  const playNote = (note: string) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audioFile = audioFiles[note];
    if (!audioFile) {
      console.error(`No audio file found for note: ${note}`);
      return;
    }

    const audio = new Audio(audioFile);
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
        setValveState((prev) => {
          const newIndex = Math.min(
            prev.partialIndex + 1,
            partialsMap[`${prev.i ? 1 : 0}${prev.o ? 1 : 0}${prev.p ? 1 : 0}`].length - 1
          );
          return { ...prev, partialIndex: newIndex };
        });
      }

      if (e.key === "s") {
        setValveState((prev) => {
          const newIndex = Math.max(prev.partialIndex - 1, 0);
          return { ...prev, partialIndex: newIndex };
        });
      }

      if (shouldAnimate) {
        const note = getNote();
        if (note && valveState.airflow) {
          playNote(note);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setValveState((prev) => ({ ...prev, airflow: false }));
        stopNote();
      }

      if (e.key === "i") {
        setValveState((prev) => ({ ...prev, i: false }));
      } else if (e.key === "o") {
        setValveState((prev) => ({ ...prev, o: false }));
      } else if (e.key === "p") {
        setValveState((prev) => ({ ...prev, p: false }));
      }
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
        <div className="control">
          Press <strong>I</strong> for 1st Valve
        </div>
        <div className="control">
          Press <strong>O</strong> for 2nd Valve
        </div>
        <div className="control">
          Press <strong>P</strong> for 3rd Valve
        </div>
        <div className="control">
          Press <strong>W</strong> to raise partial
        </div>
        <div className="control">
          Press <strong>S</strong> to lower partial
        </div>
        <div className="control">
          Press <strong>Space</strong> for airflow
        </div>
      </div>

      <div className="valves">
        <div id="valve1" className={`valve ${valveState.i ? "pressed" : ""}`}>
          I
        </div>
        <div id="valve2" className={`valve ${valveState.o ? "pressed" : ""}`}>
          O
        </div>
        <div id="valve3" className={`valve ${valveState.p ? "pressed" : ""}`}>
          P
        </div>
      </div>
    </div>
  );
}

export default App;