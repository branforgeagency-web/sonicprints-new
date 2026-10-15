"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BRAND, mountStage } from "./stage";
import { FONT } from "./textures";

/* ------------------------------------------------------------------ */
/* Tuning                                                              */
/* ------------------------------------------------------------------ */

const SIZE = 6.4; // world size of each glyph
const HOLD = 2.6; // seconds a glyph holds its shape
const MORPH = 1.8; // seconds to swirl into the next glyph
const SAMPLE = 256; // canvas resolution used to sample glyph pixels

/** Question → answer → emphasis, on a loop. */
type Draw = (ctx: CanvasRenderingContext2D, s: number) => void;
const GLYPHS: Draw[] = [
  (ctx, s) => {
    ctx.font = `900 ${s * 0.92}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", s / 2, s * 0.53);
  },
  (ctx, s) => {
    ctx.lineWidth = s * 0.14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(s * 0.18, s * 0.52);
    ctx.lineTo(s * 0.42, s * 0.76);
    ctx.lineTo(s * 0.84, s * 0.26);
    ctx.stroke();
  },
  (ctx, s) => {
    ctx.font = `900 ${s * 0.92}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", s / 2, s * 0.53);
  },
];

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const VERT = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec4 aRand;
uniform float uProg;
uniform float uTime;
uniform vec2 uMouse;
uniform float uSize;
uniform float uPixelRatio;
varying float vMix;
varying float vEnergy;

void main() {
  // Each particle leaves a little earlier or later than its neighbours.
  float start = aRand.x * 0.35;
  float e = smoothstep(start, start + 0.65, uProg);
  vec3 p = mix(aFrom, aTo, e);

  // Mid-flight the particles burst into a swirling cloud, then settle into the new glyph.
  float flight = sin(e * 3.14159);
  vec3 swirl = vec3(
    sin(uTime * 0.7 + aRand.y * 6.283) ,
    cos(uTime * 0.6 + aRand.z * 6.283),
    sin(uTime * 0.5 + aRand.w * 6.283)
  );
  p += swirl * (0.05 + flight * (0.9 + aRand.w * 1.6));
  float ang = flight * (aRand.y - 0.5) * 2.4;
  p.xz = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p.xz;

  // The cursor pushes particles aside.
  vec2 d = p.xy - uMouse;
  float dist = length(d);
  float push = smoothstep(1.15, 0.0, dist);
  p.xy += normalize(d + 0.0001) * push * 0.7;
  p.z += push * 0.6;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.55 + aRand.z) * uPixelRatio * (10.0 / -mv.z) * (1.0 + flight * 0.6);
  vMix = aRand.w;
  vEnergy = max(flight, push);
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
/* Glyph sampling                                                      */
/* ------------------------------------------------------------------ */

function sampleGlyph(draw: Draw, count: number) {
  const c = document.createElement("canvas");
  c.width = c.height = SAMPLE;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = ctx.strokeStyle = "#fff";
  draw(ctx, SAMPLE);
  const data = ctx.getImageData(0, 0, SAMPLE, SAMPLE).data;
  const filled: number[] = [];
  for (let i = 0; i < SAMPLE * SAMPLE; i++) if (data[i * 4 + 3] > 128) filled.push(i);
  const out = new Float32Array(count * 3);
  if (!filled.length) return out;
  for (let k = 0; k < count; k++) {
    const i = filled[Math.floor(Math.random() * filled.length)];
    const px = (i % SAMPLE) + Math.random();
    const py = Math.floor(i / SAMPLE) + Math.random();
    out[k * 3] = (px / SAMPLE - 0.5) * SIZE;
    out[k * 3 + 1] = -(py / SAMPLE - 0.5) * SIZE;
    out[k * 3 + 2] = (Math.random() - 0.5) * 0.9;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function GlyphMorphScene({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    return mountStage(
      host,
      ({ scene, camera, pointer, renderer, reduced }) => {
        const count = window.innerWidth < 640 ? 4200 : 7500;
        let shapes = GLYPHS.map((g) => sampleGlyph(g, count));

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
          uSize: { value: 2.6 },
          uPixelRatio: { value: renderer.getPixelRatio() },
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
        const glyph = new THREE.Group();
        glyph.add(points);
        scene.add(glyph);

        /* a faint ring of dust around the glyph for depth */
        const DUST = 700;
        const dustPos = new Float32Array(DUST * 3);
        for (let i = 0; i < DUST; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = 4 + Math.random() * 9;
          dustPos[i * 3] = Math.cos(a) * r;
          dustPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
          dustPos[i * 3 + 2] = Math.sin(a) * r - 4;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
        const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: BRAND.cream, size: 0.035, transparent: true, opacity: 0.35, depthWrite: false }));
        scene.add(dust);

        // Resample once webfonts are in, so the glyphs use Roboto.
        document.fonts.ready
          .then(() => {
            shapes = GLYPHS.map((g) => sampleGlyph(g, count));
          })
          .catch(() => {});

        let current = 0;
        let clock = 0; // time within the current hold + morph
        let morphing = false;
        let halfW = 1;
        let halfH = 1;

        const startMorph = () => {
          const next = (current + 1) % shapes.length;
          (from.array as Float32Array).set(shapes[current]);
          (to.array as Float32Array).set(shapes[next]);
          from.needsUpdate = to.needsUpdate = true;
          current = next;
          morphing = true;
          clock = 0;
        };

        return {
          resize: (w, h) => {
            camera.position.set(0, 0, 12);
            camera.lookAt(0, 0, 0);
            halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 12;
            halfW = halfH * (w / h);
            const wide = w / h > 1.1;
            // Desktop: glyph on the right of the headline. Phones: above it.
            glyph.position.set(wide ? halfW * 0.48 : 0, wide ? -0.15 : halfH * 0.32, 0);
            glyph.scale.setScalar(wide ? 0.92 : Math.min(0.9, (halfW * 1.5) / SIZE));
            uniforms.uSize.value = w < 640 ? 3.6 : 4.4;
          },
          update: (t, dt) => {
            uniforms.uTime.value = t;
            if (!reduced) {
              clock += dt;
              if (!morphing && clock > HOLD) startMorph();
              if (morphing) {
                uniforms.uProg.value = Math.min(1, clock / MORPH);
                if (clock >= MORPH) {
                  // Settle: the new glyph becomes the resting shape.
                  (from.array as Float32Array).set(shapes[current]);
                  from.needsUpdate = true;
                  uniforms.uProg.value = 0;
                  morphing = false;
                  clock = 0;
                }
              }
            }

            // Cursor in the glyph's own space.
            const s = glyph.scale.x;
            uniforms.uMouse.value.set((pointer.x * halfW - glyph.position.x) / s, (pointer.y * halfH - glyph.position.y) / s);

            glyph.rotation.y = Math.sin(t * 0.35) * 0.28 + pointer.x * 0.2;
            glyph.rotation.x = -pointer.y * 0.12;
            dust.rotation.y = t * 0.02;
          },
          dispose: () => {
            geo.dispose();
            mat.dispose();
            dustGeo.dispose();
            (dust.material as THREE.Material).dispose();
          },
        };
      },
      { fov: 40, clearColor: BRAND.ink, pointerEase: 5 },
    );
  }, []);

  return <div ref={hostRef} aria-hidden="true" className={`absolute inset-0 ${className}`} />;
}
