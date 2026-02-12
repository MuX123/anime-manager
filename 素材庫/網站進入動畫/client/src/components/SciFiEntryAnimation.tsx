import { useEffect, useRef, useState } from "react";

/**
 * Sci-Fi Entry Animation Component
 * 
 * Design: Cyberpunk Mechanicism
 * - Dual gate opening with mechanical details
 * - Neon cyan (#00f5ff) and green (#00ff88) accents
 * - Hydraulic arms, circuit boards, warning stripes
 * - Rotating logo with pulsing core
 * - Progress bar with loading messages
 * - Scan lines for authenticity
 */

const statusMessages = [
  "Establishing connection...",
  "Loading core modules...",
  "Initializing neural network...",
  "Calibrating sensors...",
  "Syncing quantum processors...",
  "Decrypting data streams...",
  "Activating defense protocols...",
  "Preparing holographic display...",
  "Finalizing boot sequence...",
  "System ready. Opening gates...",
];

export default function SciFiEntryAnimation() {
  const gateLeftRef = useRef<HTMLDivElement>(null);
  const gateRightRef = useRef<HTMLDivElement>(null);
  const centerConsoleRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressPercentRef = useRef<HTMLSpanElement>(null);
  const loadingStatusRef = useRef<HTMLDivElement>(null);

  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    startLoading();
  }, []);

  const startLoading = () => {
    let progress = 0;
    const duration = 5000; // 5 seconds total
    const interval = 50; // Update every 50ms
    const increment = 100 / (duration / interval);

    const loadingInterval = setInterval(() => {
      progress += increment + Math.random() * 0.5;

      if (progress >= 100) {
        progress = 100;
        clearInterval(loadingInterval);

        // Start opening animation
        setTimeout(openGates, 500);
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress}%`;
      }
      if (progressPercentRef.current) {
        progressPercentRef.current.textContent = `${Math.floor(progress)}`;
      }

      // Update status message
      const messageIndex = Math.min(
        Math.floor(progress / 10),
        statusMessages.length - 1
      );
      if (loadingStatusRef.current) {
        loadingStatusRef.current.textContent = statusMessages[messageIndex];
      }
    }, interval);
  };

  const openGates = () => {
    setIsOpening(true);

    // Fade out center console
    if (centerConsoleRef.current) {
      centerConsoleRef.current.style.transition = "opacity 0.5s ease";
      centerConsoleRef.current.style.opacity = "0";
    }

    // Open gates after console fades
    setTimeout(() => {
      if (gateLeftRef.current) {
        gateLeftRef.current.style.transform = "translateX(-100%)";
        gateLeftRef.current.style.transition = "transform 1.5s cubic-bezier(0.645, 0.045, 0.355, 1)";
      }
      if (gateRightRef.current) {
        gateRightRef.current.style.transform = "translateX(100%)";
        gateRightRef.current.style.transition = "transform 1.5s cubic-bezier(0.645, 0.045, 0.355, 1)";
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0a0a0f] flex flex-col items-center justify-center overflow-hidden">
      {/* Left Gate */}
      <div
        ref={gateLeftRef}
        className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-[#1a1a2e] via-[#0f0f1a] to-[#1a1a2e] border-r-[3px] border-[#00f5ff] overflow-hidden"
        style={{
          boxShadow: "inset -20px 0 60px rgba(0, 245, 255, 0.1)",
        }}
      >
        {/* Gate Pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(0, 245, 255, 0.1) 50px, rgba(0, 245, 255, 0.1) 51px),
              repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0, 245, 255, 0.1) 50px, rgba(0, 245, 255, 0.1) 51px)
            `,
          }}
        />

        {/* Mechanical Details */}
        <div
          className="absolute top-[10%] right-[20px] w-[60px] h-[120px] bg-gradient-to-b from-[#2a2a4a] to-[#1a1a2e] border border-[#00f5ff]"
          style={{ clipPath: "polygon(0 0, 100% 10%, 100% 90%, 0 100%)" }}
        />
        <div className="absolute top-[40%] right-[30px] w-[80px] h-[80px] bg-gradient-to-b from-[#2a2a4a] to-[#1a1a2e] border border-[#00f5ff] rounded-full" />
        <div
          className="absolute bottom-[15%] right-[15px] w-[100px] h-[60px] bg-gradient-to-b from-[#2a2a4a] to-[#1a1a2e] border border-[#00f5ff]"
          style={{ clipPath: "polygon(10% 0, 90% 0, 100% 100%, 0 100%)" }}
        />

        {/* Hydraulic Arm */}
        <div
          className="absolute top-1/2 right-[5px] w-[40px] h-[200px] bg-gradient-to-r from-[#3a3a5a] via-[#5a5a7a] to-[#3a3a5a] border-2 border-[#00f5ff] rounded"
          style={{
            transform: "translateY(-50%)",
            animation: "hydraulicPulse 2s ease-in-out infinite",
          }}
        >
          <div
            className="absolute top-[10%] left-1/2 w-[20px] h-[80%] bg-gradient-to-b from-[#00f5ff] to-[#0080ff] rounded"
            style={{
              transform: "translateX(-50%)",
              animation: "hydraulicPulse 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Circuit Board */}
        <div
          className="absolute top-1/2 right-[40px] w-[80px] h-[120px] border-2 border-[#00ff88] rounded"
          style={{
            transform: "translateY(-50%)",
            background: "linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 100, 80, 0.05) 100%)",
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(0, 255, 136, 0.3) 15px, rgba(0, 255, 136, 0.3) 16px),
              repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0, 255, 136, 0.3) 15px, rgba(0, 255, 136, 0.3) 16px)
            `,
          }}
        >
          <div
            className="absolute inset-[2px] bg-gradient-to-b from-[#00ff88] to-[rgba(0, 255, 136, 0.5)] rounded"
            style={{
              animation: "energyCharge 3s ease-in-out infinite",
              clipPath: "inset(100% 0 0 0)",
              boxShadow: "0 0 15px rgba(0, 255, 136, 0.3)",
            }}
          />
        </div>

        {/* Circuit Node */}
        <div
          className="absolute top-[25%] right-[45px] w-[12px] h-[12px] bg-gradient-to-b from-[#00ff88] to-[#00aa44] rounded-full"
          style={{
            boxShadow: "0 0 15px #00ff88, inset 0 0 5px rgba(0, 255, 255, 0.5)",
            animation: "nodePulse 2s ease-in-out infinite",
          }}
        />

        {/* Signal Line */}
        <div
          className="absolute top-[45%] right-[35px] h-[2px] w-[50px]"
          style={{
            background: "linear-gradient(90deg, transparent, #00ff88, transparent)",
            opacity: 0.6,
            animation: "signalFlow 2s ease-in-out infinite",
          }}
        />

        {/* Digital Display */}
        <div
          className="absolute top-[70%] right-[45px] w-[50px] px-[5px] py-[5px] bg-[rgba(0, 255, 136, 0.1)] border border-[#00ff88] rounded text-[8px] text-[#00ff88] tracking-[1px] font-mono"
          style={{
            textShadow: "0 0 10px rgba(0, 255, 136, 0.8)",
            animation: "displayFlicker 3s ease-in-out infinite",
          }}
        >
          PWR.OK
        </div>


      </div>

      {/* Right Gate */}
      <div
        ref={gateRightRef}
        className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-[#1a1a2e] via-[#0f0f1a] to-[#1a1a2e] border-l-[3px] border-[#00f5ff] overflow-hidden"
        style={{
          boxShadow: "inset 20px 0 60px rgba(0, 245, 255, 0.1)",
        }}
      >
        {/* Gate Pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(0, 245, 255, 0.1) 50px, rgba(0, 245, 255, 0.1) 51px),
              repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0, 245, 255, 0.1) 50px, rgba(0, 245, 255, 0.1) 51px)
            `,
          }}
        />

        {/* Mechanical Details */}
        <div
          className="absolute top-[10%] left-[20px] w-[60px] h-[120px] bg-gradient-to-b from-[#2a2a4a] to-[#1a1a2e] border border-[#00f5ff]"
          style={{ clipPath: "polygon(0 10%, 100% 0, 100% 100%, 0 90%)" }}
        />
        <div className="absolute top-[40%] left-[30px] w-[80px] h-[80px] bg-gradient-to-b from-[#2a2a4a] to-[#1a1a2e] border border-[#00f5ff] rounded-full" />
        <div
          className="absolute bottom-[15%] left-[15px] w-[100px] h-[60px] bg-gradient-to-b from-[#2a2a4a] to-[#1a1a2e] border border-[#00f5ff]"
          style={{ clipPath: "polygon(0 0, 90% 0, 100% 100%, 10% 100%)" }}
        />

        {/* Hydraulic Arm */}
        <div
          className="absolute top-1/2 left-[5px] w-[40px] h-[200px] bg-gradient-to-l from-[#3a3a5a] via-[#5a5a7a] to-[#3a3a5a] border-2 border-[#00f5ff] rounded"
          style={{
            transform: "translateY(-50%)",
            animation: "hydraulicPulse 2s ease-in-out infinite",
          }}
        >
          <div
            className="absolute top-[10%] left-1/2 w-[20px] h-[80%] bg-gradient-to-b from-[#00f5ff] to-[#0080ff] rounded"
            style={{
              transform: "translateX(-50%)",
              animation: "hydraulicPulse 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Circuit Board */}
        <div
          className="absolute top-1/2 left-[40px] w-[80px] h-[120px] border-2 border-[#00ff88] rounded"
          style={{
            transform: "translateY(-50%)",
            background: "linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 100, 80, 0.05) 100%)",
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(0, 255, 136, 0.3) 15px, rgba(0, 255, 136, 0.3) 16px),
              repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0, 255, 136, 0.3) 15px, rgba(0, 255, 136, 0.3) 16px)
            `,
          }}
        >
          <div
            className="absolute inset-[2px] bg-gradient-to-b from-[#00ff88] to-[rgba(0, 255, 136, 0.5)] rounded"
            style={{
              animation: "energyCharge 3s ease-in-out infinite",
              clipPath: "inset(100% 0 0 0)",
              boxShadow: "0 0 15px rgba(0, 255, 136, 0.3)",
            }}
          />
        </div>

        {/* Circuit Node */}
        <div
          className="absolute top-[25%] left-[45px] w-[12px] h-[12px] bg-gradient-to-b from-[#00ff88] to-[#00aa44] rounded-full"
          style={{
            boxShadow: "0 0 15px #00ff88, inset 0 0 5px rgba(0, 255, 255, 0.5)",
            animation: "nodePulse 2s ease-in-out infinite",
          }}
        />

        {/* Signal Line */}
        <div
          className="absolute top-[45%] left-[35px] h-[2px] w-[50px]"
          style={{
            background: "linear-gradient(90deg, transparent, #00ff88, transparent)",
            opacity: 0.6,
            animation: "signalFlow 2s ease-in-out infinite",
            transform: "scaleX(-1)",
          }}
        />

        {/* Digital Display */}
        <div
          className="absolute top-[70%] left-[45px] w-[50px] px-[5px] py-[5px] bg-[rgba(0, 255, 136, 0.1)] border border-[#00ff88] rounded text-[8px] text-[#00ff88] tracking-[1px] font-mono"
          style={{
            textShadow: "0 0 10px rgba(0, 255, 136, 0.8)",
            animation: "displayFlicker 3s ease-in-out infinite",
          }}
        >
          PWR.OK
        </div>


      </div>

      {/* Center Console */}
      <div
        ref={centerConsoleRef}
        className="absolute left-1/2 top-1/2 z-10 text-center w-[90%] max-w-[500px]"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        {/* Corner Decorations */}
        <div className="absolute top-[20px] left-[20px] w-[60px] h-[60px] border-2 border-[rgba(0, 245, 255, 0.3)]" style={{ borderRight: "none", borderBottom: "none" }} />
        <div className="absolute top-[20px] right-[20px] w-[60px] h-[60px] border-2 border-[rgba(0, 245, 255, 0.3)]" style={{ borderLeft: "none", borderBottom: "none" }} />
        <div className="absolute bottom-[20px] left-[20px] w-[60px] h-[60px] border-2 border-[rgba(0, 245, 255, 0.3)]" style={{ borderRight: "none", borderTop: "none" }} />
        <div className="absolute bottom-[20px] right-[20px] w-[60px] h-[60px] border-2 border-[rgba(0, 245, 255, 0.3)]" style={{ borderLeft: "none", borderTop: "none" }} />

        {/* Logo */}
        <div className="w-[120px] h-[120px] mx-auto mb-[30px] relative">
          {/* Outer Ring */}
          <div
            className="absolute inset-0 border-[3px] border-[#00f5ff] rounded-full"
            style={{ animation: "logoRotate 4s linear infinite" }}
          >
            <div
              className="absolute -top-[8px] left-1/2 w-[16px] h-[16px] bg-[#00f5ff] rounded-full"
              style={{
                transform: "translateX(-50%)",
                boxShadow: "0 0 20px #00f5ff",
              }}
            />
          </div>

          {/* Inner Ring */}
          <div
            className="absolute inset-[15px] border-2 border-dashed border-[rgba(0, 245, 255, 0.5)] rounded-full"
            style={{ animation: "logoRotate 3s linear infinite reverse" }}
          />

          {/* Core */}
          <div
            className="absolute inset-[30px] bg-gradient-to-b from-[#00f5ff] via-[#0080ff] to-[#1a1a2e] rounded-full flex items-center justify-center text-[24px] text-white"
            style={{
              textShadow: "0 0 20px #00f5ff",
              animation: "corePulse 2s ease-in-out infinite",
            }}
          >
            ⚡
          </div>
        </div>

        {/* Loading Title */}
        <div
          className="font-[Orbitron] text-[clamp(18px,4vw,28px)] font-bold text-[#00f5ff] uppercase tracking-[8px] mb-[10px]"
          style={{ textShadow: "0 0 30px rgba(0, 245, 255, 0.5)" }}
        >
          SYSTEM INITIALIZING
        </div>

        {/* Loading Status */}
        <div
          ref={loadingStatusRef}
          className="font-[Rajdhani] text-[clamp(12px,2.5vw,16px)] text-[rgba(0, 245, 255, 0.7)] mb-[30px] tracking-[3px] min-h-[24px]"
        >
          Establishing connection...
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-[400px] mx-auto">
          <div
            className="bg-[rgba(0, 245, 255, 0.1)] border-2 border-[#00f5ff] rounded p-[5px] relative overflow-hidden"
            style={{
              position: "relative",
            }}
          >
            {/* Left Arrow */}
            <div
              className="absolute top-1/2 w-[10px] h-[20px] bg-[#00f5ff]"
              style={{
                left: "-15px",
                transform: "translateY(-50%)",
                clipPath: "polygon(100% 0, 100% 100%, 0 50%)",
              }}
            />

            {/* Progress Bar */}
            <div
              ref={progressBarRef}
              className="h-[20px] bg-gradient-to-r from-[#0080ff] via-[#00f5ff] to-[#00ffaa] rounded w-0 relative"
              style={{
                transition: "width 0.1s ease-out",
              }}
            >
              <div
                className="absolute inset-0 rounded"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
                  animation: "progressShine 1.5s ease-in-out infinite",
                }}
              />
            </div>

            {/* Right Arrow */}
            <div
              className="absolute top-1/2 w-[10px] h-[20px] bg-[#00f5ff]"
              style={{
                right: "-15px",
                transform: "translateY(-50%)",
                clipPath: "polygon(0 0, 100% 50%, 0 100%)",
              }}
            />
          </div>

          {/* Progress Text */}
          <div
            className="font-[Orbitron] text-[14px] text-[#00f5ff] mt-[15px] tracking-[2px]"
          >
            <span ref={progressPercentRef}>0</span>% COMPLETE
          </div>
        </div>
      </div>
    </div>
  );
}
