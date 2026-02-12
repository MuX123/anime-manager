import { useEffect } from "react";
import SciFiEntryAnimation from "@/components/SciFiEntryAnimation";

/**
 * Home Page - Sci-Fi Entry Animation
 * 
 * Design Philosophy: Cyberpunk Mechanicism
 * - Dual gate opening animation with mechanical details
 * - Neon cyan and green color scheme
 * - Rapid, sharp animation timing
 */

export default function Home() {
  return (
    <div className="w-full h-screen overflow-hidden bg-background">
      {/* Scan lines overlay for authenticity */}
      <div className="scan-lines" />

      {/* Entry Animation */}
      <SciFiEntryAnimation />
    </div>
  );
}
