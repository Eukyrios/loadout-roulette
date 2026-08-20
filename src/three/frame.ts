/**
 * Camera framing shared by the roulette and dice scenes.
 *
 * Naive framing — point the camera at the middle of the content and pick a
 * distance from its bounding radius — looks wrong as soon as the camera is
 * tilted. Perspective magnifies the near edge and shrinks the far one, so the
 * projected silhouette sits BELOW the point you aimed at and can hang off the
 * bottom of the frame even though the maths said it fit.
 *
 * This does it the reliable way instead: project the content's corners, look at
 * where they actually land on screen, and correct. Distance converges so the
 * content fills the frame, then a view offset slides the frustum so it is
 * exactly centred. No magic constants, and it stays correct at any aspect
 * ratio or tilt.
 */

import * as THREE from 'three';

export interface FrameBox {
  min: THREE.Vector3;
  max: THREE.Vector3;
}

function projectedBounds(camera: THREE.PerspectiveCamera, corners: THREE.Vector3[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const p = new THREE.Vector3();
  for (const c of corners) {
    p.copy(c).project(camera);
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY };
}

/**
 * Position `camera` so `box` fills the viewport and is centred in it.
 *
 * @param tilt   Angle from straight down, in radians.
 * @param margin >1 leaves breathing room; 1.0 touches the edges.
 */
export function frameCamera(
  camera: THREE.PerspectiveCamera,
  box: FrameBox,
  opts: { tilt: number; width: number; height: number; margin?: number },
): void {
  const { tilt, width, height } = opts;
  const margin = opts.margin ?? 1.04;

  const center = new THREE.Vector3().addVectors(box.min, box.max).multiplyScalar(0.5);

  const corners: THREE.Vector3[] = [];
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        corners.push(new THREE.Vector3(x, y, z));
      }
    }
  }

  const dir = new THREE.Vector3(0, Math.cos(tilt), Math.sin(tilt));
  let distance = center.distanceTo(box.max) * 2.4; // rough starting guess

  const place = () => {
    camera.position.copy(center).addScaledVector(dir, distance);
    camera.lookAt(center);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
  };

  // Converge on a distance where the content just fits. Changing the distance
  // changes the perspective, so this is iterative rather than one division —
  // but it settles in two or three passes.
  camera.clearViewOffset();
  for (let i = 0; i < 5; i++) {
    place();
    const { minX, maxX, minY, maxY } = projectedBounds(camera, corners);
    const span = Math.max((maxX - minX) / 2, (maxY - minY) / 2) * margin;
    if (!Number.isFinite(span) || span <= 0) break;
    if (Math.abs(span - 1) < 0.003) break;
    distance *= span;
  }

  // Now slide the frustum so the silhouette is centred. Because the fit above
  // measured half-extents, centring can only reduce how far the content
  // reaches — it never pushes anything back out of frame.
  place();
  const { minX, maxX, minY, maxY } = projectedBounds(camera, corners);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  if (Math.abs(cx) < 1e-4 && Math.abs(cy) < 1e-4) {
    camera.clearViewOffset();
    return;
  }
  // +x offset slides the window right, moving content left; screen y is
  // inverted relative to NDC, hence the negated cy.
  camera.setViewOffset(width, height, (cx * width) / 2, (-cy * height) / 2, width, height);
}
