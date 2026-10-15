import * as THREE from "three";
import { BRAND } from "./stage";

/* ------------------------------------------------------------------ */
/* A particle cloud that holds a shape, then swirls into the next one. */
/* ------------------------------------------------------------------ */

const VERT = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec4 aRand;
uniform float uProg;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPush;
uniform float uSize;
uniform float uPixelRatio;
uniform float uEnergy;
uniform float uSpread;
varying float vMix;
varying float vEnergy;

void main() {
  // Each particle leaves a little earlier or later than its neighbours.
  float start = aRand.x * 0.35;
  float e = smoothstep(start, start + 0.65, uProg);
  vec3 p = mix(aFrom, aTo, e);

  // Mid-flight the particles burst into a swirling cloud, then settle into the next shape.
  float flight = sin(e * 3.14159);
  vec3 swirl = vec3(
    sin(uTime * 0.7 + aRand.y * 6.283),
    cos(uTime * 0.6 + aRand.z * 6.283),
    sin(uTime * 0.5 + aRand.w * 6.283)
  );
  p += swirl * (0.05 + uEnergy * 0.12 + flight * uSpread * (0.55 + aRand.w));
  float ang = flight * (aRand.y - 0.5) * 2.4;
  p.xz = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p.xz;

  // Optional cursor push.
  vec2 d = p.xy - uMouse;
  float push = smoothstep(1.15, 0.0, length(d)) * uPush;
  p.xy += normalize(d + 0.0001) * push * 0.7;
  p.z += push * 0.6;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.55 + aRand.z) * uPixelRatio * (10.0 / -mv.z) * (1.0 + flight * 0.6 + uEnergy * 0.35);
  vMix = aRand.w;
  vEnergy = clamp(max(flight, push) + uEnergy * 0.6, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform vec3 uAccent;
uniform vec3 uCream;
varying float vMix;
varying float vEnergy;

void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float core = smoothstep(0.5, 0.0, r);
  vec3 col = mix(uAccent, uCream, step(0.78, vMix));
  col = mix(col, vec3(1.0, 0.82, 0.6), vEnergy * 0.5);
  gl_FragColor = vec4(col, core * (0.8 + vEnergy * 0.2));
  #include <colorspace_fragment>
}
`;

/* ------------------------------------------------------------------ */
/* Shape samplers                                                      */
/* ------------------------------------------------------------------ */

export type Draw = (ctx: CanvasRenderingContext2D, s: number) => void;

/** Points scattered over whatever `draw` paints on a square canvas, scaled to `size` world units. */
export function sampleCanvas(draw: Draw, count: number, size: number, depth = 0.9, resolution = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = resolution;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = ctx.strokeStyle = "#fff";
  draw(ctx, resolution);
  const data = ctx.getImageData(0, 0, resolution, resolution).data;
  const filled: number[] = [];
  for (let i = 0; i < resolution * resolution; i++) if (data[i * 4 + 3] > 128) filled.push(i);
  const out = new Float32Array(count * 3);
  if (!filled.length) return out;
  for (let k = 0; k < count; k++) {
    const i = filled[Math.floor(Math.random() * filled.length)];
    out[k * 3] = (((i % resolution) + Math.random()) / resolution - 0.5) * size;
    out[k * 3 + 1] = -((Math.floor(i / resolution) + Math.random()) / resolution - 0.5) * size;
    out[k * 3 + 2] = (Math.random() - 0.5) * depth;
  }
  return out;
}

/** Points picked from a geometry's vertices, with a little jitter. Disposes the geometry. */
export function sampleGeometry(geo: THREE.BufferGeometry, count: number, jitter = 0.04) {
  const pos = geo.attributes.position;
  const out = new Float32Array(count * 3);
  for (let k = 0; k < count; k++) {
    const i = Math.floor(Math.random() * pos.count);
    out[k * 3] = pos.getX(i) + (Math.random() - 0.5) * jitter;
    out[k * 3 + 1] = pos.getY(i) + (Math.random() - 0.5) * jitter;
    out[k * 3 + 2] = pos.getZ(i) + (Math.random() - 0.5) * jitter;
  }
  geo.dispose();
  return out;
}

/** A shell with some thickness — an ink droplet. */
export function sampleSphere(count: number, radius: number) {
  const out = new Float32Array(count * 3);
  for (let k = 0; k < count; k++) {
    const u = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const r = radius * (0.88 + Math.random() * 0.12);
    const s = Math.sqrt(1 - u * u);
    out[k * 3] = Math.cos(a) * s * r;
    out[k * 3 + 1] = u * r;
    out[k * 3 + 2] = Math.sin(a) * s * r;
  }
  return out;
}

/** Two intertwined strands with rungs between them. */
export function sampleHelix(count: number, height: number, radius: number, turns: number) {
  const out = new Float32Array(count * 3);
  const j = () => (Math.random() - 0.5) * 0.08;
  for (let k = 0; k < count; k++) {
    const t = Math.random();
    const a = t * Math.PI * 2 * turns;
    if (Math.random() < 0.18) {
      // Rung across the two strands.
      const along = Math.random() * 2 - 1;
      out[k * 3] = Math.cos(a) * radius * along + j();
      out[k * 3 + 2] = Math.sin(a) * radius * along + j();
    } else {
      const strand = Math.random() < 0.5 ? 0 : Math.PI;
      out[k * 3] = Math.cos(a + strand) * radius + j();
      out[k * 3 + 2] = Math.sin(a + strand) * radius + j();
    }
    out[k * 3 + 1] = (t - 0.5) * height + j();
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* The morphing cloud                                                  */
/* ------------------------------------------------------------------ */

interface Options {
  count: number;
  shapes: Float32Array[];
  pixelRatio: number;
  size: number;
  /** Seconds each shape holds, and seconds to swirl into the next. */
  hold: number;
  morph: number;
  /** How far particles scatter mid-morph. */
  spread?: number;
  /** Strength of the cursor push (0 disables it). */
  push?: number;
  reduced?: boolean;
}

export function createMorphPoints({ count, shapes: initial, pixelRatio, size, hold, morph, spread = 1.5, push = 1, reduced = false }: Options) {
  let shapes = initial;
  const rand = new Float32Array(count * 4);
  for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
  const from = new THREE.BufferAttribute(new Float32Array(shapes[0]), 3);
  const to = new THREE.BufferAttribute(new Float32Array(shapes[0]), 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aFrom", from);
  geo.setAttribute("aTo", to);
  geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));

  const uniforms = {
    uProg: { value: 0 },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uPush: { value: push },
    uSize: { value: size },
    uPixelRatio: { value: pixelRatio },
    uEnergy: { value: 0 },
    uSpread: { value: spread },
    uAccent: { value: new THREE.Color(BRAND.accent) },
    uCream: { value: new THREE.Color(BRAND.cream) },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;

  let current = 0;
  let clock = 0;
  let morphing = false;

  return {
    points,
    uniforms,
    /** Swap in re-sampled shapes (e.g. once webfonts load); takes effect from the next morph. */
    setShapes(next: Float32Array[]) {
      shapes = next;
    },
    update(t: number, dt: number) {
      uniforms.uTime.value = t;
      if (reduced) return;
      clock += dt;
      if (!morphing && clock > hold) {
        const next = (current + 1) % shapes.length;
        (from.array as Float32Array).set(shapes[current]);
        (to.array as Float32Array).set(shapes[next]);
        from.needsUpdate = to.needsUpdate = true;
        current = next;
        morphing = true;
        clock = 0;
      }
      if (morphing) {
        uniforms.uProg.value = Math.min(1, clock / morph);
        if (clock >= morph) {
          // Settle: the new shape becomes the resting one.
          (from.array as Float32Array).set(shapes[current]);
          from.needsUpdate = true;
          uniforms.uProg.value = 0;
          morphing = false;
          clock = 0;
        }
      }
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
