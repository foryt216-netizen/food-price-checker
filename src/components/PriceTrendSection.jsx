import { QUICK_ITEMS } from '../services/estatApi'

export default function PriceTrendSection({ prices, loading }) {
  if (loading) return null

  const items = QUICK_ITEMS.map(item => {
    const entry = prices[item.code]
    if (!entry?.price || !entry?.prevPrice) return null
    const pct = ((entry.price - entry.prevPrice) / entry.prevPrice) * 100
    const diff = Math.round(entry.price - entry.prevPrice)
    return { ...item, price: entry.price, prevPrice: entry.prevPrice, pct, diff }
  }).filter(Boolean)

  if (items.length === 0) return null

  const sorted = [...items].sort((a, b) => b.pct - a.pct)
  const spikes = sorted.filter(x => x.pct > 0)
  const drops = sorted.filter(x => x.pct < 0).reverse()

  if (spikes.length === 0 && drops.length === 0) return null

  const month = prices.month || ''
  const prevMonth = prices.prevMonth || ''
  const periodLabel = prevMonth && month ? `${prevMonth} → ${month}` : month

  return (
    <div className="card trend-card">
      <div className="trend-header">
        <span className="section-label">先月比 価格動向</span>
        {periodLabel && <span className="quick-subtitle">{periodLabel}</span>}
      </div>
      <div className="trend-sections">
        {spikes.length > 0 && (
          <div className="trend-section">
            <h3 className="trend-title spike">今月高騰している食品</h3>
            <ul className="trend-list">
              {spikes.slice(0, 3).map(item => (
                <li key={item.code} className="trend-item spike">
                  <span className="trend-emoji">{item.emoji}</span>
                  <span className="trend-name">{item.name}</span>
                  <span className="trend-price">{item.price.toLocaleString()}円/{item.unit}</span>
                  <span className="trend-pct spike">+{item.pct.toFixed(1)}% (+{item.diff.toLocaleString()}円)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {drops.length > 0 && (
          <div className="trend-section">
            <h3 className="trend-title drop">今月お得な食品</h3>
            <ul className="trend-list">
              {drops.slice(0, 3).map(item => (
                <li key={item.code} className="trend-item drop">
                  <span className="trend-emoji">{item.emoji}</span>
                  <span className="trend-name">{item.name}</span>
                  <span className="trend-price">{item.price.toLocaleString()}円/{item.unit}</span>
                  <span className="trend-pct drop">{item.pct.toFixed(1)}% ({item.diff.toLocaleString()}円)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
