import { useState, useEffect } from 'react'

const COLOR_LABELS = {
  green: { bg: '#dcfce7', border: '#16a34a', text: '#15803d', label: '安い', icon: '↓' },
  yellow: { bg: '#fef9c3', border: '#ca8a04', text: '#92400e', label: '平均的', icon: '→' },
  red:   { bg: '#fee2e2', border: '#dc2626', text: '#b91c1c', label: '高い',  icon: '↑' },
}

function PriceValue({ price, unit }) {
  if (price == null) return <span className="no-data">データなし</span>
  return (
    <div className="price-card-value">
      <span className="price-num">{price.toLocaleString()}</span>
      <span className="price-unit">円{unit ? `/${unit}` : ''}</span>
    </div>
  )
}

export default function PriceDisplay({
  itemName, unit, nationalPrice, regionalPrice, areaName,
  userPrice, onUserPriceChange, priceColor, latestMonth,
}) {
  const [amount, setAmount] = useState('')

  // g または ml 単位の品目を検出: "100g", "1000ml" など
  const unitMatch = unit ? unit.match(/^(\d+)(g|ml)$/) : null
  const unitBase = unitMatch ? parseInt(unitMatch[1]) : null
  const unitType = unitMatch ? unitMatch[2] : null

  // 品目が変わったら入力をリセット
  useEffect(() => { setAmount('') }, [itemName])

  const colorInfo = priceColor ? COLOR_LABELS[priceColor] : null
  const diffPct = userPrice && nationalPrice
    ? (((parseFloat(userPrice) - nationalPrice) / nationalPrice) * 100).toFixed(1)
    : null

  const parsedAmount = amount ? parseFloat(amount) : null
  const calcNationalTotal = parsedAmount && nationalPrice && unitBase
    ? Math.round((parsedAmount / unitBase) * nationalPrice)
    : null
  const calcUserTotal = parsedAmount && userPrice && !isNaN(parseFloat(userPrice)) && unitBase
    ? Math.round((parsedAmount / unitBase) * parseFloat(userPrice))
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
          <PriceValue price={nationalPrice} unit={unit} />
        </div>

        {regionalPrice != null && (
          <div className="price-card regional">
            <div className="price-card-label">{areaName}</div>
            <PriceValue price={regionalPrice} unit={unit} />
            {nationalPrice != null && (
              <div className={`regional-diff ${regionalPrice > nationalPrice ? 'up' : 'down'}`}>
                全国比 {regionalPrice > nationalPrice ? '+' : ''}
                {(((regionalPrice - nationalPrice) / nationalPrice) * 100).toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </div>

      {/* g / ml 単位品目向け任意量計算 */}
      {unitBase && nationalPrice != null && (
        <div className="gram-calc-section">
          <label className="section-label" htmlFor="unit-input">
            {unitType === 'ml' ? 'ml数で合計金額を計算' : 'グラム数で合計金額を計算'}
          </label>
          <div className="gram-input-wrap">
            <input
              id="unit-input"
              type="number"
              className="gram-input"
              placeholder={unitType === 'ml' ? '例: 200' : '例: 250'}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1"
            />
            <span className="price-unit-label">{unitType}</span>
          </div>
          {calcNationalTotal != null && (
            <div className="gram-results">
              <div className="gram-result-item">
                <span className="gram-result-label">全国平均</span>
                <strong>{parseFloat(amount).toLocaleString()}{unitType} ≈ {calcNationalTotal.toLocaleString()}円</strong>
              </div>
              {calcUserTotal != null && (
                <div className="gram-result-item">
                  <span className="gram-result-label">あなたの価格</span>
                  <strong>{parseFloat(amount).toLocaleString()}{unitType} ≈ {calcUserTotal.toLocaleString()}円</strong>
                  <span className={`gram-diff ${calcUserTotal > calcNationalTotal ? 'up' : 'down'}`}>
                    全国平均より{calcUserTotal > calcNationalTotal ? '+' : ''}
                    {(calcUserTotal - calcNationalTotal).toLocaleString()}円
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="user-price-section">
        <label className="section-label" htmlFor="user-price">
          あなたの近くの価格を入力して比較
        </label>
        <div className="user-price-input-wrap">
          <input
            id="user-price"
            type="number"
            className="price-input"
            placeholder={`価格を入力（円${unit ? `/${unit}` : ''}）`}
            value={userPrice}
            onChange={e => onUserPriceChange(e.target.value)}
            min="0"
          />
          <span className="price-unit-label">円{unit ? `/${unit}` : ''}</span>
        </div>

        {colorInfo && nationalPrice != null && (
          <div
            className="comparison-result"
            style={{ background: colorInfo.bg, borderColor: colorInfo.border, color: colorInfo.text }}
          >
            <span className="comparison-icon">{colorInfo.icon}</span>
            <div className="comparison-text">
              <strong>{colorInfo.label}</strong>
              <span>
                全国平均より{diffPct && Math.abs(parseFloat(diffPct)) > 0
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
