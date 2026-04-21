
"use client"

import React, { useMemo } from 'react'
import { StatePerformance } from '@/lib/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BrazilMapProps {
  data: StatePerformance[]
  onStateClick?: (uf: string) => void
}

/**
 * Coordenadas SVG vetoriais simplificadas para os estados brasileiros.
 * Este mapeamento segue a disposição geográfica oficial.
 */
const BRAZIL_SVG_PATHS = [
  { id: "AC", name: "Acre", d: "M75,280 L90,270 L110,285 L100,310 L70,305 Z" },
  { id: "AL", name: "Alagoas", d: "M540,240 L550,235 L555,245 L545,250 Z" },
  { id: "AM", name: "Amazonas", d: "M60,100 L180,90 L230,150 L210,250 L100,260 L60,200 Z" },
  { id: "AP", name: "Amapá", d: "M280,40 L320,30 L330,70 L290,80 Z" },
  { id: "BA", name: "Bahia", d: "M400,180 L480,170 L520,220 L500,280 L440,290 L410,240 Z" },
  { id: "CE", name: "Ceará", d: "M480,110 L520,105 L530,140 L490,150 Z" },
  { id: "DF", name: "Distrito Federal", d: "M385,265 L395,265 L395,275 L385,275 Z" },
  { id: "ES", name: "Espírito Santo", d: "M485,310 L500,310 L505,340 L490,340 Z" },
  { id: "GO", name: "Goiás", d: "M350,240 L410,230 L430,290 L380,310 L340,290 Z" },
  { id: "MA", name: "Maranhão", d: "M350,100 L420,95 L440,170 L380,180 Z" },
  { id: "MG", name: "Minas Gerais", d: "M400,300 L480,290 L500,350 L440,370 L410,350 Z" },
  { id: "MS", name: "Mato Grosso do Sul", d: "M280,320 L340,310 L360,370 L300,380 Z" },
  { id: "MT", name: "Mato Grosso", d: "M230,170 L340,160 L360,280 L250,300 Z" },
  { id: "PA", name: "Pará", d: "M220,50 L350,60 L370,170 L250,160 Z" },
  { id: "PB", name: "Paraíba", d: "M540,150 L570,150 L570,165 L540,165 Z" },
  { id: "PE", name: "Pernambuco", d: "M500,165 L570,165 L575,185 L510,185 Z" },
  { id: "PI", name: "Piauí", d: "M430,120 L470,115 L490,200 L450,210 Z" },
  { id: "PR", name: "Paraná", d: "M290,390 L350,390 L360,420 L300,420 Z" },
  { id: "RJ", name: "Rio de Janeiro", d: "M460,375 L500,375 L505,395 L465,395 Z" },
  { id: "RN", name: "Rio Grande do Norte", d: "M540,125 L575,125 L580,145 L545,145 Z" },
  { id: "RO", name: "Rondônia", d: "M150,260 L220,250 L240,300 L180,310 Z" },
  { id: "RR", name: "Roraima", d: "M150,30 L210,30 L230,80 L170,90 Z" },
  { id: "RS", name: "Rio Grande do Sul", d: "M280,450 L340,450 L330,510 L260,500 Z" },
  { id: "SC", name: "Santa Catarina", d: "M300,425 L360,425 L365,445 L305,445 Z" },
  { id: "SE", name: "Sergipe", d: "M535,215 L550,215 L550,230 L535,230 Z" },
  { id: "SP", name: "São Paulo", d: "M360,360 L430,350 L450,400 L370,410 Z" },
  { id: "TO", name: "Tocantins", d: "M350,180 L400,180 L410,250 L360,260 Z" }
];

export function BrazilMap({ data, onStateClick }: BrazilMapProps) {
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
    if (!revenue || revenue === 0) return 'rgba(255, 255, 255, 0.05)'
    
    // Escala de intensidade baseada no faturamento (Quasar Blue)
    const intensity = (revenue / maxRevenue)
    return `rgba(112, 112, 194, ${0.15 + intensity * 0.85})`
  }

  return (
    <TooltipProvider>
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-black/10 rounded-2xl border border-white/5 overflow-hidden">
        <svg 
          viewBox="0 0 650 550" 
          className="w-full h-full max-h-[450px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {BRAZIL_SVG_PATHS.map((state) => {
            const performance = stateMap[state.id]
            const revenue = performance?.faturamento || 0
            const fillColor = getColor(revenue)
            
            return (
              <Tooltip key={state.id}>
                <TooltipTrigger asChild>
                  <path
                    d={state.d}
                    fill={fillColor}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                    className="transition-all duration-300 cursor-pointer hover:stroke-primary hover:stroke-[2px] hover:brightness-110"
                    onClick={() => onStateClick?.(state.id)}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-black/95 border-primary/20 p-4 shadow-2xl backdrop-blur-md">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{state.name}</span>
                      <span className="text-xs font-black text-white">{state.id}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center gap-6">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground">Faturamento</span>
                        <span className="text-[11px] font-black text-white">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground">Pedidos</span>
                        <span className="text-[11px] font-black text-white">{performance?.pedidos || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground">Ticket Médio</span>
                        <span className="text-[11px] font-black text-accent">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(performance?.ticketMedio || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </svg>

        {/* Legenda de Intensidade */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 bg-black/40 p-3 rounded-lg border border-white/5 backdrop-blur-sm">
          <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Faturamento</p>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 items-center">
              <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/10" />
              <span className="text-[7px] font-bold text-muted-foreground">Baixo</span>
            </div>
            <div className="w-16 h-1.5 bg-gradient-to-r from-white/10 to-primary rounded-full" />
            <div className="flex flex-col gap-1 items-center">
              <div className="w-3 h-3 rounded-sm bg-primary shadow-[0_0_10px_rgba(112,112,194,0.5)]" />
              <span className="text-[7px] font-bold text-muted-foreground">Alto</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
