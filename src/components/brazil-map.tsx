"use client"

import React, { useMemo } from 'react'
import { StatePerformance } from '@/lib/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from '@/lib/utils'

interface BrazilMapProps {
  data: StatePerformance[]
}

// Simplified Grid representing Brazil's states layout
const STATES_GRID = [
  [null, null, 'RR', null, 'AP', null, null],
  ['AC', 'AM', 'PA', 'MA', 'PI', 'CE', 'RN'],
  [null, 'RO', 'MT', 'TO', 'DF', 'GO', 'PB'],
  [null, null, 'MS', 'MG', 'ES', null, 'PE'],
  [null, null, 'PR', 'SP', 'RJ', 'AL', 'SE'],
  [null, null, 'SC', null, null, null, null],
  [null, null, 'RS', null, null, null, null],
]

export function BrazilMap({ data }: BrazilMapProps) {
  const maxRevenue = useMemo(() => {
    return Math.max(...data.map(d => d.faturamento), 1)
  }, [data])

  const stateMap = useMemo(() => {
    return data.reduce((acc, curr) => {
      acc[curr.estado.toUpperCase()] = curr
      return acc
    }, {} as Record<string, StatePerformance>)
  }, [data])

  const getColor = (revenue: number | undefined) => {
    if (!revenue) return 'bg-white/5'
    const intensity = (revenue / maxRevenue) * 100
    if (intensity > 80) return 'bg-primary shadow-[0_0_15px_rgba(112,112,194,0.4)]'
    if (intensity > 50) return 'bg-primary/70'
    if (intensity > 20) return 'bg-primary/40'
    return 'bg-primary/20'
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center justify-center w-full h-full p-4 overflow-hidden">
        <div className="grid grid-cols-7 gap-1.5 md:gap-2.5">
          {STATES_GRID.map((row, rowIndex) => (
            row.map((uf, colIndex) => {
              if (!uf) return <div key={`empty-${rowIndex}-${colIndex}`} className="w-8 h-8 md:w-10 md:h-10" />
              
              const performance = stateMap[uf]
              const revenue = performance?.faturamento || 0
              
              return (
                <Tooltip key={uf}>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-[10px] font-black cursor-help transition-all duration-500 hover:scale-110 hover:z-10",
                        getColor(revenue),
                        revenue > 0 ? "text-white" : "text-muted-foreground/40"
                      )}
                    >
                      {uf}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="glass-card border-white/10 p-3">
                    <div className="space-y-2">
                      <p className="text-xs font-black text-primary border-b border-white/5 pb-1">ESTADO: {uf}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground">Faturamento</span>
                        <span className="text-[10px] font-black text-white text-right">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenue)}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-muted-foreground">Pedidos</span>
                        <span className="text-[10px] font-black text-white text-right">{performance?.pedidos || 0}</span>
                        <span className="text-[9px] uppercase font-bold text-muted-foreground">Ticket Médio</span>
                        <span className="text-[10px] font-black text-accent text-right">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(performance?.ticketMedio || 0)}
                        </span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })
          ))}
        </div>
        
        <div className="mt-8 flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-white/5" />
            <span className="text-[8px] font-bold uppercase text-muted-foreground">Sem Vendas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/20" />
            <span className="text-[8px] font-bold uppercase text-muted-foreground">Baixo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <span className="text-[8px] font-bold uppercase text-muted-foreground">Alto</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
