// app/api/telegram/apply/route.ts
import { NextResponse } from "next/server"
import dns from "node:dns"
import https from "node:https"

// IPv4 우선 (일부 환경의 v6 타임아웃 회피)
dns.setDefaultResultOrder?.("ipv4first")

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const CHAT_IDS = (process.env.TELEGRAM_CHAT_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

type Body = {
  name: string
  phone: string
  bizType: "개인사업자" | "법인사업자"
  amount: number | string
  region: string
}

export async function POST(req: Request) {
  try {
    if (!BOT_TOKEN || CHAT_IDS.length === 0) {
      throw new Error("Telegram env not configured")
    }
    const b = (await req.json()) as Body

    const amountNum = Number(String(b.amount).replace(/[^\d]/g, ""))
    if (!b.name?.trim()) throw new Error("name required")
    if (!b.phone?.trim()) throw new Error("phone required")
    if (!amountNum || amountNum < 100_000) throw new Error("amount required")
    if (!b.region?.trim()) throw new Error("region required")

    const amountStr = amountNum.toLocaleString("ko-KR")
    const text =
      `<b>[신규접수]</b>\n` +
      `이름: ${escapeHtml(b.name)}\n` +
      `연락처: ${escapeHtml(b.phone)}\n` +
      `유형: ${escapeHtml(b.bizType)}\n` +
      `금액: ${amountStr}원\n` +
      `지역: ${escapeHtml(b.region)}`

    const base = `https://api.telegram.org/bot${BOT_TOKEN}`

    // 0) 네트워크 프로브 (fetch → 실패 시 https IPv4)
    const probe = await getTextWithFallback(`${base}/getMe`)
    console.log("[TG probe getMe]", probe.slice(0, 200))
    if (!probe.startsWith('{"ok":true')) {
      throw new Error(`network probe failed: ${probe}`)
    }

    // 1) 워밍업 (첫 대상만)
    const warm = await postJsonWithFallback(`${base}/sendMessage`, {
      chat_id: CHAT_IDS[0],
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    })
    console.log("TG warmup:", warm.status, warm.body.slice(0, 200))
    if (warm.status !== 200) {
      throw new Error(`warmup ${warm.status} ${warm.body}`)
    }

    // 2) 나머지 병렬 전송
    const tasks = CHAT_IDS.slice(1).map((chat_id) =>
      postJsonWithFallback(`${base}/sendMessage`, {
        chat_id,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }).then((r) => ({ chat_id, ...r }))
    )
    const results = await Promise.allSettled(tasks)
    const fails = results
      .map((r) => (r.status === "fulfilled" ? r.value : r))
      .filter((r: any) => (r as any).status !== 200)

    if (fails.length) {
      console.error("Telegram fails:", fails)
      return NextResponse.json(
        { ok: false, error: "some sends failed", details: fails },
        { status: 400 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[/api/telegram/apply] error:", e)
    const msg = e?.cause?.code || e?.code || e?.message || "fail"
    return NextResponse.json({ ok: false, error: String(msg) }, { status: 400 })
  }
}

/* =========================
        Helpers
========================= */

// 1) fetch (Abort 15s) → 실패 시 https IPv4로 재시도하여 텍스트 반환
async function getTextWithFallback(url: string) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 15_000)
  try {
    const r = await fetch(url, { signal: ctrl.signal })
    return await r.text()
  } catch (err) {
    // Fallback: https + IPv4 강제
    return await httpsGetTextIPv4(url)
  } finally {
    clearTimeout(t)
  }
}

// 2) fetch POST (Abort 25s) → 실패 시 https IPv4로 재시도하여 {status,body}
async function postJsonWithFallback(url: string, body: any): Promise<{ status: number; body: string }> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 25_000)
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    const txt = await r.text().catch(() => "")
    return { status: r.status, body: txt }
  } catch (err) {
    // Fallback: https + IPv4 강제
    return await httpsPostJsonIPv4(url, body)
  } finally {
    clearTimeout(t)
  }
}

// === Low-level IPv4 강제 통신 ===
async function httpsGetTextIPv4(urlStr: string): Promise<string> {
  const u = new URL(urlStr)
  try {
    // 1) DNS를 선행해서 IPv4 주소 확보
    const { address } = await dns.promises.lookup(u.hostname, { family: 4 })
    if (!address) throw new Error("DNS lookup returned empty address")

    // 2) IP로 접속 + SNI/Host는 원래 호스트 유지
    return await new Promise((resolve, reject) => {
      const req = https.request(
        {
          protocol: u.protocol,
          hostname: address,               // ← IP로 접속
          path: `${u.pathname}${u.search}`,
          method: "GET",
          servername: u.hostname,          // ← SNI는 도메인 유지
          timeout: 15_000,
          headers: {
            "Accept": "application/json",
            "Host": u.hostname,            // ← Host 헤더도 도메인 유지
          },
        },
        (res) => {
          let data = ""
          res.setEncoding("utf8")
          res.on("data", (c) => (data += c))
          res.on("end", () => resolve(data))
        },
      )
      req.on("timeout", () => req.destroy(new Error("ETIMEDOUT")))
      req.on("error", (e) => reject(e))
      req.end()
    })
  } catch (e) {
    return String(e)
  }
}

async function httpsPostJsonIPv4(urlStr: string, payload: any): Promise<{ status: number; body: string }> {
  const u = new URL(urlStr)
  const body = JSON.stringify(payload)
  try {
    // 1) DNS를 선행해서 IPv4 주소 확보
    const { address } = await dns.promises.lookup(u.hostname, { family: 4 })
    if (!address) throw new Error("DNS lookup returned empty address")

    // 2) IP로 접속 + SNI/Host는 원래 호스트 유지
    return await new Promise((resolve) => {
      const req = https.request(
        {
          protocol: u.protocol,
          hostname: address,               // ← IP로 접속
          path: `${u.pathname}${u.search}`,
          method: "POST",
          servername: u.hostname,          // ← SNI는 도메인 유지
          timeout: 25_000,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body).toString(),
            "Accept": "application/json",
            "Host": u.hostname,            // ← Host 헤더도 도메인 유지
          },
        },
        (res) => {
          let data = ""
          res.setEncoding("utf8")
          res.on("data", (c) => (data += c))
          res.on("end", () => resolve({ status: res.statusCode || 0, body: data }))
        },
      )
      req.on("timeout", () => req.destroy(new Error("ETIMEDOUT")))
      req.on("error", (e) => resolve({ status: 0, body: String(e) }))
      req.write(body)
      req.end()
    })
  } catch (e) {
    return { status: 0, body: String(e) }
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
