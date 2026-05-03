"use client";

import { useEffect } from "react";

export default function MatrixCanvas() {
  useEffect(() => {
    const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    // Wave state
    let waveActive = false;
    let waveX = 0;

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ";

    function drawMatrix() {
      if (!ctx) return;

      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Wave effect — only draw near the wave front
        if (waveActive) {
          const distFromWave = Math.abs(i - waveX);
          if (distFromWave > 8) continue;

          const intensity = 1 - distFromWave / 8;
          ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.9})`;
        } else {
          continue;
        }

        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      // Advance wave diagonally
      if (waveActive) {
        waveX += 1.5;
        if (waveX > columns + 10) {
          waveActive = false;
          waveX = 0;
          // Clear canvas after wave passes
          setTimeout(() => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }, 500);
        }
      }
    }

    // Trigger wave every 2 seconds
    const triggerWave = () => {
      waveActive = true;
      waveX = -10;
    };

    const waveInterval = setInterval(triggerWave, 2000);
    const animInterval = setInterval(drawMatrix, 33);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(waveInterval);
      clearInterval(animInterval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return null;
}