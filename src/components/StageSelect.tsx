import type { FC } from 'react'
import type { Stage } from '../types'
import './StageSelect.css'

interface Props {
  stages: Stage[]
  onSelect: (stage: Stage) => void
  onBack: () => void
}

const DIFF_LABEL = { easy: '初級', medium: '中級', hard: '上級' }
const DIFF_COLOR = { easy: 'easy', medium: 'medium', hard: 'hard' }

const StageSelect: FC<Props> = ({ stages, onSelect, onBack }) => (
  <div className="select-screen">
    <header className="select-header">
      <button className="btn btn-ghost btn-sm" onClick={onBack}>← 戻る</button>
      <h2>ステージ選択</h2>
      <div />
    </header>

    <div className="select-intro">
      <p>一筆書きに挑戦するグラフを選んでください。</p>
      <p className="select-tip">💡 ヒント: 奇数次数の頂点が 0 または 2 なら一筆書き可能です</p>
    </div>

    <div className="stage-grid">
      {stages.map((stage, i) => (
        <div key={stage.id} className="stage-card" onClick={() => onSelect(stage)}>
          <div className="stage-number">{i + 1}</div>
          <div className="stage-card-body">
            <div className="stage-card-header">
              <h3>{stage.name}</h3>
              <span className={`difficulty-badge`} data-diff={DIFF_COLOR[stage.difficulty]}>
                {DIFF_LABEL[stage.difficulty]}
              </span>
            </div>
            <p className="stage-card-desc">{stage.description}</p>
            <div className="stage-card-meta">
              <span className="stage-meta-item">🔗 橋: {stage.edges.length}本</span>
              <span className="stage-meta-item">🏝 島: {stage.nodes.length}個</span>
              <span className={`stage-solvable ${stage.solvable ? 'solvable' : 'unsolvable'}`}>
                {stage.solvable ? '✓ 可能' : '✗ 不可'}
              </span>
            </div>
          </div>
          <div className="stage-arrow">›</div>
        </div>
      ))}
    </div>
  </div>
)

export default StageSelect
