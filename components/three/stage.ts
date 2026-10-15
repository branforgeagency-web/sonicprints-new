import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Shared Three.js stage: renderer, camera, sizing, pointer, loop      */
/* ------------------------------------------------------------------ */

export interface StageContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Pointer over the host, normalised to -1..1 (0,0 = centre). Eased toward the real position. */
  pointer: THREE.Vector2;
  reduced: boolean;
}

export interface StageScene {
  update?: (elapsed: number, dt: number) => void;
  resize?: (width: number, height: number) => void;
  dispose: () => void;
}

interface StageOptions {
  fov?: number;
  cameraZ?: number;
  /** Clear colour; omit for a transparent canvas. */
  clearColor?: number;
  /** How quickly `pointer` follows the cursor (per second). */
  pointerEase?: number;
}

/**
 * Mounts a WebGL canvas inside `host` and runs `build`'s scene until the returned cleanup is called.
 * Rendering pauses while the host is off screen; with reduced motion only static frames are drawn.
 */
export function mountStage(
  host: HTMLElement,
  build: (ctx: StageContext) => StageScene,
  { fov = 40, cameraZ = 10, clearColor, pointerEase = 4 }: StageOptions = {},
) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: clearColor === undefined });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (clearColor === undefined) renderer.setClearColor(0x000000, 0);
  else renderer.setClearColor(clearColor, 1);
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 200);
  camera.position.set(0, 0, cameraZ);

  const pointer = new THREE.Vector2();
  const target = new THREE.Vector2();
  const ctx: StageContext = { renderer, scene, camera, pointer, reduced };
  const stage = build(ctx);

  const resize = () => {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    stage.resize?.(w, h);
    if (reduced) renderer.render(scene, camera);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const onPointerMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    target.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    target.clampScalar(-1.5, 1.5);
  };
  const onPointerLeave = () => target.set(0, 0);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);

  let inView = true;
  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
  });
  io.observe(host);

  let raf = 0;
  let last = performance.now();
  let elapsed = 0;
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    if (!inView) return;
    elapsed += dt;
    pointer.lerp(target, 1 - Math.exp(-dt * pointerEase));
    stage.update?.(elapsed, dt);
    renderer.render(scene, camera);
  };

  if (reduced) {
    stage.update?.(0, 0);
    renderer.render(scene, camera);
  } else {
    raf = requestAnimationFrame(tick);
  }

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    stage.dispose();
    renderer.dispose();
    canvas.remove();
  };
}

/** Disposes every geometry, material and texture under `root`. */
export function disposeTree(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    mesh.geometry?.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const m of mats) {
      for (const value of Object.values(m)) if (value instanceof THREE.Texture) value.dispose();
      m.dispose();
    }
  });
}

/** Brand palette as numbers for Three.js. */
export const BRAND = {
  ink: 0x001408,
  accent: 0xbd5501,
  cream: 0xf7f4ee,
} as const;
