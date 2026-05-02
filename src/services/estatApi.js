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
  // YYYY00MMZZ → YYYY年MM月
  const year = String(code).slice(0, 4)
  const month = parseInt(String(code).slice(6, 8))
  return `${year}年${month}月`
}
