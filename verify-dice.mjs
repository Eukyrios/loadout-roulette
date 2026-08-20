import * as THREE from 'three';

// Mirrors src/three/DiceTray.tsx
const FACE_VALUES = [3, 4, 1, 6, 2, 5];            // [+X,-X,+Y,-Y,+Z,-Z]
const FACE_NORMALS = {
  1: new THREE.Vector3(0, 1, 0),
  6: new THREE.Vector3(0, -1, 0),
  2: new THREE.Vector3(0, 0, 1),
  5: new THREE.Vector3(0, 0, -1),
  3: new THREE.Vector3(1, 0, 0),
  4: new THREE.Vector3(-1, 0, 0),
};
const GEOM_NORMALS = [
  new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0),
  new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0),
  new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1),
];

// 1. material slot normals must agree with FACE_NORMALS
let ok = true;
FACE_VALUES.forEach((v, i) => {
  if (!GEOM_NORMALS[i].equals(FACE_NORMALS[v])) { ok = false; console.log(`MISMATCH slot ${i} value ${v}`); }
});
console.log(ok ? 'PASS  material slots agree with face normals' : 'FAIL  slot/normal mismatch');

// 2. opposite faces sum to 7
const pairs = [[0,1],[2,3],[4,5]].map(([a,b]) => FACE_VALUES[a]+FACE_VALUES[b]);
console.log(pairs.every(s => s===7) ? 'PASS  opposite faces sum to 7' : `FAIL  sums ${pairs}`);

function faceUpQuaternion(value, spin) {
  const align = new THREE.Quaternion().setFromUnitVectors(FACE_NORMALS[value], new THREE.Vector3(0,1,0));
  const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), spin);
  return yaw.multiply(align);
}

// 3. for every value and several yaws, that value must end up pointing +Y
const UP = new THREE.Vector3(0,1,0);
let allGood = true;
for (let v = 1; v <= 6; v++) {
  for (const spin of [0, 0.9, 2.5, 4.4, 6.0]) {
    const q = faceUpQuaternion(v, spin);
    // which value is up after rotation?
    let best = null, bestDot = -2;
    for (let k = 1; k <= 6; k++) {
      const d = FACE_NORMALS[k].clone().applyQuaternion(q).dot(UP);
      if (d > bestDot) { bestDot = d; best = k; }
    }
    if (best !== v || bestDot < 0.999) {
      allGood = false;
      console.log(`FAIL  value ${v} spin ${spin}: up face is ${best} (dot ${bestDot.toFixed(4)})`);
    }
  }
}
console.log(allGood ? 'PASS  every value lands face-up under any yaw' : 'FAIL  face-up mapping broken');
