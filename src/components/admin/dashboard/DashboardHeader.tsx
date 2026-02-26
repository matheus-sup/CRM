"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Filter } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function DashboardHeaderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")

  const dateRange: DateRange | undefined = React.useMemo(() => {
    if (fromParam && toParam) {
      return {
        from: parse(fromParam, "yyyy-MM-dd", new Date()),
        to: parse(toParam, "yyyy-MM-dd", new Date()),
      }
    }
    return undefined
  }, [fromParam, toParam])

  const handleDateRangeChange = (range: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams.toString())

    if (range?.from) {
      params.set("from", format(range.from, "yyyy-MM-dd"))
    } else {
      params.delete("from")
    }

    if (range?.to) {
      params.set("to", format(range.to, "yyyy-MM-dd"))
    } else {
      params.delete("to")
    }

    router.push(`/admin?${params.toString()}`)
  }

  const handleClear = () => {
    router.push("/admin")
  }

  const handleLast30Days = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    handleDateRangeChange({ from: thirtyDaysAgo, to: today })
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Acompanhe suas vendas online e física.</p>
      </div>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              size="sm"
              className={cn(
                "justify-start text-left font-normal min-w-[200px]",
                !dateRange && "text-muted-foreground"
              )}
            >
              <Filter className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                    {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                )
              ) : (
                <span>Filtros</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-3 border-b">
              <p className="text-sm font-medium">Selecione o período</p>
              <p className="text-xs text-muted-foreground">Escolha a data inicial e final</p>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
            <div className="p-3 border-t flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                Limpar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLast30Days}
              >
                Últimos 30 dias
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

function DashboardHeaderFallback() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Acompanhe suas vendas online e física.</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="justify-start text-left font-normal min-w-[200px] text-muted-foreground"
          disabled
        >
          <Filter className="mr-2 h-4 w-4" />
          <span>Filtros</span>
        </Button>
      </div>
    </div>
  )
}

export function DashboardHeader() {
  return (
    <Suspense fallback={<DashboardHeaderFallback />}>
      <DashboardHeaderContent />
    </Suspense>
  )
}
