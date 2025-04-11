import React, { useEffect, useState, useRef } from "react";
import { RouletteTable, RouletteWheel } from "react-casino-roulette";
import "react-casino-roulette/dist/index.css";
import whiteChip from "../public/white-chip.png";
import blueChip from "../public/blue-chip.png";
import blackChip from "../public/black-chip.png";
import cyanChip from "../public/cyan-chip.png";
import { getRandomInt } from "./utills";
import { getRandomRouletteWinBet } from "./helpers";
import styles from "./Wheel.module.scss";
// Import the confetti library
import confetti from "canvas-confetti";

import axios from "axios";

const API = {
  getRandomBet: async () => {
    return getRandomRouletteWinBet();
  },
};

const chipsMap = {
  whiteChip: {
    icon: whiteChip,
    value: 1,
  },
  blueChip: {
    icon: blueChip,
    value: 10,
  },
  blackChip: {
    icon: blackChip,
    value: 100,
  },
  cyanChip: {
    icon: cyanChip,
    value: 500,
  },
};

// Audio Control Component for bottom right corner
const AudioControl = ({ isMuted, toggleMute }) => {
  return (
    <div className={styles.audioControl}>
      <button onClick={toggleMute} className={styles.audioButton}>
        {isMuted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        )}
      </button>
    </div>
  );
};

const WinPopup = ({
  winNumber,
  visible,
  onClose,
  setSpinShown,
  prizeMoney,
  isMuted,
}) => {
  const winSoundRef = useRef(null);

  useEffect(() => {
    // Create win sound element if it doesn't exist
    if (!winSoundRef.current) {
      const audio = new Audio("/win.mp3");
      audio.preload = "auto";
      winSoundRef.current = audio;
    }

    if (visible && !isMuted) {
      // Play win sound when popup becomes visible
      winSoundRef.current.currentTime = 0;
      winSoundRef.current.play().catch((error) => {
        console.error("Error playing win sound:", error);
      });

      // Create a more exciting confetti animation
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: [
          "#ff0000",
          "#00ff00",
          "#0000ff",
          "#ffff00",
          "#ff00ff",
          "#00ffff",
        ],
        startVelocity: 30,
        gravity: 0.8,
        ticks: 200,
        shapes: ["circle", "square"],
        zIndex: 1000,
      });

      // Add a second confetti burst for more effect
      setTimeout(() => {
        confetti({
          particleCount: 150,
          angle: 60,
          spread: 80,
          origin: { x: 0, y: 0.7 },
          colors: ["#ffd700", "#ff6347", "#7fffd4", "#ba55d3", "#ff69b4"],
          zIndex: 1000,
        });

        confetti({
          particleCount: 150,
          angle: 120,
          spread: 80,
          origin: { x: 1, y: 0.7 },
          colors: ["#ffd700", "#ff6347", "#7fffd4", "#ba55d3", "#ff69b4"],
          zIndex: 1000,
        });
      }, 500);
    }

    // Clean up function
    return () => {
      if (winSoundRef.current) {
        winSoundRef.current.pause();
      }
    };
  }, [visible, isMuted]);

  if (!visible) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <button
          className={styles.closeButton}
          onClick={() => {
            if (winSoundRef.current) {
              winSoundRef.current.pause();
            }
            onClose();
          }}
        >
          ×
        </button>
        <div className={styles.winMessage}>
          <div className={styles.youWin}>Your Lucky Number</div>
          <div className={styles.winNumber}>{winNumber}</div>
        </div>
        <div className={styles.winMessage}>
          <div className={styles.youWin}>Your Prize Money</div>
          <div className={styles.winNumber}>₹{prizeMoney}</div>
        </div>
        <div className={styles.youWin}>Scan & Save to avail the Prize</div>
        <div className={styles.winMessage}>
          <img
            src="/wibes_qr.png"
            style={{
              width: "200px",
              border: "1px solid #d8d8d8",
              borderRadius: "10px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Wheel = ({ setSpinShown, setIsMobileDirty }) => {
  const [isRouletteWheelSpinning, setIsRouletteWheelSpinning] = useState(false);
  const [rouletteWheelStart, setRouletteWheelStart] = useState(false);
  const [rouletteWheelBet, setRouletteWheelBet] = useState("-1");
  const [prizeMoney, setPrizeMoney] = useState(0);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const rouletteSoundRef = useRef(null);
  const carnivalSoundRef = useRef(null);

  useEffect(() => {
    // Create audio elements if they don't exist
    if (!rouletteSoundRef.current) {
      const audio = new Audio("/roulette.mp3");
      audio.preload = "auto";
      audio.loop = true;
      audio.volume = 0.8; // Full volume for roulette sound
      rouletteSoundRef.current = audio;
    }

    if (!carnivalSoundRef.current) {
      const audio = new Audio("/carnival.mp3");
      audio.preload = "auto";
      audio.loop = true;
      audio.volume = 0.6; // Lower volume for background carnival music
      carnivalSoundRef.current = audio;
    }

    // Load sound preferences from localStorage if available
    const savedMuteState = localStorage.getItem("rouletteAudioMuted");
    if (savedMuteState !== null) {
      setIsMuted(savedMuteState === "true");
    }

    // Play carnival music on component mount if not muted
    if (carnivalSoundRef.current && savedMuteState !== "true") {
      carnivalSoundRef.current.play().catch((error) => {
        console.error("Error playing carnival sound:", error);
      });
    }

    return () => {
      // Clean up audio on component unmount
      if (rouletteSoundRef.current) {
        rouletteSoundRef.current.pause();
        rouletteSoundRef.current.currentTime = 0;
      }

      if (carnivalSoundRef.current) {
        carnivalSoundRef.current.pause();
        carnivalSoundRef.current.currentTime = 0;
      }
    };
  }, []);

  // Toggle mute state and save preference
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    localStorage.setItem("rouletteAudioMuted", newMuteState.toString());

    if (newMuteState) {
      // Mute all sounds
      if (rouletteSoundRef.current) {
        rouletteSoundRef.current.pause();
      }
      if (carnivalSoundRef.current) {
        carnivalSoundRef.current.pause();
      }
    } else {
      // Unmute - resume background carnival music
      if (carnivalSoundRef.current) {
        carnivalSoundRef.current.play().catch((error) => {
          console.error("Error playing carnival sound:", error);
        });
      }

      // Resume roulette sound if wheel is spinning
      if (isRouletteWheelSpinning && rouletteSoundRef.current) {
        rouletteSoundRef.current.play().catch((error) => {
          console.error("Error playing roulette sound:", error);
        });
      }
    }
  };

  useEffect(() => {
    const backgroundIndex = getRandomInt(0, 5);
    const backgroundClass = `bg-${backgroundIndex}`;
    document.body.classList.add(backgroundClass);
    return () => {
      document.body.classList.remove(backgroundClass);
    };
  }, []);

  useEffect(() => {
    if (rouletteWheelBet === "-1" || rouletteWheelStart === true) {
      return;
    }
    setRouletteWheelStart(true);
  }, [rouletteWheelBet, rouletteWheelStart]);

  useEffect(() => {
    if (isRouletteWheelSpinning === false) {
      return;
    }
    const prepare = async () => {
      const bet = await API.getRandomBet();
      console.info("gotta win bet", bet);
      setRouletteWheelStart(false);
      setRouletteWheelBet(bet);
    };
    prepare();
  }, [isRouletteWheelSpinning]);

  // Control roulette sound based on wheel spinning state
  // Carnival music now continues playing regardless
  useEffect(() => {
    if (isRouletteWheelSpinning && !isMuted) {
      // Start roulette sound when spinning begins
      if (rouletteSoundRef.current) {
        rouletteSoundRef.current.currentTime = 0;
        rouletteSoundRef.current.play().catch((error) => {
          console.error("Error playing roulette sound:", error);
        });
      }
    } else if (!isRouletteWheelSpinning && rouletteSoundRef.current) {
      // Stop roulette sound when spin ends
      rouletteSoundRef.current.pause();
      rouletteSoundRef.current.currentTime = 0;
    }
  }, [isRouletteWheelSpinning, isMuted]);

  // Ensure carnival music plays continuously when not muted
  useEffect(() => {
    if (!isMuted && carnivalSoundRef.current) {
      // Check if carnival music is already playing
      if (carnivalSoundRef.current.paused) {
        carnivalSoundRef.current.play().catch((error) => {
          console.error("Error playing carnival sound:", error);
        });
      }
    }
  }, [isMuted, showWinPopup, isRouletteWheelSpinning]);

  // Add this new useEffect to handle carnival sound when win popup appears
  useEffect(() => {
    if (carnivalSoundRef.current) {
      if (showWinPopup) {
        // Pause carnival sound when win popup appears
        carnivalSoundRef.current.pause();
      } else if (!isMuted && !showWinPopup) {
        // Resume carnival sound when popup is closed (if not muted)
        carnivalSoundRef.current.play().catch((error) => {
          console.error("Error playing carnival sound:", error);
        });
      }
    }
  }, [showWinPopup, isMuted]);

  const handleDoSpin = () => {
    setIsRouletteWheelSpinning(true);
    setShowWinPopup(false); // Hide popup when starting a new spin
  };

  const handleEndSpin = async () => {
    try {
      setIsRouletteWheelSpinning(false);
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/number`,
        {
          number: rouletteWheelBet !== "-1" ? rouletteWheelBet : "0",
        },
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPrizeMoney(data.data.priceMoney);
      setShowWinPopup(true); // Show popup when spin ends
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const closeWinPopup = () => {
    setShowWinPopup(false);
    setSpinShown(false);
    setIsMobileDirty(false);
  };

  return (
    <div>
      <div className={styles.wheelCon}>
        <RouletteWheel
          start={rouletteWheelStart}
          winningBet={rouletteWheelBet}
          onSpinningEnd={handleEndSpin}
        />
        <div className={styles.btnImgDiv}>
          <img
            type="button"
            disabled={isRouletteWheelSpinning}
            onClick={handleDoSpin}
            src="/btn.png"
            alt="btn"
            className={styles.btnImg}
          />
        </div>
      </div>

      <WinPopup
        winNumber={rouletteWheelBet !== "-1" ? rouletteWheelBet : "0"}
        visible={showWinPopup}
        onClose={closeWinPopup}
        prizeMoney={prizeMoney}
        isMuted={isMuted}
      />

      {/* Audio Control Button */}
      <AudioControl isMuted={isMuted} toggleMute={toggleMute} />
    </div>
  );
};

export default Wheel;
