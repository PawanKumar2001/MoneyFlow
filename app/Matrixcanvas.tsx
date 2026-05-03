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

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    let waveActive = false;
    let waveX = 0;

    const chars = "₹ $ € £ ¥ ₩ ₺ ₨ ฿ ₦ ₫ ₪ ₲ ₴ ₵ ₡ ₢ ₣ ₤ ₥ ₧ ₰ ₱ ₳ ₷ ₸ ₼ ₽ ¢ ؋ ﷼ ₾ ₿";

    function drawMatrix() {
      if (!ctx) return;

      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        if (waveActive) {
          const distFromWave = Math.abs(i - waveX);
          if (distFromWave > 8) continue;

          const intensity = 1 - distFromWave / 8;
          ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 1.0})`;
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

      if (waveActive) {
        waveX += 1.5;
        if (waveX > columns + 10) {
          waveActive = false;
          waveX = 0;
          setTimeout(() => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }, 500);
        }
      }
    }

    const triggerWave = () => {
      waveActive = true;
      waveX = -10;
    };

    // First wave after 2 seconds, then every 2 seconds
    setTimeout(triggerWave, 2000);
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

  return (
    <canvas
      id="matrix-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}