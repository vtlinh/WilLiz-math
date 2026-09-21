export const CELEBRATE_DIFFICULTIES = ["pictures", "medium", "hard"];

export function shouldCelebrate({ answered = 0, correct = 0, difficulty = "" } = {}) {
  return answered > 0 && correct === answered && CELEBRATE_DIFFICULTIES.includes(difficulty);
}

const COLORS = ["#e3b03a", "#c85a3c", "#2f6b56", "#fff8eb", "#7c3aed", "#2563eb", "#f97316"];

function reducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function makeCanvas() {
  let canvas = document.getElementById("celebrate-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "celebrate-canvas";
    canvas.className = "celebrate-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.append(canvas);
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  return canvas;
}

function burst(x, y, count, kind) {
  const bits = [];
  for (let i = 0; i < count; i += 1) {
    const angle = kind === "firework" ? (Math.PI * 2 * i) / count : -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
    const speed = kind === "firework" ? 2.4 + Math.random() * 3.8 : 2 + Math.random() * 5;
    bits.push({
      kind,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: kind === "firework" ? 0.012 + Math.random() * 0.01 : 0.006 + Math.random() * 0.006,
      size: kind === "firework" ? 2 + Math.random() * 2 : 5 + Math.random() * 6,
      color: COLORS[i % COLORS.length],
      spin: (Math.random() - 0.5) * 0.3,
      angle: Math.random() * Math.PI,
    });
  }
  return bits;
}

let frame = 0;

export function stopCelebration() {
  window.cancelAnimationFrame(frame);
  frame = 0;
  document.getElementById("celebrate-canvas")?.remove();
}

export function playCelebration() {
  stopCelebration();
  if (typeof document === "undefined") return;
  if (reducedMotion()) {
    document.body.classList.add("celebrate-static");
    window.setTimeout(() => document.body.classList.remove("celebrate-static"), 1400);
    return;
  }

  const canvas = makeCanvas();
  const ctx = canvas.getContext("2d");
  let bits = [
    ...burst(canvas.width * 0.22, canvas.height * 0.72, 42, "firework"),
    ...burst(canvas.width * 0.78, canvas.height * 0.68, 42, "firework"),
    ...burst(canvas.width * 0.5, canvas.height * 0.3, 56, "confetti"),
  ];
  let launched = 1;

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (launched < 4 && Math.random() < 0.04) {
      bits = bits.concat(
        burst(canvas.width * (0.2 + Math.random() * 0.6), canvas.height * (0.35 + Math.random() * 0.4), 36, "firework"),
      );
      launched += 1;
    }
    bits = bits.filter((bit) => bit.life > 0);
    for (const bit of bits) {
      bit.x += bit.vx;
      bit.y += bit.vy;
      bit.vy += bit.kind === "confetti" ? 0.08 : 0.03;
      bit.life -= bit.decay;
      bit.angle += bit.spin;
      ctx.globalAlpha = Math.max(bit.life, 0);
      ctx.fillStyle = bit.color;
      if (bit.kind === "confetti") {
        ctx.save();
        ctx.translate(bit.x, bit.y);
        ctx.rotate(bit.angle);
        ctx.fillRect(-bit.size / 2, -bit.size / 4, bit.size, bit.size / 2);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(bit.x, bit.y, bit.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (bits.length) {
      frame = window.requestAnimationFrame(tick);
    } else {
      stopCelebration();
    }
  };
  frame = window.requestAnimationFrame(tick);
}
