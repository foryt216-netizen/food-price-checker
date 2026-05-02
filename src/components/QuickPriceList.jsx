import { QUICK_ITEMS } from '../services/estatApi'

export default function QuickPriceList({ prices, loading, onSelect }) {
  return (
    <div className="card quick-price-card-wrapper">
      <div className="quick-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>よく使う食品の全国平均価格</h2>
        <span className="quick-subtitle">
          {!loading && prices.month ? `最新データ: ${prices.month}` : ''}
        </span>
      </div>

      {loading ? (
        <div className="quick-loading">
          <div className="spinner small" />
          価格データ取得中...
        </div>
      ) : (
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
                      <span className="quick-price-num">
                        {entry.price.toLocaleString()}
                      </span>
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
      )}

      <p className="quick-note">項目をクリックすると地域別・推移グラフが表示されます</p>
    </div>
  )
}
