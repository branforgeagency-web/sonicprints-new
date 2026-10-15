"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { faceGeometry } from "./card";
import { PAINT } from "./painters";
import { createNeonTails } from "./neonTails";
import { BRAND, disposeTree, mountStage } from "./stage";
import { labelTexture, type Painter } from "./textures";

/* ------------------------------------------------------------------ */
/* Tuning                                                              */
/* ------------------------------------------------------------------ */

const RX = 4.6; // orbit radius across
const RZ = 2.9; // orbit radius in depth
const SPEED = 0.17; // radians per second
const PRINT_ZONE = 0.8; // radians either side of the front where the print line applies
const RESET_AT = 2.5; // radians past the front where products go blank again (behind the core)
const SPARKS = 260;

/* ------------------------------------------------------------------ */
/* "Printable" material: blank until the print line passes over it     */
/* ------------------------------------------------------------------ */

/** Uniforms shared by every printable material: where the print line is, and its glow. */
const shared = {
  uBeamX: { value: 0 },
  uGlow: { value: new THREE.Color(0xff8a2a).multiplyScalar(2.2) },
};

interface PrintState {
  /** 0 = blank, 1 = printing (left of the line is printed), 2 = printed. */
  uState: { value: number };
  uBlank: { value: THREE.Color };
}

function printable(
  map: THREE.Texture,
  blank: THREE.ColorRepresentation,
  params: THREE.MeshStandardMaterialParameters = {},
) {
  const mat = new THREE.MeshStandardMaterial({
    map,
    roughness: 0.5,
    ...params,
  });
  const own: PrintState = {
    uState: { value: 0 },
    uBlank: { value: new THREE.Color(blank) },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, own, shared);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vPrintWorld;",
      )
      .replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvPrintWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vPrintWorld;\nuniform float uState;\nuniform float uBeamX;\nuniform vec3 uBlank;\nuniform vec3 uGlow;",
      )
      .replace(
        "#include <map_fragment>",
        /* glsl */ `
        // Products travel right-to-left through the line, so whatever is left of it has been printed.
        float printed = uState > 1.5 ? 1.0 : (uState > 0.5 ? step(vPrintWorld.x, uBeamX) : 0.0);
        #ifdef USE_MAP
          vec4 texel = texture2D(map, vMapUv);
          diffuseColor.rgb *= mix(uBlank, texel.rgb, printed);
        #endif`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        if (uState > 0.5 && uState < 1.5) {
          float edge = 1.0 - smoothstep(0.0, 0.07, abs(vPrintWorld.x - uBeamX));
          totalEmissiveRadiance += uGlow * edge;
        }`,
      );
  };
  mat.userData.print = own;
  return mat;
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

interface Product {
  obj: THREE.Object3D;
  prints: THREE.MeshStandardMaterial[];
}

function tshirtShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.34, 1.05);
  s.quadraticCurveTo(0, 0.76, 0.34, 1.05);
  s.lineTo(0.64, 0.97);
  s.lineTo(1.0, 0.6);
  s.lineTo(0.78, 0.34);
  s.lineTo(0.6, 0.47);
  s.lineTo(0.6, -1.05);
  s.lineTo(-0.6, -1.05);
  s.lineTo(-0.6, 0.47);
  s.lineTo(-0.78, 0.34);
  s.lineTo(-1.0, 0.6);
  s.lineTo(-0.64, 0.97);
  s.closePath();
  return s;
}

function buildProducts(
  tex: (w: number, h: number, p: Painter) => THREE.Texture,
): Product[] {
  const plain = (
    color: THREE.ColorRepresentation,
    params: THREE.MeshStandardMaterialParameters = {},
  ) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...params });
  const products: Product[] = [];

  /* business cards */
  {
    const g = new THREE.Group();
    const front = printable(tex(700, 400, PAINT.cardFront), 0xf3efe6, {
      roughness: 0.35,
    });
    const edge = plain(0xf3efe6);
    const back = plain(0xf3efe6);
    const geo = new THREE.BoxGeometry(1.75, 1, 0.03);
    for (let i = 0; i < 3; i++) {
      const card = new THREE.Mesh(geo, [edge, edge, edge, edge, front, back]);
      card.position.set(i * 0.07, -i * 0.06, -i * 0.05);
      card.rotation.z = i * 0.08;
      g.add(card);
    }
    products.push({ obj: g, prints: [front] });
  }

  /* mug */
  {
    const g = new THREE.Group();
    const body = printable(tex(1024, 512, PAINT.mug), 0xf3efe6, {
      roughness: 0.22,
      side: THREE.DoubleSide,
    });
    const cream = plain(0xf3efe6, { roughness: 0.22 });
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.55, 1.3, 48, 1, true),
      body,
    );
    // A cylinder's texture is centred on its back (-z); turn the logo to face out.
    cyl.rotation.y = Math.PI;
    const base = new THREE.Mesh(new THREE.CircleGeometry(0.55, 48), cream);
    base.rotation.x = Math.PI / 2;
    base.position.y = -0.65;
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.29, 0.07, 14, 32, Math.PI * 1.25),
      cream,
    );
    handle.position.x = 0.64;
    handle.rotation.z = -Math.PI * 0.62;
    g.add(cyl, base, handle);
    products.push({ obj: g, prints: [body] });
  }

  /* T-shirt */
  {
    const g = new THREE.Group();
    const shape = tshirtShape();
    const front = printable(tex(600, 630, PAINT.tshirt), 0xf1eee7, {
      roughness: 0.9,
    });
    const fabric = plain(0xe7e2d8, { roughness: 0.95 });
    const face = new THREE.Mesh(faceGeometry(shape, 2, 2.1), front);
    face.position.z = 0.051;
    const back = new THREE.Mesh(faceGeometry(shape, 2, 2.1), fabric);
    back.rotation.y = Math.PI;
    back.position.z = -0.051;
    const edgeGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: false,
    });
    edgeGeo.translate(0, 0, -0.05);
    const edge = new THREE.Mesh(edgeGeo, [
      new THREE.MeshBasicMaterial({ visible: false }),
      fabric,
    ]);
    g.add(edge, face, back);
    g.scale.setScalar(0.85);
    products.push({ obj: g, prints: [front] });
  }

  /* packaging box */
  {
    const mat = printable(tex(512, 512, PAINT.box), 0xc9a36f, {
      roughness: 0.75,
    });
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), mat);
    products.push({ obj: box, prints: [mat] });
  }

  /* roll-up banner */
  {
    const g = new THREE.Group();
    const mat = printable(tex(400, 1100, PAINT.banner), 0xf3efe6);
    const sheetGeo = new THREE.PlaneGeometry(1.05, 2.9);
    const sheet = new THREE.Mesh(sheetGeo, mat);
    // Plain back so the print never shows mirrored from behind.
    const backing = new THREE.Mesh(sheetGeo, plain(0xdcd6ca));
    backing.rotation.y = Math.PI;
    backing.position.z = -0.005;
    g.add(backing);
    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.13, 0.28),
      plain(0x2a2f2c, { metalness: 0.6, roughness: 0.35 }),
    );
    foot.position.y = -1.5;
    g.add(sheet, foot);
    products.push({ obj: g, prints: [mat] });
  }

  /* tote bag */
  {
    const g = new THREE.Group();
    const toteTex = tex(512, 580, PAINT.tote);
    const front = printable(toteTex, 0xefe7d8, { roughness: 0.95 });
    const canvas = plain(0xe8dfcd, { roughness: 0.95 });
    const bag = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.65, 0.16), [
      canvas,
      canvas,
      canvas,
      canvas,
      front,
      canvas,
    ]);
    for (const x of [-0.34, 0.34]) {
      const strap = new THREE.Mesh(
        new THREE.TorusGeometry(0.27, 0.035, 10, 32, Math.PI),
        canvas,
      );
      strap.position.set(x, 0.82, 0);
      g.add(strap);
    }
    g.add(bag);
    products.push({ obj: g, prints: [front] });
  }

  /* notebook */
  {
    const cover = printable(tex(450, 620, PAINT.notebook), 0xe9e4da, {
      roughness: 0.6,
    });
    const pages = plain(0xfaf8f2, { roughness: 0.9 });
    const book = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.75, 0.2), [
      pages,
      pages,
      pages,
      pages,
      cover,
      pages,
    ]);
    products.push({ obj: book, prints: [cover] });
  }

  /* sticker */
  {
    const top = printable(tex(256, 256, PAINT.sticker), 0xffffff, {
      roughness: 0.3,
    });
    const sticker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.03, 48),
      [plain(0xffffff), top, plain(0xffffff)],
    );
    sticker.rotation.x = Math.PI / 2; // face the outside of the orbit
    const g = new THREE.Group();
    g.add(sticker);
    products.push({ obj: g, prints: [top] });
  }

  return products;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const easeOutBack = (t: number) =>
  1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);

/** Angle difference wrapped to (-π, π]. */
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

function haloTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.35, "rgba(255,255,255,0.25)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 8;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 128, 0);
  g.addColorStop(0, "rgba(255,138,42,0)");
  g.addColorStop(0.5, "rgba(255,138,42,1)");
  g.addColorStop(1, "rgba(255,138,42,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 8);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}


export default function PrintOrbitScene({
  className = "",
}: {
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    return mountStage(
      host,
      ({ scene, camera, pointer, renderer, reduced }) => {
        scene.fog = new THREE.Fog(BRAND.ink, 13, 24);

        scene.add(new THREE.HemisphereLight(0xfff4e6, 0x001408, 1.3));
        const key = new THREE.DirectionalLight(0xffffff, 1.6);
        key.position.set(-5, 7, 9);
        scene.add(key);

        const world = new THREE.Group();
        scene.add(world);

        /* products */
        const repaints: (() => void)[] = [];
        const tex = (w: number, h: number, p: Painter) => {
          const t = labelTexture(w, h, p);
          repaints.push(t.repaint);
          return t.texture;
        };
        const products = buildProducts(tex).map((p, i, all) => {
          const holder = new THREE.Group();
          holder.add(p.obj);
          world.add(holder);
          return {
            ...p,
            holder,
            base: (i / all.length) * Math.PI * 2,
            phase: Math.random() * Math.PI * 2,
          };
        });
        document.fonts.ready
          .then(() => repaints.forEach((r) => r()))
          .catch(() => {});

        /* neon comet tails sweeping around the centre */
        const tails = createNeonTails({ pixelRatio: renderer.getPixelRatio(), reduced });
        const coreGroup = tails.group;
        world.add(coreGroup);

        // Soft glow behind the core that flares while a product is being printed.
        const haloMat = new THREE.SpriteMaterial({
          map: haloTexture(),
          color: 0xff8a2a,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const halo = new THREE.Sprite(haloMat);
        halo.scale.setScalar(7);
        world.add(halo);

        /* orbit track */
        const track = new THREE.Mesh(
          new THREE.RingGeometry(0.995, 1.005, 160),
          new THREE.MeshBasicMaterial({
            color: BRAND.accent,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
          }),
        );
        track.rotation.x = -Math.PI / 2;
        track.scale.set(RX, RZ, 1);
        track.position.y = -1.55;
        world.add(track);

        /* print line at the front */
        const beam = new THREE.Group();
        beam.position.set(0, 0, RZ + 0.85);
        const core = new THREE.Mesh(
          new THREE.PlaneGeometry(0.035, 3.6),
          new THREE.MeshBasicMaterial({
            color: 0xffd0a0,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        const glowMat = new THREE.MeshBasicMaterial({
          map: glowTexture(),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0.55,
        });
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 3.9), glowMat);
        const headMat = new THREE.MeshStandardMaterial({
          color: 0x1a1f1c,
          metalness: 0.8,
          roughness: 0.3,
          emissive: BRAND.accent,
          emissiveIntensity: 0.25,
        });
        // Emitter at the foot only, so the beam fires upward and leaves the core in view.
        const head = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.2, 0.32),
          headMat,
        );
        head.position.y = -1.95;
        beam.add(head);
        beam.add(glow, core);
        world.add(beam);
        const beamLight = new THREE.PointLight(0xff8a2a, 18, 7, 1.6);
        beamLight.position.set(0, 0, RZ + 1.4);
        world.add(beamLight);

        /* sparks */
        const sparkPos = new Float32Array(SPARKS * 3);
        const sparkVel = new Float32Array(SPARKS * 3);
        const sparkLife = new Float32Array(SPARKS);
        const sparkGeo = new THREE.BufferGeometry();
        sparkGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(sparkPos, 3),
        );
        const sparks = new THREE.Points(
          sparkGeo,
          new THREE.PointsMaterial({
            color: 0xffa040,
            size: 0.07,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        world.add(sparks);
        sparkPos.fill(9999);
        let nextSpark = 0;
        let spawnDebt = 0;

        /* ink dust */
        const DUST = 420;
        const dustPos = new Float32Array(DUST * 3);
        for (let i = 0; i < DUST; i++) {
          dustPos[i * 3] = (Math.random() - 0.5) * 30;
          dustPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
          dustPos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
        const dust = new THREE.Points(
          dustGeo,
          new THREE.PointsMaterial({
            color: BRAND.accent,
            size: 0.05,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
          }),
        );
        scene.add(dust);

        const beamWorld = new THREE.Vector3();
        const tmp = new THREE.Vector3();
        let orbit = 0;

        return {
          resize: (w, h) => {
            const narrow = w / h < 0.8;
            tails.uniforms.uSize.value = narrow ? 5.5 : 8;
            // Phones: pull in closer and let the orbit run off the sides, so the core stays big.
            camera.position.set(0, 2.3, narrow ? 19 : 14.5);
            camera.lookAt(0, -0.2, 0);
            // Desktop: scene sits right of the copy. Phones: above it.
            if (narrow) camera.setViewOffset(w, h, 0, h * 0.2, w, h);
            else if (w / h < 1.25)
              camera.setViewOffset(w, h, 0, h * 0.12, w, h);
            else camera.setViewOffset(w, h, -w * 0.2, 0, w, h);
          },
          update: (t, dt) => {
            const scroll = Math.min(
              1,
              window.scrollY / Math.max(1, window.innerHeight),
            );
            orbit += dt * SPEED * (1 + scroll * 2.5);

            world.rotation.set(
              0.16 + scroll * 0.35 - pointer.y * 0.06,
              pointer.x * 0.14,
              0,
            );
            world.position.y = scroll * 2.2;

            beam.getWorldPosition(beamWorld);
            shared.uBeamX.value = beamWorld.x;

            let activity = 0;
            products.forEach((p, i) => {
              const theta = p.base + orbit;
              const intro = reduced
                ? 1
                : THREE.MathUtils.clamp((t - 0.35 - i * 0.12) / 1, 0, 1);
              p.holder.position.set(
                Math.cos(theta) * RX,
                Math.sin(t * 0.9 + p.phase) * 0.18,
                Math.sin(theta) * RZ,
              );
              p.holder.rotation.set(
                Math.sin(t * 0.7 + p.phase) * 0.08,
                Math.PI / 2 - theta + Math.sin(t * 0.5 + p.phase) * 0.15,
                Math.sin(t * 0.6 + p.phase) * 0.05,
              );
              p.holder.scale.setScalar(Math.max(0.0001, easeOutBack(intro)));

              // Where is this product relative to the front of the orbit?
              const a = wrap(theta - Math.PI / 2);
              const state =
                a > RESET_AT || a < -PRINT_ZONE ? 0 : a <= PRINT_ZONE ? 1 : 2;
              for (const m of p.prints)
                (m.userData.print as PrintState).uState.value = state;
              if (state === 1) {
                p.holder.getWorldPosition(tmp);
                activity = Math.max(
                  activity,
                  1 - Math.min(1, Math.abs(tmp.x - beamWorld.x) / 1.1),
                );
              }
            });

            /* line + light react to whatever is under it */
            const pulse = 0.5 + 0.5 * Math.sin(t * 9);
            glowMat.opacity = 0.35 + activity * 0.45 + pulse * 0.08;
            beamLight.intensity = 8 + activity * 32;
            headMat.emissiveIntensity = 0.25 + activity * 0.9;

            /* sparks fly off in the direction of travel while printing */
            spawnDebt += dt * activity * 260;
            while (spawnDebt >= 1) {
              spawnDebt -= 1;
              const k = nextSpark;
              nextSpark = (nextSpark + 1) % SPARKS;
              sparkPos[k * 3] = beam.position.x;
              sparkPos[k * 3 + 1] = (Math.random() - 0.5) * 3;
              sparkPos[k * 3 + 2] = beam.position.z - 0.2;
              sparkVel[k * 3] = -0.6 - Math.random() * 2.4;
              sparkVel[k * 3 + 1] = (Math.random() - 0.3) * 1.6;
              sparkVel[k * 3 + 2] = 0.4 + Math.random() * 1.4;
              sparkLife[k] = 0.35 + Math.random() * 0.5;
            }
            for (let k = 0; k < SPARKS; k++) {
              if (sparkLife[k] <= 0) continue;
              sparkLife[k] -= dt;
              if (sparkLife[k] <= 0) {
                sparkPos[k * 3] = 9999;
                continue;
              }
              sparkVel[k * 3 + 1] -= 4 * dt;
              sparkPos[k * 3] += sparkVel[k * 3] * dt;
              sparkPos[k * 3 + 1] += sparkVel[k * 3 + 1] * dt;
              sparkPos[k * 3 + 2] += sparkVel[k * 3 + 2] * dt;
            }
            sparkGeo.attributes.position.needsUpdate = true;

            tails.update(t, activity);
            const d = reduced
              ? 1
              : easeOutBack(THREE.MathUtils.clamp((t - 0.1) / 1.1, 0, 1));
            coreGroup.scale.setScalar(Math.max(0.0001, d));
            haloMat.opacity =
              (0.22 + activity * 0.35 + Math.sin(t * 2) * 0.04) * d;
            halo.scale.setScalar(6.5 + activity * 1.5);
            track.rotation.z = -t * 0.05;
            dust.rotation.y = t * 0.015;
            dust.position.y = Math.sin(t * 0.25) * 0.3;
          },
          dispose: () => {
            tails.dispose();
            disposeTree(world);
            disposeTree(dust);
          },
        };
      },
      { fov: 36, clearColor: BRAND.ink },
    );
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`absolute inset-0 ${className}`}
    />
  );
}
