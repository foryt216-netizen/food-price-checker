import { QUICK_ITEMS, CATEGORIES } from '../services/estatApi'

export default function QuickPriceList({
  prices, loading, onSelect,
  activeCategory, onCategoryChange, catData,
}) {
  const isAll = activeCategory === 'all'
  const catLoading = !isAll && (catData?.loading ?? false)
  const catItems = !isAll ? (catData?.items ?? []) : []
  const activeCatDef = CATEGORIES.find(c => c.id === activeCategory)

  const latestMonthLabel = isAll
    ? (!loading && prices.month ? prices.month : '')
    : (!catLoading && catItems[0]?.month ? catItems[0].month : '')

  return (
    <div className="card quick-price-card-wrapper">
      {/* カテゴリータブ */}
      <div className="cat-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`cat-tab${activeCategory === cat.id ? ' active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      <div className="quick-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          {activeCatDef
            ? `${activeCatDef.emoji} ${activeCatDef.label}の全国平均価格`
            : '全国平均価格'}
        </h2>
        <span className="quick-subtitle">
          {latestMonthLabel ? `最新データ: ${latestMonthLabel}` : ''}
        </span>
      </div>

      {(isAll ? loading : catLoading) ? (
        <div className="quick-loading">
          <div className="spinner small" />
          価格データ取得中...
        </div>
      ) : isAll ? (
        /* よく使うタブ */
        <div className="quick-grid">
          {QUICK_ITEMS.map(item => {
            const entry = prices[item.code]
            return (
              <button
                key={item.code}
                className="quick-item"
                onClick={() => onSelect(item)}
                title={`${item.name}を選択して詳細を見る`}
              >
                <span className="quick-emoji">{item.emoji}</span>
                <span className="quick-name">{item.name}</span>
                <div className="quick-price-row">
                  {entry ? (
                    <>
                      <span className="quick-price-num">{entry.price.toLocaleString()}</span>
                      <span className="quick-unit">円/{item.unit}</span>
                    </>
                  ) : (
                    <span className="quick-no-data">データなし</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      ) : catItems.length > 0 ? (
        /* カテゴリータブ */
        <div className="quick-grid">
          {catItems.map(item => (
            <button
              key={item.code}
              className="quick-item cat-grid-item"
              onClick={() => onSelect(item)}
              title={`${item.name}を選択して詳細を見る`}
            >
              <span className="quick-name">{item.name}</span>
              <div className="quick-price-row">
                <span className="quick-price-num">{item.price.toLocaleString()}</span>
                <span className="quick-unit">円/{item.unit || '-'}</span>
              </div>
              {item.prevPrice != null && (
                <span className={`cat-grid-change ${item.price > item.prevPrice ? 'up' : 'down'}`}>
                  {item.price > item.prevPrice ? '▲' : '▼'}
                  {Math.abs(((item.price - item.prevPrice) / item.prevPrice) * 100).toFixed(1)}%
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="quick-loading" style={{ color: '#94a3b8', justifyContent: 'center' }}>
          このカテゴリーのデータはありません
        </div>
      )}

      <p className="quick-note">項目をクリックすると地域別・推移グラフが表示されます</p>
    </div>
  )
}
