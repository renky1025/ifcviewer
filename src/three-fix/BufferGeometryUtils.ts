import type { BufferGeometry } from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export function mergeGeometries(
  geometries: BufferGeometry[],
  useGroups?: boolean,
): BufferGeometry | null {
  const fn = (BufferGeometryUtils as any).mergeBufferGeometries
  if (typeof fn === 'function') {
    return fn(geometries, useGroups)
  }
  return null
}
