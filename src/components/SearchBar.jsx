import { useState, useRef, useEffect } from 'react'

export default function SearchBar({ items, selectedItem, onSelect }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const filtered = query.trim()
    ? items.filter(i => i.name.includes(query.trim())).slice(0, 15)
    : []

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (item) => {
    onSelect(item)
    setQuery(item.name)
    setOpen(false)
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
    setOpen(true)
    if (!e.target.value.trim()) onSelect(null)
  }

  return (
    <div className="search-bar" ref={ref}>
      <label className="section-label">商品名を入力</label>
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="例: 精米、食パン、鶏卵..."
          value={query}
          onChange={handleChange}
          onFocus={() => query.trim() && setOpen(true)}
        />
        {query && (
          <button className="clear-btn" onClick={() => { setQuery(''); onSelect(null); setOpen(false) }}>
            ×
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul className="search-dropdown">
          {filtered.map(item => (
            <li
              key={item.code}
              className={`search-item ${selectedItem?.code === item.code ? 'selected' : ''}`}
              onMouseDown={() => handleSelect(item)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && filtered.length === 0 && (
        <div className="search-empty">「{query}」に一致する品目がありません</div>
      )}

      {selectedItem && (
        <div className="selected-badge">選択中: {selectedItem.name}</div>
      )}
    </div>
  )
}
