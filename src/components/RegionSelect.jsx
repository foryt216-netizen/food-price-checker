export default function RegionSelect({ areas, selectedArea, onChange }) {
  return (
    <div className="region-select">
      <label className="section-label" htmlFor="region-select">地域を選択</label>
      <select
        id="region-select"
        className="select-input"
        value={selectedArea}
        onChange={e => onChange(e.target.value)}
      >
        {areas.map(area => (
          <option key={area.code} value={area.code}>{area.name}</option>
        ))}
      </select>
    </div>
  )
}
