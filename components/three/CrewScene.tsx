"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { CrewMember } from "@/lib/site";
import { roundedCard, type CardParts } from "./card";
import { BRAND, disposeTree, mountStage } from "./stage";
import { FONT, labelTexture, wrapText, type Painter } from "./textures";

/* ------------------------------------------------------------------ */
/* Card artwork                                                        */
/* ------------------------------------------------------------------ */

const INK = "#001408";
const ACCENT = "#bd5501";
const CREAM = "#f7f4ee";
const TEX_W = 640;
const TEX_H = 914;

const pad2 = (n: number) => String(n).padStart(2, "0");

function paintFront(m: CrewMember, i: number, total: number): Painter {
  return (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
    g.addColorStop(0, "#0a2a16");
    g.addColorStop(1, INK);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Halftone rings around the avatar — a nod to print screens.
    const cx = w / 2;
    const cy = h * 0.4;
    for (let ring = 0; ring < 7; ring++) {
      const r = w * 0.27 + ring * w * 0.035;
      const dots = 26 + ring * 7;
      const size = Math.max(1.2, 5.5 - ring * 0.7);
      ctx.fillStyle = `rgba(189,85,1,${0.55 - ring * 0.07})`;
      for (let d = 0; d < dots; d++) {
        const a = (d / dots) * Math.PI * 2 + ring * 0.2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Avatar disc with the member's initial.
    const disc = ctx.createRadialGradient(cx - w * 0.08, cy - w * 0.08, w * 0.02, cx, cy, w * 0.25);
    disc.addColorStop(0, "#e2731b");
    disc.addColorStop(1, ACCENT);
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CREAM;
    ctx.font = `900 ${w * 0.3}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(m.name[0], cx, cy + w * 0.015);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(247,244,238,0.55)";
    ctx.font = `500 ${w * 0.04}px ${FONT}`;
    ctx.fillText(`${pad2(i + 1)} / ${pad2(total)}`, w * 0.08, h * 0.07);
    ctx.textAlign = "right";
    ctx.fillText("SONIC CREW", w * 0.92, h * 0.07);
    ctx.textAlign = "left";

    ctx.fillStyle = CREAM;
    ctx.font = `900 ${w * 0.15}px ${FONT}`;
    ctx.fillText(m.name, w * 0.08, h * 0.83);
    ctx.fillStyle = ACCENT;
    ctx.font = `700 ${w * 0.05}px ${FONT}`;
    ctx.fillText(m.role.toUpperCase(), w * 0.08, h * 0.9);
    ctx.fillStyle = "rgba(247,244,238,0.4)";
    ctx.font = `500 ${w * 0.034}px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText("TAP TO FLIP ↻", w * 0.92, h * 0.955);
    ctx.textAlign = "left";
  };
}

function paintBack(m: CrewMember): Painter {
  return (ctx, w, h) => {
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(0, 0, w, h * 0.012);
    ctx.font = `700 ${w * 0.04}px ${FONT}`;
    ctx.fillText(`WHAT ${m.name} DOES`, w * 0.08, h * 0.1);
    ctx.fillStyle = INK;
    ctx.font = `800 ${w * 0.085}px ${FONT}`;
    const end = wrapText(ctx, m.does, w * 0.08, h * 0.22, w * 0.84, w * 0.1);
    ctx.fillStyle = "rgba(0,20,8,0.15)";
    ctx.fillRect(w * 0.08, end + h * 0.02, w * 0.84, 2);
    ctx.fillStyle = "rgba(0,20,8,0.6)";
    ctx.font = `500 ${w * 0.042}px ${FONT}`;
    wrapText(ctx, m.stages, w * 0.08, end + h * 0.08, w * 0.84, w * 0.055);
    // Big faded initial as a watermark.
    ctx.fillStyle = "rgba(189,85,1,0.12)";
    ctx.font = `900 ${w * 0.62}px ${FONT}`;
    ctx.fillText(m.name[0], w * 0.48, h * 0.97);
    ctx.fillStyle = INK;
    ctx.font = `900 ${w * 0.05}px ${FONT}`;
    ctx.fillText("SONIC", w * 0.08, h * 0.93);
    ctx.fillStyle = ACCENT;
    ctx.fillText("PRINTS", w * 0.08 + ctx.measureText("SONIC ").width, h * 0.93);
  };
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const CARD_W = 2.1;
const CARD_H = 3;
const ENTER_STAGGER = 0.12;
const ENTER_TIME = 1.1;

interface Slot {
  pos: THREE.Vector3;
  rotY: number;
  rotZ?: number;
}

/** Horizontal distance between fanned cards (less than a card width, so they overlap). */
const FAN_STEP = 1.8;

/** Arc on wide screens, 3×2 on medium, 2×3 on phones. Returns slots and the layout's bounds. */
function layout(count: number, aspect: number) {
  const slots: Slot[] = [];
  
  if (aspect >= 1.25) {
    // A fanned hand of cards: overlapping, dropping and turning away towards the edges.
    const mid = (count - 1) / 2;
    for (let i = 0; i < count; i++) {
      const o = i - mid;
      slots.push({ pos: new THREE.Vector3(o * FAN_STEP, -o * o * 0.07, i * 0.04), rotY: 0, rotZ: -o * 0.07 });
    }
    return { slots, width: (count - 1) * FAN_STEP + CARD_W + 0.4, height: CARD_H + 0.9 };
  }
  const cols = aspect >= 0.75 ? 3 : 2;
  const rows = Math.ceil(count / cols);
  const gx = CARD_W + 0.35;
  const gy = CARD_H + 0.4;
  for (let i = 0; i < count; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    slots.push({
      pos: new THREE.Vector3((c - (cols - 1) / 2) * gx, ((rows - 1) / 2 - r) * gy, 0),
      rotY: 0,
    });
  }
  return { slots, width: cols * gx, height: rows * gy };
}

const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export interface CrewControls {
  /** Highlight one card (-1 = none), e.g. from a focused button. */
  highlight: (i: number) => void;
  flip: (i: number) => void;
}

interface Props {
  crew: CrewMember[];
  controlsRef?: RefObject<CrewControls | null>;
  className?: string;
}

export default function CrewScene({ crew, controlsRef, className = "" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    return mountStage(
      host,
      ({ scene, camera, reduced }) => {
        scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        const key = new THREE.DirectionalLight(0xffffff, 1.4);
        key.position.set(-4, 6, 8);
        scene.add(key);
        // A warm light that follows the cursor so a highlight sweeps across the cards.
        const spot = new THREE.PointLight(0xffb27a, 26, 14, 1.4);
        spot.position.set(0, 0, 4);
        scene.add(spot);

        const repaints: (() => void)[] = [];
        const root = new THREE.Group();
        scene.add(root);

        const cards = crew.map((m, i) => {
          const f = labelTexture(TEX_W, TEX_H, paintFront(m, i, crew.length));
          const b = labelTexture(TEX_W, TEX_H, paintBack(m));
          repaints.push(f.repaint, b.repaint);
          const parts: CardParts = roundedCard(CARD_W, CARD_H, 0.16, 0.07, f.texture, b.texture, BRAND.accent);
          parts.front.material.roughness = 0.32;
          const pivot = new THREE.Group(); // positioned by layout
          pivot.add(parts.group);
          root.add(pivot);
          parts.group.traverse((o) => (o.userData.card = i));
          return { pivot, card: parts.group, hover: 0, flip: 0, flipTarget: 0, slot: { pos: new THREE.Vector3(), rotY: 0 } as Slot };
        });

        document.fonts.ready.then(() => repaints.forEach((r) => r())).catch(() => {});

        /* dust */
        const DUST = 220;
        const dustPos = new Float32Array(DUST * 3);
        for (let i = 0; i < DUST; i++) {
          dustPos[i * 3] = (Math.random() - 0.5) * 22;
          dustPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
          dustPos[i * 3 + 2] = -2 - Math.random() * 6;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
        const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: BRAND.accent, size: 0.05, transparent: true, opacity: 0.6, depthWrite: false }));
        scene.add(dust);

        /* pointer + picking */
        const ndc = new THREE.Vector2(9, 9);
        const raycaster = new THREE.Raycaster();
        let hovered = -1;
        let forced = -1;
        let pointerInside = false;

        const pick = () => {
          if (!pointerInside) return -1;
          raycaster.setFromCamera(ndc, camera);
          const hit = raycaster.intersectObjects(root.children, true)[0];
          return hit ? (hit.object.userData.card as number) : -1;
        };
        const onMove = (e: PointerEvent) => {
          const r = host.getBoundingClientRect();
          ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
          pointerInside = true;
        };
        const onLeave = () => {
          pointerInside = false;
          ndc.set(9, 9);
        };
        const flip = (i: number) => {
          const c = cards[i];
          if (c) c.flipTarget = c.flipTarget === 0 ? Math.PI : 0;
        };
        const onClick = (e: MouseEvent) => {
          onMove(e as PointerEvent);
          const i = pick();
          if (i >= 0) flip(i);
        };
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerleave", onLeave);
        host.addEventListener("click", onClick);

        if (controlsRef) {
          controlsRef.current = {
            highlight: (i) => {
              forced = i;
            },
            flip,
          };
        }

        const fit = (w: number, h: number) => {
          const aspect = w / h;
          const { slots, width, height } = layout(cards.length, aspect);
          cards.forEach((c, i) => (c.slot = slots[i]));
          const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
          const dist = Math.max((height + 0.8) / 2 / t, (width + 0.6) / 2 / (t * aspect));
          camera.position.set(0, 0, dist + 0.5);
          camera.lookAt(0, 0, 0);
        };

        const tmp = new THREE.Vector3();

        return {
          resize: fit,
          update: (t, dt) => {
            const k = 1 - Math.exp(-dt * 8);
            hovered = forced >= 0 ? forced : pick();
            host.style.cursor = hovered >= 0 ? "pointer" : "";

            // Light follows the cursor across the card plane.
            tmp.set(ndc.x, ndc.y, 0.5).unproject(camera).sub(camera.position).normalize();
            const target = pointerInside ? camera.position.clone().add(tmp.multiplyScalar(camera.position.z - 3)) : new THREE.Vector3(0, 1, 4);
            spot.position.lerp(target, k * 0.6);

            cards.forEach((c, i) => {
              const enter = reduced ? 1 : THREE.MathUtils.clamp((t - i * ENTER_STAGGER) / ENTER_TIME, 0, 1);
              const e = easeOutBack(enter);
              c.hover += ((hovered === i ? 1 : 0) - c.hover) * k;
              c.flip += (c.flipTarget - c.flip) * (1 - Math.exp(-dt * 6));

              const float = Math.sin(t * 0.9 + i * 1.3) * 0.08;
              c.pivot.position.set(
                c.slot.pos.x,
                c.slot.pos.y + float + (1 - e) * -7 + c.hover * 0.15,
                c.slot.pos.z + c.hover * 1.1,
              );
              // Hovering straightens a fanned card so it can be read.
              c.pivot.rotation.set((1 - e) * 1.1, c.slot.rotY, (c.slot.rotZ ?? 0) * (1 - c.hover) + Math.sin(t * 0.6 + i) * 0.015);
              c.pivot.scale.setScalar(1 + c.hover * 0.06);

              // Tilt toward the cursor while hovered; the flip spins the inner card.
              let tiltX = 0;
              let tiltY = 0;
              if (hovered === i && pointerInside) {
                const p = c.pivot.position.clone().project(camera);
                tiltX = THREE.MathUtils.clamp((ndc.y - p.y) * 1.6, -0.35, 0.35);
                tiltY = THREE.MathUtils.clamp((ndc.x - p.x) * 1.6, -0.4, 0.4);
              }
              c.card.rotation.x += (-tiltX * c.hover - c.card.rotation.x) * k;
              c.card.rotation.y = c.flip + tiltY * c.hover;
            });

            dust.rotation.y = t * 0.015;
          },
          dispose: () => {
            host.removeEventListener("pointermove", onMove);
            host.removeEventListener("pointerleave", onLeave);
            host.removeEventListener("click", onClick);
            host.style.cursor = "";
            if (controlsRef) controlsRef.current = null;
            disposeTree(root);
            disposeTree(dust);
          },
        };
      },
      { fov: 35 },
    );
  }, [crew, controlsRef]);

  return <div ref={hostRef} className={`absolute inset-0 touch-pan-y ${className}`} />;
}
