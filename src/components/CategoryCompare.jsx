export default function CategoryCompare({ category, catData, selectedCode, onSelect }) {
  const items = (catData?.items ?? []).filter(i => i.code !== selectedCode)
  if (!catData?.loading && items.length === 0) return null

  return (
    <div className="card">
      <h2 className="section-title">
        {category.emoji} 同じカテゴリーの食品比較
        <span className="cat-label-tag">{category.label}</span>
      </h2>
      {catData?.loading ? (
        <div className="cat-compare-loading">
          <div className="spinner small" /> 読み込み中...
        </div>
      ) : (
        <div className="cat-compare-grid">
          {items.map(item => (
            <button key={item.code} className="cat-compare-item" onClick={() => onSelect(item)}>
              <span className="cat-compare-name">{item.name}</span>
              <div className="cat-compare-price-row">
                <span className="cat-compare-num">{item.price.toLocaleString()}</span>
                <span className="cat-compare-unit">円/{item.unit || '-'}</span>
              </div>
              {item.prevPrice != null && (
                <span className={`cat-compare-change ${item.price > item.prevPrice ? 'up' : 'down'}`}>
                  {item.price > item.prevPrice ? '▲' : '▼'}
                  {Math.abs(((item.price - item.prevPrice) / item.prevPrice) * 100).toFixed(1)}%
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      <p className="quick-note">クリックするとその食品の詳細を見られます</p>
    </div>
  )
}
