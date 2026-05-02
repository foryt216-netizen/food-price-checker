export default function AlertPanel({ alert, itemName }) {
  if (!alert) return null

  const isSpike = alert.type === 'spike'
  const pct = Math.abs(alert.change * 100).toFixed(1)

  return (
    <div className={`alert-panel ${isSpike ? 'alert-spike' : 'alert-drop'}`}>
      <div className="alert-icon">{isSpike ? '⚠️' : '📉'}</div>
      <div className="alert-body">
        <strong className="alert-title">
          {isSpike ? '価格高騰アラート' : '価格暴落アラート'}
        </strong>
        <p className="alert-message">
          {itemName}の価格が先月比で <strong>{pct}%</strong>
          {isSpike ? '上昇' : '下落'}しています
          {alert.month && `（${alert.month}時点）`}。
        </p>
      </div>
    </div>
  )
}
