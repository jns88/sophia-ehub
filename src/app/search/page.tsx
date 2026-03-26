
"use client"

import { useState } from "react"
import { Search as SearchIcon, Package, Sparkles, TrendingDown, Target, HelpCircle, Globe, Database, LayoutGrid, CheckCircle2 } from "lucide-react"
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
        <h1 className="text-5xl font-black tracking-tighter text-white font-headline">Consulta Estratégica</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-xl font-medium">
          Visão 360º de rentabilidade por SKU com leitura de origem de dados.
        </p>
        
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto mt-10">
          <Input 
            placeholder="SKU ou Nome do Produto..." 
            className="flex-1 h-14 bg-card border-white/5 text-lg font-medium focus-visible:ring-primary rounded-xl pl-6"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
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

      {product && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Card className={cn("glass-card overflow-hidden border-none", getStatusColorClass(product.status))}>
            <CardContent className="p-12">
              <div className="flex flex-col md:flex-row justify-between gap-8 items-start">
                <div className="space-y-6 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className="font-mono text-muted-foreground text-xs uppercase">SKU: {product.sku}</Badge>
                    <Badge className={cn("font-black px-3 py-1 text-[10px] uppercase", product.status === 'APROVADO' ? 'bg-emerald-500' : 'bg-rose-500')}>
                      {product.status}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black px-3 py-1 text-xs uppercase">CLASSE {product.classificacaoABC}</Badge>
                    <Badge variant="outline" className="bg-secondary border-white/10 text-white font-bold px-3 py-1 text-[10px] flex items-center gap-1.5 uppercase">
                      <Database className="h-3 w-3" /> {product.origemDados}
                    </Badge>
                  </div>
                  <h2 className="text-5xl font-black text-white leading-tight font-headline tracking-tighter">{product.nomeProduto}</h2>
                  <p className="text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" /> {product.marketplace}
                  </p>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl border border-white/5 flex flex-col items-end min-w-[240px]">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1">Preço Consolidado</p>
                  <p className="text-5xl font-black text-white font-mono tracking-tighter">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.precoVenda)}
                  </p>
                </div>
              </div>

              <Separator className="my-12 bg-white/5" />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.1em] flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-primary" /> Margem %
                  </p>
                  <p className={cn("text-4xl font-black font-mono tracking-tighter", product.margemPercentual > 20 ? 'text-emerald-400' : 'text-rose-400')}>
                    {product.margemPercentual.toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.1em] flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> Lucro Líquido
                  </p>
                  <p className="text-4xl font-black text-white font-mono tracking-tighter">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.lucroLiquido)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.1em] flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" /> ROAS
                  </p>
                  <p className="text-4xl font-black text-white font-mono tracking-tighter">
                    {typeof product.roas === 'number' ? product.roas.toFixed(2) : product.roas}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.1em] flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-amber-500" /> Score
                  </p>
                  <p className="text-4xl font-black text-white font-mono tracking-tighter">
                    {product.score.toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
