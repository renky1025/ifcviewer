import { useRef, useState } from 'react'
import './App.css'
import ViewerCanvas from './components/ViewerCanvas'
import Toolbar from './components/Toolbar'
import TreeView from './components/TreeView'
import PropertyPanel from './components/PropertyPanel'
import type { IfcViewer, ViewerSelection } from './viewer/IfcViewer'

function App() {
  const viewerRef = useRef<IfcViewer | null>(null)
  const [selection, setSelection] = useState<ViewerSelection | null>(null)
  const [spatialTree, setSpatialTree] = useState<unknown | null>(null)
  const [loadingPercent, setLoadingPercent] = useState<number | null>(null)

  const handleViewerCreated = (viewer: IfcViewer) => {
    viewerRef.current = viewer
  }

  const handleOpenFile = async (file: File) => {
    setLoadingPercent(0)
    setSelection(null)
    try {
      await viewerRef.current?.loadIfcFile(file)
    } catch {
    }
  }

  return (
    <div className="app-root">
      <Toolbar
        onOpenFile={handleOpenFile}
        onToggleSectionPlane={(active) => viewerRef.current?.enableSectionPlane(active)}
        onSectionOffsetChange={(offset) => viewerRef.current?.setSectionOffset(offset)}
        loadingPercent={loadingPercent}
      />
      <div className="app-main">
        <div className="sidebar-left">
          <div className="left-panel left-panel-browser">
            <div className="left-panel-header">
              <span className="left-panel-title">构件浏览器</span>
            </div>
            <div className="left-panel-body left-panel-body-tree">
              <TreeView
                tree={spatialTree}
                selectedId={selection?.expressID ?? null}
                onNodeClick={(id) => {
                  void viewerRef.current?.selectElementById(id)
                }}
              />
            </div>
          </div>
          <div className="left-panel left-panel-properties">
            <div className="left-panel-header">
              <span className="left-panel-title">属性浏览器</span>
            </div>
            <div className="left-panel-body left-panel-body-properties">
              <PropertyPanel selection={selection} />
            </div>
          </div>
        </div>
        <div className="viewer-container">
          <ViewerCanvas
            onViewerCreated={handleViewerCreated}
            onSelectionChanged={(sel) => setSelection(sel)}
            onSpatialTree={(tree) => setSpatialTree(tree)}
            onLoadProgress={(percent) => setLoadingPercent(percent)}
            onLoaded={() => setLoadingPercent(null)}
            onError={(error) => {
              console.error('IFC Viewer Error', error)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default App
