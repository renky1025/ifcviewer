import * as THREE from 'three'
import { IFCLoader } from 'web-ifc-three'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'

export class IfcLoaderWrapper {
  private loader: IFCLoader
  private scene: THREE.Scene
  private modelID: number | null = null
  private modelObject: THREE.Object3D | null = null

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.loader = new IFCLoader()
    this.loader.ifcManager.setWasmPath('/web-ifc/')
    this.loader.ifcManager.setupThreeMeshBVH(computeBoundsTree, disposeBoundsTree, acceleratedRaycast)
  }

  getManager() {
    return this.loader.ifcManager as any
  }

  getModelID() {
    return this.modelID
  }

  getModelObject() {
    return this.modelObject
  }

  async loadFromFile(file: File, onProgress?: (percent: number) => void) {
    const objectUrl = URL.createObjectURL(file)
    if (onProgress) {
      this.loader.ifcManager.setOnProgress((event: unknown) => {
        const anyEvent = event as { loaded?: number; total?: number }
        const loaded = anyEvent.loaded ?? 0
        const total = anyEvent.total ?? 0
        const ratio = total > 0 ? (loaded / total) * 100 : 0
        onProgress(Math.max(0, Math.min(100, ratio)))
      })
    }
    const model = await (this.loader as any).loadAsync(objectUrl)
    URL.revokeObjectURL(objectUrl)
    this.clear()
    this.scene.add(model)
    this.modelObject = model
    const anyModel = model as any
    this.modelID = typeof anyModel.modelID === 'number' ? anyModel.modelID : null
    return model
  }

  clear() {
    if (this.modelID !== null) {
      try {
        this.loader.ifcManager.close(this.modelID, this.scene as any)
      } catch {
      }
    }
    if (this.modelObject) {
      this.scene.remove(this.modelObject)
      this.modelObject = null
    }
    this.modelID = null
  }

  async dispose() {
    this.clear()
    try {
      await this.loader.ifcManager.dispose()
    } catch {
    }
  }
}
