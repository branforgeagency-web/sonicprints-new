"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const FOV = 40;
const CAM_Z = 10;
const SHARD_COUNT = 35;
const GRAVITY = -9;
const STRESS_MAX = 0.3;
const SPRING_K = 90;
const SPRING_C = 14;
const HOLD_SECONDS = 1.6;
const IDLE_REFORM_SECONDS = 1.4;
const CARD_STALL_SECONDS = 2.2;
const MAX_TEXTURE_SIDE = 4096;

const CSS = `
.bfx{position:relative;width:100%;height:100%;min-height:320px;overflow:hidden;isolation:isolate;background:#f7f4ee;cursor:crosshair;touch-action:pan-y;user-select:none;-webkit-user-select:none}
.bfx-stage,.bfx-stage canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.bfx-chrome{position:absolute;inset:0;z-index:1;pointer-events:none;mix-blend-mode:difference;color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:clamp(16px,3vw,32px);font-family:var(--font-poppins),Arial,sans-serif;font-size:clamp(10px,1vw,12px);font-weight:500;letter-spacing:.16em;text-transform:uppercase}
.bfx-row{display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap}
.bfx-mark{font-family:var(--font-poppins),Arial,sans-serif;font-weight:800;font-size:clamp(15px,1.5vw,19px);letter-spacing:0;text-transform:none}
`;

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const VIGNETTE_GLSL = /* glsl */ `
float vignette(vec2 uv) {
  vec2 q = uv - 0.5;
  q.x *= 1.15;
  return mix(0.62, 1.0, smoothstep(0.82, 0.18, length(q)));
}
`;

const BACK_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const BACK_FRAG = /* glsl */ `
uniform sampler2D uBack;
varying vec2 vUv;
${VIGNETTE_GLSL}
void main() {
  gl_FragColor = vec4(texture2D(uBack, vUv).rgb * vignette(vUv), 1.0);
}
`;

const SHARD_VERT = /* glsl */ `
attribute float aEdge;
varying vec2 vUv;
varying float vEdge;
varying vec3 vNormalV;
varying vec3 vViewDir;
void main() {
  vUv = uv;
  vEdge = aEdge;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormalV = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
  vViewDir = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const SHARD_FRAG = /* glsl */ `
uniform sampler2D uFront;
uniform sampler2D uBack;
uniform float uOpen;
uniform vec2 uCenter;
varying vec2 vUv;
varying float vEdge;
varying vec3 vNormalV;
varying vec3 vViewDir;
${VIGNETTE_GLSL}

vec3 sampleBack(vec2 uv) {
  vec2 c = clamp(uv, 0.001, 0.999);
  return texture2D(uBack, c).rgb * vignette(c);
}

void main() {
  vec3 N = normalize(vNormalV);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(vViewDir);
  float so = smoothstep(0.0, 1.0, clamp(uOpen, 0.0, 1.0));

  // Edge masks in screen space: a hairline crack and a wider bevel band.
  float fw = max(fwidth(vEdge), 1e-4);
  float crack = 1.0 - smoothstep(0.0, fw * 1.5, vEdge);
  float bevel = 1.0 - smoothstep(0.0, fw * 9.0, vEdge);

  // Refraction: offset grows with opening and view-space tilt.
  vec2 dir = vUv - uCenter;
  float dl = length(dir);
  vec2 caDir = dl > 1e-5 ? dir / dl : vec2(1.0, 0.0);
  vec2 off = N.xy * (0.035 + 0.09 * so) * so + caDir * bevel * 0.012 * so;

  // Chromatic aberration, strongest at the cut rim.
  float ca = (0.002 + 0.010 * so) * (0.3 + (1.0 - vEdge) + bevel);
  vec2 ruv = vUv + off;
  vec3 refr = vec3(
    sampleBack(ruv + caDir * ca).r,
    sampleBack(ruv).g,
    sampleBack(ruv - caDir * ca).b
  );

  vec3 front = texture2D(uFront, vUv).rgb;
  vec3 col = mix(front, refr, so);

  // At rest the cut edges read as dark scored lines in the frost.
  col *= 1.0 - crack * 0.42 * (1.0 - so);
  // Bevel catches more light as the shard opens.
  col += bevel * (1.0 - crack) * (0.05 + 0.35 * so) * vec3(0.92, 0.96, 1.0);

  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 3.0);
  col += fres * vec3(0.75, 0.88, 1.0) * (0.25 + 0.9 * so);

  vec3 L = normalize(vec3(-0.45, 0.65, 0.62));
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 80.0);
  col += spec * (0.15 + 0.9 * so) * (0.6 + 0.4 * bevel);

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/* Math helpers                                                        */
/* ------------------------------------------------------------------ */

type Vec2 = [number, number];

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  const t = l2 > 0 ? Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
  return Math.hypot(ax + dx * t - px, ay + dy * t - py);
}

/** Sutherland–Hodgman: keep the part of `poly` where (p - m) · n <= 0. */
function clipHalfPlane(poly: Vec2[], mx: number, my: number, nx: number, ny: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const da = (a[0] - mx) * nx + (a[1] - my) * ny;
    const db = (b[0] - mx) * nx + (b[1] - my) * ny;
    if (da <= 0) out.push(a);
    if (da <= 0 !== db <= 0) {
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

function polygonCentroid(poly: Vec2[]): Vec2 {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % poly.length];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area *= 0.5;
  return [cx / (6 * area), cy / (6 * area)];
}

/* ------------------------------------------------------------------ */
/* Baked canvases                                                      */
/* ------------------------------------------------------------------ */

const DISPLAY_FONT = 'Poppins, Arial, sans-serif';
const MONO_FONT = 'Poppins, Arial, sans-serif';

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  family: string,
  maxW: number,
  maxH: number,
) {
  ctx.font = `${weight} ${maxH}px ${family}`;
  const w = ctx.measureText(text).width;
  return w > maxW ? maxH * (maxW / w) : maxH;
}

function radialBloom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function drawFront(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const u = H / 1000;
  const R = Math.max(W, H);

  const g = ctx.createLinearGradient(0, 0, W * 0.35, H);
  g.addColorStop(0, "#fbf9f5");
  g.addColorStop(0.5, "#f7f4ee");
  g.addColorStop(1, "#ebe4d8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  radialBloom(ctx, W * 0.2, H * 0.15, R * 0.6, "rgba(255,255,255,0.55)");
  radialBloom(ctx, W * 0.85, H * 0.9, R * 0.5, "rgba(189,85,1,0.12)");

  // Frost grain.
  const rnd = mulberry32(7);
  const dot = Math.max(1, Math.round(u * 1.4));
  const count = Math.min(9000, Math.floor((W * H) / 300));
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < count; i++) ctx.fillRect(rnd() * W, rnd() * H, dot, dot);
  ctx.fillStyle = "#001408";
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < count; i++) ctx.fillRect(rnd() * W, rnd() * H, dot, dot);
  ctx.globalAlpha = 1;

  // Frosted headline, read through the glass.
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cy = H * 0.53;
  const giant = fitFontSize(ctx, "SONIC PRINTS", 800, DISPLAY_FONT, W * 0.84, H * 0.3);
  ctx.font = `800 ${giant}px ${DISPLAY_FONT}`;
  ctx.filter = `blur(${Math.max(1, giant * 0.035)}px)`;
  ctx.fillStyle = "rgba(0,20,8,0.28)";
  ctx.fillText("SONIC PRINTS", W / 2, cy);
  ctx.filter = "none";

  const kicker = Math.max(11 * (H / 900), giant * 0.085);
  ctx.font = `500 ${kicker}px ${MONO_FONT}`;
  ctx.letterSpacing = `${kicker * 0.4}px`;
  ctx.fillStyle = "rgba(0,20,8,0.6)";
  ctx.fillText("HOLD STILL", W / 2, cy - giant * 0.62);
  ctx.letterSpacing = "0px";
}

function drawBack(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const R = Math.max(W, H);

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#001408");
  g.addColorStop(0.38, "#06240f");
  g.addColorStop(0.72, "#5c2b03");
  g.addColorStop(1, "#bd5501");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.globalCompositeOperation = "screen";
  radialBloom(ctx, W * 0.18, H * 0.78, R * 0.55, "rgba(189,85,1,0.35)");
  radialBloom(ctx, W * 0.78, H * 0.22, R * 0.5, "rgba(255,140,40,0.30)");
  radialBloom(ctx, W * 0.62, H * 0.86, R * 0.45, "rgba(189,85,1,0.40)");
  radialBloom(ctx, W * 0.4, H * 0.3, R * 0.35, "rgba(247,244,238,0.10)");
  ctx.globalCompositeOperation = "source-over";

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cy = H * 0.53;
  const giant = fitFontSize(ctx, "SONIC PRINTS", 800, DISPLAY_FONT, W * 0.86, H * 0.3);
  ctx.font = `800 ${giant}px ${DISPLAY_FONT}`;
  ctx.shadowColor = "rgba(189,85,1,0.6)";
  ctx.shadowBlur = giant * 0.25;
  ctx.fillStyle = "#f7f4ee";
  ctx.fillText("SONIC PRINTS", W / 2, cy);
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.fillText("SONIC PRINTS", W / 2, cy);

  const kicker = Math.max(11 * (H / 900), giant * 0.085);
  ctx.font = `500 ${kicker}px ${MONO_FONT}`;
  ctx.letterSpacing = `${kicker * 0.4}px`;
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillText("LOOK CLOSER", W / 2, cy - giant * 0.62);

  const sub = kicker * 0.9;
  const subY = cy + giant * 0.62;
  ctx.font = `400 ${sub}px ${MONO_FONT}`;
  ctx.letterSpacing = `${sub * 0.18}px`;
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.fillText("A fault line runs beneath every calm surface", W / 2, subY);
  ctx.letterSpacing = "0px";

  // Jagged fault line under the subline.
  const lineW = Math.min(W * 0.5, giant * 3);
  const lineY = subY + sub * 1.8;
  const lg = ctx.createLinearGradient(W / 2 - lineW / 2, 0, W / 2 + lineW / 2, 0);
  lg.addColorStop(0, "rgba(255,255,255,0)");
  lg.addColorStop(0.5, "rgba(255,255,255,0.7)");
  lg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.strokeStyle = lg;
  ctx.lineWidth = Math.max(1, H / 900);
  ctx.beginPath();
  const rnd = mulberry32(11);
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const x = W / 2 - lineW / 2 + (lineW * i) / steps;
    const y = lineY + (i % 2 === 0 ? -1 : 1) * sub * 0.25 * rnd();
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function makeCanvasTexture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.flipY = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

/* ------------------------------------------------------------------ */
/* Shards                                                              */
/* ------------------------------------------------------------------ */

type ShardState = "intact" | "falling" | "gone" | "condensing";

interface Shard {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  cx: number;
  cy: number;
  radius: number;
  state: ShardState;
  open: number;
  openV: number;
  px: number;
  py: number;
  pz: number;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  wx: number;
  wy: number;
  wz: number;
  lx: number;
  ly: number;
  delay: number;
  fuse: number;
}

interface View {
  w: number;
  h: number;
  halfW: number;
  halfH: number;
  breakR: number;
  previewR: number;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function BreakAnimate() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const card = new URLSearchParams(window.location.search).has("card");

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x001408, 1);
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAM_Z);

    const view: View = { w: 1, h: 1, halfW: 1, halfH: 1, breakR: 1, previewR: 2 };

    /* ---- textures ---- */
    const frontCanvas = document.createElement("canvas");
    const backCanvas = document.createElement("canvas");
    const uFront: { value: THREE.Texture | null } = { value: null };
    const uBack: { value: THREE.Texture | null } = { value: null };

    const paint = () => {
      const fctx = frontCanvas.getContext("2d");
      const bctx = backCanvas.getContext("2d");
      if (!fctx || !bctx) return;
      drawFront(fctx, frontCanvas.width, frontCanvas.height);
      drawBack(bctx, backCanvas.width, backCanvas.height);
      if (uFront.value) uFront.value.needsUpdate = true;
      if (uBack.value) uBack.value.needsUpdate = true;
    };

    const bake = () => {
      const scale = Math.min(renderer.getPixelRatio(), MAX_TEXTURE_SIDE / Math.max(view.w, view.h));
      const W = Math.max(2, Math.round(view.w * scale));
      const H = Math.max(2, Math.round(view.h * scale));
      frontCanvas.width = backCanvas.width = W;
      frontCanvas.height = backCanvas.height = H;
      // A size change needs fresh GPU storage, so swap in new textures.
      uFront.value?.dispose();
      uBack.value?.dispose();
      uFront.value = makeCanvasTexture(frontCanvas);
      uBack.value = makeCanvasTexture(backCanvas);
      paint();
    };

    /* ---- back quad ---- */
    const backMat = new THREE.ShaderMaterial({
      vertexShader: BACK_VERT,
      fragmentShader: BACK_FRAG,
      uniforms: { uBack },
      depthWrite: false,
    });
    const backQuad = new THREE.Mesh(new THREE.BufferGeometry(), backMat);
    backQuad.position.z = -0.02;
    backQuad.renderOrder = -1;
    scene.add(backQuad);

    const buildBackQuad = () => {
      // Span the frustum at z = -0.02 so its UVs line up with the shards' screen UVs.
      const k = (CAM_Z + 0.02) / CAM_Z;
      const geo = new THREE.PlaneGeometry(view.halfW * 2 * k, view.halfH * 2 * k);
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
      backQuad.geometry.dispose();
      backQuad.geometry = geo;
    };

    /* ---- shards ---- */
    const baseMaterial = new THREE.ShaderMaterial({
      vertexShader: SHARD_VERT,
      fragmentShader: SHARD_FRAG,
      uniforms: {
        uFront: { value: null },
        uBack: { value: null },
        uOpen: { value: 0 },
        uCenter: { value: new THREE.Vector2() },
      },
      side: THREE.DoubleSide,
    });

    let shards: Shard[] = [];
    let seed = 1;

    const disposeShards = () => {
      for (const s of shards) {
        scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
      }
      shards = [];
    };

    const buildShards = (startState: "intact" | "condensing") => {
      disposeShards();
      const rnd = mulberry32(seed++);
      const { halfW, halfH } = view;
      const aspect = halfW / halfH;
      const cols = Math.max(3, Math.round(Math.sqrt(SHARD_COUNT * aspect)));
      const rows = Math.max(3, Math.round(SHARD_COUNT / cols));
      const X = halfW * 1.04;
      const Y = halfH * 1.04;

      const seeds: Vec2[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          seeds.push([
            -X + (c + 0.5 + (rnd() - 0.5) * 0.8) * ((2 * X) / cols),
            -Y + (r + 0.5 + (rnd() - 0.5) * 0.8) * ((2 * Y) / rows),
          ]);
        }
      }

      const cell = Math.sqrt((4 * halfW * halfH) / seeds.length);
      view.breakR = cell * 0.62;
      view.previewR = cell * 1.9;
      const maxDist = Math.hypot(halfW, halfH);

      for (let i = 0; i < seeds.length; i++) {
        const [sx, sy] = seeds[i];
        let poly: Vec2[] = [
          [-X, -Y],
          [X, -Y],
          [X, Y],
          [-X, Y],
        ];
        for (let j = 0; j < seeds.length && poly.length >= 3; j++) {
          if (j === i) continue;
          const [tx, ty] = seeds[j];
          poly = clipHalfPlane(poly, (sx + tx) / 2, (sy + ty) / 2, tx - sx, ty - sy);
        }
        if (poly.length < 3) continue;

        const [cx, cy] = polygonCentroid(poly);
        const n = poly.length;
        const pos = new Float32Array((n + 1) * 3);
        const uv = new Float32Array((n + 1) * 2);
        const edge = new Float32Array(n + 1);
        const index: number[] = [];
        uv[0] = 0.5 + cx / (2 * halfW);
        uv[1] = 0.5 - cy / (2 * halfH);
        edge[0] = 1;
        let radius = 0;
        for (let k = 0; k < n; k++) {
          const [x, y] = poly[k];
          pos[(k + 1) * 3] = x - cx;
          pos[(k + 1) * 3 + 1] = y - cy;
          uv[(k + 1) * 2] = 0.5 + x / (2 * halfW);
          uv[(k + 1) * 2 + 1] = 0.5 - y / (2 * halfH);
          radius = Math.max(radius, Math.hypot(x - cx, y - cy));
          index.push(0, k + 1, ((k + 1) % n) + 1);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
        geo.setAttribute("aEdge", new THREE.BufferAttribute(edge, 1));
        geo.setIndex(index);

        const mat = baseMaterial.clone();
        mat.uniforms.uFront = uFront;
        mat.uniforms.uBack = uBack;
        mat.uniforms.uCenter.value.set(uv[0], uv[1]);

        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        const condensing = startState === "condensing";
        const shard: Shard = {
          mesh,
          cx,
          cy,
          radius,
          state: startState,
          open: condensing ? 1 : 0,
          openV: 0,
          px: cx,
          py: cy,
          pz: 0,
          vx: 0,
          vy: 0,
          vz: 0,
          rx: 0,
          ry: 0,
          rz: 0,
          wx: 0,
          wy: 0,
          wz: 0,
          lx: 0,
          ly: 0,
          delay: condensing ? (Math.hypot(cx, cy) / maxDist) * 0.7 : 0,
          fuse: -1,
        };
        applyPose(shard);
        shards.push(shard);
      }
    };

    const applyPose = (s: Shard) => {
      s.mesh.position.set(s.px, s.py, s.pz);
      s.mesh.rotation.set(s.rx, s.ry, s.rz);
      s.mesh.material.uniforms.uOpen.value = s.open;
    };

    const restPose = (s: Shard) => {
      s.px = s.cx;
      s.py = s.cy;
      s.pz = 0;
      s.rx = s.ry = s.rz = 0;
      s.mesh.visible = true;
    };

    /* ---- pointer (real or virtual) ---- */
    const ptr = { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, active: false, lastT: 0 };

    const toWorld = (clientX: number, clientY: number): Vec2 => {
      const r = root.getBoundingClientRect();
      return [
        ((clientX - r.left) / r.width * 2 - 1) * view.halfW,
        -((clientY - r.top) / r.height * 2 - 1) * view.halfH,
      ];
    };

    const onPointerMove = (e: PointerEvent) => {
      const [x, y] = toWorld(e.clientX, e.clientY);
      const now = performance.now();
      if (ptr.active) {
        const dt = Math.max(1, now - ptr.lastT) / 1000;
        ptr.vx += ((x - ptr.x) / dt - ptr.vx) * 0.4;
        ptr.vy += ((y - ptr.y) / dt - ptr.vy) * 0.4;
      } else {
        ptr.px = x;
        ptr.py = y;
        ptr.vx = ptr.vy = 0;
      }
      ptr.x = x;
      ptr.y = y;
      ptr.active = true;
      ptr.lastT = now;
    };
    const onPointerLeave = () => {
      ptr.active = false;
    };

    /* ---- solver ---- */
    let phase: "live" | "hold" = "live";
    let holdT = 0;
    let idleT = 0;
    let stallT = 0;

    const knock = (s: Shard, fromX: number, fromY: number, withPointer: boolean) => {
      let dx = s.cx - fromX;
      let dy = s.cy - fromY;
      const d = Math.hypot(dx, dy);
      if (d < 1e-4) {
        const a = Math.random() * Math.PI * 2;
        dx = Math.cos(a);
        dy = Math.sin(a);
      } else {
        dx /= d;
        dy /= d;
      }
      const speed = 1 + Math.random() * 1.6;
      const pvx = withPointer ? Math.max(-8, Math.min(8, ptr.vx)) * 0.12 : 0;
      const pvy = withPointer ? Math.max(-8, Math.min(8, ptr.vy)) * 0.12 : 0;
      s.vx = dx * speed + pvx;
      s.vy = dy * speed + 1.2 + Math.random() * 1.2 + pvy;
      s.vz = 1.6 + Math.random() * 2.4;
      s.wx = (Math.random() - 0.5) * 9;
      s.wy = (Math.random() - 0.5) * 9;
      s.wz = (Math.random() - 0.5) * 5;
      s.openV = 0;
      s.fuse = -1;
      s.state = "falling";
    };

    const reformGone = () => {
      for (const s of shards) {
        if (s.state !== "gone") continue;
        restPose(s);
        s.state = "condensing";
        s.open = 1;
        s.delay = Math.random() * 0.4;
        applyPose(s);
      }
    };

    const step = (dt: number) => {
      const { halfH, breakR, previewR } = view;
      const live = ptr.active && phase === "live";
      let gone = 0;
      let broken = 0;
      let unfusedIntact = 0;
      let newBreak = false;

      for (const s of shards) {
        if (s.state === "intact") {
          if (s.fuse > 0) {
            s.fuse -= dt;
            if (s.fuse <= 0) {
              knock(s, 0, 0, false);
              newBreak = true;
            }
          }
        }

        if (s.state === "intact") {
          const d = live ? distToSegment(s.cx, s.cy, ptr.px, ptr.py, ptr.x, ptr.y) : Infinity;
          if (d < breakR) {
            knock(s, ptr.x, ptr.y, true);
            newBreak = true;
          } else {
            const target = STRESS_MAX * (1 - smoothstep(breakR, previewR, d));
            if (target > 0.001) {
              const dx = s.cx - ptr.x;
              const dy = s.cy - ptr.y;
              s.lx = dx / d;
              s.ly = dy / d;
            }
            s.openV += (SPRING_K * (target - s.open) - SPRING_C * s.openV) * dt;
            s.open += s.openV * dt;
            s.px = s.cx;
            s.py = s.cy;
            s.pz = Math.max(0, s.open) * 0.5;
            s.rx = -s.ly * s.open * 0.6;
            s.ry = s.lx * s.open * 0.6;
            s.rz = 0;
            if (s.fuse < 0) unfusedIntact++;
          }
        }

        if (s.state === "falling") {
          s.vy += GRAVITY * dt;
          s.px += s.vx * dt;
          s.py += s.vy * dt;
          s.pz += s.vz * dt;
          s.rx += s.wx * dt;
          s.ry += s.wy * dt;
          s.rz += s.wz * dt;
          s.open = Math.min(1, s.open + dt * 2.4);
          const frameHalf = (halfH * (CAM_Z - s.pz)) / CAM_Z;
          if (s.py + s.radius < -frameHalf - 0.1 || s.pz > CAM_Z - 1.2) {
            s.state = "gone";
            s.mesh.visible = false;
          }
        } else if (s.state === "condensing") {
          s.delay -= dt;
          if (s.delay <= 0) {
            s.open -= dt * 0.9;
            if (s.open <= 0) {
              s.open = 0;
              s.openV = 0;
              s.state = "intact";
            }
          }
        }

        if (s.state === "gone") gone++;
        if (s.state === "gone" || s.state === "falling") broken++;
        if (s.state !== "gone") applyPose(s);
      }

      ptr.px = ptr.x;
      ptr.py = ptr.y;

      if (phase === "live" && shards.length > 0 && gone === shards.length) {
        phase = "hold";
        holdT = 0;
      } else if (phase === "hold") {
        holdT += dt;
        if (holdT > HOLD_SECONDS) {
          buildShards("condensing");
          phase = "live";
        }
      }

      // Standalone: re-form if the pointer leaves with the pane partly broken.
      if (!card && phase === "live" && !ptr.active && gone > 0) {
        idleT += dt;
        if (idleT > IDLE_REFORM_SECONDS) {
          reformGone();
          idleT = 0;
        }
      } else {
        idleT = 0;
      }

      // Card: the roaming cursor can't reach every edge, so release the rest when it stalls.
      if (card && phase === "live") {
        if (newBreak || broken === 0 || unfusedIntact === 0) stallT = 0;
        else stallT += dt;
        if (stallT > CARD_STALL_SECONDS) {
          stallT = 0;
          for (const s of shards) if (s.state === "intact") s.fuse = 0.05 + Math.random() * 0.9;
        }
      }
    };

    /* ---- layout ---- */
    const layout = () => {
      const w = Math.max(1, root.clientWidth);
      const h = Math.max(1, root.clientHeight);
      view.w = w;
      view.h = h;
      view.halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;
      view.halfW = view.halfH * (w / h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      bake();
      buildBackQuad();
      buildShards("intact");
      phase = "live";

      if (reduced) {
        // One calm frame with a corner already fallen away.
        for (const s of shards) {
          if (s.cx > view.halfW * 0.3 && s.cy > view.halfH * 0.15) {
            s.state = "gone";
            s.mesh.visible = false;
          }
        }
        renderer.render(scene, camera);
      }
    };

    layout();

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (root.clientWidth !== view.w || root.clientHeight !== view.h) layout();
      }, 120);
    });
    ro.observe(root);

    /* ---- webfonts: re-bake once Poppins arrives ---- */
    let disposed = false;
    const onFontsLoaded = () => {
      if (disposed) return;
      paint();
      if (reduced) renderer.render(scene, camera);
    };
    document.fonts.addEventListener("loadingdone", onFontsLoaded);
    Promise.all([
      document.fonts.load(`800 120px Poppins`),
      document.fonts.load(`500 16px Poppins`),
    ])
      .then(onFontsLoaded)
      .catch(() => {});

    /* ---- loop ---- */
    let inView = true;
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(root);

    let raf = 0;
    if (!reduced) {
      if (!card) {
        root.addEventListener("pointermove", onPointerMove);
        root.addEventListener("pointerdown", onPointerMove);
        root.addEventListener("pointerleave", onPointerLeave);
        root.addEventListener("pointercancel", onPointerLeave);
      }

      let last = performance.now();
      let elapsed = 0;
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        if (!inView) return;
        elapsed += dt;

        if (card) {
          // Virtual cursor roaming a Lissajous path.
          const x = view.halfW * 0.66 * Math.sin(elapsed * 0.75);
          const y = view.halfH * 0.56 * Math.sin(elapsed * 1.12 + 0.6);
          if (!ptr.active) {
            ptr.px = x;
            ptr.py = y;
          } else if (dt > 0) {
            ptr.vx = (x - ptr.x) / dt;
            ptr.vy = (y - ptr.y) / dt;
          }
          ptr.x = x;
          ptr.y = y;
          ptr.active = true;
        } else {
          const decay = Math.exp(-dt * 6);
          ptr.vx *= decay;
          ptr.vy *= decay;
        }

        step(dt);
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      document.fonts.removeEventListener("loadingdone", onFontsLoaded);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerdown", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.removeEventListener("pointercancel", onPointerLeave);
      disposeShards();
      baseMaterial.dispose();
      backQuad.geometry.dispose();
      backMat.dispose();
      uFront.value?.dispose();
      uBack.value?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={rootRef} className="bfx" role="img" aria-label="Frosted glass that shatters under the cursor">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div ref={stageRef} className="bfx-stage" />
      <div className="bfx-chrome" aria-hidden="true">
        <div className="bfx-row">
          <span className="bfx-mark"></span>
          <span></span>
        </div>
        <div className="bfx-row">
          <span>Move the cursor — break the surface</span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
