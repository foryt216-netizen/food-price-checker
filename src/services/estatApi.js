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
  // 精白米 (5kg)
  '01001': '5kg', '01002': '5kg', '01003': '5kg', '01004': '5kg', '01005': '5kg',
  // パン（食パン1斤 = 約340g、総務省調査単位）
  '01021': '1斤',
  // めん類
  '01031': '200g', '01032': '200g',
  '01041': '1袋', '01042': '1袋',
  '01061': '1袋',   // 即席ラーメン
  '01071': '1個',   // 即席カップめん
  '01081': '500g',  // スパゲッティ
  '01082': '500g',
  // 小麦粉
  '01091': '1kg',
  // 調味料
  '01051': '1kg',   // 食塩
  '01052': '1kg',   // 砂糖
  '01053': '1000ml', // しょうゆ
  '01054': '750g',   // みそ
  '01055': '500ml',  // 酢
  '01056': '1000ml', // 食用油（サラダ油）
  '01057': '500g',   // マヨネーズ
  '01058': '500g',   // ケチャップ
  // 牛肉 (100g)
  '01101': '100g', '01102': '100g', '01103': '100g', '01104': '100g',
  // 合びき肉・加工肉 (100g)
  '01111': '100g',
  '01121': '100g',   // ウインナーソーセージ
  '01122': '100g',
  '01131': '100g',   // ハム
  '01141': '100g',   // ベーコン
  // 魚介類 (100g)
  '01201': '100g', '01202': '100g', '01203': '100g', '01204': '100g',
  '01205': '100g',
  // 豚肉 (100g)
  '01211': '100g', '01212': '100g', '01213': '100g',
  // 鶏肉 (100g)
  '01221': '100g', '01222': '100g',
  // 乳製品
  '01301': '200g',   // バター
  '01302': '200g',   // マーガリン
  '01303': '1000ml', // 牛乳
  '01304': '400g',   // ヨーグルト
  '01311': '100g',   // チーズ
  // 鶏卵
  '01341': '10個',
  // 野菜類
  '01401': '1kg',    // キャベツ
  '01402': '1束', '01403': '1個',
  '01404': '1本',    // 大根
  '01405': '1本', '01406': '1個', '01407': '1kg',
  '01408': '1kg',    // じゃがいも
  '01409': '1株', '01410': '1束',
  '01411': '1kg',    // 玉ねぎ
  '01412': '1kg', '01413': '1束', '01414': '1本', '01415': '1kg',
  '01416': '1個',    // トマト
  '01417': '1本',    // きゅうり
  '01418': '1束',    // ほうれんそう
  '01419': '1束',    // 小松菜
  '01420': '1本',
  '01421': '1株',    // レタス
  '01422': '1個',    // ブロッコリー
  '01423': '1個',    // カリフラワー
  '01424': '1個',    // ピーマン
  '01425': '1個',    // なす
  '01426': '1本',    // ごぼう
  '01427': '1本',    // れんこん
  '01428': '1個',    // さつまいも
  '01429': '1個',    // さといも
  '01430': '1束',    // みつば
  '01431': '1束',    // しそ
  '01432': '1パック', // しいたけ
  '01433': '1個', '01434': '1本',
  '01435': '1本', '01436': '1個',
}

// コードと品目名から単位を解決する。静的マップにない品目は名前中の括弧表記を解析して返す。
export function getItemUnit(code, itemName = '') {
  if (ITEM_UNITS[code]) return ITEM_UNITS[code]
  // 品目名に含まれる括弧内の単位表記を抽出: 例「食パン（１ｋｇ）」→ "1kg"
  const match = itemName.match(/[（(]([^）)]+)[）)]/)
  if (match) {
    const raw = match[1].normalize('NFKC').replace(/,/g, '').trim()
    if (/^\d+(g|kg|ml|L|ℓ|個|枚|本|束|袋|玉|株|尾|切|缶|箱|包|パック|入)/.test(raw)) {
      return raw
    }
  }
  return ''
}

// e-Stat の小売物価統計調査でデータが1kg換算に正規化されており
// 実際の販売単位・価格と大きく乖離する品目。トップページ・検索から除外する。
export const EXCLUDED_CODES = new Set([
  '01021',         // 食パン: 調査は1kg換算、実売は1斤(約340g)
  '01031','01032', // ゆでうどん: 調査は1kg換算
  '01041','01042', // 中華生めん: 調査は1kg換算
  '01061',         // 即席ラーメン: 調査は1kg換算
  '01071',         // 即席カップめん: 調査は1kg換算
  '01081','01082', // スパゲッティ: 調査は1kg換算
])

// 品目カテゴリー定義（タブ表示・同カテゴリー比較に使用）
export const CATEGORIES = [
  { id: 'all',       label: 'よく使う',   emoji: '⭐' },
  { id: 'grain',     label: '穀物',       emoji: '🌾',
    codes: ['01001','01002','01003','01004','01005','01091'] },
  { id: 'meat',      label: '肉類',       emoji: '🥩',
    codes: ['01101','01102','01103','01104','01111','01121','01122','01131','01141','01211','01212','01213','01221','01222'] },
  { id: 'fish',      label: '魚類',       emoji: '🐟',
    codes: ['01201','01202','01203','01204','01205'] },
  { id: 'dairy',     label: '乳製品・卵', emoji: '🥛',
    codes: ['01301','01302','01303','01304','01311','01341'] },
  { id: 'vegetable', label: '野菜',       emoji: '🥦',
    codes: ['01401','01402','01403','01404','01405','01406','01407','01408','01409','01410','01411','01412','01413','01414','01415','01416','01417','01418','01419','01420','01421','01422','01423','01424','01425','01426','01427','01428','01429','01430','01431','01432','01433','01434','01435','01436'] },
  { id: 'seasoning', label: '調味料',     emoji: '🧂',
    codes: ['01051','01052','01053','01054','01055','01056','01057','01058'] },
]

export function getItemCategory(code) {
  return CATEGORIES.find(c => c.codes?.includes(code)) ?? null
}

// トップページに表示するよく使う食品（実売価格と一致する品目のみ）
export const QUICK_ITEMS = [
  { code: '01001', name: '精白米',        unit: '5kg',    emoji: '🌾' },
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
