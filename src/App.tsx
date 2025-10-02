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
  const [activeWalk, setActiveWalk] = useState(false);
  const [pedestrianWaiting, setPedestrianWaiting] = useState(false);
  const walkTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const blinkTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const blinkIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // When pressed:
  // If the light is Green: wait until Green finishes, then Yellow finishes, then show Red + Walk for 15 seconds.
  // If the light is Yellow: wait until Yellow finishes, then show Red + Walk for 15 seconds.
  // If the light is Red: immediately start Red + Walk for 15 seconds.

  useEffect(() => {
    if (pedestrianWaiting) {
      if (activeLight === "red") {
        startWalking();
      } else if (activeLight === "yellow") {
        const timer = setTimeout(() => {
          startWalking();
        }, lights.yellow.duration);
        return () => clearTimeout(timer);
      } else if (activeLight === "green") {
        const greenTimer = setTimeout(() => {
          setActiveLight("yellow");
        }, lights.green.duration);
        return () => {
          clearTimeout(greenTimer);
        };
      }
    } else {
      const timer = setInterval(() => {
        setActiveLight((color) => lights[color].next);
      }, lights[activeLight].duration);
      return () => clearInterval(timer);
    }
  }, [pedestrianWaiting, activeLight]);

  // for component umount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
    // return () => {
    //   if (walkTimerRef.current) {
    //     clearTimeout(walkTimerRef.current);
    //   }
    // };
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
    setActiveWalk(true);
    setActiveLight("red");

    // clear all timers from previous start walking
    clearAllTimers();

    // stop waking after 15 seconds
    walkTimerRef.current = setTimeout(() => {
      setActiveWalk(false);
      setPedestrianWaiting(false);
      setActiveLight("green");
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current);
      }
    }, 15000);

    blinkTimerRef.current = setTimeout(() => {
      startBlinking();
    }, 10000); // 10 seconds after start walking
  };

  const startBlinking = () => {
    // if blinking got called again, clear the previous interval
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
    }

    blinkIntervalRef.current = setInterval(() => {
      setActiveWalk((walk) => !walk);
    }, 500);
  };

  console.log({ activeWalk, pedestrianWaiting, activeLight });
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
        <div className={`${styles.light} ${activeWalk ? styles.active : ""}`}>
          hi
        </div>
        <button
          className={styles.button}
          onClick={() => setPedestrianWaiting(true)}
        >
          Pedestrian Button
        </button>
      </div>
    </div>
  );
}

export default App;
