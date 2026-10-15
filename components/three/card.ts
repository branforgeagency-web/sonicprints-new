import * as THREE from "three";

export function roundedShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** ShapeGeometry with UVs remapped to 0..1 across the card, so a full texture fits the face. */
export function faceGeometry(shape: THREE.Shape, w: number, h: number) {
  const geo = new THREE.ShapeGeometry(shape, 8);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  uv.needsUpdate = true;
  return geo;
}

export interface CardParts {
  group: THREE.Group;
  front: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshStandardMaterial>;
  back: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshStandardMaterial>;
}

/**
 * A thick rounded card: textured front and back faces plus a solid edge.
 * The back face is pre-rotated so its texture reads correctly when the card is flipped.
 */
export function roundedCard(
  w: number,
  h: number,
  r: number,
  depth: number,
  front: THREE.Texture,
  back: THREE.Texture,
  edgeColor: THREE.ColorRepresentation,
): CardParts {
  const shape = roundedShape(w, h, r);
  const group = new THREE.Group();

  const faceGeo = faceGeometry(shape, w, h);
  const frontMesh = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({ map: front, roughness: 0.45, metalness: 0.05 }));
  frontMesh.position.z = depth / 2 + 0.001;
  const backMesh = new THREE.Mesh(faceGeo.clone(), new THREE.MeshStandardMaterial({ map: back, roughness: 0.6 }));
  backMesh.rotation.y = Math.PI;
  backMesh.position.z = -depth / 2 - 0.001;

  const edgeGeo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 8 });
  edgeGeo.translate(0, 0, -depth / 2);
  // Group 0 = caps (hidden behind the faces), group 1 = the sides.
  const edge = new THREE.Mesh(edgeGeo, [
    new THREE.MeshBasicMaterial({ visible: false }),
    new THREE.MeshStandardMaterial({ color: edgeColor, roughness: 0.5 }),
  ]);

  group.add(edge, frontMesh, backMesh);
  return { group, front: frontMesh, back: backMesh };
}
