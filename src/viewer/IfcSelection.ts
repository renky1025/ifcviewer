import * as THREE from 'three'

export type SelectionCallback = (expressID: number) => void

export class IfcSelection {
  private camera: THREE.Camera
  private domElement: HTMLElement
  private scene: THREE.Scene
  private manager: any
  private onSelect: SelectionCallback
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private handlePointerDown: (event: MouseEvent) => void

  constructor(camera: THREE.Camera, domElement: HTMLElement, scene: THREE.Scene, manager: any, onSelect: SelectionCallback) {
    this.camera = camera
    this.domElement = domElement
    this.scene = scene
    this.manager = manager
    this.onSelect = onSelect
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.handlePointerDown = (event: MouseEvent) => this.onPointerDown(event)
    this.domElement.addEventListener('pointerdown', this.handlePointerDown)
  }

  private onPointerDown(event: MouseEvent) {
    const bounds = this.domElement.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    if (bounds.width <= 0 || bounds.height <= 0) {
      return
    }
    this.mouse.x = (x / bounds.width) * 2 - 1
    this.mouse.y = -(y / bounds.height) * 2 + 1
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.scene.children, true)
    if (!intersects.length) {
      return
    }
    const intersection = intersects[0]
    const mesh = intersection.object as THREE.Mesh
    if (!mesh.geometry || intersection.faceIndex == null) {
      return
    }
    const geometry = mesh.geometry as THREE.BufferGeometry
    const expressID = this.manager.getExpressId(geometry, intersection.faceIndex)
    if (typeof expressID === 'number') {
      this.onSelect(expressID)
    }
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this.handlePointerDown)
  }
}
