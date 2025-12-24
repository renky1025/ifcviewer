import { useEffect, useRef } from 'react'
import { IfcViewer, type IfcViewerCallbacks } from '../viewer/IfcViewer'

interface ViewerCanvasProps {
  onViewerCreated(viewer: IfcViewer): void
  onSelectionChanged: NonNullable<NonNullable<IfcViewerCallbacks['onSelectionChanged']>>
  onSpatialTree: NonNullable<NonNullable<IfcViewerCallbacks['onSpatialTree']>>
  onLoadProgress?: NonNullable<NonNullable<IfcViewerCallbacks['onLoadProgress']>>
  onLoaded?: NonNullable<NonNullable<IfcViewerCallbacks['onLoaded']>>
  onError?: NonNullable<NonNullable<IfcViewerCallbacks['onError']>>
}

function ViewerCanvas(props: ViewerCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }
    const viewer = new IfcViewer(containerRef.current, {
      onSelectionChanged: props.onSelectionChanged,
      onSpatialTree: props.onSpatialTree,
      onLoadProgress: props.onLoadProgress,
      onLoaded: props.onLoaded,
      onError: props.onError,
    })
    props.onViewerCreated(viewer)
    return () => {
      viewer.dispose()
    }
  }, [])

  return <div ref={containerRef} className="viewer-canvas" />
}

export default ViewerCanvas
