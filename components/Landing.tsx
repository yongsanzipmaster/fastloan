"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import React from "react"

/* =========================
   Rolling banners helpers
========================= */
type Status = "신규" | "심사중" | "승인" | "보완요청"

const SURNAMES = ["김", "이", "박", "최", "정", "곽", "안", "주"] as const
const STATUSES: Status[] = ["신규", "심사중", "승인", "보완요청"]

function formatKRW(n: number): string {
  return n.toLocaleString("ko-KR") + "원"
}
function todayString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${y}-${m}-${day} ${hh}:${mm}`
}
function randomAmount(): number {
  // 500만 ~ 3000만 (10만원 단위)
  const min = 5_000_000
  const max = 30_000_000
  const step = 100_000
  const r = Math.floor((Math.random() * (max - min)) / step)
  return min + r * step
}
function randomStatusWeighted(): Status {
  const r = Math.random()
  if (r < 0.86) return "승인"        // 86%
  if (r < 0.98) return "심사중"      // 12%
  if (r < 0.995) return "신규"       // 1.5%
  return "보완요청"                  // 0.5% (거의 안 나옴)
}
function randomEntry(forced?: Status) {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)]
  const status = forced ?? randomStatusWeighted()
  return {
    dt: todayString(),
    name: `${surname}**`,
    amount: formatKRW(randomAmount()),
    status,
  }
}

function StatusBadge({ status }: { status: Status }) {
  const cls =
    status === "신규"
      ? "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
      : status === "심사중"
      ? "bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300"
      : status === "승인"
      ? "bg-green-200 text-green-900 dark:bg-green-500/20 dark:text-green-300"
      : "bg-red-200 text-red-900 dark:bg-red-500/20 dark:text-red-300"
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

function TickerRow({ reverse = false }: { reverse?: boolean }) {
  const base = React.useMemo(() => {
    // 가중치로 뽑기
    const arr = Array.from({ length: 96 }, () => randomEntry())

    // 보완요청 개수 정규화 (최대 1개)
    const idxs = arr
      .map((e, i) => (e.status === "보완요청" ? i : -1))
      .filter((i) => i >= 0)

    if (idxs.length === 0) {
      // 하나도 없으면 임의 위치에 1개 주입
      const i = Math.floor(Math.random() * arr.length)
      arr[i] = randomEntry("보완요청")
    } else if (idxs.length > 1) {
      // 2개 이상이면 첫 번째만 남기고 나머지는 승인으로 변경
      idxs.slice(1).forEach((i) => (arr[i].status = "승인"))
    }

    return arr
  }, [])

  const items = React.useMemo(() => [...base, ...base], [base])

  return (
    <div className="relative overflow-hidden">
      <div className={`ticker-track ${reverse ? "ticker-right" : "ticker-left"}`}>
        {items.map((it, idx) => (
          <div
            key={idx}
            className="mx-2 shrink-0 rounded-lg border border-border bg-card px-3 py-2 text-xs text-card-foreground shadow-sm"
          >
            <span className="mr-3 tabular-nums text-muted-foreground">{it.dt}</span>
            <span className="mr-3 font-semibold">{it.name}</span>
            <span className="mr-3 tabular-nums">{it.amount}</span>
            <StatusBadge status={it.status as Status} />
          </div>
        ))}
      </div>
    </div>
  )
}

function RollingBanners() {
  return (
    <section className="border-y border-border bg-secondary/10 px-0 py-6">
      <div className="mx-auto max-w-full">
        <TickerRow />
        <div className="mt-3">
          <TickerRow reverse />
        </div>
      </div>
    </section>
  )
}

/* =========================
          Page
========================= */
export default function Landing() {
  const [openFaq, setOpenFaq] = useState<string>("")
  const [openApply, setOpenApply] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              <span>신뢰할 수 있고 빠른 대출 중개</span>
            </div>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              스마트한 대출 중개,
              <br />
              빠르고 안전하게 패스트론
            </h1>
            <p className="mb-10 text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
              복잡한 대출 절차를 간소화하고, 여러 금융사를 비교하여 최적의 조건을 찾아드립니다.
            </p>
            <p className="mb-10 text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
              이젠 사업자 대출도 AI가 최적의 금융사로 매칭해드립니다.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button onClick={() => setOpenApply(true)} className="group w-full rounded-lg bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto">
                지금 접수하기
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* USP Section - 3 Columns */}
      <section className="border-y border-border bg-secondary/30 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10">
                <svg className="size-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">빠른 심사</h3>
              <p className="leading-relaxed text-muted-foreground">신청 후 평균 30분 이내에 상담원이 연락 드리고 있습니다</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10">
                <svg className="size-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">최소 300만원부터 최대 5억원까지</h3>
              <p className="leading-relaxed text-muted-foreground">1개월 이상 매출이 발생하고 있다면 최대 5억까지 당일 실행</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10">
                <svg className="size-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">다중 금융사 비교</h3>
              <p className="leading-relaxed text-muted-foreground">20개 이상의 금융기관을 동시에 비교하여 최적의 대출을 찾아드립니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">심사 조건</h2>
            <p className="mx-auto max-w-2xl text-pretty leading-relaxed text-muted-foreground">대출 접수에 필요한 자격 조건입니다.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature Card 1 */}
            <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-card-foreground">개인사업자</h3>
              <p className="leading-relaxed text-muted-foreground">신용점수와 무관하고, 기대출이 많아도 실행 가능</p>
            </div>

            {/* Feature Card 2 */}
            <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-card-foreground">법인사업자</h3>
              <p className="leading-relaxed text-muted-foreground">신보, 기보 거절되시는 분들, 급한 자금 필요하신 분들</p>
            </div>

            {/* Feature Card 3 */}
            <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-card-foreground">신규 매장</h3>
              <p className="leading-relaxed text-muted-foreground">월세,공과금,직원 급여등 당장 급한데 은행권 거절되시는 분들</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rolling banners (NEW) */}
      <RollingBanners />

      {/* FAQ Section */}
      <section className="border-t border-border bg-secondary/20 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">자주 묻는 질문</h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              패스트론 대출 서비스에 대해 궁금하신 사항을 확인해보세요
            </p>
          </div>
          <Accordion type="single" collapsible value={openFaq} onValueChange={setOpenFaq} className="space-y-4">
            <AccordionItem value="item-1" className="rounded-lg border border-border bg-card px-6">
              <AccordionTrigger className="text-left font-semibold text-card-foreground hover:no-underline">
                대출 신청 후 얼마나 걸리나요?
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                온라인 신청 후 평균 30분 이내에 상담을 받아보실 수 있습니다. 본 심사는 제출하신 서류와
                금융기관에 따라 1-3 영업일이 소요됩니다. 긴급한 경우 빠른 심사 옵션도 이용 가능합니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="rounded-lg border border-border bg-card px-6">
              <AccordionTrigger className="text-left font-semibold text-card-foreground hover:no-underline">
                중개 수수료가 있나요?
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                모든 대출 상담 후 실행되는데까지 중개수수료는 발생하지 않습니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="rounded-lg border border-border bg-card px-6">
              <AccordionTrigger className="text-left font-semibold text-card-foreground hover:no-underline">
                신용등급에 영향을 주나요?
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                저희 패스트론은 신용등급에 전혀 영향을 주지 않습니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="rounded-lg border border-border bg-card px-6">
              <AccordionTrigger className="text-left font-semibold text-card-foreground hover:no-underline">
                어떤 서류가 필요한가요?
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                기본적으로 매출내역 등을 확인할 수 있는 부가세과세표준증명, 세금계산서 내역, 통장 입금내역,
                실제 운영되고 있는 사업자라는 증빙에 관련한 서류들이 필요합니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="rounded-lg border border-border bg-card px-6">
              <AccordionTrigger className="text-left font-semibold text-card-foreground hover:no-underline">
                개인정보는 안전하게 관리되나요?
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                고객님의 개인정보는 금융위원회 인증을 받은 보안 시스템으로 암호화되어 안전하게 보관됩니다.
                개인정보는 대출 심사 목적으로만 사용되고 고객님의 동의 없이 제3자에게 제공되지 않습니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold text-foreground">패스트론</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                신뢰할 수 있는 대출 서비스로 고객님의 금융 목표를 지원합니다.
              </p>
            </div>
            {/* 필요 시 메뉴 섹션 복구 가능 */}
            {/* 
            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">서비스</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="transition-colors hover:text-foreground">신용대출</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">주택담보대출</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">사업자대출</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">금리비교</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">고객지원</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="transition-colors hover:text-foreground">FAQ</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">고객센터</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">이용가이드</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">공지사항</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">회사정보</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="transition-colors hover:text-foreground">회사소개</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">이용약관</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">개인정보처리방침</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">제휴문의</a></li>
              </ul>
            </div>
            */}
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 패스트론. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ApplyModal open={openApply} onClose={() => setOpenApply(false)} />
    </div>
  )
}

type ApplyModalProps = {
  open: boolean
  onClose: () => void
}

function ApplyModal({ open, onClose }: ApplyModalProps) {
  // 스크롤 잠금 + ESC 닫기
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  // 폼 상태
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")        // 표시용: 010-1234-5678
  const [bizType, setBizType] = useState<"개인사업자" | "법인사업자">("개인사업자")
  const [amountDisplay, setAmountDisplay] = useState("") // 표시용: 10,000,000
  const [amountValue, setAmountValue] = useState<number | null>(null) // 숫자값
  const [region, setRegion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 입력 유틸
  const formatPhone = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0,3)}-${digits.slice(3)}`
    return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`
  }
  const formatMoneyDisp = (nstr: string) => {
    const digits = nstr.replace(/\D/g, "").slice(0, 11) // 최대 999억까지 여유
    if (!digits) return ""
    return Number(digits).toLocaleString("ko-KR")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 간단 검증
    if (!name.trim()) { alert("이름을 입력해 주세요."); return }
    if (phone.replace(/\D/g, "").length < 10) { alert("휴대폰 번호를 정확히 입력해 주세요."); return }
    if (!amountValue || amountValue < 100_000) { alert("신청 금액을 입력해 주세요."); return }
    if (!region.trim()) { alert("지역을 입력해 주세요."); return }

    try {
      setIsSubmitting(true)
      const res = await fetch("/api/telegram/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          bizType,
          amount: amountValue,
          region,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        console.error("apply failed:", res.status, data)
        alert(`전송 실패: ${data?.error ?? res.statusText}`)
        return
      }

      alert("접수가 완료되었습니다. 곧 상담원이 연락드립니다.")
      onClose()
      // 초기화
      setName(""); setPhone(""); setAmountDisplay(""); setAmountValue(null); setRegion(""); setBizType("개인사업자")
    } catch (err) {
      console.error(err)
      alert("네트워크 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal content */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-card-foreground">빠른 접수</h3>
          <p className="mt-1 text-sm text-muted-foreground">정보를 입력해 주시면 즉시 상담을 도와드립니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="홍길동"
              required
            />
          </div>

          {/* 휴대폰 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">휴대폰 번호</label>
            <input
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="010-1234-5678"
              required
            />
          </div>

          {/* 사업자 유형 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">사업자 유형</label>
            <select
              value={bizType}
              onChange={(e) => setBizType(e.target.value as any)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option>개인사업자</option>
              <option>법인사업자</option>
            </select>
          </div>

          {/* 신청 금액 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">신청 금액</label>
            <div className="relative">
              <input
                inputMode="numeric"
                value={amountDisplay}
                onChange={(e) => {
                  const disp = formatMoneyDisp(e.target.value)
                  setAmountDisplay(disp)
                  setAmountValue(disp ? Number(disp.replace(/,/g, "")) : null)
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-right text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="예: 10,000,000"
                required
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">원</span>
            </div>
          </div>

          {/* 지역 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">지역</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="예: 서울 송파구"
              required
            />
          </div>

          {/* 액션 */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
            >
              {isSubmitting ? "전송중..." : "접수하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
