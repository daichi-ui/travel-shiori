// 入力からリンク先を取り出す。「店名 https://...」のように文字と一緒に貼っても URL 部分だけ使う。
// "www.example.com" のように https:// が無いものは補う。リンクにできなければ null
export function toLink(text: string): string | null {
  const value = text.trim()
  const found = value.match(/https?:\/\/[^\s<>"'「」]+/)
  if (found) return found[0]
  if (/^(www\.)?[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(value)) return `https://${value}`
  return null
}

// リンクの表示用に「example.com/path…」のように短くする
export function shortLink(link: string) {
  try {
    const url = new URL(link)
    const rest = decodeURIComponent(url.pathname + url.search).replace(/\/$/, '')
    const text = url.hostname.replace(/^www\./, '') + rest
    return text.length > 40 ? `${text.slice(0, 40)}…` : text
  } catch {
    return link
  }
}
