import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Neon tails: glowing comets that sweep around the centre on tilted,  */
/* looping paths, each with a white-hot head and a fading neon trail.  */
/* ------------------------------------------------------------------ */

const TRAIL = 320; // points per tail
const SPACING = 0.0016; // path distance between tail points (in loops)

interface TailDef {
  color: number;
  radius: number;
  tilt: [number, number, number];
  speed: number; // loops per second (negative = reverse)
  wobble: number; // radial in/out amount
  lobes: number; // how many in/out waves per loop
  phase: number;
}

const TAILS: TailDef[] = [
  { color: 0xff7a1a, radius: 1.9, tilt: [1.1, 0, 0.3], speed: 0.16, wobble: 0.25, lobes: 3, phase: 0 },
  { color: 0xfff1dc, radius: 1.6, tilt: [0.2, 0.9, -0.4], speed: -0.2, wobble: 0.3, lobes: 2, phase: 0.3 },
  { color: 0xbd5501, radius: 2.2, tilt: [-0.7, 0.4, 1.2], speed: 0.13, wobble: 0.2, lobes: 4, phase: 0.6 },
  { color: 0xffa24d, radius: 1.75, tilt: [1.6, 0.8, 0.1], speed: -0.15, wobble: 0.35, lobes: 3, phase: 0.15 },
  { color: 0xfff1dc, radius: 2.05, tilt: [0.5, -1.2, 0.7], speed: 0.18, wobble: 0.22, lobes: 5, phase: 0.85 },
  { color: 0xff7a1a, radius: 1.45, tilt: [-1.2, 0.2, -0.9], speed: 0.22, wobble: 0.28, lobes: 2, phase: 0.45 },
];

const VERT = /* glsl */ `
attribute float aAge; // 0 = head, 1 = end of tail
attribute vec3 aColor;
uniform float uSize;
uniform float uPixelRatio;
uniform float uEnergy;
uniform float uScale;
varying float vAge;
varying vec3 vColor;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float taper = pow(1.0 - aAge, 1.4);
  gl_PointSize = uSize * uScale * (0.45 + taper * (1.1 + uEnergy * 0.5)) * uPixelRatio * (10.0 / -mv.z);
  vAge = aAge;
  vColor = aColor;
}
`;

const FRAG = /* glsl */ `
uniform float uEnergy;
uniform float uLevel;
uniform float uAlpha;
varying float vAge;
varying vec3 vColor;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float glow = smoothstep(0.5, 0.0, r);
  float core = smoothstep(0.18, 0.0, r);
  // The head burns white-hot; the trail cools to the tube colour.
  vec3 col = mix(vec3(1.0, 0.97, 0.9), vColor, smoothstep(0.0, 0.12, vAge));
  col += core * 0.35 * (1.0 - vAge);
  float fade = pow(1.0 - vAge, 1.6);
  gl_FragColor = vec4(col, glow * fade * (0.85 + uEnergy * 0.3) * uLevel * uAlpha);
  #include <colorspace_fragment>
}
`;

export function createNeonTails({ pixelRatio, reduced }: { pixelRatio: number; reduced: boolean }) {
  const count = TAILS.length * TRAIL;
  const pos = new Float32Array(count * 3);
  const age = new Float32Array(count);
  const col = new Float32Array(count * 3);
  const c = new THREE.Color();
  TAILS.forEach((tail, ti) => {
    c.setHex(tail.color);
    for (let k = 0; k < TRAIL; k++) {
      const i = ti * TRAIL + k;
      age[i] = k / (TRAIL - 1);
      c.toArray(col, i * 3);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aAge", new THREE.BufferAttribute(age, 1));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));

  const uniforms = {
    uSize: { value: 5 },
    uPixelRatio: { value: pixelRatio },
    uEnergy: { value: 0 },
    uLevel: { value: 1 },
  };
  // Two passes over the same trail: a bright tube and a wide, faint bloom around it.
  const pass = (scale: number, alpha: number) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { ...uniforms, uScale: { value: scale }, uAlpha: { value: alpha } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    return { points, mat };
  };
  const passes = [pass(1, 0.55), pass(4.2, 0.07)];

  const group = new THREE.Group();
  for (const p of passes) group.add(p.points);

  // Each tail's tilt as a fixed rotation.
  const tilts = TAILS.map((tail) => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...tail.tilt)));
  const v = new THREE.Vector3();

  return {
    group,
    uniforms,
    /** `energy` (0..1) brightens and thickens the tails while a product prints. */
    update(t: number, energy: number) {
      uniforms.uEnergy.value += (energy - uniforms.uEnergy.value) * 0.08;
      // Neon flickers on over the first second, then holds with a faint hum.
      uniforms.uLevel.value = reduced ? 1 : t < 1 ? (Math.sin(t * 40) > -0.2 ? t : 0.1) : 0.94 + 0.06 * Math.sin(t * 11);
      const time = reduced ? 0 : t;
      TAILS.forEach((tail, ti) => {
        const head = tail.phase + time * tail.speed;
        const dir = Math.sign(tail.speed);
        for (let k = 0; k < TRAIL; k++) {
          const u = (head - dir * k * SPACING) * Math.PI * 2;
          const r = tail.radius + Math.sin(u * tail.lobes) * tail.wobble;
          v.set(Math.cos(u) * r, Math.sin(u * tail.lobes * 0.5) * 0.25, Math.sin(u) * r).applyMatrix4(tilts[ti]);
          v.toArray(pos, (ti * TRAIL + k) * 3);
        }
      });
      geo.attributes.position.needsUpdate = true;
      group.rotation.y = time * 0.12;
    },
    dispose() {
      geo.dispose();
      for (const p of passes) p.mat.dispose();
    },
  };
}
