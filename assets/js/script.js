const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const VIRTUAL_WIDTH = 850;
const VIRTUAL_HEIGHT = 500;

const stateBadge = document.getElementById("stateBadge");
const stateText = document.getElementById("stateText");
const subStatus = document.getElementById("subStatus");
const replayBtn = document.getElementById("replayBtn");
const tapHint = document.getElementById("tapHint");
const letterModal = document.getElementById("letterModal");
const modalCard = document.getElementById("modalCard");

const STATES = {
  PEEK_1_IN: "PEEK_1_IN",
  PEEK_1_PAUSE: "PEEK_1_PAUSE", // "Hi Suman 💕"
  PEEK_1_OUT: "PEEK_1_OUT",
  PEEK_2_IN: "PEEK_2_IN",
  PEEK_2_PAUSE: "PEEK_2_PAUSE", // "Special mail for you! 💌"
  PEEK_2_OUT: "PEEK_2_OUT",
  PEEK_3_IN: "PEEK_3_IN",
  PEEK_3_PAUSE: "PEEK_3_PAUSE", // "Wait, I’ll go get that! 🏃‍♂️💨"
  PEEK_3_OUT: "PEEK_3_OUT",
  WALKING: "WALKING",
  ARRIVED: "ARRIVED",
};

let currentState = STATES.PEEK_1_IN;

const START_X = -130;
const STOP_X = 360;
let posX = START_X;
let walkTimer = 0;
let pauseTimer = 0;
let headTilt = 0;
let giftScale = 0;
let isGiftOpened = false;
let speechBubbleAlpha = 0;

let particles = [];
let ambientConfetti = [];

class Particle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size =
      type === "heart" ? Math.random() * 10 + 8 : Math.random() * 6 + 4;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = -Math.random() * 3 - 1.5;
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.01;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.1;
    const colors = ["#ff4d6d", "#38bdf8", "#fbbf24", "#a78bfa", "#34d399"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;
    this.alpha -= this.decay;
    this.rotation += this.rotSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.type === "heart") {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      const sz = this.size;
      const topCurveHeight = sz * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -sz / 2, 0, -sz / 2, topCurveHeight);
      ctx.bezierCurveTo(-sz / 2, (sz + topCurveHeight) / 2, 0, sz, 0, sz);
      ctx.bezierCurveTo(
        0,
        sz,
        sz / 2,
        (sz + topCurveHeight) / 2,
        sz / 2,
        topCurveHeight,
      );
      ctx.bezierCurveTo(sz / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 3, this.size, this.size * 0.6);
    }
    ctx.restore();
  }
}

function initAmbientConfetti() {
  ambientConfetti = [];
  for (let i = 0; i < 12; i++) {
    const colors = ["#ff4d6d", "#38bdf8", "#fbbf24", "#a78bfa", "#34d399"];
    ambientConfetti.push({
      x: Math.random() * VIRTUAL_WIDTH,
      y: Math.random() * 350 + 50,
      size: Math.random() * 7 + 5,
      speed: Math.random() * 0.6 + 0.3,
      wobble: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.4 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}
initAmbientConfetti();

function spawnCelebrationBurst(x, y, count = 20) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, i % 2 === 0 ? "heart" : "confetti"));
  }
}

function handleResize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const container = canvas.parentElement;
  const rect = container.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(
    (rect.width * dpr) / VIRTUAL_WIDTH,
    (rect.height * dpr) / VIRTUAL_HEIGHT,
  );
}

window.addEventListener("resize", handleResize);
window.addEventListener("orientationchange", () =>
  setTimeout(handleResize, 100),
);

function drawBackground() {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
  skyGrad.addColorStop(0, "#ffffff");
  skyGrad.addColorStop(0.6, "#fff0f5");
  skyGrad.addColorStop(1, "#e0f7fa");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  ambientConfetti.forEach((c) => {
    c.y -= c.speed;
    c.wobble += 0.03;
    let curX = c.x + Math.sin(c.wobble) * 15;
    if (c.y < -20) {
      c.y = 420;
      c.x = Math.random() * VIRTUAL_WIDTH;
    }

    ctx.save();
    ctx.globalAlpha = c.opacity;
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(curX, c.y, c.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Ground floor line at Y = 400
  ctx.strokeStyle = "#f472b6";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 400);
  ctx.lineTo(VIRTUAL_WIDTH, 400);
  ctx.stroke();

  ctx.fillStyle = "#fb7185";
  for (let i = 40; i < VIRTUAL_WIDTH; i += 70) {
    ctx.beginPath();
    ctx.arc(i, 408, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSpeechBubble(x, y, text, alpha) {
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  let floatY = y + Math.sin(walkTimer * 0.15) * 4;

  ctx.font = 'bold 16px "Fredoka", cursive, sans-serif';
  let textWidth = ctx.measureText(text).width;
  let bubbleWidth = Math.max(110, textWidth + 30);
  let bubbleHeight = 42;
  let bubbleX = x - 25;
  let bubbleY = floatY - 65;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ff4d6d";
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 16);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 5, floatY - 23);
  ctx.lineTo(x - 8, floatY - 10);
  ctx.lineTo(x + 18, floatY - 23);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 4, floatY - 24);
  ctx.lineTo(x + 19, floatY - 24);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = "#ff2a55";
  ctx.textAlign = "center";
  ctx.fillText(text, bubbleX + bubbleWidth / 2, floatY - 38);

  ctx.restore();
}

function drawChibiCharacter(x, y, isWalking, headAngle = 0) {
  ctx.save();
  ctx.lineWidth = 5.5;
  ctx.strokeStyle = "#2c3e50";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const isArrived = currentState === STATES.ARRIVED;
  const isPeeking =
    currentState === STATES.PEEK_1_PAUSE ||
    currentState === STATES.PEEK_2_PAUSE ||
    currentState === STATES.PEEK_3_PAUSE;

  let bobY = isWalking ? Math.abs(Math.sin(walkTimer * 0.24)) * 9 : 0;
  let swing = isWalking ? Math.sin(walkTimer * 0.24) * 16 : 0;
  let charY = y - bobY;

  ctx.fillStyle = "rgba(244, 114, 182, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x + 40, y + 10, isArrived ? 56 : 46, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Boots
  ctx.fillStyle = "#2c3e50";
  ctx.save();
  ctx.translate(x + 26, charY - 18);
  if (isWalking) ctx.rotate((swing * Math.PI) / 180);
  ctx.fillRect(-8, 0, 16, 18);
  ctx.strokeRect(-8, 0, 16, 18);
  ctx.fillStyle = "#795548";
  ctx.beginPath();
  ctx.roundRect(-12, 12, 22, 12, 5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(x + 54, charY - 18);
  if (isWalking) ctx.rotate((-swing * Math.PI) / 180);
  ctx.fillStyle = "#2c3e50";
  ctx.fillRect(-8, 0, 16, 18);
  ctx.strokeRect(-8, 0, 16, 18);
  ctx.fillStyle = "#795548";
  ctx.beginPath();
  ctx.roundRect(-10, 12, 22, 12, 5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Torso
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.roundRect(x + 16, charY - 62, 48, 46, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x + 16, charY - 22, 48, 5);
  ctx.strokeRect(x + 16, charY - 22, 48, 5);

  ctx.fillStyle = "#ff4d6d";
  ctx.fillRect(x + 44, charY - 52, 10, 5);

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x + 22, charY - 62);
  ctx.lineTo(x + 32, charY - 52);
  ctx.lineTo(x + 34, charY - 62);
  ctx.moveTo(x + 58, charY - 62);
  ctx.lineTo(x + 48, charY - 52);
  ctx.lineTo(x + 46, charY - 62);
  ctx.fill();
  ctx.stroke();

  // Arms
  ctx.fillStyle = "#38bdf8";
  ctx.save();
  ctx.translate(x + 18, charY - 52);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-12, 10);
  ctx.lineTo(-4, 20);
  ctx.lineTo(6, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffdca3";
  ctx.beginPath();
  ctx.arc(-8, 16, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(x + 60, charY - 52);
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  if (isArrived) {
    ctx.moveTo(0, 0);
    ctx.lineTo(16, -20);
    ctx.lineTo(24, -42);
    ctx.lineTo(12, -42);
    ctx.lineTo(0, -10);
  } else if (isPeeking) {
    let waveAngle = Math.sin(walkTimer * 0.2) * 0.35 - 0.4;
    ctx.rotate(waveAngle);
    ctx.moveTo(0, 0);
    ctx.lineTo(14, -12);
    ctx.lineTo(22, -22);
    ctx.lineTo(12, -22);
    ctx.lineTo(0, -8);
  } else if (isWalking) {
    let armAngle = (swing * 0.8 * Math.PI) / 180;
    ctx.rotate(-armAngle);
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 10);
    ctx.lineTo(20, 20);
    ctx.lineTo(10, 20);
  } else {
    ctx.moveTo(0, 0);
    ctx.lineTo(12, 8);
    ctx.lineTo(16, 18);
    ctx.lineTo(4, 16);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffdca3";
  let hX = isArrived ? 18 : isPeeking ? 17 : isWalking ? 16 : 12;
  let hY = isArrived ? -42 : isPeeking ? -22 : isWalking ? 20 : 18;
  ctx.beginPath();
  ctx.arc(hX, hY, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Head & Original Delivery Cap with Heart Logo
  ctx.save();
  ctx.translate(x + 40, charY - 100);
  ctx.rotate(headAngle);

  ctx.fillStyle = "#ffdca3";
  ctx.fillRect(-8, 26, 16, 14);
  ctx.strokeRect(-8, 26, 16, 14);

  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#5c3d2e";
  ctx.beginPath();
  ctx.arc(-30, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (isPeeking) {
    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-6, -4, 6, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(14, -4, 6, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  } else {
    function drawGlossyEye(eyeX, eyeY) {
      ctx.save();
      ctx.fillStyle = "#2c3e50";
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, 6.5, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(eyeX - 2.5, eyeY - 3.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeX + 2, eyeY + 3.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    drawGlossyEye(-6, -2);
    drawGlossyEye(14, -2);
  }

  ctx.fillStyle = "rgba(255, 77, 109, 0.6)";
  ctx.beginPath();
  ctx.arc(-14, 8, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22, 8, 7.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#2c3e50";
  ctx.lineWidth = 3.5;
  if (isPeeking) {
    ctx.fillStyle = "#ff4d6d";
    ctx.beginPath();
    ctx.arc(4, 6, 6.5, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(4, 8, 4.5, 0, Math.PI, false);
    ctx.stroke();
  }

  // Original Red Delivery Cap with Visor & Heart Logo
  ctx.fillStyle = "#ff4d6d";
  ctx.save();
  ctx.translate(0, -18);
  ctx.beginPath();
  ctx.arc(0, 0, 36, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(10, -2);
  ctx.quadraticCurveTo(46, -10, 52, 10);
  ctx.quadraticCurveTo(26, 16, 0, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Heart emblem on cap
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(12, -14, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff4d6d";
  ctx.font = "8px sans-serif";
  ctx.fillText("❤", 9, -11);
  ctx.restore();

  ctx.restore();

  if (speechBubbleAlpha > 0) {
    let bubbleText = "Hi Suman 💕";
    if (currentState === STATES.PEEK_2_PAUSE) {
      bubbleText = "Special mail for you! 💌";
    } else if (currentState === STATES.PEEK_3_PAUSE) {
      bubbleText = "Wait, I’ll go get that! 🏃‍♂️💨";
    }
    drawSpeechBubble(x + 40, charY - 140, bubbleText, speechBubbleAlpha);
  }

  // Gift Box Presentation
  if (isArrived) {
    if (giftScale < 1) giftScale += 0.08;

    ctx.save();
    ctx.translate(x + 90, charY - 116);

    let currentScale = Math.min(1, giftScale);
    ctx.scale(currentScale, currentScale);
    ctx.rotate(-0.05 + Math.sin(walkTimer * 0.1) * 0.03);

    ctx.fillStyle = "#ff4d6d";
    ctx.fillRect(-24, -14, 48, 38);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "#2c3e50";
    ctx.strokeRect(-24, -14, 48, 38);

    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(-7, -14, 14, 38);
    ctx.strokeRect(-7, -14, 14, 38);

    ctx.fillStyle = "#e11d48";
    ctx.fillRect(-28, -24, 56, 12);
    ctx.strokeRect(-28, -24, 56, 12);

    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(-10, -30, 8, 0, Math.PI * 2);
    ctx.arc(10, -30, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

function updateState() {
  walkTimer++;

  switch (currentState) {
    case STATES.PEEK_1_IN:
      if (posX < -5) {
        posX += 2.2;
      } else {
        currentState = STATES.PEEK_1_PAUSE;
        pauseTimer = 0;
        spawnCelebrationBurst(posX + 80, 260, 8);
      }
      updateUIBadge(
        "👀 Peek 1/3...",
        "bg-pink-500",
        "Postman peeking in to say hi!",
      );
      break;

    case STATES.PEEK_1_PAUSE:
      pauseTimer++;
      headTilt = Math.sin(pauseTimer * 0.08) * 0.18;
      if (speechBubbleAlpha < 1) speechBubbleAlpha += 0.1;

      if (pauseTimer > 75) {
        currentState = STATES.PEEK_1_OUT;
      }
      break;

    case STATES.PEEK_1_OUT:
      if (speechBubbleAlpha > 0) speechBubbleAlpha -= 0.1;
      headTilt *= 0.8;
      if (posX > START_X) {
        posX -= 2.8;
      } else {
        currentState = STATES.PEEK_2_IN;
        pauseTimer = 0;
      }
      break;

    case STATES.PEEK_2_IN:
      if (posX < -5) {
        posX += 3.2;
      } else {
        currentState = STATES.PEEK_2_PAUSE;
        pauseTimer = 0;
        spawnCelebrationBurst(posX + 80, 260, 10);
      }
      updateUIBadge("💖 Peek 2/3...", "bg-rose-500", "Sharing special news!");
      break;

    case STATES.PEEK_2_PAUSE:
      pauseTimer++;
      headTilt = -Math.sin(pauseTimer * 0.1) * 0.15;
      if (speechBubbleAlpha < 1) speechBubbleAlpha += 0.1;

      if (pauseTimer > 75) {
        currentState = STATES.PEEK_2_OUT;
      }
      break;

    case STATES.PEEK_2_OUT:
      if (speechBubbleAlpha > 0) speechBubbleAlpha -= 0.12;
      if (posX > START_X) {
        posX -= 3.5;
      } else {
        currentState = STATES.PEEK_3_IN;
        pauseTimer = 0;
      }
      break;

    case STATES.PEEK_3_IN:
      if (posX < -5) {
        posX += 3.5;
      } else {
        currentState = STATES.PEEK_3_PAUSE;
        pauseTimer = 0;
        spawnCelebrationBurst(posX + 80, 260, 12);
      }
      updateUIBadge(
        "🏃‍♂️ Peek 3/3...",
        "bg-pink-600",
        "Getting ready to walk over!",
      );
      break;

    case STATES.PEEK_3_PAUSE:
      pauseTimer++;
      headTilt = Math.sin(pauseTimer * 0.12) * 0.18;
      if (speechBubbleAlpha < 1) speechBubbleAlpha += 0.1;

      if (pauseTimer > 80) {
        currentState = STATES.PEEK_3_OUT;
      }
      break;

    case STATES.PEEK_3_OUT:
      if (speechBubbleAlpha > 0) speechBubbleAlpha -= 0.12;
      if (posX > START_X) {
        posX -= 3.8;
      } else {
        currentState = STATES.WALKING;
        headTilt = 0;
        speechBubbleAlpha = 0;
      }
      break;

    case STATES.WALKING:
      headTilt = 0;
      if (posX < STOP_X) {
        posX += 2.4;
      } else {
        currentState = STATES.ARRIVED;
        spawnCelebrationBurst(STOP_X + 90, 270, 25);
      }
      updateUIBadge(
        "🚶 On His Way!",
        "bg-pink-600",
        "Walking over to deliver your birthday surprise",
      );
      break;

    case STATES.ARRIVED:
      updateUIBadge(
        "🎁 Gift Arrived!",
        "bg-rose-600",
        "Birthday surprise arrived! Tap gift box to open.",
      );
      tapHint.classList.remove("opacity-0");
      tapHint.classList.add("opacity-100");
      replayBtn.classList.add("pulse-btn");

      if (Math.random() < 0.08) {
        particles.push(
          new Particle(
            STOP_X + 90 + (Math.random() - 0.5) * 20,
            270,
            "sparkle",
          ),
        );
      }
      break;
  }
}

function updateUIBadge(text, bgClass, subText) {
  stateText.textContent = text;
  subStatus.textContent = subText;
  stateBadge.className = `state-badge ${bgClass} text-white text-[11px] sm:text-sm font-medium px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg flex items-center gap-1.5 sm:gap-2`;
}

function renderLoop() {
  ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  drawBackground();
  updateState();

  const isWalking =
    currentState === STATES.PEEK_1_IN ||
    currentState === STATES.PEEK_1_OUT ||
    currentState === STATES.PEEK_2_IN ||
    currentState === STATES.PEEK_2_OUT ||
    currentState === STATES.PEEK_3_IN ||
    currentState === STATES.PEEK_3_OUT ||
    currentState === STATES.WALKING;

  drawChibiCharacter(posX, 395, isWalking, headTilt);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw(ctx);
    if (p.alpha <= 0) particles.splice(i, 1);
  }

  requestAnimationFrame(renderLoop);
}

function handleInteraction(evt) {
  if (currentState !== STATES.ARRIVED) return;

  const rect = canvas.getBoundingClientRect();
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;

  const clickX = (clientX - rect.left) * (VIRTUAL_WIDTH / rect.width);
  const clickY = (clientY - rect.top) * (VIRTUAL_HEIGHT / rect.height);

  const giftX = STOP_X + 90;
  const giftY = 270;

  if (Math.abs(clickX - giftX) < 90 && Math.abs(clickY - giftY) < 90) {
    isGiftOpened = true;
    spawnCelebrationBurst(giftX, giftY, 35);
    openModal();
  }
}

canvas.addEventListener("click", handleInteraction);
canvas.addEventListener(
  "touchstart",
  (e) => {
    if (currentState === STATES.ARRIVED) {
      e.preventDefault();
      handleInteraction(e);
    }
  },
  { passive: false },
);

function openModal() {
  letterModal.classList.remove("opacity-0", "pointer-events-none");
  letterModal.classList.add("opacity-100");
  modalCard.classList.remove("scale-90");
  modalCard.classList.add("scale-100");
}

function closeModal() {
  letterModal.classList.add("opacity-0", "pointer-events-none");
  letterModal.classList.remove("opacity-100");
  modalCard.classList.add("scale-90");
  modalCard.classList.remove("scale-100");
}

function resetAnimation() {
  posX = START_X;
  walkTimer = 0;
  pauseTimer = 0;
  headTilt = 0;
  giftScale = 0;
  speechBubbleAlpha = 0;
  isGiftOpened = false;
  particles = [];
  currentState = STATES.PEEK_1_IN;

  tapHint.classList.add("opacity-0");
  tapHint.classList.remove("opacity-100");
  replayBtn.classList.remove("pulse-btn");
  closeModal();
}

window.onload = () => {
  handleResize();
  renderLoop();
};






// typewriter function
// *************************************************************************************
// *************************************************************************************

const giftBtn = document.querySelector('.gift-btn');
const urlParams = new URLSearchParams(window.location.search);
const happy_birthday = urlParams.get('happy_birthday') || 'default';

const baseURL = 'gift.html';
let responsiveURL = baseURL +'?happy_birthday='+ happy_birthday;
document.getElementById('giftBtnId').setAttribute('href', responsiveURL);