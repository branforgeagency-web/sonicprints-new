import * as THREE from "three";

export type Painter = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

export const FONT = "Roboto, Arial, sans-serif";

/** A canvas-backed texture; call `repaint` again once webfonts have loaded. */
export function labelTexture(w: number, h: number, paint: Painter) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const repaint = () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    paint(ctx, w, h);
    texture.needsUpdate = true;
  };
  repaint();
  return { texture, repaint };
}

/** Draws `text` word-wrapped to `maxWidth`; returns the y below the last line. */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}

/** Rounded-rectangle path (for clipping card artwork). */
export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
