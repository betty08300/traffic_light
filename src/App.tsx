import React, { useState, useEffect } from "react";
import "./App.css";
import styles from "./App.module.scss";

// Requirements
//      Traffic Light Cycle
// Red: 5 seconds
// Yellow: 2 seconds
// Green: 10 seconds
// The lights should cycle in this order: Red → Green → Yellow → Red...
// Pedestrian Button Behavior
// A "Pedestrian Button" is available for users to press at any time.
// When pressed:
// If the light is Green: wait until Green finishes, then Yellow finishes, then show Red + Walk for 15 seconds.
// If the light is Yellow: wait until Yellow finishes, then show Red + Walk for 15 seconds.
// If the light is Red: immediately start Red + Walk for 15 seconds.
// After the 15-second walk period, resume the normal light cycle.
// Optional Enhancement
// During the last 5 seconds of the walk period, the Walk light should blink to indicate time is running out.

type LightColor = "red" | "yellow" | "green";

function App() {
  const lights: Record<LightColor, { next: LightColor; duration: number }> = {
    red: { next: "green", duration: 5000 },
    green: { next: "yellow", duration: 3000 },
    yellow: { next: "red", duration: 3000 },
  };

  const [activeLight, setActiveLight] = useState<LightColor>("red");
  const [mode, setMode] = useState<"normal" | "pending" | "walking">("normal");
  const [isBlinking, setIsBlinking] = useState(false);
  const walkTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const blinkTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const blinkIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // When pressed:
  // If the light is Green: wait until Green finishes, then Yellow finishes, then show Red + Walk for 15 seconds.
  // If the light is Yellow: wait until Yellow finishes, then show Red + Walk for 15 seconds.
  // If the light is Red: immediately start Red + Walk for 15 seconds.

  useEffect(() => {
    if (mode === "walking") return;
    if (mode === "pending") {
      if (activeLight === "red") {
        startWalking();
      } else if (activeLight === "yellow") {
        const timer = setTimeout(() => {
          setActiveLight("red");
          console.log("yellow finish");
        }, lights[activeLight].duration);
        return () => {
          clearTimeout(timer);
        };
      } else if (activeLight === "green") {
        const timer = setTimeout(() => {
          setActiveLight("yellow");
        }, lights[activeLight].duration);
        return () => {
          clearTimeout(timer);
        };
      }
    } else {
      // normal light cycle
      const timer = setInterval(() => {
        setActiveLight((light) => lights[light].next);
      }, lights[activeLight].duration);

      return () => {
        clearInterval(timer);
      };
    }
  }, [mode, activeLight]);

  // for component umount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  const clearAllTimers = () => {
    // clear time out before it got called again
    if (walkTimerRef.current) {
      clearTimeout(walkTimerRef.current);
    }
    if (blinkTimerRef.current) {
      clearTimeout(blinkTimerRef.current);
    }
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
    }
  };

  const startWalking = () => {
    setMode("walking");
    setIsBlinking(false);
    clearAllTimers();

    startBlinking();

    walkTimerRef.current = setTimeout(() => {
      setMode("normal");
      setActiveLight("green");
      setIsBlinking(false);
      clearAllTimers();
    }, 10000);
  };

  const startBlinking = () => {
    blinkTimerRef.current = setTimeout(() => {
      blinkIntervalRef.current = setInterval(() => {
        setIsBlinking((b) => !b);
      }, 500);
    }, 5000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.lightContainer}>
        {Object.keys(lights).map((color) => (
          <div
            key={color}
            className={`${styles.light} ${
              activeLight === color ? styles.active : ""
            } ${styles[color as LightColor]}`}
          ></div>
        ))}
        <div
          className={`${styles.light} ${
            mode === "walking" && !isBlinking ? styles.active : ""
          }`}
        />
        <button className={styles.button} onClick={() => setMode("pending")}>
          Pedestrian Button
        </button>
      </div>
    </div>
  );
}

export default App;
