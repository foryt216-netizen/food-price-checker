export default async function handler(req, res) {
  const { path: pathArr, ...queryParams } = req.query
  const pathStr = Array.isArray(pathArr) ? pathArr.join('/') : (pathArr || '')

  const apiKey = process.env.ESTAT_API_KEY || queryParams.appId
  if (!apiKey) {
    return res.status(500).json({ error: 'ESTAT_API_KEY not configured' })
  }

  const { appId: _drop, ...restParams } = queryParams
  const params = new URLSearchParams({ appId: apiKey, ...restParams })
  const url = `https://api.e-stat.go.jp/${pathStr}?${params}`

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FoodPriceChecker/1.0)',
        'Accept': 'application/json',
        'Accept-Language': 'ja,en-US;q=0.9',
      },
    })

    const data = await upstream.json()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(upstream.status).json(data)
  } catch (err) {
    res.status(502).json({ error: 'Upstream error', message: err.message })
  }
}
