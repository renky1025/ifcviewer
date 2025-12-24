import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export class SceneManager {
  private container: HTMLDivElement
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private controls: OrbitControls
  private animationFrameId: number | null = null
  private resizeObserver: ResizeObserver | null = null

  constructor(container: HTMLDivElement) {
    this.container = container
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xf2f2f2)
    const width = Math.max(this.container.clientWidth, 1)
    const height = Math.max(this.container.clientHeight, 1)
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000)
    this.camera.position.set(10, 10, 10)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
    this.renderer.setPixelRatio(window.devicePixelRatio || 1)
    this.renderer.setSize(width, height)
    this.renderer.localClippingEnabled = false
    this.container.innerHTML = ''
    this.container.appendChild(this.renderer.domElement)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.target.set(0, 0, 0)
    this.addDefaultLights()
    this.observeResize()
  }

  private addDefaultLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambient)
    const directional = new THREE.DirectionalLight(0xffffff, 0.8)
    directional.position.set(10, 20, 10)
    this.scene.add(directional)
  }

  private observeResize() {
    const resize = () => {
      const width = Math.max(this.container.clientWidth, 1)
      const height = Math.max(this.container.clientHeight, 1)
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    }
    this.resizeObserver = new ResizeObserver(() => resize())
    this.resizeObserver.observe(this.container)
    window.addEventListener('resize', resize)
  }

  start() {
    const renderLoop = () => {
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
      this.animationFrameId = window.requestAnimationFrame(renderLoop)
    }
    renderLoop()
  }

  getScene() {
    return this.scene
  }

  getCamera() {
    return this.camera
  }

  getRenderer() {
    return this.renderer
  }

  getControls() {
    return this.controls
  }

  getDomElement() {
    return this.renderer.domElement
  }

  setClippingPlanes(planes: THREE.Plane[] | null) {
    this.renderer.clippingPlanes = planes ?? []
    this.renderer.localClippingEnabled = !!planes && planes.length > 0
  }

  dispose() {
    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    this.controls.dispose()
    this.renderer.dispose()
    this.container.innerHTML = ''
  }
}
