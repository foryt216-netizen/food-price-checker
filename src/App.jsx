import { useState, useEffect, useCallback } from 'react'
import {
  STATS_ID, QUICK_ITEMS, ITEM_UNITS,
  getMetaInfo, getStatsData,
  lastNMonthCodes, formatMonthLabel, cleanItemName,
  calcNationalAvg, groupByTime,
} from './services/estatApi'
import SearchBar from './components/SearchBar'
import RegionSelect from './components/RegionSelect'
import PriceDisplay from './components/PriceDisplay'
import PriceChart from './components/PriceChart'
import AlertPanel from './components/AlertPanel'
import QuickPriceList from './components/QuickPriceList'
import PriceTrendSection from './components/PriceTrendSection'

// 小売物価統計調査 調査対象都市 81市
const ALL_AREAS = [
  { code: 'NATIONAL', name: '全国平均（全都市の平均）' },
  { code: '01100', name: '札幌市' },
  { code: '01202', name: '函館市' },
  { code: '01204', name: '旭川市' },
  { code: '02201', name: '青森市' },
  { code: '02203', name: '八戸市' },
  { code: '03201', name: '盛岡市' },
  { code: '04100', name: '仙台市' },
  { code: '05201', name: '秋田市' },
  { code: '06201', name: '山形市' },
  { code: '07201', name: '福島市' },
  { code: '07203', name: '郡山市' },
  { code: '08201', name: '水戸市' },
  { code: '08202', name: '日立市' },
  { code: '09201', name: '宇都宮市' },
  { code: '09208', name: '小山市' },
  { code: '10201', name: '前橋市' },
  { code: '11100', name: 'さいたま市' },
  { code: '11202', name: '熊谷市' },
  { code: '11203', name: '川口市' },
  { code: '11208', name: '所沢市' },
  { code: '12100', name: '千葉市' },
  { code: '12217', name: '柏市' },
  { code: '12227', name: '浦安市' },
  { code: '13100', name: '特別区部（東京）' },
  { code: '13201', name: '八王子市' },
  { code: '13202', name: '立川市' },
  { code: '13206', name: '府中市' },
  { code: '14100', name: '横浜市' },
  { code: '14130', name: '川崎市' },
  { code: '14150', name: '相模原市' },
  { code: '14205', name: '藤沢市' },
  { code: '15100', name: '新潟市' },
  { code: '15202', name: '長岡市' },
  { code: '16201', name: '富山市' },
  { code: '17201', name: '金沢市' },
  { code: '18201', name: '福井市' },
  { code: '19201', name: '甲府市' },
  { code: '20201', name: '長野市' },
  { code: '20202', name: '松本市' },
  { code: '21201', name: '岐阜市' },
  { code: '22100', name: '静岡市' },
  { code: '22130', name: '浜松市' },
  { code: '22210', name: '富士市' },
  { code: '23100', name: '名古屋市' },
  { code: '23201', name: '豊橋市' },
  { code: '24201', name: '津市' },
  { code: '24204', name: '松阪市' },
  { code: '25201', name: '大津市' },
  { code: '26100', name: '京都市' },
  { code: '27100', name: '大阪市' },
  { code: '27140', name: '堺市' },
  { code: '27210', name: '枚方市' },
  { code: '27227', name: '東大阪市' },
  { code: '28100', name: '神戸市' },
  { code: '28201', name: '姫路市' },
  { code: '28204', name: '西宮市' },
  { code: '28207', name: '伊丹市' },
  { code: '29201', name: '奈良市' },
  { code: '30201', name: '和歌山市' },
  { code: '31201', name: '鳥取市' },
  { code: '32201', name: '松江市' },
  { code: '33100', name: '岡山市' },
  { code: '34100', name: '広島市' },
  { code: '34207', name: '福山市' },
  { code: '35202', name: '宇部市' },
  { code: '35203', name: '山口市' },
  { code: '36201', name: '徳島市' },
  { code: '37201', name: '高松市' },
  { code: '38201', name: '松山市' },
  { code: '38202', name: '今治市' },
  { code: '39201', name: '高知市' },
  { code: '40100', name: '北九州市' },
  { code: '40130', name: '福岡市' },
  { code: '41201', name: '佐賀市' },
  { code: '42201', name: '長崎市' },
  { code: '42202', name: '佐世保市' },
  { code: '43100', name: '熊本市' },
  { code: '44201', name: '大分市' },
  { code: '45201', name: '宮崎市' },
  { code: '46201', name: '鹿児島市' },
  { code: '47201', name: '那覇市' },
]

export default function App() {
  const [allItems, setAllItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedArea, setSelectedArea] = useState('NATIONAL')
  const [priceHistory, setPriceHistory] = useState([])
  const [userPrice, setUserPrice] = useState('')
  const [quickPrices, setQuickPrices] = useState({})
  const [initLoading, setInitLoading] = useState(true)
  const [quickLoading, setQuickLoading] = useState(false)
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [initError, setInitError] = useState(null)
  const [priceError, setPriceError] = useState(null)

  useEffect(() => { initApp() }, [])

  useEffect(() => {
    if (selectedItem) loadPriceData()
  }, [selectedItem, selectedArea])

  const initApp = async () => {
    setInitLoading(true)
    setInitError(null)
    try {
      const meta = await getMetaInfo(STATS_ID)
      const classObjs = meta?.GET_META_INFO?.METADATA_INF?.CLASS_INF?.CLASS_OBJ
      if (!classObjs) throw new Error('メタデータが取得できませんでした')

      const objArr = Array.isArray(classObjs) ? classObjs : [classObjs]
      for (const obj of objArr) {
        if (obj['@id'] === 'cat02' || (obj['@name'] || '').includes('銘柄')) {
          const classes = Array.isArray(obj.CLASS) ? obj.CLASS : obj.CLASS ? [obj.CLASS] : []
          const items = classes
            .map(c => ({ code: c['@code'], name: cleanItemName(c['@name']) }))
            .filter(c => c.code && c.name)
          if (items.length > 0) setAllItems(items)
        }
      }
    } catch (e) {
      console.error(e)
      setInitError(`初期化エラー: ${e.message}`)
    }
    setInitLoading(false)
    loadQuickPrices()
  }

  const loadQuickPrices = async () => {
    setQuickLoading(true)
    try {
      // 6ヶ月分取得: e-Statの公表ラグ(約2ヶ月)があるため3ヶ月だと直近1ヶ月しか
      // データがなく前月比が計算できない。6ヶ月なら必ず2ヶ月以上の実績値が入る。
      const months = lastNMonthCodes(6)
      const fromCode = months[0]
      const toCode = months[months.length - 1]

      // 8品目を並列取得
      const results = await Promise.all(
        QUICK_ITEMS.map(item =>
          getStatsData(STATS_ID, {
            cdCat01: '0020',
            cdCat02: item.code,
            cdTimeFrom: fromCode,
            cdTimeTo: toCode,
          }).catch(() => null)
        )
      )

      const prices = {}
      let latestMonth = ''
      let prevMonth = ''

      results.forEach((raw, i) => {
        const byTime = groupByTime(raw)
        const sortedTimes = Object.keys(byTime).sort().reverse()
        if (sortedTimes.length === 0) return
        const latest = sortedTimes[0]
        const prev = sortedTimes[1]
        const nationalAvg = calcNationalAvg(byTime[latest])
        const prevNationalAvg = prev ? calcNationalAvg(byTime[prev]) : null
        if (nationalAvg != null) {
          prices[QUICK_ITEMS[i].code] = {
            price: nationalAvg,
            month: formatMonthLabel(latest),
            prevPrice: prevNationalAvg,
          }
          if (latest > latestMonth) {
            latestMonth = latest
            prevMonth = prev || ''
          }
        }
      })

      setQuickPrices({
        ...prices,
        month: latestMonth ? formatMonthLabel(latestMonth) : '',
        prevMonth: prevMonth ? formatMonthLabel(prevMonth) : '',
      })
    } catch (e) {
      console.error('クイック価格取得エラー:', e)
    }
    setQuickLoading(false)
  }

  const loadPriceData = useCallback(async () => {
    if (!selectedItem) return
    setLoadingPrices(true)
    setPriceError(null)
    try {
      const months = lastNMonthCodes(6)
      const raw = await getStatsData(STATS_ID, {
        cdCat01: '0020',
        cdCat02: selectedItem.code,
        cdTimeFrom: months[0],
        cdTimeTo: months[months.length - 1],
      })

      const vals = raw?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE
      if (!vals) {
        setPriceHistory(months.map(m => ({ timeCode: m, month: formatMonthLabel(m), national: null, regional: null })))
        setLoadingPrices(false)
        return
      }

      const arr = Array.isArray(vals) ? vals : [vals]
      const byTime = {}
      for (const v of arr) {
        const t = String(v['@time'] || '')
        const area = String(v['@area'] || '')
        const price = parseFloat(v['$'])
        if (!isNaN(price) && t) {
          if (!byTime[t]) byTime[t] = { all: [], cityMap: {} }
          byTime[t].all.push(price)
          byTime[t].cityMap[area] = price
        }
      }

      const history = months.map(code => {
        const entry = byTime[code]
        const national = entry ? calcNationalAvg(entry.all) : null
        const regional =
          entry && selectedArea !== 'NATIONAL' ? (entry.cityMap[selectedArea] ?? null) : null
        return { timeCode: code, month: formatMonthLabel(code), national, regional }
      })

      setPriceHistory(history)
      setUserPrice('')
    } catch (e) {
      console.error(e)
      setPriceError(`データ取得エラー: ${e.message}`)
    }
    setLoadingPrices(false)
  }, [selectedItem, selectedArea])

  // クイックリストからアイテムを選択したとき（コードだけ持つためallItemsから探す）
  const handleQuickSelect = (quickItem) => {
    const found = allItems.find(i => i.code === quickItem.code)
    setSelectedItem(found ?? { code: quickItem.code, name: quickItem.name })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const validHistory = priceHistory.filter(h => h.national !== null)
  const latest = validHistory[validHistory.length - 1]
  const previous = validHistory[validHistory.length - 2]
  const latestNational = latest?.national ?? null
  const latestRegional = selectedArea !== 'NATIONAL' ? (latest?.regional ?? null) : null

  const itemUnit = selectedItem ? (ITEM_UNITS[selectedItem.code] || '') : ''

  const getPriceColor = () => {
    if (!userPrice || !latestNational) return null
    const u = parseFloat(userPrice)
    if (isNaN(u)) return null
    const ratio = u / latestNational
    if (ratio < 0.95) return 'green'
    if (ratio > 1.05) return 'red'
    return 'yellow'
  }

  const getAlert = () => {
    if (!latestNational || !previous?.national) return null
    const change = (latestNational - previous.national) / previous.national
    if (Math.abs(change) < 0.1) return null
    return { type: change > 0 ? 'spike' : 'drop', change, month: latest?.month }
  }

  const selectedAreaName = ALL_AREAS.find(a => a.code === selectedArea)?.name || ''

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <h1>食品価格チェッカー</h1>
          <p>総務省 小売物価統計調査（e-Stat）</p>
        </div>
      </header>

      <main className="main-content">
        {initLoading ? (
          <div className="init-loading">
            <div className="spinner" />
            <span>統計データを読み込み中...</span>
          </div>
        ) : initError ? (
          <div className="error-card">
            <strong>読み込みエラー</strong>
            <p>{initError}</p>
            <button onClick={initApp} className="btn-retry">再試行</button>
          </div>
        ) : (
          <>
            <div className="card">
              <SearchBar
                items={allItems}
                selectedItem={selectedItem}
                onSelect={setSelectedItem}
              />
            </div>

            {/* 検索前: よく使う食品一覧 + 価格動向 */}
            {!selectedItem && (
              <>
                <QuickPriceList
                  prices={quickPrices}
                  loading={quickLoading}
                  onSelect={handleQuickSelect}
                />
                <PriceTrendSection
                  prices={quickPrices}
                  loading={quickLoading}
                />
              </>
            )}

            {/* 検索後: 詳細表示 */}
            {selectedItem && (
              <>
                <div className="card">
                  <RegionSelect
                    areas={ALL_AREAS}
                    selectedArea={selectedArea}
                    onChange={setSelectedArea}
                  />
                </div>

                {loadingPrices ? (
                  <div className="loading-prices">
                    <div className="spinner small" />
                    価格データ取得中...
                  </div>
                ) : priceError ? (
                  <div className="error-card">
                    <strong>データ取得エラー</strong>
                    <p>{priceError}</p>
                    <button onClick={loadPriceData} className="btn-retry">再試行</button>
                  </div>
                ) : (
                  <>
                    <AlertPanel alert={getAlert()} itemName={selectedItem.name} />

                    <div className="card">
                      <PriceDisplay
                        itemName={selectedItem.name}
                        unit={itemUnit}
                        nationalPrice={latestNational}
                        regionalPrice={latestRegional}
                        areaName={selectedAreaName}
                        userPrice={userPrice}
                        onUserPriceChange={setUserPrice}
                        priceColor={getPriceColor()}
                        latestMonth={latest?.month}
                      />
                    </div>

                    {validHistory.length > 0 && (
                      <div className="card">
                        <PriceChart
                          data={priceHistory}
                          areaName={selectedAreaName}
                          showRegional={selectedArea !== 'NATIONAL'}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>データ出典: 総務省統計局 小売物価統計調査（e-Stat API）</p>
      </footer>
    </div>
  )
}
