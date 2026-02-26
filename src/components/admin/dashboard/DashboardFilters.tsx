"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Filter } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DashboardFiltersProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
}

export function DashboardFilters({
  dateRange,
  onDateRangeChange,
}: DashboardFiltersProps) {
  return (
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
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
          <div className="p-3 border-t flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDateRangeChange(undefined)}
            >
              Limpar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(today.getDate() - 30)
                onDateRangeChange({ from: thirtyDaysAgo, to: today })
              }}
            >
              Últimos 30 dias
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
