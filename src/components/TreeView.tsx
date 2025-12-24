import { useState, useCallback, type MouseEventHandler } from 'react'

interface SpatialNode {
  expressID?: number
  type?: string
  children?: SpatialNode[]
  [key: string]: unknown
}

interface TreeViewProps {
  tree: unknown | null
  onNodeClick(expressID: number): void
  selectedId?: number | null
}

interface TreeNodeProps {
  node: SpatialNode
  depth: number
  path: string
  expandedKeys: Set<string>
  onToggle(path: string): void
  onNodeClick(expressID: number): void
  selectedId?: number | null
}

function TreeNode(props: TreeNodeProps) {
  const { node, depth, path, expandedKeys, onToggle, onNodeClick, selectedId } = props
  const anyNode = node as any
  const label =
    anyNode?.Name?.value ??
    anyNode?.LongName?.value ??
    anyNode?.Name ??
    anyNode?.LongName ??
    node.type ??
    '节点'
  const id = node.expressID
  const hasChildren = Array.isArray(node.children) && node.children.length > 0
  const isExpanded = hasChildren && expandedKeys.has(path)
  const isSelected = typeof selectedId === 'number' && selectedId === id

  const handleLabelClick = () => {
    if (typeof id === 'number') {
      onNodeClick(id)
    }
  }

  const handleCaretClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation()
    if (hasChildren) {
      onToggle(path)
    }
  }

  return (
    <li className="tree-node">
      <div
        className={`tree-node-row${isSelected ? ' tree-node-row--selected' : ''}`}

        onClick={handleLabelClick}
      >
        {hasChildren ? (
          <button
            type="button"
            className="tree-node-caret"
            onClick={handleCaretClick}
            aria-label={isExpanded ? '折叠' : '展开'}
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="tree-node-caret-placeholder" />
        )}
        <span className="tree-node-label">
          {label}
          {typeof id === 'number' ? ` (#${id})` : ''}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <ul className="tree-children">
          {node.children!.map((child, index) => (
            <TreeNode
              key={`${path}-${index}`}
              node={child}
              depth={depth + 1}
              path={`${path}-${index}`}
              expandedKeys={expandedKeys}
              onToggle={onToggle}
              onNodeClick={onNodeClick}
              selectedId={selectedId}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function TreeView(props: TreeViewProps) {
  if (!props.tree) {
    return <div className="tree-view">暂无模型</div>
  }

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set(['root']))

  const handleToggle = useCallback((path: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const handleNodeClick = useCallback(
    (id: number) => {
      props.onNodeClick(id)
    },
    [props.onNodeClick],
  )

  const root = props.tree as SpatialNode

  return (
    <div className="tree-view">
      <ul className="tree-root">
        <TreeNode
          node={root}
          depth={0}
          path="root"
          expandedKeys={expandedKeys}
          onToggle={handleToggle}
          onNodeClick={handleNodeClick}
          selectedId={props.selectedId ?? null}
        />
      </ul>
    </div>
  )
}

export default TreeView
