const API_KEY = 'b95d541af611ccc457693c23c4cf39f99fe50701'
const BASE = '/api/estat/rest/3.0/app/json'

async function call(endpoint, params) {
  const url = new URL(`${BASE}/${endpoint}`, window.location.origin)
  url.search = new URLSearchParams({ appId: API_KEY, lang: 'J', ...params })
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const result =
    data?.GET_META_INFO?.RESULT ??
    data?.GET_STATS_DATA?.RESULT ??
    data?.GET_STATS_LIST?.RESULT
  // status 0=正常, 100=データなし（空配列として扱う）
  if (result && result.STATUS !== 0 && result.STATUS !== 100) {
    throw new Error(result.ERROR_MSG || 'APIエラー')
  }
  return data
}

// 小売物価統計調査（動向編）主要品目の都市別小売価格 月次
export const STATS_ID = '0003421913'

export const getMetaInfo = (statsDataId) =>
  call('getMetaInfo', { statsDataId })

export const getStatsData = (statsDataId, params = {}) =>
  call('getStatsData', { statsDataId, ...params })

// このテーブルの時間コード形式: YYYY00MMZZ (例: 2026000303 = 2026年3月)
export function buildTimeCode(year, month) {
  const mm = String(month).padStart(2, '0')
  return `${year}00${mm}${mm}`
}

export function lastNMonthCodes(n = 6) {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1)
    return buildTimeCode(d.getFullYear(), d.getMonth() + 1)
  })
}

export function formatMonthLabel(code) {
  const year = String(code).slice(0, 4)
  const month = parseInt(String(code).slice(6, 8))
  return `${year}年${month}月`
}

// メタデータの品目名に付く番号プレフィックス（例: "1021 食パン" → "食パン"）を除去
export function cleanItemName(name) {
  return String(name).replace(/^\d{4}\s+/, '')
}

// 小売物価統計調査 survey仕様に基づく品目別単位
// 出典: 総務省統計局 小売物価統計調査（動向編）品目別調査仕様
// APIメタデータには@unit情報なし。単位は総務省公式PDF・横浜市調査資料より確認。
export const ITEM_UNITS = {
  '01001': '5kg', '01002': '5kg', '01003': '5kg', '01005': '5kg',
  '01021': '1kg',   // 食パン: 1kg（総務省公式PDF "White bread (1kg)" 確認済み）
  '01031': '200g', '01041': '1束',
  '01051': '1個', '01052': '1玉',
  '01101': '100g', '01103': '100g', '01111': '100g',
  '01201': '100g', '01211': '100g', '01221': '100g',
  '01303': '1000ml',
  '01341': '10個',
  '01401': '1kg',  // キャベツ: 1kg（総務省公式PDF "Cabbage (1kg)" 確認済み）
  '01402': '1束', '01403': '1個',
  '01405': '1本', '01406': '1個', '01407': '1kg',  // もやし: 1kg（横浜市R6調査 1kg確認済み）
  '01409': '1株', '01410': '1束',
  '01412': '1kg', '01414': '1本', '01415': '1kg',  // にんじん: 1kg（総務省公式PDF "Carrots (1kg)" 確認済み）
  '01420': '1本', '01433': '1個', '01434': '1本',
  '01435': '1本', '01436': '1個',
}

// トップページに表示するよく使う食品（APIで確認済みコード）
export const QUICK_ITEMS = [
  { code: '01021', name: '食パン',        unit: '1kg',    emoji: '🍞' },
  { code: '01341', name: '鶏卵',          unit: '10個',   emoji: '🥚' },
  { code: '01303', name: '牛乳',          unit: '1000ml', emoji: '🥛' },
  { code: '01407', name: 'もやし',        unit: '1kg',    emoji: '🌱' },
  { code: '01221', name: '鶏肉',          unit: '100g',   emoji: '🍗' },
  { code: '01211', name: '豚肉（バラ）',  unit: '100g',   emoji: '🥩' },
  { code: '01401', name: 'キャベツ',      unit: '1kg',    emoji: '🥬' },
  { code: '01415', name: 'にんじん',      unit: '1kg',    emoji: '🥕' },
]

// 全国平均を計算（81都市の平均値）
export function calcNationalAvg(values) {
  const valid = values.filter(v => !isNaN(v) && v != null)
  return valid.length > 0 ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : null
}

// APIレスポンスから {timeCode: price[]} のマップを作成
export function groupByTime(raw) {
  const vals = raw?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE
  if (!vals) return {}
  const arr = Array.isArray(vals) ? vals : [vals]
  const map = {}
  for (const v of arr) {
    const t = String(v['@time'] || '')
    const price = parseFloat(v['$'])
    if (t && !isNaN(price)) {
      if (!map[t]) map[t] = []
      map[t].push(price)
    }
  }
  return map
}
