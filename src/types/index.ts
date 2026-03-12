export interface Node {
  id: string
  x: number
  y: number
  label: string
  color?: string
}

export interface Edge {
  id: string
  from: string
  to: string
  label?: string
}

export interface Stage {
  id: string
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
  solvable: boolean
  hint: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface GameState {
  path: string[]       // node ids in order
  usedEdges: Set<string>
  currentNode: string | null
}
