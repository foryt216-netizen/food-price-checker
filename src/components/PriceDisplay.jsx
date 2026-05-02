const COLOR_LABELS = {
  green: { bg: '#dcfce7', border: '#16a34a', text: '#15803d', label: '安い', icon: '↓' },
  yellow: { bg: '#fef9c3', border: '#ca8a04', text: '#92400e', label: '平均的', icon: '→' },
  red: { bg: '#fee2e2', border: '#dc2626', text: '#b91c1c', label: '高い', icon: '↑' },
}

export default function PriceDisplay({
  itemName, nationalPrice, regionalPrice, areaName,
  userPrice, onUserPriceChange, priceColor, latestMonth
}) {
  const colorInfo = priceColor ? COLOR_LABELS[priceColor] : null
  const diffPct = userPrice && nationalPrice
    ? (((parseFloat(userPrice) - nationalPrice) / nationalPrice) * 100).toFixed(1)
    : null

  return (
    <div className="price-display">
      <h2 className="section-title">
        {itemName} の価格情報
        {latestMonth && <span className="month-tag">{latestMonth}</span>}
      </h2>

      <div className="price-grid">
        <div className="price-card national">
          <div className="price-card-label">全国平均価格</div>
          <div className="price-card-value">
            {nationalPrice != null ? (
              <><span className="price-num">{nationalPrice.toLocaleString()}</span><span className="price-unit">円</span></>
            ) : <span className="no-data">データなし</span>}
          </div>
        </div>

        {regionalPrice != null && (
          <div className="price-card regional">
            <div className="price-card-label">{areaName}</div>
            <div className="price-card-value">
              <span className="price-num">{regionalPrice.toLocaleString()}</span>
              <span className="price-unit">円</span>
            </div>
            {nationalPrice != null && (
              <div className={`regional-diff ${regionalPrice > nationalPrice ? 'up' : 'down'}`}>
                全国比 {regionalPrice > nationalPrice ? '+' : ''}
                {(((regionalPrice - nationalPrice) / nationalPrice) * 100).toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </div>

      <div className="user-price-section">
        <label className="section-label" htmlFor="user-price">
          あなたの近くの価格を入力して比較
        </label>
        <div className="user-price-input-wrap">
          <input
            id="user-price"
            type="number"
            className="price-input"
            placeholder="価格を入力（円）"
            value={userPrice}
            onChange={e => onUserPriceChange(e.target.value)}
            min="0"
          />
          <span className="price-unit-label">円</span>
        </div>

        {colorInfo && nationalPrice != null && (
          <div
            className="comparison-result"
            style={{
              background: colorInfo.bg,
              borderColor: colorInfo.border,
              color: colorInfo.text,
            }}
          >
            <span className="comparison-icon">{colorInfo.icon}</span>
            <div className="comparison-text">
              <strong>{colorInfo.label}</strong>
              <span>
                全国平均より {diffPct && Math.abs(parseFloat(diffPct)) > 0
                  ? `${Math.abs(parseFloat(diffPct))}% ${parseFloat(diffPct) > 0 ? '高い' : '安い'}`
                  : 'ほぼ同じ'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
