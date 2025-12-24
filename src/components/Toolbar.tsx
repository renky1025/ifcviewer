import { useRef, useState, type ChangeEvent } from 'react'

interface ToolbarProps {
  onOpenFile(file: File): void
  onToggleSectionPlane(active: boolean): void
  onSectionOffsetChange(offset: number): void
  loadingPercent: number | null
}

function Toolbar(props: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [sectionActive, setSectionActive] = useState(false)
  const [sectionOffset, setSectionOffset] = useState(0)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }
    const file = files[0]
    props.onOpenFile(file)
  }

  const handleOpenClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleToggleSection = () => {
    const next = !sectionActive
    setSectionActive(next)
    props.onToggleSectionPlane(next)
  }

  const handleSectionOffsetChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    setSectionOffset(value)
    props.onSectionOffsetChange(value)
  }

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button type="button" onClick={handleOpenClick}>
          打开 IFC 文件
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ifc"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button type="button" onClick={handleToggleSection}>
          {sectionActive ? '关闭剖切' : '开启剖切'}
        </button>
        <input
          type="range"
          min={-50}
          max={50}
          step={0.1}
          value={sectionOffset}
          onChange={handleSectionOffsetChange}
          className="toolbar-section-slider"
        />
      </div>
      <div className="toolbar-right">
        {props.loadingPercent != null && props.loadingPercent < 100 ? (
          <span>加载中 {props.loadingPercent.toFixed(0)}%</span>
        ) : (
          <span>就绪</span>
        )}
      </div>
    </div>
  )
}

export default Toolbar
