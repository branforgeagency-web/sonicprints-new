"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { BRAND, disposeTree, mountStage } from "./stage";

/* ------------------------------------------------------------------ */
/* Tuning                                                              */
/* ------------------------------------------------------------------ */

/** How quickly the drawn progress catches up with the scroll position (per second). */
const FOLLOW_RATE = 5;
/** Camera offset from the job marker. */
const CAM_OFFSET = new THREE.Vector3(2.2, 2.4, 7.5);

/** A winding path; one control point per stage so each stage sits on the curve. */
function stagePoints(count: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    pts.push(new THREE.Vector3(side * 2.6, Math.sin(i * 1.3) * 1.1, -i * 6));
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface Props {
  /** 0..1 scroll progress through the pipeline, written by the parent. */
  progressRef: RefObject<number>;
  stages: number;
  className?: string;
}

export default function PipelineScene({ progressRef, stages, className = "" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    return mountStage(
      host,
      ({ scene, camera, pointer }) => {
        scene.fog = new THREE.FogExp2(BRAND.ink, 0.045);

        scene.add(new THREE.AmbientLight(0xffffff, 0.35));
        const key = new THREE.DirectionalLight(0xffffff, 1.6);
        key.position.set(3, 8, 6);
        scene.add(key);

        const root = new THREE.Group();
        scene.add(root);

        const points = stagePoints(stages);
        const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.4);
        // Arc-length positions of each stage along the curve (stages aren't evenly spaced by length).
        const stageU = points.map((p) => {
          let best = 0;
          let bestD = Infinity;
          for (let i = 0; i <= 200; i++) {
            const d = curve.getPointAt(i / 200).distanceToSquared(p);
            if (d < bestD) {
              bestD = d;
              best = i / 200;
            }
          }
          return best;
        });

        /* track: faint full path + bright progress path */
        const SEG = 600;
        const trackGeo = new THREE.TubeGeometry(curve, SEG, 0.035, 8, false);
        root.add(new THREE.Mesh(trackGeo, new THREE.MeshBasicMaterial({ color: BRAND.cream, transparent: true, opacity: 0.16 })));
        const litGeo = new THREE.TubeGeometry(curve, SEG, 0.07, 10, false);
        const lit = new THREE.Mesh(litGeo, new THREE.MeshBasicMaterial({ color: BRAND.accent }));
        root.add(lit);
        const litIndexCount = litGeo.index ? litGeo.index.count : 0;

        /* stage nodes */
        const nodeGeo = new THREE.IcosahedronGeometry(0.55, 1);
        const wireGeo = new THREE.IcosahedronGeometry(0.85, 1);
        const ringGeo = new THREE.TorusGeometry(1.15, 0.02, 8, 64);
        const nodes = points.map((p) => {
          const g = new THREE.Group();
          g.position.copy(p);
          const core = new THREE.Mesh(
            nodeGeo,
            new THREE.MeshStandardMaterial({ color: 0x0c2a17, emissive: BRAND.accent, emissiveIntensity: 0, roughness: 0.35, metalness: 0.2, flatShading: true }),
          );
          const wire = new THREE.Mesh(wireGeo, new THREE.MeshBasicMaterial({ color: BRAND.cream, wireframe: true, transparent: true, opacity: 0.18 }));
          const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: BRAND.accent, transparent: true, opacity: 0 }));
          g.add(core, wire, ring);
          root.add(g);
          return { g, core, wire, ring, lit: 0 };
        });

        /* the job travelling the line */
        const job = new THREE.Group();
        const jobCore = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 16), new THREE.MeshBasicMaterial({ color: 0xffd2a6 }));
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 32, 16),
          new THREE.MeshBasicMaterial({ color: BRAND.accent, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }),
        );
        const jobLight = new THREE.PointLight(BRAND.accent, 30, 10, 1.8);
        job.add(jobCore, halo, jobLight);
        root.add(job);

        /* trail particles behind the job */
        const TRAIL = 90;
        const trailPos = new Float32Array(TRAIL * 3);
        const trailGeo = new THREE.BufferGeometry();
        trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
        const trail = new THREE.Points(
          trailGeo,
          new THREE.PointsMaterial({ color: BRAND.accent, size: 0.09, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }),
        );
        root.add(trail);

        /* star field / paper dust */
        const STARS = 1400;
        const starPos = new Float32Array(STARS * 3);
        for (let i = 0; i < STARS; i++) {
          starPos[i * 3] = (Math.random() - 0.5) * 50;
          starPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
          starPos[i * 3 + 2] = 10 - Math.random() * (stages * 6 + 30);
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        const stars = new THREE.Points(
          starGeo,
          new THREE.PointsMaterial({ color: BRAND.cream, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false }),
        );
        scene.add(stars);

        /* floor grid for depth */
        const grid = new THREE.GridHelper(120, 120, BRAND.accent, 0x0d3a1f);
        grid.position.set(0, -3.2, -stages * 3);
        const gridMat = grid.material as THREE.Material;
        gridMat.transparent = true;
        gridMat.opacity = 0.22;
        scene.add(grid);

        let shown = 0;
        const camPos = new THREE.Vector3();
        const lookAt = new THREE.Vector3();
        const camTarget = new THREE.Vector3();
        const lookTarget = new THREE.Vector3();
        const tmp = new THREE.Vector3();
        let first = true;

        return {
          resize: (w, h) => {
            // Frame the job off-centre so it clears the text: right of the panels on desktop, above them on mobile.
            if (w >= 768) camera.setViewOffset(w, h, -w * 0.2, 0, w, h);
            else camera.setViewOffset(w, h, 0, h * 0.16, w, h);
          },
          update: (t, dt) => {
            const target = THREE.MathUtils.clamp(progressRef.current ?? 0, 0, 1);
            shown = first ? target : shown + (target - shown) * (1 - Math.exp(-dt * FOLLOW_RATE));

            // Map 0..1 progress so it rests on each stage node rather than between them.
            const seg = shown * (stages - 1);
            const i = Math.min(stages - 2, Math.floor(seg));
            const f = seg - i;
            const eased = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
            const u = THREE.MathUtils.lerp(stageU[i], stageU[i + 1], eased);

            curve.getPointAt(u, job.position);
            halo.scale.setScalar(1 + Math.sin(t * 4) * 0.12);
            lit.geometry.setDrawRange(0, Math.floor((litIndexCount * u) / 6) * 6);

            for (let k = 0; k < TRAIL; k++) {
              const tu = Math.max(0, u - k * 0.0018);
              curve.getPointAt(tu, tmp);
              const jitter = k * 0.004;
              trailPos[k * 3] = tmp.x + Math.sin(t * 3 + k) * jitter;
              trailPos[k * 3 + 1] = tmp.y + Math.cos(t * 2.5 + k) * jitter;
              trailPos[k * 3 + 2] = tmp.z;
            }
            trailGeo.attributes.position.needsUpdate = true;

            nodes.forEach((n, k) => {
              const reached = u >= stageU[k] - 0.002 ? 1 : 0;
              n.lit += (reached - n.lit) * (1 - Math.exp(-dt * 6));
              const mat = n.core.material as THREE.MeshStandardMaterial;
              mat.emissiveIntensity = n.lit * 1.6;
              n.core.rotation.y = t * 0.4 + k;
              n.core.rotation.x = t * 0.25;
              n.wire.rotation.y = -t * 0.2;
              const near = Math.max(0, 1 - Math.abs(u - stageU[k]) * 14);
              (n.ring.material as THREE.MeshBasicMaterial).opacity = near * 0.9;
              n.ring.scale.setScalar(1 + near * 0.25 + Math.sin(t * 3) * 0.04 * near);
              n.ring.lookAt(camera.position);
            });

            // Camera trails the job, swaying with the pointer; looks slightly ahead along the line.
            camTarget.copy(job.position).add(CAM_OFFSET);
            camTarget.x += pointer.x * 1.2;
            camTarget.y += pointer.y * 0.8;
            curve.getPointAt(Math.min(1, u + 0.04), lookTarget);
            lookTarget.lerp(job.position, 0.6);
            const k = first ? 1 : 1 - Math.exp(-dt * 3);
            camPos.lerp(camTarget, k);
            lookAt.lerp(lookTarget, k);
            camera.position.copy(camPos);
            camera.lookAt(lookAt);
            first = false;
          },
          dispose: () => {
            disposeTree(root);
            disposeTree(stars);
            grid.dispose();
          },
        };
      },
      { fov: 45, cameraZ: 8, clearColor: BRAND.ink },
    );
  }, [progressRef, stages]);

  return <div ref={hostRef} aria-hidden="true" className={`absolute inset-0 ${className}`} />;
}
