"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

// 의존성 최소화를 위해 utils 없이 내부 cn 사용
function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ")
}

/** Accordion (shadcn 호환: single 전용) */
type AccordionCtx = {
  value: string
  setValue: (v: string) => void
  collapsible: boolean
}
const AccordionContext = React.createContext<AccordionCtx | null>(null)

type AccordionProps = {
  /** shadcn 호환용, 단순화를 위해 "single"만 지원 */
  type?: "single"
  /** 같은 아이템 다시 클릭 시 닫힘 허용 */
  collapsible?: boolean
  /** 제어형 값 */
  value?: string
  /** 비제어형 초기값 */
  defaultValue?: string
  /** 값 변경 콜백(shadcn 호환) */
  onValueChange?: (v: string) => void
  className?: string
  children: React.ReactNode
}

export function Accordion({
  type = "single",
  collapsible = false,
  value,
  defaultValue = "",
  onValueChange,
  className,
  children,
}: AccordionProps) {
  if (type !== "single") {
    console.warn("Accordion: only `type=\"single\"` is supported in this implementation.")
  }

  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState(defaultValue)
  const current = isControlled ? (value as string) : internal

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const ctx = React.useMemo<AccordionCtx>(
    () => ({ value: current, setValue, collapsible }),
    [current, setValue, collapsible]
  )

  return (
    <div className={cn("divide-y rounded-md border", className)}>
      <AccordionContext.Provider value={ctx}>{children}</AccordionContext.Provider>
    </div>
  )
}

type ItemCtx = { itemValue: string }
const ItemContext = React.createContext<ItemCtx | null>(null)

type AccordionItemProps = {
  value: string
  className?: string
  children: React.ReactNode
}

export function AccordionItem({ value, className, children }: AccordionItemProps) {
  return (
    <div className={cn("group", className)}>
      <ItemContext.Provider value={{ itemValue: value }}>{children}</ItemContext.Provider>
    </div>
  )
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }

export function AccordionTrigger({ className, children, ...props }: TriggerProps) {
  const acc = React.useContext(AccordionContext)
  const item = React.useContext(ItemContext)
  if (!acc || !item) return null

  const open = acc.value === item.itemValue
  const toggle = () => {
    if (open && acc.collapsible) acc.setValue("")
    else acc.setValue(item.itemValue)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex w-full items-center justify-between p-4 text-left text-sm font-medium transition hover:bg-muted",
        className
      )}
      aria-expanded={open}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn("h-4 w-4 transition-transform duration-200", open ? "rotate-180" : "rotate-0")}
        aria-hidden="true"
      />
    </button>
  )
}

type ContentProps = React.HTMLAttributes<HTMLDivElement> & { className?: string }

export function AccordionContent({ className, children, ...props }: ContentProps) {
  const acc = React.useContext(AccordionContext)
  const item = React.useContext(ItemContext)
  if (!acc || !item) return null

  const open = acc.value === item.itemValue
  return (
    <div
      className={cn(
        "overflow-hidden text-sm transition-all",
        open ? "max-h-[600px] p-4" : "max-h-0 p-0",
        className
      )}
      role="region"
      aria-hidden={!open}
      {...props}
    >
      {children}
    </div>
  )
}
