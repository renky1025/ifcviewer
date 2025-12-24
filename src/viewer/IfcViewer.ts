import * as THREE from 'three'
import { SceneManager } from './SceneManager'
import { IfcLoaderWrapper } from './IfcLoader'
import { IfcSelection } from './IfcSelection'
import { IfcProperties } from './IfcProperties'
import type { ElementProperties } from './IfcProperties'

export interface ViewerSelection {
  modelID: number
  expressID: number
  properties: ElementProperties
}

export interface IfcViewerCallbacks {
  onLoaded?(modelID: number): void
  onLoadProgress?(percent: number): void
  onSelectionChanged?(selection: ViewerSelection | null): void
  onSpatialTree?(tree: unknown): void
  onError?(error: unknown): void
}

export class IfcViewer {
  private callbacks: IfcViewerCallbacks
  private sceneManager: SceneManager
  private ifcLoader: IfcLoaderWrapper
  private selection: IfcSelection
  private properties: IfcProperties
  private selectionMaterial: THREE.MeshPhongMaterial
  private selectionCustomId = 'ifc-selection'
  private sectionPlane: THREE.Plane | null = null

  constructor(container: HTMLDivElement, callbacks: IfcViewerCallbacks = {}) {
    this.callbacks = callbacks
    this.sceneManager = new SceneManager(container)
    this.ifcLoader = new IfcLoaderWrapper(this.sceneManager.getScene())
    this.properties = new IfcProperties(this.ifcLoader.getManager())
    this.selectionMaterial = new THREE.MeshPhongMaterial({
      color: 0xff6b00,
      transparent: true,
      opacity: 0.8,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    })
    this.selection = new IfcSelection(
      this.sceneManager.getCamera(),
      this.sceneManager.getDomElement(),
      this.sceneManager.getScene(),
      this.ifcLoader.getManager(),
      (expressID) => {
        this.handleSelection(expressID).catch((error) => {
          if (this.callbacks.onError) {
            this.callbacks.onError(error)
          }
        })
      },
    )
    this.sceneManager.start()
  }

  async loadIfcFile(file: File) {
    try {
      const model = await this.ifcLoader.loadFromFile(file, (percent) => {
        if (this.callbacks.onLoadProgress) {
          this.callbacks.onLoadProgress(percent)
        }
      })
      const anyModel = model as any
      const modelID = typeof anyModel.modelID === 'number' ? anyModel.modelID : this.ifcLoader.getModelID()
      if (typeof modelID === 'number') {
        if (this.callbacks.onLoaded) {
          this.callbacks.onLoaded(modelID)
        }
        await this.fitToModel()
        const tree = await this.properties.getSpatialStructure(modelID)
        if (this.callbacks.onSpatialTree) {
          this.callbacks.onSpatialTree(tree)
        }
      }
    } catch (error) {
      if (this.callbacks.onError) {
        this.callbacks.onError(error)
      }
      throw error
    }
  }

  private async handleSelection(expressID: number) {
    const modelID = this.ifcLoader.getModelID()
    if (typeof modelID !== 'number') {
      return
    }
    await this.highlightSelection(modelID, expressID)
    const properties = await this.properties.getElementProperties(modelID, expressID)
    if (this.callbacks.onSelectionChanged) {
      this.callbacks.onSelectionChanged({ modelID, expressID, properties })
    }
  }

  async selectElementById(expressID: number) {
    await this.handleSelection(expressID)
  }

  private async highlightSelection(modelID: number, expressID: number) {
    const manager = this.ifcLoader.getManager()
    try {
      manager.removeSubset(modelID, this.selectionMaterial, this.selectionCustomId)
    } catch {
    }
    manager.createSubset({
      modelID,
      scene: this.sceneManager.getScene(),
      ids: [expressID],
      removePrevious: true,
      material: this.selectionMaterial,
      customID: this.selectionCustomId,
    })
  }

  private async fitToModel() {
    const model = this.ifcLoader.getModelObject()
    if (!model) {
      return
    }
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxSize = Math.max(size.x, size.y, size.z)
    if (!Number.isFinite(maxSize) || maxSize <= 0) {
      return
    }
    const distance = maxSize * 1.8
    const direction = new THREE.Vector3(1, 1, 1).normalize()
    const camera = this.sceneManager.getCamera()
    const controls = this.sceneManager.getControls()
    camera.position.copy(center.clone().add(direction.multiplyScalar(distance)))
    camera.near = maxSize / 100
    camera.far = maxSize * 20
    camera.updateProjectionMatrix()
    controls.target.copy(center)
    controls.update()
  }

  enableSectionPlane(active: boolean) {
    if (active) {
      if (!this.sectionPlane) {
        this.sectionPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)
      }
      this.sceneManager.setClippingPlanes([this.sectionPlane])
    } else {
      this.sceneManager.setClippingPlanes(null)
    }
  }

  setSectionOffset(offset: number) {
    if (!this.sectionPlane) {
      return
    }
    this.sectionPlane.constant = offset
  }

  dispose() {
    this.sceneManager.dispose()
    this.ifcLoader.dispose()
    this.selection.dispose()
  }
}
