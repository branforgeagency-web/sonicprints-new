"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { roundedCard } from "./card";
import { PAINT } from "./painters";
import { BRAND, disposeTree, mountStage } from "./stage";
import { FONT, labelTexture, type Painter } from "./textures";

/* ------------------------------------------------------------------ */
/* B2B ↔ B2C — "many" vs "one".                                        */
/* B2B: ~1,400 glossy printed tiles stream endlessly along a torus-    */
/* knot production line (GPU instancing, studio reflections).          */
/* B2C: the stream spirals inward and is absorbed into one large       */
/* custom print, with a few stragglers left circling it.               */
/* ------------------------------------------------------------------ */

const SWITCH_RATE = 0.75; // how fast the formation follows the selected mode
const FLOW = 0.022; // production-line speed (loops per second)
const KNOT_SCALE = 0.98;

const PALETTE = [BRAND.ink, BRAND.ink, BRAND.accent, BRAND.accent, BRAND.cream, 0xe0a46a];

/** The one-off piece revealed for individuals. */
const yourDesign: Painter = (ctx, w, h) => {
  ctx.fillStyle = "#f7f4ee";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#bd5501";
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.3, h * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#001408";
  ctx.font = `900 ${h * 0.24}px ${FONT}`;
  ctx.fillText("YOUR", w * 0.07, h * 0.42);
  ctx.fillStyle = "#bd5501";
  ctx.fillText("DESIGN.", w * 0.07, h * 0.66);
  ctx.fillStyle = "#001408";
  ctx.font = `700 ${h * 0.065}px ${FONT}`;
  ctx.fillText("ANY PRODUCT  ·  QTY 1", w * 0.075, h * 0.84);
  ctx.fillRect(w * 0.075, h * 0.89, w * 0.86, h * 0.012);
};

/** (2,3) torus knot — the production line. */
function knot(u: number, out: THREE.Vector3) {
  const t = u * Math.PI * 2;
  const r = 2 + Math.cos(3 * t);
  return out.set(r * Math.cos(2 * t), r * Math.sin(2 * t), Math.sin(3 * t) * 1.1).multiplyScalar(KNOT_SCALE);
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);

interface Props {
  /** 0 = businesses (B2B), 1 = individuals (B2C). */
  mode: 0 | 1;
  className?: string;
}

export default function AudienceScene({ mode, className = "" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<number>(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    return mountStage(
      host,
      ({ renderer, scene, camera, pointer, reduced }) => {
        /* studio reflections */
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;
        pmrem.dispose();
        const key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(-3, 4, 6);
        scene.add(key);

        const world = new THREE.Group();
        scene.add(world);
        const line = new THREE.Group(); // the knot tumbles slowly
        world.add(line);

        /* the stream of printed tiles */
        const COUNT = window.innerWidth < 640 ? 700 : 1400;
        const tileGeo = new RoundedBoxGeometry(0.2, 0.13, 0.026, 2, 0.012);
        const tileMat = new THREE.MeshPhysicalMaterial({
          roughness: 0.32,
          metalness: 0.05,
          clearcoat: 1,
          clearcoatRoughness: 0.12,
        });
        const tiles = new THREE.InstancedMesh(tileGeo, tileMat, COUNT);
        tiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        tiles.frustumCulled = false;
        const color = new THREE.Color();
        const seed = new Float32Array(COUNT * 6);
        for (let i = 0; i < COUNT; i++) {
          tiles.setColorAt(i, color.setHex(PALETTE[Math.floor(Math.random() * PALETTE.length)]));
          // tube offset (3), delay, spin, landing spot
          const a = Math.random() * Math.PI * 2;
          const r = Math.sqrt(Math.random()) * 0.32;
          seed.set([Math.cos(a) * r, Math.sin(a) * r, (Math.random() - 0.5) * 0.3, Math.random() * 0.55, (Math.random() - 0.5) * 4, Math.random()], i * 6);
        }
        line.add(tiles);

        /* the one-off piece */
        const design = labelTexture(900, 560, yourDesign);
        const back = labelTexture(900, 560, PAINT.cardBack);
        const hero = roundedCard(3.5, 2.18, 0.14, 0.1, design.texture, back.texture, BRAND.accent);
        for (const mesh of [hero.front, hero.back]) {
          mesh.material.roughness = 0.35;
          mesh.material.envMapIntensity = 0.3;
          // Keep the printed artwork true to brand colours (no filmic tone mapping).
          mesh.material.toneMapped = false;
        }
        const heroHolder = new THREE.Group();
        heroHolder.add(hero.group);
        world.add(heroHolder);
        document.fonts.ready
          .then(() => {
            design.repaint();
            back.repaint();
          })
          .catch(() => {});

        // Soft shadow under the formation, for grounding on white.
        const shadowTex = (() => {
          const c = document.createElement("canvas");
          c.width = c.height = 128;
          const ctx = c.getContext("2d")!;
          const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
          g.addColorStop(0, "rgba(0,20,8,0.22)");
          g.addColorStop(1, "rgba(0,20,8,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 128, 128);
          return new THREE.CanvasTexture(c);
        })();
        const shadow = new THREE.Mesh(
          new THREE.PlaneGeometry(7, 1.6),
          new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -3.1;
        world.add(shadow);

        let m = modeRef.current; // 0 = stream, 1 = one piece
        const dummy = new THREE.Object3D();
        const p = new THREE.Vector3();
        const ahead = new THREE.Vector3();
        const tangent = new THREE.Vector3();
        const normal = new THREE.Vector3();
        const binormal = new THREE.Vector3();
        const target = new THREE.Vector3();
        const lineInv = new THREE.Matrix4();
        const Z = new THREE.Vector3(0, 0, 1);

        return {
          resize: (w, h) => {
            const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
            const halfW = halfH * (w / h);
            world.scale.setScalar(Math.min(1, (halfW * 2) / 7.2, (halfH * 2) / 7));
          },
          update: (t, dt) => {
            const goal = modeRef.current;
            m = reduced ? goal : m + THREE.MathUtils.clamp(goal - m, -dt * SWITCH_RATE, dt * SWITCH_RATE);

            line.rotation.set(0.5 + Math.sin(t * 0.15) * 0.2, t * 0.12, t * 0.05);
            line.updateMatrix();
            // B2C targets are placed in the section's frame; convert them into the knot's tumbling frame.
            lineInv.copy(line.matrix).invert();

            for (let i = 0; i < COUNT; i++) {
              const o = i * 6;
              const u = (i / COUNT + t * FLOW) % 1;
              knot(u, p);
              knot(u + 0.003, ahead);
              tangent.subVectors(ahead, p).normalize();
              normal.crossVectors(tangent, Z).normalize();
              binormal.crossVectors(tangent, normal);
              p.addScaledVector(normal, seed[o]).addScaledVector(binormal, seed[o + 1]);

              const local = ease(THREE.MathUtils.clamp(m * 1.55 - seed[o + 3], 0, 1));
              const keeper = i % 14 === 0; // a few stay circling the big piece
              let scale = 1;

              if (local > 0) {
                if (keeper) {
                  const a = (i / COUNT) * Math.PI * 2 * 14 + t * 0.35;
                  target.set(Math.cos(a) * 3.3, Math.sin(a) * 1.9, Math.sin(a * 2) * 0.6 - 0.3);
                } else {
                  // Spiral in toward a spot on the big piece's face, then get absorbed.
                  const sw = (1 - local) * 5 + seed[o + 4];
                  const r = (1 - local) * 2.4;
                  target.set(
                    (seed[o + 5] - 0.5) * 3 + Math.cos(sw) * r,
                    (seed[o] / 0.32) * 0.9 + Math.sin(sw) * r,
                    0.2,
                  );
                  scale = 1 - THREE.MathUtils.smoothstep(local, 0.72, 1);
                }
                target.applyMatrix4(lineInv);
                p.lerp(target, local);
              }

              dummy.position.copy(p);
              dummy.lookAt(ahead.copy(p).add(tangent));
              dummy.rotateZ(seed[o + 4] * t * 0.6 + seed[o + 2] * 10);
              dummy.scale.setScalar(Math.max(0.0001, scale * (keeper ? 1 + local * 0.6 : 1)));
              dummy.updateMatrix();
              tiles.setMatrixAt(i, dummy.matrix);
            }
            tiles.instanceMatrix.needsUpdate = true;

            // The big piece pops in as the stream is absorbed.
            const h = THREE.MathUtils.clamp((m - 0.35) / 0.65, 0, 1);
            heroHolder.visible = h > 0.001;
            heroHolder.scale.setScalar(Math.max(0.0001, easeOutBack(h)));
            heroHolder.rotation.set(0.08 + Math.sin(t * 0.8) * 0.06, Math.sin(t * 0.5) * 0.35 + (1 - h) * Math.PI, Math.sin(t * 0.6) * 0.03);
            heroHolder.position.y = Math.sin(t * 1.1) * 0.08;
            shadow.scale.x = THREE.MathUtils.lerp(1, 0.55, m);

            world.rotation.y = pointer.x * 0.25;
            world.rotation.x = -pointer.y * 0.12;
          },
          dispose: () => {
            disposeTree(world);
            envTex.dispose();
            scene.environment = null;
          },
        };
      },
      { fov: 40, cameraZ: 11, pointerEase: 4 },
    );
  }, []);

  return <div ref={hostRef} aria-hidden="true" className={`absolute inset-0 ${className}`} />;
}
