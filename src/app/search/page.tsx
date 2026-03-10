"use client"

import { useState } from "react"
import { Search as SearchIcon, Package, Sparkles, TrendingDown, Target, HelpCircle, ArrowRight, TrendingUp, ShieldCheck, ShoppingCart, Globe, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { Product } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getAiProductInsight, AiProductInsightOutput } from "@/ai/flows/ai-product-insight-generator"
import { cn } from "@/lib/utils"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [product, setProduct] = useState<Product | null>(null)
  const [insight, setInsight] = useState<AiProductInsightOutput | null>(null)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query) return

    setSearched(true)
    const found = MOCK_PRODUCTS.find(p => 
      p.sku.toLowerCase() === query.toLowerCase() || 
      p.nomeProduto.toLowerCase().includes(query.toLowerCase())
    )

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
      case 'APROVADO': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]'
      case 'ATENÇÃO': return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]'
      case 'CRÍTICO': return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]'
      default: return ''
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'APROVADO': return 'bg-emerald-500 text-white'
      case 'ATENÇÃO': return 'bg-amber-500 text-white'
      case 'CRÍTICO': return 'bg-rose-500 text-white'
      default: return ''
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center space-y-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-2">
          <SearchIcon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white font-headline">Consulta Estratégica</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Obtenha uma visão 360º de rentabilidade, performance comercial e insights gerados por IA para qualquer SKU.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mt-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Digite o SKU ou Nome do Produto..." 
              className="pl-12 h-14 bg-card border-white/5 text-lg font-medium focus-visible:ring-primary rounded-xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="h-14 px-10 text-lg font-bold rounded-xl relative shadow-xl">
            Consultar SKU
          </Button>
        </form>
      </div>

      {product ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Card className={cn("glass-card overflow-hidden border-none transition-all duration-500", getStatusColorClass(product.status))}>
            <CardContent className="p-10">
              <div className="flex flex-col md:flex-row justify-between gap-8 items-start">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className="font-mono px-3 py-1 bg-white/5 border-white/10 text-muted-foreground text-xs uppercase tracking-tighter">SKU: {product.sku}</Badge>
                    <Badge className={cn("font-black px-3 py-1 text-[10px] uppercase tracking-widest", getStatusBadgeColor(product.status))}>
                      {product.status}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-bold px-3 py-1 text-xs">Curva {product.classificacaoABC}</Badge>
                    <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent font-bold px-3 py-1 text-xs">{product.marketplace}</Badge>
                  </div>
                  <h2 className="text-4xl font-black text-white leading-tight font-headline">{product.nomeProduto}</h2>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> {product.marca}</div>
                    <div className="flex items-center gap-1.5"><Package className="h-4 w-4" /> {product.categoria}</div>
                    <div className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> {product.tipoEnvio}</div>
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col items-end min-w-[200px]">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mb-1">Preço Atual</p>
                  <p className="text-4xl font-black text-white font-mono">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.precoVenda)}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-emerald-400 text-[10px] font-bold">
                    <TrendingUp className="h-3 w-3" /> PREÇO COMPETITIVO
                  </div>
                </div>
              </div>

              <Separator className="my-10 bg-white/5" />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                <div className="space-y-2 group">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-primary" /> Margem Percentual
                  </p>
                  <p className={cn("text-3xl font-black font-mono transition-transform group-hover:scale-105 origin-left", product.margemPercentual > 20 ? 'text-emerald-400' : 'text-rose-400')}>
                    {product.margemPercentual.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">Meta sugerida: +18.5%</p>
                </div>
                <div className="space-y-2 group">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> Lucro Líquido
                  </p>
                  <p className="text-3xl font-black text-white font-mono group-hover:scale-105 origin-left transition-transform">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.lucroLiquido)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Após todas as taxas e custos</p>
                </div>
                <div className="space-y-2 group">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" /> ROAS
                  </p>
                  <p className="text-3xl font-black text-white font-mono group-hover:scale-105 origin-left transition-transform">
                    {typeof product.roas === 'number' ? product.roas.toFixed(2) : product.roas}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Retorno do investimento Ads</p>
                </div>
                <div className="space-y-2 group">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-500" /> Reclamação
                  </p>
                  <p className={cn("text-3xl font-black font-mono group-hover:scale-105 origin-left transition-transform", product.reclamacaoPercentual > 3 ? 'text-rose-400' : 'text-emerald-400')}>
                    {product.reclamacaoPercentual.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">Status: {product.statusReclamacao}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-none shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Decomposição de Custos
                </CardTitle>
                <CardDescription>Entenda para onde vai o faturamento bruto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-muted-foreground font-medium">Custo do Produto (CMV)</span>
                  <span className="font-bold text-white font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.custoProduto)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-muted-foreground font-medium">Comissão Marketplace</span>
                  <span className="font-bold text-white font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.comissaoMarketplace)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-muted-foreground font-medium">Custo Logístico / Frete</span>
                  <span className="font-bold text-white font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.custoLogistico)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-muted-foreground font-medium">Investimento Marketing (Ads)</span>
                  <span className="font-bold text-white font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.investimentoAds)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20 bg-primary/5 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(112,112,194,0.3)] border-none">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="h-32 w-32" />
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Sophia Insight (Analista IA)
                </CardTitle>
                <CardDescription className="text-blue-100/60">Análise cognitiva baseada em performance histórica.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingInsight ? (
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-primary/20 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-primary/20 rounded animate-pulse" />
                    <div className="h-4 w-4/6 bg-primary/20 rounded animate-pulse" />
                    <div className="pt-4 space-y-2">
                      <div className="h-3 w-1/4 bg-primary/10 rounded animate-pulse" />
                      <div className="h-3 w-full bg-primary/10 rounded animate-pulse" />
                    </div>
                  </div>
                ) : insight ? (
                  <div className="space-y-6">
                    <p className="text-sm leading-relaxed text-blue-50 font-medium">
                      {insight.explanation}
                    </p>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Ações Estratégicas Recomendadas:</p>
                      <ul className="space-y-3">
                        {insight.suggestedActions.map((action, i) => (
                          <li key={i} className="text-xs flex items-start gap-3 text-white bg-white/5 p-2 rounded-lg border border-white/5">
                            <ArrowRight className="h-4 w-4 text-accent flex-shrink-0" />
                            <span className="font-medium">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400/50" />
                    <p className="text-sm text-blue-100/70 italic max-w-xs">
                      {product.status === 'APROVADO' 
                        ? "Produto operando em alta performance conforme planejado. Continue monitorando métricas diárias." 
                        : "Insights não disponíveis para este SKU no momento."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-none bg-secondary/20 p-8 border-dashed border-2 border-white/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Módulo de Concorrência</h4>
                  <p className="text-sm text-muted-foreground">Funcionalidade prevista para monitoramento automático de preços rivais.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/5 min-w-[120px]">
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Preço Rival</p>
                  <p className="text-lg font-black text-white/50">R$ --,--</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/5 min-w-[120px]">
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Gap %</p>
                  <p className="text-lg font-black text-white/50">--%</p>
                </div>
                <Button variant="outline" className="border-white/10 opacity-50 cursor-not-allowed">Habilitar Monitor</Button>
              </div>
            </div>
          </Card>
        </div>
      ) : searched ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="h-24 w-24 rounded-3xl bg-secondary flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-white">SKU não localizado</h3>
            <p className="text-muted-foreground max-w-md">Não encontramos nenhum produto com o termo "{query}". Verifique se o SKU está correto ou se os dados foram importados.</p>
          </div>
          <Button variant="outline" onClick={() => setSearched(false)}>Limpar Busca</Button>
        </div>
      ) : null}
    </div>
  )
}
