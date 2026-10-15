import { FONT, type Painter } from "./textures";

/* ------------------------------------------------------------------ */
/* Branded product artwork, painted onto canvas textures.             */
/* Shared by the quote scene and the home hero.                       */
/* ------------------------------------------------------------------ */

const INK = "#001408";
const ACCENT = "#bd5501";
const CREAM = "#f7f4ee";

const wordmark = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
  ctx.fillStyle = color;
  ctx.font = `900 ${size}px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("SONIC", x, y);
  ctx.fillStyle = ACCENT;
  ctx.fillText("PRINTS", x, y + size * 0.95);
};

export const PAINT: Record<string, Painter> = {
  cardFront: (ctx, w, h) => {
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, w, h);
    wordmark(ctx, w * 0.08, h * 0.42, h * 0.2, CREAM);
    ctx.fillStyle = "rgba(247,244,238,0.65)";
    ctx.font = `500 ${h * 0.065}px ${FONT}`;
    ctx.fillText("WE DON'T JUST PRINT. WE BUILD BRANDS.", w * 0.08, h * 0.86);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(w * 0.84, h * 0.1, w * 0.08, w * 0.08);
  },
  cardBack: (ctx, w, h) => {
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = INK;
    ctx.font = `700 ${h * 0.1}px ${FONT}`;
    ctx.fillText("info@sonicprints.in", w * 0.08, h * 0.3);
    ctx.font = `400 ${h * 0.08}px ${FONT}`;
    ctx.fillText("+91 73387 53815", w * 0.08, h * 0.46);
    ctx.fillText("Gandhipuram, Coimbatore", w * 0.08, h * 0.6);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(0, h * 0.9, w, h * 0.1);
  },
  mug: (ctx, w, h) => {
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(0, h * 0.78, w, h * 0.08);
    // Logo centred on the side facing the camera (texture wraps around the cylinder).
    wordmark(ctx, w * 0.36, h * 0.42, h * 0.16, INK);
  },
  box: (ctx, w, h) => {
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = w * 0.02;
    ctx.strokeRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84);
    wordmark(ctx, w * 0.16, h * 0.5, h * 0.16, CREAM);
  },
  tote: (ctx, w, h) => {
    ctx.fillStyle = "#efe7d8";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.46, w * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CREAM;
    ctx.font = `900 ${w * 0.11}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("PRINT", w * 0.5, h * 0.45);
    ctx.fillStyle = ACCENT;
    ctx.fillText("ANYTHING", w * 0.5, h * 0.55);
    ctx.textAlign = "left";
  },
  banner: (ctx, w, h) => {
    ctx.fillStyle = ACCENT;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = CREAM;
    ctx.font = `900 ${w * 0.2}px ${FONT}`;
    ["YOUR", "BRAND", "HERE."].forEach((line, i) => ctx.fillText(line, w * 0.1, h * (0.2 + i * 0.12)));
    ctx.fillStyle = INK;
    ctx.fillRect(w * 0.1, h * 0.62, w * 0.8, h * 0.004);
    ctx.font = `500 ${w * 0.065}px ${FONT}`;
    ctx.fillText("12 KITS · ONE PARTNER", w * 0.1, h * 0.7);
    wordmark(ctx, w * 0.1, h * 0.86, w * 0.11, INK);
  },
  sticker: (ctx, w, h) => {
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CREAM;
    ctx.font = `900 ${w * 0.4}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SP", w / 2, h / 2 + w * 0.02);
  },
  tshirt: (ctx, w, h) => {
    ctx.fillStyle = "#f1eee7";
    ctx.fillRect(0, 0, w, h);
    // Chest print, centred a little high.
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.42, w * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ACCENT;
    ctx.font = `900 ${w * 0.13}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SP", w * 0.5, h * 0.425);
    ctx.fillStyle = INK;
    ctx.font = `900 ${w * 0.065}px ${FONT}`;
    ctx.fillText("SONIC PRINTS", w * 0.5, h * 0.66);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  },
  notebook: (ctx, w, h) => {
    ctx.fillStyle = ACCENT;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(0,20,8,0.18)";
    ctx.fillRect(0, 0, w * 0.06, h);
    ctx.fillStyle = CREAM;
    ctx.font = `900 ${w * 0.15}px ${FONT}`;
    ctx.fillText("NOTES", w * 0.16, h * 0.3);
    ctx.fillStyle = INK;
    ctx.fillRect(w * 0.16, h * 0.36, w * 0.5, h * 0.008);
    wordmark(ctx, w * 0.16, h * 0.8, w * 0.1, CREAM);
  },
};
