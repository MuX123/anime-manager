/**
 * Main Content Component
 * 
 * Displayed after the sci-fi entry animation completes.
 * Continues the cyberpunk mechanicism aesthetic.
 */

export default function MainContent() {
  return (
    <div className="w-full h-full bg-background text-foreground flex flex-col items-center justify-center p-4 md:p-8">
      {/* Main Content Area */}
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-[Orbitron] text-4xl md:text-5xl font-bold text-[#00f5ff] uppercase tracking-[8px] mb-4 sci-fi-glow">
            SYSTEM ONLINE
          </h1>
          <p className="font-[Rajdhani] text-lg md:text-xl text-[#00ff88] tracking-[3px] mb-8">
            NEURAL NETWORK ACTIVATED
          </p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-[#00f5ff] via-[#00ff88] to-[#ffcc00]" />
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Section 1 */}
          <div
            className="p-6 md:p-8 border-2 border-[#00f5ff] rounded"
            style={{
              background: "linear-gradient(135deg, rgba(0, 245, 255, 0.05) 0%, rgba(0, 100, 80, 0.02) 100%)",
              boxShadow: "0 0 20px rgba(0, 245, 255, 0.2), inset 0 0 10px rgba(0, 245, 255, 0.1)",
            }}
          >
            <h2 className="font-[Orbitron] text-xl md:text-2xl font-bold text-[#00f5ff] uppercase tracking-[4px] mb-4">
              Core Systems
            </h2>
            <p className="font-[Rajdhani] text-sm md:text-base text-[rgba(0, 245, 255, 0.8)] leading-relaxed">
              All primary systems operational. Neural processors running at optimal capacity. Quantum encryption protocols active.
            </p>
          </div>

          {/* Section 2 */}
          <div
            className="p-6 md:p-8 border-2 border-[#00ff88] rounded"
            style={{
              background: "linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 100, 80, 0.02) 100%)",
              boxShadow: "0 0 20px rgba(0, 255, 136, 0.2), inset 0 0 10px rgba(0, 255, 136, 0.1)",
            }}
          >
            <h2 className="font-[Orbitron] text-xl md:text-2xl font-bold text-[#00ff88] uppercase tracking-[4px] mb-4">
              Data Streams
            </h2>
            <p className="font-[Rajdhani] text-sm md:text-base text-[rgba(0, 255, 136, 0.8)] leading-relaxed">
              Information flow normalized. Decryption matrices aligned. All channels synchronized and ready for transmission.
            </p>
          </div>
        </div>

        {/* Status Grid */}
        <div
          className="p-6 md:p-8 border-2 border-[#ffcc00] rounded mb-12"
          style={{
            background: "linear-gradient(135deg, rgba(255, 204, 0, 0.05) 0%, rgba(255, 100, 0, 0.02) 100%)",
            boxShadow: "0 0 20px rgba(255, 204, 0, 0.2), inset 0 0 10px rgba(255, 204, 0, 0.1)",
          }}
        >
          <h2 className="font-[Orbitron] text-xl md:text-2xl font-bold text-[#ffcc00] uppercase tracking-[4px] mb-6">
            System Status
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "CPU", value: "98%" },
              { label: "RAM", value: "2.8GB" },
              { label: "BANDWIDTH", value: "1.2GB/s" },
              { label: "LATENCY", value: "0.2ms" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-[rgba(0, 245, 255, 0.05)] border border-[#00f5ff] rounded text-center"
              >
                <p className="font-[Rajdhani] text-xs md:text-sm text-[rgba(0, 245, 255, 0.6)] uppercase tracking-[2px] mb-2">
                  {item.label}
                </p>
                <p className="font-[Orbitron] text-lg md:text-xl font-bold text-[#00f5ff]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="font-[Rajdhani] text-xs md:text-sm text-[rgba(0, 245, 255, 0.5)] uppercase tracking-[3px] mb-4">
            System Ready for Operation
          </p>
          <div className="flex justify-center gap-4">
            <button
              className="px-6 md:px-8 py-2 md:py-3 border-2 border-[#00f5ff] text-[#00f5ff] font-[Orbitron] font-bold uppercase tracking-[3px] rounded hover:bg-[#00f5ff] hover:text-[#0a0a0f] transition-all duration-300"
              style={{
                boxShadow: "0 0 20px rgba(0, 245, 255, 0.3)",
              }}
            >
              Initialize
            </button>
            <button
              className="px-6 md:px-8 py-2 md:py-3 border-2 border-[#00ff88] text-[#00ff88] font-[Orbitron] font-bold uppercase tracking-[3px] rounded hover:bg-[#00ff88] hover:text-[#0a0a0f] transition-all duration-300"
              style={{
                boxShadow: "0 0 20px rgba(0, 255, 136, 0.3)",
              }}
            >
              Execute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
