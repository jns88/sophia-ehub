"use client"

import { useState, useMemo } from "react"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { KpiCard } from "@/components/kpi-card"
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  BarChart, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  TrendingDown,
  Database,
  Filter,
  Calendar,
  Clock,
  Settings2,
  LayoutGrid,
  Info
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn } from "@/lib/utils"
import { TimeRange } from "@/lib/types"

export default function DashboardPage() {
  const [selectedChannel, setSelectedChannel] = useState("all")
  const [selectedSource, setSelectedSource] = useState("all")
  const [timeRange, setTimeRange] = useState<TimeRange>("mes")
  const [selectedMonth, setSelectedMonth] = useState("10")
  const [selectedYear, setSelectedYear] = useState("2023")
  
  // Preferências do Dashboard
  const [mainMetric, setMainMetric] = useState("receita")
  const [showComparison, setShowComparison] = useState(true)

  const filteredProducts = useMemo(() => {
    // Simulação de filtro temporal baseada no mock (no mundo real filtraria por data)
    // Aqui apenas simulamos uma variação para demonstrar o efeito nos KPIs
    let multiplier = 1
    if (timeRange === 'hoje') multiplier = 0.03
    if (timeRange === 'semana') multiplier = 0.22
    if (timeRange === 'mes') multiplier = 1

    return MOCK_PRODUCTS
      .filter(p => {
        const matchChannel = selectedChannel === "all" || p.marketplace === selectedChannel
        const matchSource = selectedSource === "all" || p.origemDados === selectedSource
        return matchChannel && matchSource
      })
      .map(p => ({
        ...p,
        precoVenda: p.precoVenda * multiplier,
        lucroLiquido: p.lucroLiquido * multiplier
      }))
  }, [selectedChannel, selectedSource, timeRange])
  
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
    const rentabilidadePercentual = receitaTotal > 0 ? (lucroLiquidoTotal / receitaTotal) * 100 : 0

    return {
      receitaTotal, lucroLiquidoTotal, margemMedia, roasMedio,
      totalProdutos, produtosAprovados, produtosAtencao, produtosCriticos,
      scoreMedio, rentabilidadePercentual
    }
  }, [filteredProducts])

  // Dados para o gráfico comparativo
  const comparisonData = useMemo(() => {
    const labels = timeRange === 'hoje' ? ['Ontem', 'Hoje'] : timeRange === 'semana' ? ['Semana Anterior', 'Esta Semana'] : ['Mês Anterior', 'Mês Atual']
    return [
      { name: labels[0], faturamento: metrics.receitaTotal * 0.92, lucro: metrics.lucroLiquidoTotal * 0.88 },
      { name: labels[1], faturamento: metrics.receitaTotal, lucro: metrics.lucroLiquidoTotal },
    ]
  }, [metrics, timeRange])

  const countA = filteredProducts.filter(p => p.classificacaoABC === 'A').length
  const countB = filteredProducts.filter(p => p.classificacaoABC === 'B').length
  const countC = filteredProducts.filter(p => p.classificacaoABC === 'C').length

  const getRangeText = () => {
    if (timeRange === 'hoje') return 'do dia'
    if (timeRange === 'semana') return 'da semana'
    if (timeRange === 'mes') return 'do mês'
    return ''
  }

  const getContextText = () => {
    let text = getRangeText()
    if (selectedChannel !== 'all') text += ` em ${selectedChannel}`
    if (selectedSource !== 'all') text += ` via ${selectedSource}`
    return text
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header com Identidade Personalizada e Filtros */}
      <div className="space-y-6 bg-card p-8 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-white font-headline">Hub analítico para ajudar a vida do Jonas</h1>
            <p className="text-muted-foreground text-lg font-medium">Faturamento e rentabilidade consolidada em tempo real.</p>
          </div>
          <Badge variant="outline" className="h-10 px-4 font-mono text-xs border-primary/20 text-primary bg-primary/5 hidden md:flex items-center gap-2">
            <Clock className="h-3 w-3" /> Última atualização: Agora
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> Período
            </label>
            <div className="flex gap-1 bg-secondary/30 p-1 rounded-xl">
              <button 
                onClick={() => setTimeRange('hoje')}
                className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", timeRange === 'hoje' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white")}
              >Hoje</button>
              <button 
                onClick={() => setTimeRange('semana')}
                className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", timeRange === 'semana' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white")}
              >Semana</button>
              <button 
                onClick={() => setTimeRange('mes')}
                className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", timeRange === 'mes' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white")}
              >Mês</button>
            </div>
          </div>

          {timeRange === 'mes' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mês de Análise</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="bg-secondary/50 border-white/5 h-11 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="09">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ano</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-secondary/50 border-white/5 h-11 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" /> Canal
            </label>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger className="bg-secondary/50 border-white/5 h-11 font-bold">
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
        </div>
      </div>

      {/* Preferências do Dashboard (Mapeado das Configurações) */}
      <Card className="glass-card border-none">
        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Settings2 className="h-3.5 w-3.5 text-primary" /> Preferências de Visualização
          </CardTitle>
          <div className="flex gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Métrica em Destaque:</span>
              <Select value={mainMetric} onValueChange={setMainMetric}>
                <SelectTrigger className="w-[120px] h-8 text-[10px] font-bold border-white/5 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="lucro">Lucro</SelectItem>
                  <SelectItem value="margem">Margem %</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs com Contexto Dinâmico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Receita Total" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.receitaTotal)} 
          icon={TrendingUp} 
          description={`Receita total ${getContextText()}`}
          accent={mainMetric === 'receita'}
        />
        <KpiCard 
          title="Lucro Líquido" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.lucroLiquidoTotal)} 
          icon={DollarSign} 
          description={`Resultado final ${getRangeText()}`}
          accent={mainMetric === 'lucro'}
        />
        <KpiCard 
          title="Margem de Contribuição" 
          value={`${metrics.margemMedia.toFixed(1)}%`} 
          icon={Percent} 
          description={`Margem média ${getRangeText()}`}
          accent={mainMetric === 'margem'}
        />
        <KpiCard 
          title="ROAS Geral" 
          value={metrics.roasMedio.toFixed(2)} 
          icon={BarChart} 
          description="Performance Ads no período"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <LayoutGrid className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Score Médio</p>
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

      {/* Gráfico Comparativo e Curva ABC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" /> Comparativo de Desempenho
                </CardTitle>
                <CardDescription>Comparação de Faturamento e Lucro vs Período Anterior.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="faturamento" name="Faturamento" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro" name="Lucro Líquido" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-accent" /> Curva ABC & Alertas
            </CardTitle>
            <CardDescription>Participação estratégica do catálogo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Distribuição Pareto</h5>
                <Badge variant="outline" className="text-[10px] border-white/10">{metrics.totalProdutos} SKUs Ativos</Badge>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-black uppercase text-[10px]">Classe A (80% Faturamento)</span>
                    <span className="text-accent font-black">{countA} SKUs</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-primary" style={{ width: `${(countA / (metrics.totalProdutos || 1)) * 100}%` }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground text-right font-bold uppercase tracking-tighter">Participação: {((countA / (metrics.totalProdutos || 1)) * 100).toFixed(1)}%</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-black uppercase text-[10px]">Classe B (15% Faturamento)</span>
                    <span className="text-accent font-black">{countB} SKUs</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-accent" style={{ width: `${(countB / (metrics.totalProdutos || 1)) * 100}%` }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground text-right font-bold uppercase tracking-tighter">Participação: {((countB / (metrics.totalProdutos || 1)) * 100).toFixed(1)}%</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-black uppercase text-[10px]">Classe C (5% Faturamento)</span>
                    <span className="text-accent font-black">{countC} SKUs</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-muted-foreground/30" style={{ width: `${(countC / (metrics.totalProdutos || 1)) * 100}%` }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground text-right font-bold uppercase tracking-tighter">Participação: {((countC / (metrics.totalProdutos || 1)) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Alertas Ativos</h5>
              <div className="space-y-3">
                {metrics.produtosCriticos > 0 && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-4">
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-wider">SKUs Críticos {getRangeText()}</p>
                      <p className="text-[10px] text-rose-300/70 font-medium">Existem {metrics.produtosCriticos} produtos com margem negativa no período selecionado.</p>
                    </div>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-4">
                  <Info className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-wider">Status das Origens</p>
                    <p className="text-[10px] text-primary/70 font-medium">Integridade dos dados via {selectedSource === 'all' ? 'Fontes Híbridas' : selectedSource} validada.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Produtos Destaque */}
      <Card className="glass-card border-none overflow-hidden">
        <CardHeader className="bg-white/[0.02] p-8 border-b border-white/5">
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <ArrowUpRight className="h-6 w-6 text-primary" /> Performance do Catálogo {getRangeText()}
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Principais SKUs ordenados por lucro real no período.</CardDescription>
            </div>
            <div className="flex gap-4">
               <Badge variant="outline" className="h-8 bg-white/5 border-white/10 uppercase text-[9px] font-black">{selectedChannel === 'all' ? 'Múltiplos Canais' : selectedChannel}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.01]">
              <TableRow className="border-white/5">
                <TableHead className="font-black uppercase text-[10px] py-6 px-8 tracking-widest">Produto / SKU</TableHead>
                <TableHead className="font-black uppercase text-[10px] py-6 tracking-widest">Marketplace</TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] py-6 tracking-widest">Lucro {getRangeText()}</TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] py-6 px-8 tracking-widest">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.slice(0, 8).map((p) => (
                <TableRow key={p.sku} className="border-white/5 hover:bg-white/5 transition-all">
                  <TableCell className="py-6 px-8">
                    <p className="font-black text-sm text-white">{p.nomeProduto}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">{p.sku} • {p.origemDados}</p>
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge variant="outline" className="text-[9px] font-black uppercase border-accent/20 text-accent bg-accent/5">{p.marketplace}</Badge>
                  </TableCell>
                  <TableCell className={cn("text-right font-black font-mono text-sm py-6", p.lucroLiquido < 0 ? "text-rose-400" : "text-emerald-400")}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.lucroLiquido)}
                  </TableCell>
                  <TableCell className="text-right py-6 px-8">
                    <Badge variant={p.status === 'APROVADO' ? 'default' : p.status === 'CRÍTICO' ? 'destructive' : 'secondary'} className="text-[10px] font-black uppercase tracking-widest h-7 px-3">
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
