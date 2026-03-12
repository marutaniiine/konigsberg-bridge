import { useState, useCallback } from 'react'
import type { FC } from 'react'
import './App.css'
import GameBoard from './components/GameBoard'
import InfoPanel from './components/InfoPanel'
import StageSelect from './components/StageSelect'
import type { Stage } from './types'
import { STAGES } from './data/stages'

type Screen = 'title' | 'select' | 'game' | 'theory'

const App: FC = () => {
  const [screen, setScreen] = useState<Screen>('title')
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)

  const handleSelectStage = useCallback((stage: Stage) => {
    setSelectedStage(stage)
    setScreen('game')
  }, [])

  return (
    <div className="app">
      {screen === 'title' && (
        <TitleScreen
          onPlay={() => setScreen('select')}
          onTheory={() => setScreen('theory')}
        />
      )}
      {screen === 'select' && (
        <StageSelect
          stages={STAGES}
          onSelect={handleSelectStage}
          onBack={() => setScreen('title')}
        />
      )}
      {screen === 'game' && selectedStage && (
        <GameBoard
          stage={selectedStage}
          onBack={() => setScreen('select')}
          onNext={() => {
            const idx = STAGES.indexOf(selectedStage)
            if (idx < STAGES.length - 1) {
              setSelectedStage(STAGES[idx + 1])
            } else {
              setScreen('select')
            }
          }}
        />
      )}
      {screen === 'theory' && (
        <InfoPanel onBack={() => setScreen('title')} />
      )}
    </div>
  )
}

interface TitleScreenProps {
  onPlay: () => void
  onTheory: () => void
}

const TitleScreen: FC<TitleScreenProps> = ({ onPlay, onTheory }) => (
  <div className="title-screen">
    <div className="title-water">
      <div className="title-ripple" />
    </div>
    <div className="title-content">
      <div className="title-icon">🌉</div>
      <h1 className="title-main">ケーニヒスベルクの橋</h1>
      <p className="title-sub">一筆書きパズル</p>
      <p className="title-desc">
        7本の橋をすべて一度だけ渡れるか？<br />
        18世紀の数学者オイラーが挑んだ問題に挑戦しよう
      </p>
      <div className="title-buttons">
        <button className="btn btn-primary" onClick={onPlay}>
          ▶ ゲームをはじめる
        </button>
        <button className="btn btn-secondary" onClick={onTheory}>
          📖 オイラーの定理を学ぶ
        </button>
      </div>
    </div>
  </div>
)

export default App
