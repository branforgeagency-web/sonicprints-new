"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Kit } from "@/lib/kits";
import { roundedCard } from "./card";
import { BRAND, disposeTree, mountStage } from "./stage";
import { FONT, labelTexture, wrapText, type Painter } from "./textures";

/* ------------------------------------------------------------------ */
/* Card artwork                                                        */
/* ------------------------------------------------------------------ */

const ACCENT = "#bd5501";
const INK = "#001408";
const TEX_W = 640;
const TEX_H = 890;

function paintFront(kit: Kit, total: number, label: string): Painter {
  return (ctx, w, h) => {
    ctx.fillStyle = kit.background;
    ctx.fillRect(0, 0, w, h);
    const dim = kit.color === INK ? "rgba(0,20,8,0.55)" : "rgba(247,244,238,0.6)";
    const accent = kit.background === ACCENT ? INK : ACCENT;

    ctx.fillStyle = dim;
    ctx.font = `500 ${w * 0.042}px ${FONT}`;
    ctx.fillText(`${label} ${kit.number} / ${String(total).padStart(2, "0")}`, w * 0.08, h * 0.08);

    ctx.fillStyle = kit.color;
    ctx.font = `900 ${w * 0.36}px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText(kit.number, w * 0.94, h * 0.36);
    ctx.textAlign = "left";

    ctx.fillStyle = accent;
    ctx.fillRect(w * 0.08, h * 0.46, w * 0.14, h * 0.008);

    ctx.fillStyle = kit.color;
    // Long titles (category names) get a smaller size and fewer listed items so nothing overflows.
    const long = kit.title.length > 24;
    const size = w * (long ? 0.082 : 0.115);
    ctx.font = `900 ${size}px ${FONT}`;
    const end = wrapText(ctx, kit.title.toUpperCase(), w * 0.08, h * 0.56, w * 0.84, size);

    ctx.fillStyle = dim;
    ctx.font = `500 ${w * 0.04}px ${FONT}`;
    kit.includes.slice(0, long ? 4 : 5).forEach((item, i) => ctx.fillText(`— ${item}`, w * 0.08, end + h * 0.02 + i * w * 0.055));

    ctx.fillStyle = kit.color;
    ctx.font = `900 ${w * 0.04}px ${FONT}`;
    ctx.fillText("SONIC", w * 0.08, h * 0.95);
    ctx.fillStyle = accent;
    ctx.fillText("PRINTS", w * 0.08 + ctx.measureText("SONIC ").width, h * 0.95);
  };
}

const paintBack: Painter = (ctx, w, h) => {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(189,85,1,0.22)";
  for (let y = 0; y < h; y += 28) {
    for (let x = (y / 28) % 2 ? 14 : 0; x < w; x += 28) {
      ctx.beginPath();
      ctx.arc(x, y, 4 + 3 * Math.sin((x + y) * 0.01), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = "#f7f4ee";
  ctx.font = `900 ${w * 0.12}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("SONIC", w / 2, h * 0.5);
  ctx.fillStyle = ACCENT;
  ctx.fillText("PRINTS", w / 2, h * 0.5 + w * 0.13);
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const CARD_W = 2.3;
const CARD_H = 3.2;
const RADIUS = 6.4;
const DRAG_SPEED = 0.006; // radians per px
const CLICK_SLOP = 6; // px of movement still counted as a click

interface Props {
  kits: Kit[];
  /** Counter label on each card, e.g. "KIT" or "CATEGORY". */
  label?: string;
  /** Index of the kit at the front, owned by the parent. */
  activeRef: RefObject<number>;
  onSelect: (index: number) => void;
  className?: string;
}

export default function KitRingScene({ kits, label = "KIT", activeRef, onSelect, className = "" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const N = kits.length;
    const step = (Math.PI * 2) / N;

    return mountStage(
      host,
      ({ scene, camera, pointer }) => {
        scene.fog = new THREE.Fog(BRAND.ink, 10, 24);
        scene.add(new THREE.AmbientLight(0xffffff, 1.1));
        const key = new THREE.DirectionalLight(0xffffff, 1.3);
        key.position.set(3, 6, 10);
        scene.add(key);
        const rim = new THREE.PointLight(BRAND.accent, 60, 20, 1.5);
        rim.position.set(0, 3, RADIUS + 2);
        scene.add(rim);

        const world = new THREE.Group();
        world.rotation.x = 0.07;
        scene.add(world);
        const ring = new THREE.Group();
        world.add(ring);

        const repaints: (() => void)[] = [];
        const back = labelTexture(TEX_W, TEX_H, paintBack);
        repaints.push(back.repaint);

        const cards = kits.map((kit, i) => {
          const front = labelTexture(TEX_W, TEX_H, paintFront(kit, N, label));
          repaints.push(front.repaint);
          const parts = roundedCard(CARD_W, CARD_H, 0.14, 0.06, front.texture, back.texture, BRAND.accent);
          const holder = new THREE.Group();
          const a = i * step;
          holder.position.set(Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS);
          holder.rotation.y = a;
          holder.add(parts.group);
          ring.add(holder);
          parts.group.traverse((o) => (o.userData.kit = i));
          return { parts, lift: 0 };
        });
        document.fonts.ready.then(() => repaints.forEach((r) => r())).catch(() => {});

        /* stage floor: glowing rings + dust */
        const floor = new THREE.Group();
        floor.position.y = -CARD_H / 2 - 0.45;
        const ringMat = new THREE.MeshBasicMaterial({ color: BRAND.accent, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        for (const [r, o] of [
          [RADIUS + 1.1, 0.5],
          [RADIUS + 1.6, 0.2],
          [RADIUS - 1.2, 0.12],
        ] as const) {
          const m = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.03, 128), ringMat.clone());
          m.material.opacity = o;
          m.rotation.x = -Math.PI / 2;
          floor.add(m);
        }
        world.add(floor);

        const DUST = 500;
        const dustPos = new Float32Array(DUST * 3);
        for (let i = 0; i < DUST; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = 2 + Math.random() * 12;
          dustPos[i * 3] = Math.cos(a) * r;
          dustPos[i * 3 + 1] = (Math.random() - 0.3) * 8;
          dustPos[i * 3 + 2] = Math.sin(a) * r;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
        const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: BRAND.accent, size: 0.06, transparent: true, opacity: 0.55, depthWrite: false }));
        world.add(dust);

        /* interaction */
        let rot = -(activeRef.current ?? 0) * step;
        let dragging = false;
        let dragStartX = 0;
        let dragStartRot = 0;
        let moved = 0;
        const raycaster = new THREE.Raycaster();
        const ndc = new THREE.Vector2();

        const nearest = (r: number) => (((Math.round(-r / step) % N) + N) % N);

        const onDown = (e: PointerEvent) => {
          dragging = true;
          moved = 0;
          dragStartX = e.clientX;
          dragStartRot = rot;
          host.setPointerCapture(e.pointerId);
          host.style.cursor = "grabbing";
        };
        const onMove = (e: PointerEvent) => {
          if (!dragging) return;
          const dx = e.clientX - dragStartX;
          moved = Math.max(moved, Math.abs(dx));
          rot = dragStartRot + dx * DRAG_SPEED;
        };
        const onUp = (e: PointerEvent) => {
          if (!dragging) return;
          dragging = false;
          host.style.cursor = "grab";
          if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
          if (moved < CLICK_SLOP) {
            const r = host.getBoundingClientRect();
            ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
            raycaster.setFromCamera(ndc, camera);
            const hit = raycaster.intersectObjects(ring.children, true)[0];
            if (hit) onSelectRef.current(hit.object.userData.kit as number);
          } else {
            onSelectRef.current(nearest(rot));
          }
        };
        host.style.cursor = "grab";
        host.addEventListener("pointerdown", onDown);
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerup", onUp);
        host.addEventListener("pointercancel", onUp);

        return {
          resize: (w, h) => {
            const aspect = w / h;
            const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
            // Desktop: the front card fills about half the height with neighbours either side.
            // Phones: keep the front card (and a sliver of its neighbours) in frame.
            const narrow = aspect < 0.8;
            const dist = narrow ? 15 : Math.max(10.5, (CARD_W * 3.2) / 2 / (t * aspect));
            camera.position.set(0, 1.1, RADIUS + dist);
            camera.lookAt(0, -0.2, RADIUS - 2);
            if (w >= 900) camera.setViewOffset(w, h, -w * 0.22, 0, w, h);
            else camera.setViewOffset(w, h, 0, h * 0.07, w, h);
          },
          update: (t, dt) => {
            if (!dragging) {
              // Ease to the active kit along the shortest way round.
              const base = -(activeRef.current ?? 0) * step;
              const target = base + Math.PI * 2 * Math.round((rot - base) / (Math.PI * 2));
              rot += (target - rot) * (1 - Math.exp(-dt * 5));
            }
            ring.rotation.y = rot;
            world.rotation.y = pointer.x * 0.06;
            world.rotation.x = 0.07 - pointer.y * 0.03;

            cards.forEach((c, i) => {
              // 1 when facing the camera, falling to 0 round the back.
              const facing = (Math.cos(i * step + rot) + 1) / 2;
              const front = Math.pow(facing, 18);
              c.lift += (front - c.lift) * (1 - Math.exp(-dt * 8));
              c.parts.group.position.set(0, Math.sin(t * 1.1 + i) * 0.06 + c.lift * 0.2, c.lift * 0.9);
              c.parts.group.scale.setScalar(1 + c.lift * 0.12);
              c.parts.group.rotation.y = Math.sin(t * 0.7 + i) * 0.03 * (1 - c.lift);
              const shade = 0.3 + 0.7 * Math.pow(facing, 2.5);
              c.parts.front.material.color.setScalar(shade);
              c.parts.back.material.color.setScalar(shade);
            });
            floor.rotation.y = -t * 0.05;
            dust.rotation.y = t * 0.02;
          },
          dispose: () => {
            host.removeEventListener("pointerdown", onDown);
            host.removeEventListener("pointermove", onMove);
            host.removeEventListener("pointerup", onUp);
            host.removeEventListener("pointercancel", onUp);
            host.style.cursor = "";
            disposeTree(world);
          },
        };
      },
      { fov: 38, clearColor: BRAND.ink },
    );
  }, [kits, label, activeRef]);

  return <div ref={hostRef} aria-hidden="true" className={`absolute inset-0 touch-pan-y select-none ${className}`} />;
}
