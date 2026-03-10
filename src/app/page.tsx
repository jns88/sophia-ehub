"use client"

import { useState, useMemo } from "react"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { KpiCard } from "@/components/kpi-card"
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  BarChart, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  ArrowUpRight,
  TrendingDown,
  Info,
  Database,
  Filter
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const [selectedChannel, setSelectedChannel] = useState("all")
  const [selectedSource, setSelectedSource] = useState("all")

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchChannel = selectedChannel === "all" || p.marketplace === selectedChannel
      const matchSource = selectedSource === "all" || p.origemDados === selectedSource
      return matchChannel && matchSource
    })
  }, [selectedChannel, selectedSource])
  
  const metrics = useMemo(() => {
    const products = filteredProducts
    if (products.length === 0) return {
      receitaTotal: 0, lucroLiquidoTotal: 0, margemMedia: 0, roasMedio: 0, 
      totalProdutos: 0, produtosAprovados: 0, produtosAtencao: 0, produtosCriticos: 0,
      scoreMedio: 0, rentabilidadePercentual: 0
    }

    const receitaTotal = products.reduce((acc, p) => acc + p.precoVenda, 0)
    const lucroLiquidoTotal = products.reduce((acc, p) => acc + p.lucroLiquido, 0)
    const margemMedia = products.reduce((acc, p) => acc + p.margemPercentual, 0) / products.length
    
    const roasValues = products.filter(p => typeof p.roas === 'number') as { roas: number }[]
    const roasMedio = roasValues.length > 0 
      ? roasValues.reduce((acc, p) => acc + p.roas, 0) / roasValues.length 
      : 0

    const totalProdutos = products.length
    const produtosAprovados = products.filter(p => p.status === 'APROVADO').length
    const produtosAtencao = products.filter(p => p.status === 'ATENÇÃO').length
    const produtosCriticos = products.filter(p => p.status === 'CRÍTICO').length
    const scoreMedio = products.reduce((acc, p) => acc + p.score, 0) / products.length
    const rentabilidadePercentual = (lucroLiquidoTotal / receitaTotal) * 100

    return {
      receitaTotal, lucroLiquidoTotal, margemMedia, roasMedio,
      totalProdutos, produtosAprovados, produtosAtencao, produtosCriticos,
      scoreMedio, rentabilidadePercentual
    }
  }, [filteredProducts])

  const countA = filteredProducts.filter(p => p.classificacaoABC === 'A').length
  const countB = filteredProducts.filter(p => p.classificacaoABC === 'B').length
  const countC = filteredProducts.filter(p => p.classificacaoABC === 'C').length

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-secondary/20 p-6 rounded-2xl border border-white/5 shadow-inner">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-white font-headline">Dashboard Operacional</h1>
          <p className="text-muted-foreground text-lg">Hub analítico de faturamento e rentabilidade.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" /> Canal de Venda
            </label>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger className="w-[200px] bg-card border-white/5 h-11">
                <SelectValue placeholder="Todos os canais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os canais</SelectItem>
                <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
                <SelectItem value="Amazon">Amazon</SelectItem>
                <SelectItem value="Shopee">Shopee</SelectItem>
                <SelectItem value="Magalu">Magalu</SelectItem>
                <SelectItem value="B2W / Americanas">B2W / Americanas</SelectItem>
                <SelectItem value="Loja Própria / Site">Loja Própria / Site</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Database className="h-3 w-3" /> Origem dos Dados
            </label>
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-[200px] bg-card border-white/5 h-11">
                <SelectValue placeholder="Todas as origens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as origens</SelectItem>
                <SelectItem value="CSV">CSV</SelectItem>
                <SelectItem value="XLSX">XLSX</SelectItem>
                <SelectItem value="Google Sheets">Google Sheets</SelectItem>
                <SelectItem value="API Mercado Livre">API Mercado Livre</SelectItem>
                <SelectItem value="API Amazon">API Amazon</SelectItem>
                <SelectItem value="API Shopee">API Shopee</SelectItem>
                <SelectItem value="API Site">API Site</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Receita Total" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.receitaTotal)} 
          icon={TrendingUp} 
          description="Faturamento bruto consolidado"
        />
        <KpiCard 
          title="Lucro Líquido" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.lucroLiquidoTotal)} 
          icon={DollarSign} 
          accent
          description="Resultado final após custos"
        />
        <KpiCard 
          title="Margem de Contribuição" 
          value={`${metrics.margemMedia.toFixed(1)}%`} 
          icon={Percent} 
          description="Margem média do catálogo"
        />
        <KpiCard 
          title="ROAS Geral" 
          value={metrics.roasMedio.toFixed(2)} 
          icon={BarChart} 
          description="Retorno sobre investimento Ads"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        <Card className="glass-card p-6 border-none shadow-xl flex items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
            <Percent className="h-7 w-7 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Rentabilidade %</p>
            <h4 className="text-2xl font-black text-white">{metrics.rentabilidadePercentual.toFixed(1)}%</h4>
          </div>
        </Card>
        <Card className="glass-card p-6 border-none shadow-xl flex items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Score Estratégico</p>
            <h4 className="text-2xl font-black text-white">{metrics.scoreMedio.toFixed(2)} / 3.0</h4>
          </div>
        </Card>
        <Card className="glass-card p-6 border-none shadow-xl flex items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="h-7 w-7 text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">SKUs Críticos</p>
            <h4 className="text-2xl font-black text-white">{metrics.produtosCriticos}</h4>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                Performance do Catálogo
              </CardTitle>
              <CardDescription>Principais produtos com base nos filtros ativos.</CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">Origem: {selectedSource === 'all' ? 'Múltiplas' : selectedSource}</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead>Produto</TableHead>
                  <TableHead>Marketplace</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.slice(0, 10).map((p) => (
                  <TableRow key={p.sku} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <p className="font-medium text-sm truncate max-w-[250px] text-white">{p.nomeProduto}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{p.sku} • {p.origemDados}</p>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-accent">{p.marketplace}</TableCell>
                    <TableCell className={cn("text-right font-black font-mono text-xs", p.lucroLiquido < 0 ? "text-rose-400" : "text-emerald-400")}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.lucroLiquido)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={p.status === 'APROVADO' ? 'default' : p.status === 'CRÍTICO' ? 'destructive' : 'secondary'} className="text-[9px]">
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-accent" />
              Curva ABC & Alertas
            </CardTitle>
            <CardDescription>Participação estratégica por classe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Distribuição Pareto</h5>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">Classe A (80% Faturamento)</span>
                    <span className="text-accent font-bold">{countA} SKUs ({((countA / (metrics.totalProdutos || 1)) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(countA / (metrics.totalProdutos || 1)) * 100}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">Classe B (15% Faturamento)</span>
                    <span className="text-accent font-bold">{countB} SKUs ({((countB / (metrics.totalProdutos || 1)) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(countB / (metrics.totalProdutos || 1)) * 100}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">Classe C (5% Faturamento)</span>
                    <span className="text-accent font-bold">{countC} SKUs ({((countC / (metrics.totalProdutos || 1)) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/30" style={{ width: `${(countC / (metrics.totalProdutos || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alertas Ativos</h5>
              <div className="space-y-3">
                {metrics.produtosCriticos > 0 && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">SKUs Críticos Detectados</p>
                      <p className="text-[10px] text-rose-300/70">{metrics.produtosCriticos} produtos com margem negativa em {selectedChannel === 'all' ? 'todos os canais' : selectedChannel}.</p>
                    </div>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Atualização de Origem</p>
                    <p className="text-[10px] text-primary/70">Leitura de dados via {selectedSource === 'all' ? 'múltiplas fontes' : selectedSource} estável.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
