import type { FC } from 'react'
import './InfoPanel.css'

interface Props {
  onBack: () => void
}

const InfoPanel: FC<Props> = ({ onBack }) => (
  <div className="info-screen">
    <header className="info-header">
      <button className="btn btn-ghost btn-sm" onClick={onBack}>← 戻る</button>
      <h2>オイラーの定理</h2>
      <div />
    </header>

    <div className="info-content">
      <section className="info-section">
        <div className="info-icon">🏰</div>
        <h3>ケーニヒスベルクの橋問題とは</h3>
        <p>
          18世紀のプロイセン（現ロシア）の都市ケーニヒスベルクには、
          プレーゲル川によって分断された4つの地区を結ぶ<strong>7本の橋</strong>がありました。
          市民の間で「<strong>7本の橋を全て一度ずつ渡って出発点に戻れるか？</strong>」という
          問題が話題になっていました。
        </p>
      </section>

      <section className="info-section">
        <div className="info-icon">🧮</div>
        <h3>オイラーの解決（1736年）</h3>
        <p>
          数学者レオンハルト・オイラーはこの問題を抽象化し、
          地区を<strong>点（頂点）</strong>、橋を<strong>線（辺）</strong>として表現しました。
          これが<strong>グラフ理論</strong>の誕生です。
        </p>
        <p>
          オイラーは「一筆書きが可能かどうか」を次の条件で判定できることを証明しました：
        </p>
      </section>

      <section className="info-theorem">
        <h3>🔑 オイラーの定理</h3>
        <div className="theorem-rules">
          <div className="theorem-rule">
            <div className="rule-badge rule-closed">閉路（元の場所に戻る）</div>
            <p>すべての頂点の次数が<strong>偶数</strong>のとき一筆書き可能。<br />どこからでも始められる。</p>
          </div>
          <div className="theorem-rule">
            <div className="rule-badge rule-open">開路（違う場所で終わる）</div>
            <p>奇数次数の頂点が<strong>ちょうど2個</strong>のとき一筆書き可能。<br />奇数次数の頂点から始め、もう一方で終わる。</p>
          </div>
          <div className="theorem-rule">
            <div className="rule-badge rule-impossible">不可能</div>
            <p>奇数次数の頂点が<strong>3個以上</strong>のとき、一筆書きは<strong>絶対に不可能</strong>。</p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="info-icon">🌉</div>
        <h3>ケーニヒスベルクの場合</h3>
        <div className="konigsberg-table">
          <div className="k-row k-header">
            <span>地区</span><span>橋の本数</span><span>次数の奇偶</span>
          </div>
          <div className="k-row">
            <span>北岸</span><span>3本</span><span className="odd-text">奇数 ✗</span>
          </div>
          <div className="k-row">
            <span>南岸</span><span>3本</span><span className="odd-text">奇数 ✗</span>
          </div>
          <div className="k-row">
            <span>大島</span><span>5本</span><span className="odd-text">奇数 ✗</span>
          </div>
          <div className="k-row">
            <span>小島</span><span>3本</span><span className="odd-text">奇数 ✗</span>
          </div>
        </div>
        <p style={{ marginTop: 12 }}>
          奇数次数の頂点が<strong>4個</strong>あるため、一筆書きは<strong>数学的に不可能</strong>と証明されました！
        </p>
      </section>

      <section className="info-section">
        <div className="info-icon">💡</div>
        <h3>なぜ重要なのか</h3>
        <p>
          この問題はグラフ理論の始まりとなり、現代の様々な技術の基礎になっています：
        </p>
        <ul className="info-list">
          <li>🗺 <strong>カーナビ・経路探索</strong>（最短ルート計算）</li>
          <li>🌐 <strong>インターネットのルーティング</strong>（データの最適経路）</li>
          <li>🧬 <strong>DNAの塩基配列解析</strong>（オイラー路の応用）</li>
          <li>📦 <strong>物流・配送最適化</strong>（中国人郵便配達問題）</li>
          <li>🔌 <strong>回路設計</strong>（集積回路の最適配線）</li>
        </ul>
      </section>

      <div className="info-cta">
        <button className="btn btn-primary" onClick={onBack}>
          ▶ ゲームで試してみる
        </button>
      </div>
    </div>
  </div>
)

export default InfoPanel
