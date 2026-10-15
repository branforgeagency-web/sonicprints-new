"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PAINT } from "./painters";
import { BRAND, disposeTree, mountStage } from "./stage";
import { labelTexture, type Painter } from "./textures";

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

interface Floater {
  obj: THREE.Object3D;
  base: THREE.Vector3;
  spin: THREE.Vector3;
  phase: number;
  depth: number;
}

export default function QuoteScene({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    return mountStage(
      host,
      ({ scene, camera, pointer }) => {
        const repaints: (() => void)[] = [];
        const tex = (w: number, h: number, paint: Painter) => {
          const t = labelTexture(w, h, paint);
          repaints.push(t.repaint);
          return t.texture;
        };
        const std = (opts: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial({ roughness: 0.55, ...opts });

        /* lights */
        scene.add(new THREE.HemisphereLight(0xfff4e6, 0x001408, 1.4));
        const key = new THREE.DirectionalLight(0xffffff, 2.2);
        key.position.set(4, 6, 8);
        scene.add(key);
        const glow = new THREE.PointLight(BRAND.accent, 40, 18, 1.6);
        glow.position.set(-3, -2, 4);
        scene.add(glow);

        const group = new THREE.Group();
        scene.add(group);
        const floaters: Floater[] = [];
        const add = (obj: THREE.Object3D, pos: [number, number, number], rot: [number, number, number], depth = 1) => {
          obj.position.set(...pos);
          obj.rotation.set(...rot);
          group.add(obj);
          floaters.push({
            obj,
            base: obj.position.clone(),
            spin: new THREE.Vector3((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.35, (Math.random() - 0.5) * 0.15),
            phase: Math.random() * Math.PI * 2,
            depth,
          });
        };

        /* business cards — a small fanned stack */
        const cardGeo = new THREE.BoxGeometry(1.75, 1, 0.025);
        const cardFront = tex(700, 400, PAINT.cardFront);
        const cardBack = tex(700, 400, PAINT.cardBack);
        const edge = std({ color: BRAND.cream });
        const cards = new THREE.Group();
        for (let i = 0; i < 4; i++) {
          const card = new THREE.Mesh(cardGeo, [
            edge,
            edge,
            edge,
            edge,
            std({ map: cardFront, roughness: 0.35 }),
            std({ map: cardBack }),
          ]);
          card.position.set(i * 0.06, -i * 0.05, -i * 0.04);
          card.rotation.z = i * 0.09;
          cards.add(card);
        }
        add(cards, [-1.6, 1.25, 0.6], [-0.25, 0.45, -0.12], 1.2);

        /* mug */
        const mug = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.62, 0.56, 1.35, 48, 1, true),
          std({ map: tex(1024, 512, PAINT.mug), side: THREE.DoubleSide, roughness: 0.25 }),
        );
        body.rotation.y = Math.PI; // a cylinder's texture is centred on its back; turn the logo to the front
        const base = new THREE.Mesh(new THREE.CircleGeometry(0.56, 48), std({ color: BRAND.cream }));
        base.rotation.x = Math.PI / 2;
        base.position.y = -0.675;
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 16, 32, Math.PI * 1.25), std({ color: BRAND.cream, roughness: 0.25 }));
        handle.position.x = 0.66;
        handle.rotation.z = -Math.PI * 0.62;
        mug.add(body, base, handle);
        add(mug, [1.7, 1.4, -0.2], [0.18, -0.6, 0.08], 0.9);

        /* packaging box */
        const boxTex = tex(512, 512, PAINT.box);
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 1.4, 1.4),
          std({ map: boxTex, roughness: 0.7 }),
        );
        add(box, [0.6, -1.55, 0.3], [0.5, 0.7, 0.1], 1.1);

        /* tote bag */
        const tote = new THREE.Group();
        const bag = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 1.7, 0.18),
          std({ map: tex(512, 580, PAINT.tote), roughness: 0.95 }),
        );
        const strapMat = std({ color: 0xe6dccb, roughness: 0.95 });
        for (const x of [-0.35, 0.35]) {
          const strap = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 10, 32, Math.PI), strapMat);
          strap.position.set(x, 0.85, 0);
          tote.add(strap);
        }
        tote.add(bag);
        add(tote, [-2.3, -1.25, -0.6], [0.05, 0.4, 0.08], 0.8);

        /* roll-up banner */
        const banner = new THREE.Group();
        const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.3), std({ map: tex(400, 1100, PAINT.banner), side: THREE.DoubleSide }));
        const foot = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.14, 0.3), std({ color: 0x2a2f2c, metalness: 0.6, roughness: 0.35 }));
        foot.position.y = -1.72;
        banner.add(sheet, foot);
        add(banner, [3.1, -0.4, -1.8], [0, -0.45, 0.04], 0.6);

        /* stickers */
        const stickerGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.02, 40);
        const stickerTex = tex(256, 256, PAINT.sticker);
        const stickerMat = [std({ color: BRAND.accent }), std({ map: stickerTex, roughness: 0.3 }), std({ color: BRAND.cream })];
        const stickerSpots: [number, number, number][] = [
          [-0.2, 2.5, -1],
          [2.9, 2.4, -1.4],
          [-3.1, 0.4, -1.2],
          [2.4, -2.5, 0.2],
          [-0.9, -0.15, 1.4],
        ];
        for (const pos of stickerSpots) {
          const s = new THREE.Mesh(stickerGeo, stickerMat);
          add(s, pos, [Math.PI / 2 - 0.4, 0, Math.random()], 1.4);
        }

        /* drifting ink dust */
        const DUST = 260;
        const dustPos = new Float32Array(DUST * 3);
        for (let i = 0; i < DUST; i++) {
          dustPos[i * 3] = (Math.random() - 0.5) * 14;
          dustPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
          dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
        const dust = new THREE.Points(
          dustGeo,
          new THREE.PointsMaterial({ color: BRAND.accent, size: 0.045, transparent: true, opacity: 0.7, depthWrite: false }),
        );
        scene.add(dust);

        document.fonts.ready.then(() => repaints.forEach((r) => r())).catch(() => {});

        return {
          resize: (w, h) => {
            // The products span ~7.5 units across; shrink them to fit narrow (portrait) containers.
            group.scale.setScalar(THREE.MathUtils.clamp((w / h) * 0.85, 0.5, 1));
            camera.position.z = 10;
          },
          update: (t, dt) => {
            for (const f of floaters) {
              f.obj.position.x = f.base.x + pointer.x * 0.25 * f.depth;
              f.obj.position.y = f.base.y + Math.sin(t * 0.8 + f.phase) * 0.16 + pointer.y * 0.18 * f.depth;
              f.obj.rotation.x += f.spin.x * dt;
              f.obj.rotation.y += f.spin.y * dt;
              f.obj.rotation.z += f.spin.z * dt;
            }
            group.rotation.y = pointer.x * 0.18;
            group.rotation.x = -pointer.y * 0.1;
            dust.rotation.y = t * 0.02;
            dust.position.y = Math.sin(t * 0.3) * 0.2;
            glow.position.x = -3 + Math.sin(t * 0.5) * 1.5;
          },
          dispose: () => {
            disposeTree(group);
            disposeTree(dust);
          },
        };
      },
      { fov: 38, cameraZ: 10 },
    );
  }, []);

  return <div ref={hostRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`} />;
}
