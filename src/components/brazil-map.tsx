"use client"

import React, { useMemo } from 'react'
import { StatePerformance } from '@/lib/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from '@/lib/utils'

interface BrazilMapProps {
  data: StatePerformance[]
}

/**
 * Grid simplificado representando o mapa do Brasil por estados.
 * Esta abordagem é extremamente leve e performática.
 */
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

  /**
   * Determina a cor do estado baseada no faturamento:
   * - Baixo/Zero: Cinza
   * - Médio: Azul
   * - Alto: Azul Brilhante com Glow
   */
  const getColorClasses = (revenue: number | undefined) => {
    if (!revenue || revenue === 0) return 'bg-white/5 text-muted-foreground/40 border-white/5'
    
    const intensity = (revenue / maxRevenue) * 100
    
    if (intensity > 70) {
      return 'bg-primary text-white shadow-[0_0_20px_-5px_rgba(112,112,194,0.8)] border-primary/50'
    }
    
    if (intensity > 30) {
      return 'bg-primary/60 text-white border-primary/30'
    }
    
    return 'bg-primary/20 text-primary-foreground/80 border-primary/10'
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
                        "w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-[10px] font-black cursor-help transition-all duration-300 hover:scale-110 hover:z-20 border",
                        getColorClasses(revenue)
                      )}
                    >
                      {uf}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="glass-card border-white/10 p-4 shadow-2xl">
                    <div className="space-y-2.5 min-w-[140px]">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Estado</span>
                        <span className="text-xs font-black text-white">{uf}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground">Faturamento</span>
                          <span className="text-[11px] font-black text-white font-mono">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenue)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground">Pedidos</span>
                          <span className="text-[11px] font-black text-white font-mono">{performance?.pedidos || 0}</span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })
          ))}
        </div>
        
        {/* Legenda de Performance */}
        <div className="mt-10 flex gap-6 items-center px-6 py-2 bg-white/5 rounded-full border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-white/5 border border-white/10" />
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Baixo/Zero</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/60 border border-primary/30" />
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Médio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary border border-primary/50 shadow-[0_0_8px_rgba(112,112,194,0.5)]" />
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Alto</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
