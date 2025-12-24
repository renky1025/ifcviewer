import { useState, type ReactNode } from 'react'
import type { ViewerSelection } from '../viewer/IfcViewer'

interface PropertyPanelProps {
  selection: ViewerSelection | null
}

type PropertyTabKey = 'basic' | 'pset' | 'type' | 'materials'

const PROPERTY_TABS: { key: PropertyTabKey; label: string }[] = [
  { key: 'basic', label: '基本信息' },
  { key: 'pset', label: '属性集' },
  { key: 'type', label: '类型' },
  { key: 'materials', label: '材质' },
]

function getDisplayText(value: unknown): string {
  if (value == null) {
    return '-'
  }
  if (typeof value === 'object') {
    const anyValue = value as any
    if (Array.isArray(anyValue)) {
      const items = anyValue
        .map((item: unknown) => getDisplayText(item))
        .filter((text) => text !== '-')
      if (items.length === 0) {
        return '-'
      }
      const joined = items.join(', ')
      if (joined.length > 120) {
        return `${joined.slice(0, 117)}...`
      }
      return joined
    }
    if ('value' in anyValue) {
      return getDisplayText(anyValue.value)
    }
    return '-'
  }
  return String(value)
}

function getName(value: unknown, fallback: string): string {
  const text = getDisplayText(value)
  if (!text || text === '-') {
    return fallback
  }
  return text
}

function extractPsetRows(
  pset: any,
): { key: string; label: string; value: ReactNode; unit?: ReactNode }[] {
  const rows: { key: string; label: string; value: ReactNode; unit?: ReactNode }[] = []

  const pushFromArray = (items: any[] | undefined, groupKey: string) => {
    if (!Array.isArray(items)) {
      return
    }
    items.forEach((item, index) => {
      const label = getName(item?.Name, `${groupKey} ${index + 1}`)
      const rawValue =
        item?.NominalValue ??
        item?.LengthValue ??
        item?.AreaValue ??
        item?.VolumeValue ??
        item?.CountValue ??
        item?.WeightValue ??
        item?.Value
      const valueText = getDisplayText(rawValue)
      const unitText = item?.Unit ? getDisplayText(item.Unit) : ''
      rows.push({
        key: `${groupKey}-${index}-${label}`,
        label,
        value: valueText,
        unit: unitText || undefined,
      })
    })
  }

  pushFromArray(pset?.HasProperties, '属性')
  pushFromArray(pset?.Quantities, '量')

  return rows
}

function extractMaterialRows(material: any): { key: string; label: string; value: ReactNode }[] {
  if (!material || typeof material !== 'object') {
    return []
  }
  const rows: { key: string; label: string; value: ReactNode }[] = []
  const entries = Object.entries(material as Record<string, unknown>)
  for (const [key, raw] of entries) {
    if (key === 'expressID' || key === 'type' || key === 'Name') {
      continue
    }
    const text = getDisplayText(raw)
    if (!text || text === '-') {
      continue
    }
    rows.push({
      key,
      label: key,
      value: text,
    })
  }
  return rows
}

function renderBasic(selection: ViewerSelection) {
  const native = selection.properties.native as any
  const rows: { label: string; value: ReactNode }[] = [
    { label: 'IfcID', value: native?.expressID ?? '-' },
    { label: 'IFC类型', value: native?.type ?? '-' },
    { label: '名称', value: native?.Name?.value ?? native?.Name ?? '-' },
    { label: 'GlobalId', value: native?.GlobalId?.value ?? native?.GlobalId ?? '-' },
  ]

  return (
    <div className="property-table">
      {rows.map((row) => (
        <div key={row.label} className="property-row">
          <div className="property-row-label">{row.label}</div>
          <div className="property-row-value">{row.value}</div>
        </div>
      ))}
    </div>
  )
}

function renderPropertySets(selection: ViewerSelection) {
  const sets = selection.properties.propertySets as any[] | undefined
  if (!sets || sets.length === 0) {
    return <div className="property-empty">无属性集</div>
  }

  return (
    <div className="property-section-list">
      {sets.map((pset, index) => {
        const title = getName(pset?.Name, `属性集 ${index + 1}`)
        const rows = extractPsetRows(pset)
        return (
          <details key={index} className="property-section" open={index === 0}>
            <summary className="property-section-title">{title}</summary>
            {rows.length === 0 ? (
              <div className="property-empty">无可显示的属性</div>
            ) : (
              <div className="property-table">
                {rows.map((row) => (
                  <div key={row.key} className="property-row">
                    <div className="property-row-label">{row.label}</div>
                    <div className="property-row-value">
                      {row.value}
                      {row.unit ? <span className="property-row-unit">{row.unit}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <details className="property-advanced">
              <summary className="property-advanced-title">高级：查看原始 JSON</summary>
              <pre className="property-section-pre">{JSON.stringify(pset, null, 2)}</pre>
            </details>
          </details>
        )
      })}
    </div>
  )
}

function renderTypeProps(selection: ViewerSelection) {
  const types = selection.properties.typeProperties as any[] | undefined
  if (!types || types.length === 0) {
    return <div className="property-empty">无类型信息</div>
  }

  return (
    <div className="property-section-list">
      {types.map((t, index) => {
        const title = getName(t?.Name, `类型 ${index + 1}`)
        const rows = extractPsetRows(t)
        return (
          <details key={index} className="property-section" open={index === 0}>
            <summary className="property-section-title">{title}</summary>
            {rows.length === 0 ? (
              <div className="property-empty">无可显示的属性</div>
            ) : (
              <div className="property-table">
                {rows.map((row) => (
                  <div key={row.key} className="property-row">
                    <div className="property-row-label">{row.label}</div>
                    <div className="property-row-value">
                      {row.value}
                      {row.unit ? <span className="property-row-unit">{row.unit}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <details className="property-advanced">
              <summary className="property-advanced-title">高级：查看原始 JSON</summary>
              <pre className="property-section-pre">{JSON.stringify(t, null, 2)}</pre>
            </details>
          </details>
        )
      })}
    </div>
  )
}

function renderMaterials(selection: ViewerSelection) {
  const mats = selection.properties.materials as any[] | undefined
  if (!mats || mats.length === 0) {
    return <div className="property-empty">无材质信息</div>
  }

  return (
    <div className="property-section-list">
      {mats.map((m, index) => {
        const title = getName(m?.Name, `材质 ${index + 1}`)
        const rows = extractMaterialRows(m)
        return (
          <details key={index} className="property-section" open={index === 0}>
            <summary className="property-section-title">{title}</summary>
            {rows.length === 0 ? (
              <div className="property-empty">无可显示的属性</div>
            ) : (
              <div className="property-table">
                {rows.map((row) => (
                  <div key={row.key} className="property-row">
                    <div className="property-row-label">{row.label}</div>
                    <div className="property-row-value">{row.value}</div>
                  </div>
                ))}
              </div>
            )}
            <details className="property-advanced">
              <summary className="property-advanced-title">高级：查看原始 JSON</summary>
              <pre className="property-section-pre">{JSON.stringify(m, null, 2)}</pre>
            </details>
          </details>
        )
      })}
    </div>
  )
}

function PropertyPanel(props: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<PropertyTabKey>('basic')

  if (!props.selection) {
    return <div className="property-panel">未选择构件</div>
  }

  const { modelID, expressID } = props.selection

  let tabContent: ReactNode = null
  if (activeTab === 'basic') {
    tabContent = renderBasic(props.selection)
  } else if (activeTab === 'pset') {
    tabContent = renderPropertySets(props.selection)
  } else if (activeTab === 'type') {
    tabContent = renderTypeProps(props.selection)
  } else if (activeTab === 'materials') {
    tabContent = renderMaterials(props.selection)
  }

  return (
    <div className="property-panel">
      <div className="property-header">
        <div>模型 ID: {modelID}</div>
        <div>构件 ID: {expressID}</div>
      </div>
      <div className="property-tabs">
        {PROPERTY_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`property-tab${activeTab === tab.key ? ' property-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="property-content">{tabContent}</div>
    </div>
  )
}

export default PropertyPanel
