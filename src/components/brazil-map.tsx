"use client"

import React, { useMemo, memo, useCallback } from 'react'
import { StatePerformance } from '@/lib/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface BrazilMapProps {
  data: StatePerformance[]
  selectedState?: string | null
  onStateClick?: (uf: string) => void
}

const BRAZIL_SVG_PATHS = [
  // NORTE
  { id: "AC", name: "Acre", d: "M60,300 L100,280 L120,320 L80,340 Z" },
  { id: "RO", name: "Rondônia", d: "M100,280 L140,260 L160,300 L120,320 Z" },
  { id: "AM", name: "Amazonas", d: "M120,200 L220,180 L260,260 L160,300 Z" },
  { id: "RR", name: "Roraima", d: "M200,120 L240,100 L260,140 L220,180 Z" },
  { id: "AP", name: "Amapá", d: "M280,120 L320,100 L340,140 L300,160 Z" },
  { id: "PA", name: "Pará", d: "M220,180 L340,160 L360,240 L260,260 Z" },
  { id: "TO", name: "Tocantins", d: "M300,260 L340,240 L360,300 L320,320 Z" },

  // NORDESTE
  { id: "MA", name: "Maranhão", d: "M340,160 L380,150 L400,200 L360,240 Z" },
  { id: "PI", name: "Piauí", d: "M380,150 L420,160 L420,210 L400,200 Z" },
  { id: "CE", name: "Ceará", d: "M420,160 L460,170 L450,210 L420,210 Z" },
  { id: "RN", name: "Rio Grande do Norte", d: "M460,170 L500,180 L490,210 L450,210 Z" },
  { id: "PB", name: "Paraíba", d: "M450,210 L490,210 L480,240 L440,230 Z" },
  { id: "PE", name: "Pernambuco", d: "M440,230 L480,240 L470,270 L430,260 Z" },
  { id: "AL", name: "Alagoas", d: "M430,260 L470,270 L460,300 L420,290 Z" },
  { id: "SE", name: "Sergipe", d: "M420,290 L460,300 L450,320 L410,310 Z" },
  { id: "BA", name: "Bahia", d: "M360,240 L420,210 L420,310 L340,300 Z" },

  // CENTRO-OESTE
  { id: "MT", name: "Mato Grosso", d: "M220,260 L300,260 L320,320 L240,340 Z" },
  { id: "MS", name: "Mato Grosso do Sul", d: "M240,340 L300,340 L300,400 L260,420 Z" },
  { id: "GO", name: "Goiás", d: "M300,300 L340,300 L340,350 L300,360 Z" },
  { id: "DF", name: "Distrito Federal", d: "M320,330 L330,330 L330,340 L320,340 Z" },

  // SUDESTE
  { id: "MG", name: "Minas Gerais", d: "M340,300 L400,300 L420,360 L360,380 Z" },
  { id: "ES", name: "Espírito Santo", d: "M420,300 L460,300 L460,340 L420,360 Z" },
  { id: "RJ", name: "Rio de Janeiro", d: "M400,360 L440,360 L430,390 L390,380 Z" },
  { id: "SP", name: "São Paulo", d: "M300,360 L360,380 L340,420 L280,400 Z" },

  // SUL
  { id: "PR", name: "Paraná", d: "M280,400 L340,420 L320,460 L260,440 Z" },
  { id: "SC", name: "Santa Catarina", d: "M260,440 L320,460 L300,500 L240,480 Z" },
  { id: "RS", name: "Rio Grande do Sul", d: "M240,480 L300,500 L280,560 L220,540 Z" },
];

export const BrazilMap = memo(({ data, selectedState, onStateClick }: BrazilMapProps) => {
  const maxRevenue = useMemo(() => {
    return Math.max(...data.map(d => d.faturamento), 1)
  }, [data])

  const stateMap = useMemo(() => {
    return data.reduce((acc, curr) => {
      acc[curr.estado.toUpperCase()] = curr
      return acc
    }, {} as Record<string, StatePerformance>)
  }, [data])

  const getColorByRevenue = (revenue: number | undefined) => {
    if (!revenue || revenue === 0) return 'rgba(255, 255, 255, 0.05)'
    
    const intensity = revenue / maxRevenue;

    let r, g, b;

    if (intensity < 0.5) {
      const factor = intensity * 2;
      r = Math.round(58 + (255 - 58) * factor);
      g = Math.round(123 + (165 - 123) * factor);
      b = Math.round(213 + (0 - 213) * factor);
    } else {
      const factor = (intensity - 0.5) * 2;
      r = 255;
      g = Math.round(165 + (76 - 165) * factor);
      b = Math.round(0 + (76 - 0) * factor);
    }

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Identificação robusta de elemento por coordenadas para evitar problemas de eventos
   * em camadas complexas de SVG e tooltips.
   */
  const handleMapSelection = useCallback((e: React.MouseEvent) => {
    // Busca o elemento exatamente sob o ponteiro usando as coordenadas da viewport
    const element = document.elementFromPoint(e.clientX, e.clientY) as SVGPathElement | null;
    
    // Se o elemento for um path com ID de estado válido, dispara a ação
    if (element && element.tagName === 'path' && element.id) {
       const stateId = element.id.toUpperCase();
       if (BRAZIL_SVG_PATHS.some(s => s.id === stateId)) {
         onStateClick?.(stateId);
       }
    }
  }, [onStateClick]);

  return (
    <TooltipProvider delayDuration={0}>
      <div 
        className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-black/10 rounded-2xl border border-white/5 overflow-visible cursor-pointer z-0"
        onClick={handleMapSelection}
      >
        <svg 
          viewBox="0 0 600 700" 
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full max-h-[500px] relative z-10 pointer-events-auto"
          shapeRendering="geometricPrecision"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="brasil" stroke="#1c1c1c" strokeWidth="1">
            {BRAZIL_SVG_PATHS.map((state) => {
              const performance = stateMap[state.id]
              const revenue = performance?.faturamento || 0
              const fillColor = getColorByRevenue(revenue)
              const isClasseA = performance?.pareto_class === 'A'
              const isSelected = selectedState === state.id
              
              return (
                <Tooltip key={state.id}>
                  <TooltipTrigger asChild>
                    <path
                      id={state.id}
                      d={state.d}
                      fill={fillColor}
                      stroke={isSelected ? "white" : isClasseA ? "rgba(245, 158, 11, 0.8)" : "#1c1c1c"}
                      strokeWidth={isSelected ? "3" : isClasseA ? "2.5" : "1"}
                      vectorEffect="non-scaling-stroke"
                      className={cn(
                        "transition-all duration-200 hover:brightness-110",
                        isSelected && "brightness-125"
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/95 border-white/10 p-4 shadow-2xl backdrop-blur-md z-50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{state.name}</span>
                        </div>
                        <span className="text-xs font-black text-white">{state.id}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center gap-6">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground">Faturamento</span>
                          <span className="text-[11px] font-black text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </g>
        </svg>

        <div className="absolute bottom-6 left-6 flex flex-col gap-2 bg-black/60 p-4 rounded-xl border border-white/5 backdrop-blur-md pointer-events-none z-20">
          <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1 text-center">Intensidade</p>
          <div className="flex items-center gap-4">
            <div className="w-24 h-2 bg-gradient-to-r from-[#3A7BD5] via-[#FFA500] to-[#FF4C4C] rounded-full" />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
});

BrazilMap.displayName = "BrazilMap";