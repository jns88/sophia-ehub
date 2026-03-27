
"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Search as SearchIcon, 
  Package, 
  Sparkles, 
  TrendingDown, 
  Target, 
  HelpCircle, 
  Globe, 
  Database, 
  LayoutGrid, 
  CheckCircle2,
  Filter,
  ArrowRight,
  ChevronRight,
  Eye,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DEFAULT_COMPANY_ID } from "@/lib/mock-data"
import { Product } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAiProductInsight, AiProductInsightOutput } from "@/ai/flows/ai-product-insight-generator"
import { cn } from "@/lib/utils"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [selectedChannel, setSelectedChannel] = useState("all")
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [insight, setInsight] = useState<AiProductInsightOutput | null>(null)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeCompanyId, setActiveCompanyId] = useState(DEFAULT_COMPANY_ID)

  useEffect(() => {
    setMounted(true)
    const companyId = localStorage.getItem('sophia_active_company_id') || DEFAULT_COMPANY_ID
    setActiveCompanyId(companyId)
    
    const stored = localStorage.getItem(`sophia_products_${companyId}`)
    if (stored) {
      setProducts(JSON.parse(stored))
    }
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchQuery = !query || 
        p.sku.toLowerCase().includes(query.toLowerCase()) || 
        p.nomeProduto.toLowerCase().includes(query.toLowerCase())
      
      const matchChannel = selectedChannel === "all" || p.marketplace === selectedChannel
      
      return matchQuery && matchChannel
    })
  }, [products, query, selectedChannel])

  const handleViewDetails = async (product: Product) => {
    setSelectedProduct(product)
    setInsight(null)
    
    if (product.status !== 'APROVADO') {
      setLoadingInsight(true)
      try {
        const result = await getAiProductInsight({
          sku: product.sku,
          nomeProduto: product.nomeProduto,
          categoria: product.categoria,
          marketplace: product.marketplace,
          marca: product.marca,
          tipoEnvio: product.tipoEnvio,
          precoVenda: product.precoVenda,
          custoProduto: product.custoProduto,
          comissaoMarketplace: product.comissaoMarketplace,
          custoLogistico: product.custoLogistico,
          investimentoAds: product.investimentoAds,
          reclamacaoPercentual: product.reclamacaoPercentual,
          margemPercentual: product.margemPercentual,
          lucroLiquido: product.lucroLiquido,
          roas: product.roas,
          score: product.score,
          status: product.status,
          classificacaoABC: product.classificacaoABC,
          statusReclamacao: product.statusReclamacao
        })
        setInsight(result)
      } catch (error) {
        console.error("Erro ao gerar insight:", error)
      } finally {
        setLoadingInsight(false)
      }
    }
  }

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'APROVADO': return 'border-emerald-500/20 bg-emerald-500/5'
      case 'ATENÇÃO': return 'border-amber-500/20 bg-amber-500/5'
      case 'CRÍTICO': return 'border-rose-500/20 bg-rose-500/5'
      default: return 'border-white/5 bg-white/5'
    }
  }

  if (!mounted) return null;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white font-headline">Consulta & Catálogo</h1>
          <p className="text-muted-foreground text-lg font-medium">Visão 360º e auditoria individual de SKUs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Filtros e Lista */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="glass-card border-none shadow-2xl">
            <CardHeader className="p-8 pb-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por SKU ou Nome do Produto..." 
                    className="h-14 bg-secondary/30 border-white/5 rounded-xl pl-12 font-bold text-white focus-visible:ring-primary"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger className="w-full md:w-[200px] h-14 bg-secondary/30 border-white/5 rounded-xl font-bold">
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
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-white/5">
                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest">Produto / SKU</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Canal</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-right">ABC</TableHead>
                    <TableHead className="py-6 px-8 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <TableRow 
                        key={p.sku} 
                        className={cn(
                          "border-white/5 hover:bg-white/[0.02] cursor-pointer group transition-all",
                          selectedProduct?.sku === p.sku && "bg-primary/5"
                        )}
                        onClick={() => handleViewDetails(p)}
                      >
                        <TableCell className="py-6 px-8">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-white group-hover:text-primary transition-colors">{p.nomeProduto}</span>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">{p.sku} • {p.categoria}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <Badge variant="outline" className="text-[9px] font-bold uppercase border-white/10 bg-white/5">
                            {p.marketplace}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6">
                          <Badge className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5",
                            p.status === 'APROVADO' ? "bg-emerald-500" : p.status === 'ATENÇÃO' ? "bg-amber-500" : "bg-rose-500"
                          )}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 text-right font-black text-xs text-primary">
                          {p.classificacaoABC}
                        </TableCell>
                        <TableCell className="py-6 px-8 text-right">
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <Package className="h-12 w-12" />
                          <p className="font-black uppercase tracking-widest text-xs">Nenhum SKU encontrado no catálogo ativo</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Produto Selecionado */}
        <div className="xl:col-span-1 space-y-6">
          {selectedProduct ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className={cn("glass-card border-none overflow-hidden shadow-2xl transition-all", getStatusColorClass(selectedProduct.status))}>
                <CardHeader className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-muted-foreground uppercase">{selectedProduct.sku}</Badge>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-primary/10 border-primary/20 text-primary px-3">Classe {selectedProduct.classificacaoABC}</Badge>
                  </div>
                  <CardTitle className="text-2xl font-black text-white leading-tight">{selectedProduct.nomeProduto}</CardTitle>
                  <CardDescription className="flex items-center gap-2 font-bold uppercase text-[10px] text-muted-foreground mt-2">
                    <Globe className="h-3 w-3" /> {selectedProduct.marketplace} • <Database className="h-3 w-3" /> {selectedProduct.origemDados}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Margem Líquida</p>
                      <p className={cn("text-3xl font-black font-mono", selectedProduct.margemPercentual > 20 ? "text-emerald-400" : "text-rose-400")}>
                        {selectedProduct.margemPercentual.toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Lucro Unitário</p>
                      <p className="text-3xl font-black text-white font-mono">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProduct.lucroLiquido)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">ROAS</p>
                      <p className="text-3xl font-black text-accent font-mono">
                        {typeof selectedProduct.roas === 'number' ? selectedProduct.roas.toFixed(2) : selectedProduct.roas}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Score de Saúde</p>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-black text-white font-mono">{selectedProduct.score.toFixed(1)}</p>
                        <span className="text-xs text-muted-foreground">/ 3.0</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Sparkles className="h-3 w-3" /> Insights da Sophia AI
                    </h4>
                    {loadingInsight ? (
                      <div className="flex flex-col items-center justify-center py-10 space-y-4 bg-white/5 rounded-2xl border border-white/5">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Analisando métricas do SKU...</p>
                      </div>
                    ) : insight ? (
                      <div className="space-y-4 animate-in fade-in duration-700">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <p className="text-xs leading-relaxed font-medium text-blue-100/90">{insight.explanation}</p>
                        </div>
                        {insight.suggestedActions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Ações Recomendadas:</p>
                            <div className="flex flex-col gap-2">
                              {insight.suggestedActions.map((action, i) => (
                                <div key={i} className="flex items-start gap-3 bg-primary/5 p-3 rounded-xl border border-primary/10">
                                  <ArrowRight className="h-3 w-3 text-primary mt-1 shrink-0" />
                                  <p className="text-[11px] font-bold text-white/80">{action}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400/50" />
                        <p className="text-[11px] font-bold text-emerald-400/70 max-w-[200px]">Este produto está com saúde excelente. Continue o monitoramento de estoque.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-3xl bg-card/20 text-center opacity-40">
              <Eye className="h-10 w-10 mb-4" />
              <p className="text-sm font-black uppercase tracking-widest">Selecione um SKU para análise individual</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
