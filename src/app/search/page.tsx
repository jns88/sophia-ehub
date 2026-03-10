"use client"

import { useState, useMemo } from "react"
import { Search as SearchIcon, Package, Sparkles, TrendingDown, Target, HelpCircle, ArrowRight, TrendingUp, ShieldCheck, ShoppingCart, Globe, AlertCircle, Database, LayoutGrid, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { Product } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAiProductInsight, AiProductInsightOutput } from "@/ai/flows/ai-product-insight-generator"
import { cn } from "@/lib/utils"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [selectedChannel, setSelectedChannel] = useState("all")
  const [product, setProduct] = useState<Product | null>(null)
  const [insight, setInsight] = useState<AiProductInsightOutput | null>(null)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query && selectedChannel === "all") return

    setSearched(true)
    const found = MOCK_PRODUCTS.find(p => {
      const matchQuery = !query || 
        p.sku.toLowerCase() === query.toLowerCase() || 
        p.nomeProduto.toLowerCase().includes(query.toLowerCase())
      
      const matchChannel = selectedChannel === "all" || p.marketplace === selectedChannel
      
      return matchQuery && matchChannel
    })

    if (found) {
      setProduct(found)
      setInsight(null)
      
      if (found.status !== 'APROVADO') {
        setLoadingInsight(true)
        try {
          const result = await getAiProductInsight({
            sku: found.sku,
            nomeProduto: found.nomeProduto,
            categoria: found.categoria,
            marketplace: found.marketplace,
            marca: found.marca,
            tipoEnvio: found.tipoEnvio,
            precoVenda: found.precoVenda,
            custoProduto: found.custoProduto,
            comissaoMarketplace: found.comissaoMarketplace,
            custoLogistico: found.custoLogistico,
            investimentoAds: found.investimentoAds,
            reclamacaoPercentual: found.reclamacaoPercentual,
            margemPercentual: found.margemPercentual,
            lucroLiquido: found.lucroLiquido,
            roas: found.roas,
            score: found.score,
            status: found.status,
            classificacaoABC: found.classificacaoABC,
            statusReclamacao: found.statusReclamacao
          })
          setInsight(result)
        } catch (error) {
          console.error("Erro ao gerar insight:", error)
        } finally {
          setLoadingInsight(false)
        }
      }
    } else {
      setProduct(null)
      setInsight(null)
    }
  }

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'APROVADO': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_25px_-5px_rgba(16,185,129,0.2)]'
      case 'ATENÇÃO': return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_25px_-5px_rgba(245,158,11,0.2)]'
      case 'CRÍTICO': return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_25px_-5px_rgba(239,68,68,0.2)]'
      default: return ''
    }
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-2">
          <SearchIcon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white font-headline">Consulta Estratégica</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-xl font-medium">
          Visão 360º de rentabilidade por SKU com leitura de origem de dados em tempo real.
        </p>
        
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto mt-10">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="SKU ou Nome do Produto..." 
              className="pl-12 h-14 bg-card border-white/5 text-lg font-medium focus-visible:ring-primary rounded-xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-full md:w-[220px] h-14 bg-card border-white/5 rounded-xl font-bold text-white">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Canais</SelectItem>
              <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
              <SelectItem value="Amazon">Amazon</SelectItem>
              <SelectItem value="Shopee">Shopee</SelectItem>
              <SelectItem value="Magalu">Magalu</SelectItem>
              <SelectItem value="B2W / Americanas">B2W / Americanas</SelectItem>
              <SelectItem value="Loja Própria / Site">Loja Própria / Site</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" size="lg" className="h-14 px-10 text-lg font-black rounded-xl shadow-xl shadow-primary/20">
            Consultar
          </Button>
        </form>
      </div>

      {product ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Card className={cn("glass-card overflow-hidden border-none transition-all duration-500", getStatusColorClass(product.status))}>
            <CardContent className="p-12">
              <div className="flex flex-col md:flex-row justify-between gap-8 items-start">
                <div className="space-y-6 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className="font-mono px-3 py-1 bg-white/5 border-white/10 text-muted-foreground text-xs uppercase tracking-tighter">SKU: {product.sku}</Badge>
                    <Badge className={cn("font-black px-3 py-1 text-[10px] uppercase tracking-widest", product.status === 'APROVADO' ? 'bg-emerald-500' : product.status === 'CRÍTICO' ? 'bg-rose-500' : 'bg-amber-500')}>
                      {product.status}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black px-3 py-1 text-xs">CLASSE {product.classificacaoABC}</Badge>
                    <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent font-black px-3 py-1 text-xs uppercase tracking-widest">{product.marketplace}</Badge>
                    <Badge variant="outline" className="bg-secondary border-white/10 text-white font-bold px-3 py-1 text-[10px] flex items-center gap-1.5">
                      <Database className="h-3 w-3" /> {product.origemDados}
                    </Badge>
                  </div>
                  <h2 className="text-5xl font-black text-white leading-tight font-headline tracking-tighter">{product.nomeProduto}</h2>
                  <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm font-bold">
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><ShieldCheck className="h-4 w-4 text-primary" /> {product.marca}</div>
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Package className="h-4 w-4 text-accent" /> {product.categoria}</div>
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Globe className="h-4 w-4 text-amber-500" /> {product.tipoEnvio}</div>
                  </div>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl border border-white/5 flex flex-col items-end min-w-[240px]">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1">Preço Consolidado</p>
                  <p className="text-5xl font-black text-white font-mono tracking-tighter">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.precoVenda)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                    <LayoutGrid className="h-3.5 w-3.5" /> Score: {product.score.toFixed(1)} / 3.0
                  </div>
                </div>
              </div>

              <Separator className="my-12 bg-white/5" />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                <div className="space-y-2 group">
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.1em] flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-primary" /> Margem %
                  </p>
                  <p className={cn("text-4xl font-black font-mono tracking-tighter transition-transform group-hover:scale-105 origin-left", product.margemPercentual > 20 ? 'text-emerald-400' : 'text-rose-400')}>
                    {product.margemPercentual.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Benchmark: +18.0%</p>
                </div>
                <div className="space-y-2 group">
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.1em] flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> Lucro Líquido
                  </p>
                  <p className="text-4xl font-black text-white font-mono tracking-tighter group-hover:scale-105 origin-left transition-transform">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.lucroLiquido)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Líquido Real</p>
                </div>
                <div className="space-y-2 group">
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.1em] flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" /> ROAS
                  </p>
                  <p className="text-4xl font-black text-white font-mono tracking-tighter group-hover:scale-105 origin-left transition-transform">
                    {typeof product.roas === 'number' ? product.roas.toFixed(2) : product.roas}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Performance de Ads</p>
                </div>
                <div className="space-y-2 group">
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.1em] flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-500" /> Operacional
                  </p>
                  <p className={cn("text-4xl font-black font-mono tracking-tighter group-hover:scale-105 origin-left transition-transform uppercase", product.statusReclamacao === 'ALERTA' ? 'text-rose-400' : 'text-emerald-400')}>
                    {product.statusReclamacao}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Status de Reclamação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card border-none shadow-xl">
              <CardHeader className="pb-6 p-8">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Decomposição de Custos
                </CardTitle>
                <CardDescription>Detalhamento financeiro da operação por SKU.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                <div className="flex justify-between items-center text-sm p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Custo do Produto (CMV)</span>
                  <span className="font-bold text-white font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.custoProduto)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Comissão Marketplace</span>
                  <span className="font-bold text-white font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.comissaoMarketplace)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Custo Logístico</span>
                  <span className="font-bold text-white font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.custoLogistico)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Investimento Marketing</span>
                  <span className="font-bold text-white font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.investimentoAds)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20 bg-primary/5 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(112,112,194,0.3)] border-none">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="h-32 w-32" />
              </div>
              <CardHeader className="pb-6 p-8">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Sophia Insight (Analista IA)
                </CardTitle>
                <CardDescription className="text-blue-100/60">Análise estratégica baseada em performance consolidada.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                {loadingInsight ? (
                  <div className="space-y-6">
                    <div className="h-4 w-full bg-primary/20 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-primary/20 rounded animate-pulse" />
                    <div className="h-4 w-4/6 bg-primary/20 rounded animate-pulse" />
                    <div className="pt-4 space-y-3">
                      <div className="h-3 w-1/4 bg-primary/10 rounded animate-pulse" />
                      <div className="h-10 w-full bg-primary/10 rounded-xl animate-pulse" />
                      <div className="h-10 w-full bg-primary/10 rounded-xl animate-pulse" />
                    </div>
                  </div>
                ) : insight ? (
                  <div className="space-y-8">
                    <p className="text-base leading-relaxed text-blue-50 font-medium italic">
                      "{insight.explanation}"
                    </p>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Plano de Ação Recomendado:</p>
                      <ul className="grid gap-3">
                        {insight.suggestedActions.map((action, i) => (
                          <li key={i} className="text-xs flex items-center gap-4 text-white bg-white/5 p-4 rounded-xl border border-white/5 hover:border-accent/30 transition-all cursor-default">
                            <div className="h-2 w-2 rounded-full bg-accent shrink-0" />
                            <span className="font-bold">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400/50" />
                    <p className="text-sm text-blue-100/70 italic max-w-xs font-medium">
                      {product.status === 'APROVADO' 
                        ? "Este SKU está performando acima da média global. Mantenha a estratégia atual e monitore a ruptura de estoque." 
                        : "Dados insuficientes para gerar insights automáticos neste canal."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : searched ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="h-24 w-24 rounded-3xl bg-secondary flex items-center justify-center shadow-xl">
            <AlertCircle className="h-12 w-12 text-rose-500" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white tracking-tight">SKU ou Canal não localizado</h3>
            <p className="text-muted-foreground max-w-md font-medium">Não encontramos correspondência para o termo "{query}" no canal selecionado. Verifique as integrações ativas.</p>
          </div>
          <Button variant="outline" size="lg" className="rounded-xl border-white/10" onClick={() => { setSearched(false); setQuery(""); setSelectedChannel("all"); }}>Redefinir Filtros</Button>
        </div>
      ) : null}
    </div>
  )
}
