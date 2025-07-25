import { useRef, useEffect } from 'react';

export default function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx  = canvas.getContext('2d');
    const DPR  = window.devicePixelRatio || 1;

    /* ---- config ---- */
    const COUNT = 180;
    const MAX_V = 0.2;
    const MIN_R = 1;
    const MAX_R = 6;

    /* ---- resize ---- */
    function resize() {
      canvas.width  = window.innerWidth  * DPR;
      canvas.height = window.innerHeight * DPR;
    }
    window.addEventListener('resize', resize);
    resize();

    /* ---- particles ---- */
    const particles = Array.from({ length: COUNT }, () => ({
      x : Math.random() * canvas.width,
      y : Math.random() * canvas.height,
      vx: (Math.random() * 2 - 1) * MAX_V * DPR,
      vy: (Math.random() * 2 - 1) * MAX_V * DPR,
      r : (MIN_R + Math.random() * (MAX_R - MIN_R)) * DPR,
      a : 0.12 + Math.random() * 0.10,
    }));

    let frame;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;

        if (p.x < 0) p.x += canvas.width;
        else if (p.x > canvas.width) p.x -= canvas.width;
        if (p.y < 0) p.y += canvas.height;
        else if (p.y > canvas.height) p.y -= canvas.height;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(255,255,255,${p.a})`);
        g.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(tick);
    }
    tick();

    // cleanup on unmount
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas id="particle-canvas" ref={canvasRef} />;
}
