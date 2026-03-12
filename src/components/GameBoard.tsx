import { useState, useCallback, useEffect, useRef } from 'react'
import type { FC } from 'react'
import type { Stage, Edge, GameState } from '../types'
import './GameBoard.css'

interface Props {
  stage: Stage
  onBack: () => void
  onNext: () => void
}

type Result = 'none' | 'success' | 'stuck' | 'impossible_proven'

const SVG_W = 600
const SVG_H = 420

function getEdgesBetween(edges: Edge[], a: string, b: string): Edge[] {
  return edges.filter(e =>
    (e.from === a && e.to === b) || (e.from === b && e.to === a)
  )
}

function getAvailableEdges(state: GameState, edges: Edge[]): Edge[] {
  if (!state.currentNode) return []
  return edges.filter(e =>
    !state.usedEdges.has(e.id) &&
    (e.from === state.currentNode || e.to === state.currentNode)
  )
}

function getDegree(nodeId: string, edges: Edge[]): number {
  return edges.filter(e => e.from === nodeId || e.to === nodeId).length
}

const GameBoard: FC<Props> = ({ stage, onBack, onNext }) => {
  const [gameState, setGameState] = useState<GameState>({
    path: [],
    usedEdges: new Set(),
    currentNode: null,
  })
  const [result, setResult] = useState<Result>('none')
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null)
  const [moveCount, setMoveCount] = useState(0)
  const [trailPoints, setTrailPoints] = useState<{ x: number; y: number }[]>([])
  const animRef = useRef<number | null>(null)

  const reset = useCallback(() => {
    setGameState({ path: [], usedEdges: new Set(), currentNode: null })
    setResult('none')
    setShowHint(false)
    setShowAnswer(false)
    setMoveCount(0)
    setTrailPoints([])
    if (animRef.current) cancelAnimationFrame(animRef.current)
  }, [])

  useEffect(() => { reset() }, [stage, reset])

  const getNodePos = useCallback((id: string) => {
    return stage.nodes.find(n => n.id === id)!
  }, [stage.nodes])

  const handleNodeClick = useCallback((nodeId: string) => {
    if (result !== 'none') return

    setGameState(prev => {
      // First click: select start node
      if (prev.currentNode === null) {
        const node = getNodePos(nodeId)
        setTrailPoints([{ x: node.x, y: node.y }])
        return { ...prev, path: [nodeId], currentNode: nodeId }
      }

      // Same node: deselect (only if no moves made)
      if (prev.currentNode === nodeId && prev.path.length === 1) {
        setTrailPoints([])
        return { path: [], usedEdges: new Set(), currentNode: null }
      }

      // Find available edge from current to clicked
      const available = getEdgesBetween(stage.edges, prev.currentNode, nodeId)
        .filter(e => !prev.usedEdges.has(e.id))

      if (available.length === 0) return prev

      const edge = available[0]
      const newUsed = new Set(prev.usedEdges)
      newUsed.add(edge.id)
      const newPath = [...prev.path, nodeId]
      const newState: GameState = {
        path: newPath,
        usedEdges: newUsed,
        currentNode: nodeId,
      }

      setMoveCount(c => c + 1)
      const node = getNodePos(nodeId)
      setTrailPoints(pts => [...pts, { x: node.x, y: node.y }])

      // Check success
      if (newUsed.size === stage.edges.length) {
        setResult('success')
        return newState
      }

      // Check stuck
      const nextAvailable = getAvailableEdges(newState, stage.edges)
      if (nextAvailable.length === 0 && newUsed.size < stage.edges.length) {
        setResult('stuck')
      }

      return newState
    })
  }, [result, stage.edges, getNodePos])

  const handleEdgeClick = useCallback((edge: Edge) => {
    if (result !== 'none') return
    if (gameState.usedEdges.has(edge.id)) return

    // If no start selected, select a start node
    if (!gameState.currentNode) {
      handleNodeClick(edge.from)
      return
    }

    // Move along this edge if connected to current
    const canUse = (edge.from === gameState.currentNode || edge.to === gameState.currentNode)
      && !gameState.usedEdges.has(edge.id)
    if (!canUse) return

    const target = edge.from === gameState.currentNode ? edge.to : edge.from
    handleNodeClick(target)
  }, [result, gameState, handleNodeClick])

  const getEdgeMidpoint = (edge: Edge) => {
    const from = getNodePos(edge.from)
    const to = getNodePos(edge.to)
    // Check for parallel edges
    const parallel = stage.edges.filter(e =>
      (e.from === edge.from && e.to === edge.to) ||
      (e.from === edge.to && e.to === edge.from)
    )
    const idx = parallel.indexOf(edge)
    const offset = (idx - (parallel.length - 1) / 2) * 30
    const mx = (from.x + to.x) / 2
    const my = (from.y + to.y) / 2
    const dx = to.x - from.x
    const dy = to.y - from.y
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    return {
      x: mx + ((-dy / len) * offset),
      y: my + ((dx / len) * offset),
    }
  }

  const getEdgePath = (edge: Edge): string => {
    const from = getNodePos(edge.from)
    const to = getNodePos(edge.to)
    const parallel = stage.edges.filter(e =>
      (e.from === edge.from && e.to === edge.to) ||
      (e.from === edge.to && e.to === edge.from)
    )
    const idx = parallel.indexOf(edge)
    if (parallel.length === 1) {
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
    }
    const offset = (idx - (parallel.length - 1) / 2) * 28
    const dx = to.x - from.x
    const dy = to.y - from.y
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const cx = (from.x + to.x) / 2 + (-dy / len) * offset
    const cy = (from.y + to.y) / 2 + (dx / len) * offset
    return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`
  }

  const trailPath = trailPoints.length > 1
    ? trailPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : ''

  const isEdgeUsed = (edge: Edge) => gameState.usedEdges.has(edge.id)
  const isEdgeAvailable = (edge: Edge) => {
    if (!gameState.currentNode) return false
    return (edge.from === gameState.currentNode || edge.to === gameState.currentNode)
      && !gameState.usedEdges.has(edge.id)
  }

  const oddNodes = stage.nodes.filter(n => getDegree(n.id, stage.edges) % 2 !== 0)

  return (
    <div className="game-screen">
      <header className="game-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← 戻る</button>
        <div className="game-title">
          <span className="difficulty-badge" data-diff={stage.difficulty}>
            {stage.difficulty === 'easy' ? '初級' : stage.difficulty === 'medium' ? '中級' : '上級'}
          </span>
          <h2>{stage.name}</h2>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={reset}>リセット</button>
      </header>

      <div className="game-layout">
        <div className="game-main">
          <p className="stage-desc">{stage.description}</p>

          {/* Status bar */}
          <div className="status-bar">
            <span>橋: {gameState.usedEdges.size} / {stage.edges.length}</span>
            <span>手数: {moveCount}</span>
            {gameState.currentNode && (
              <span>現在地: <strong>{stage.nodes.find(n => n.id === gameState.currentNode)?.label}</strong></span>
            )}
          </div>

          {/* SVG Board */}
          <div className="svg-wrapper">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="game-svg">
              {/* Water background */}
              <rect width={SVG_W} height={SVG_H} fill="#0a1e36" rx="12" />
              <ellipse cx="300" cy="210" rx="280" ry="180" fill="#0d2a48" opacity="0.5" />

              {/* Trail path */}
              {trailPath && (
                <path
                  d={trailPath}
                  fill="none"
                  stroke="#e2b96f"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="8 4"
                  opacity="0.7"
                />
              )}

              {/* Edges */}
              {stage.edges.map(edge => {
                const used = isEdgeUsed(edge)
                const avail = isEdgeAvailable(edge)
                const hovered = hoveredEdge === edge.id
                const mid = getEdgeMidpoint(edge)
                return (
                  <g key={edge.id} onClick={() => handleEdgeClick(edge)} style={{ cursor: avail ? 'pointer' : 'default' }}>
                    {/* Clickable area */}
                    <path
                      d={getEdgePath(edge)}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="20"
                    />
                    {/* Visual edge */}
                    <path
                      d={getEdgePath(edge)}
                      fill="none"
                      stroke={used ? '#e94560' : avail || hovered ? '#e2b96f' : '#3a5a7a'}
                      strokeWidth={used ? 4 : avail || hovered ? 5 : 3}
                      strokeLinecap="round"
                      onMouseEnter={() => setHoveredEdge(edge.id)}
                      onMouseLeave={() => setHoveredEdge(null)}
                      opacity={used ? 0.9 : 1}
                    />
                    {/* Bridge cross marks */}
                    {!used && (
                      <circle cx={mid.x} cy={mid.y} r="10"
                        fill={avail || hovered ? '#e2b96f22' : '#ffffff11'}
                        stroke={avail || hovered ? '#e2b96f' : '#3a5a7a'}
                        strokeWidth="1.5"
                      />
                    )}
                    {used && (
                      <text x={mid.x} y={mid.y + 5} textAnchor="middle" fontSize="11" fill="#e94560" fontWeight="bold">✓</text>
                    )}
                    {/* Edge label */}
                    <text
                      x={mid.x}
                      y={mid.y + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fill={used ? '#e94560cc' : avail ? '#e2b96f' : '#8b949e'}
                      fontWeight="bold"
                    >
                      {edge.label}
                    </text>
                  </g>
                )
              })}

              {/* Nodes */}
              {stage.nodes.map(node => {
                const isCurrent = gameState.currentNode === node.id
                const inPath = gameState.path.includes(node.id)
                const hovered = hoveredNode === node.id
                const degree = getDegree(node.id, stage.edges)
                const isOdd = degree % 2 !== 0
                return (
                  <g
                    key={node.id}
                    onClick={() => handleNodeClick(node.id)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Glow for current */}
                    {isCurrent && (
                      <circle cx={node.x} cy={node.y} r="36" fill="#e2b96f" opacity="0.15" />
                    )}
                    {/* Island body */}
                    <ellipse
                      cx={node.x} cy={node.y}
                      rx={hovered || isCurrent ? 34 : 30}
                      ry={hovered || isCurrent ? 26 : 22}
                      fill={node.color || '#1a4a2a'}
                      stroke={isCurrent ? '#e2b96f' : inPath ? '#6a9a5a' : isOdd ? '#e9456088' : '#2d6a4f'}
                      strokeWidth={isCurrent ? 3 : 2}
                    />
                    {/* Odd marker */}
                    {isOdd && showAnswer && (
                      <circle cx={node.x + 22} cy={node.y - 16} r="8" fill="#e94560" />
                    )}
                    {/* Label */}
                    <text
                      x={node.x} y={node.y - 3}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill={isCurrent ? '#e2b96f' : '#e6edf3'}
                    >
                      {node.label}
                    </text>
                    <text
                      x={node.x} y={node.y + 12}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#8b949e"
                    >
                      {degree}本
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Result overlay */}
          {result !== 'none' && (
            <div className={`result-banner result-${result === 'success' ? 'success' : 'fail'}`}>
              {result === 'success' && (
                <>
                  <div className="result-icon">🎉</div>
                  <h3>一筆書き成功！</h3>
                  <p>すべての橋を一度ずつ渡り切った！</p>
                  <div className="result-actions">
                    <button className="btn btn-primary" onClick={onNext}>次のステージへ →</button>
                    <button className="btn btn-ghost btn-sm" onClick={reset}>もう一度</button>
                  </div>
                </>
              )}
              {result === 'stuck' && (
                <>
                  <div className="result-icon">🚧</div>
                  <h3>行き詰まりました</h3>
                  <p>渡れる橋がなくなりました。やり直しましょう！</p>
                  <div className="result-actions">
                    <button className="btn btn-primary" onClick={reset}>リセット</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowHint(true)}>ヒントを見る</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="game-side">
          <div className="side-card">
            <h3>次数（橋の本数）</h3>
            <div className="degree-list">
              {stage.nodes.map(n => {
                const deg = getDegree(n.id, stage.edges)
                return (
                  <div key={n.id} className={`degree-item ${deg % 2 !== 0 ? 'odd' : 'even'}`}>
                    <span className="degree-label">{n.label}</span>
                    <span className="degree-value">{deg}本</span>
                    <span className="degree-type">{deg % 2 !== 0 ? '奇数' : '偶数'}</span>
                  </div>
                )
              })}
            </div>
            <div className="odd-count-info">
              奇数次数の頂点: <strong>{oddNodes.length}個</strong>
              {oddNodes.length <= 2
                ? <span className="badge-ok"> → 一筆書き可能条件OK</span>
                : <span className="badge-ng"> → 一筆書き不可能</span>
              }
            </div>
          </div>

          <div className="side-card">
            <h3>操作ガイド</h3>
            <ul className="guide-list">
              <li>島をクリックしてスタート地点を選択</li>
              <li>隣の島をクリックして橋を渡る</li>
              <li>すべての橋を渡り切ったらクリア！</li>
            </ul>
          </div>

          <div className="hint-area">
            {!showHint ? (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowHint(true)}>
                💡 ヒントを見る
              </button>
            ) : (
              <div className="hint-card">
                <h4>💡 ヒント</h4>
                <p>{stage.hint}</p>
              </div>
            )}
            {!showAnswer ? (
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setShowAnswer(true)}>
                📖 答え・解説を見る
              </button>
            ) : (
              <div className="hint-card answer-card">
                <h4>📖 解説</h4>
                <p>{stage.explanation}</p>
                <div className={`solvable-badge ${stage.solvable ? 'solvable' : 'unsolvable'}`}>
                  {stage.solvable ? '✓ 一筆書き可能' : '✗ 一筆書き不可能'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameBoard
