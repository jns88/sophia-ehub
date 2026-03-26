
"use client"

import { useState, useMemo, useEffect } from "react"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { KpiCard } from "@/components/kpi-card"
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  BarChart, 
  AlertCircle,
  ArrowUpRight,
  TrendingDown,
  Filter,
  Calendar,
  Clock,
  Settings2,
  LayoutGrid,
  Info,
  Layers,
  PieChart as PieChartIcon,
  Activity,
  CheckCircle2,
  LineChart as LineChartIcon
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts'
import { cn } from "@/lib/utils"
import { TimeRange, Product } from "@/lib/types"

const CHANNELS = [
  "Mercado Livre",
  "Amazon",
  "Shopee",
  "Magalu",
  "B2W / Americanas",
  "Loja Própria / Site"
]

const COLORS = ['#7070C2', '#63DBFF', '#4B4B8F', '#F59E0B', '#10B981', '#F43F5E']

export default function DashboardPage() {
  const [selectedChannel, setSelectedChannel] = useState("all")
  const [selectedSource, setSelectedSource] = useState("all")
  const [timeRange, setTimeRange] = useState<TimeRange>("mes")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [currentTime, setCurrentTime] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  
  const [mainMetric, setMainMetric] = useState("receita")

  useEffect(() => {
    setMounted(true)
    const now = new Date();
    const currentYearNum = now.getFullYear();
    const yearsList = Array.from({ length: 5 }, (_, i) => (currentYearNum - 2 + i).toString());
    setAvailableYears(yearsList);
    setSelectedMonth((now.getMonth() + 1).toString().padStart(2, '0'));
    setSelectedYear(currentYearNum.toString());

    const updateTime = () => {
      const currentNow = new Date();
      setCurrentTime(new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      }).format(currentNow));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!mounted) return [];
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
        lucroLiquido: p.lucroLiquido * multiplier,
        custoProduto: p.custoProduto * multiplier,
        comissaoMarketplace: p.comissaoMarketplace * multiplier,
        custoLogistico: p.custoLogistico * multiplier,
        investimentoAds: p.investimentoAds * multiplier
      }))
  }, [selectedChannel, selectedSource, timeRange, mounted])
  
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

  // Comparison Data (Current vs Prev)
  const comparisonData = useMemo(() => {
    const labels = timeRange === 'hoje' ? ['Ontem', 'Hoje'] : timeRange === 'semana' ? ['Semana Ant.', 'Esta Sem.'] : ['Mês Ant.', 'Mês Atu.']
    return [
      { name: labels[0], faturamento: metrics.receitaTotal * 0.92, lucro: metrics.lucroLiquidoTotal * 0.88 },
      { name: labels[1], faturamento: metrics.receitaTotal, lucro: metrics.lucroLiquidoTotal },
    ]
  }, [metrics, timeRange])

  // Trend Data for Evolution Chart
  const trendData = useMemo(() => [
    { name: 'Mês-5', faturamento: metrics.receitaTotal * 0.7, lucro: metrics.lucroLiquidoTotal * 0.65 },
    { name: 'Mês-4', faturamento: metrics.receitaTotal * 0.85, lucro: metrics.lucroLiquidoTotal * 0.75 },
    { name: 'Mês-3', faturamento: metrics.receitaTotal * 0.8, lucro: metrics.lucroLiquidoTotal * 0.72 },
    { name: 'Mês-2', faturamento: metrics.receitaTotal * 0.95, lucro: metrics.lucroLiquidoTotal * 0.9 },
    { name: 'Mês-1', faturamento: metrics.receitaTotal * 0.92, lucro: metrics.lucroLiquidoTotal * 0.88 },
    { name: 'Atual', faturamento: metrics.receitaTotal, lucro: metrics.lucroLiquidoTotal },
  ], [metrics])

  // Multi-channel Performance Data
  const channelPerformanceData = useMemo(() => {
    return CHANNELS.map(channel => {
      const channelProducts = filteredProducts.filter(p => p.marketplace === channel)
      const revenue = channelProducts.reduce((acc, p) => acc + p.precoVenda, 0)
      const profit = channelProducts.reduce((acc, p) => acc + p.lucroLiquido, 0)
      const margin = channelProducts.length > 0 
        ? channelProducts.reduce((acc, p) => acc + p.margemPercentual, 0) / channelProducts.length 
        : 0
      const roasValues = channelProducts.filter(p => typeof p.roas === 'number') as { roas: number }[]
      const roas = roasValues.length > 0 
        ? roasValues.reduce((acc, p) => acc + p.roas, 0) / roasValues.length 
        : 0

      return {
        name: channel,
        receita: Math.round(revenue),
        lucro: Math.round(profit),
        margem: Math.round(margin),
        roas: parseFloat(roas.toFixed(2))
      }
    }).filter(d => d.receita > 0)
  }, [filteredProducts])

  // Channel Distribution Data (Donut)
  const channelDistributionData = useMemo(() => {
    const total = metrics.receitaTotal || 1
    return CHANNELS.map((channel, index) => {
      const revenue = filteredProducts
        .filter(p => p.marketplace === channel)
        .reduce((acc, p) => acc + p.precoVenda, 0)
      
      return {
        name: channel,
        value: revenue,
        percentage: (revenue / total) * 100,
        color: COLORS[index % COLORS.length]
      }
    }).filter(d => d.value > 0)
  }, [filteredProducts, metrics.receitaTotal])

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
      {/* Header Area */}
      <div className="space-y-6 bg-card p-8 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight font-headline">Hub analítico para ajudar a vida do Jonas</h1>
            <p className="text-muted-foreground text-lg font-medium">Gestão estratégica de marketplaces e rentabilidade em tempo real.</p>
          </div>
          <Badge variant="outline" className="h-10 px-4 font-mono text-xs border-primary/20 text-primary bg-primary/5 hidden md:flex items-center gap-2">
            <Clock className="h-3 w-3" /> Última atualização: {mounted ? currentTime : "--:--"}
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

          {timeRange === 'mes' && mounted && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mês</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="bg-secondary/50 border-white/5 h-11 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Maio</SelectItem>
                    <SelectItem value="06">Junho</SelectItem>
                    <SelectItem value="07">Julho</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
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
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
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
                {CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Dashboard Preferences Area */}
      <Card className="glass-card border-none">
        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Settings2 className="h-3.5 w-3.5 text-primary" /> Preferências do Dashboard
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

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Receita Total" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.receitaTotal)} 
          icon={TrendingUp} 
          description={`Receita ${getContextText()}`}
          accent={mainMetric === 'receita'}
        />
        <KpiCard 
          title="Lucro Líquido" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.lucroLiquidoTotal)} 
          icon={DollarSign} 
          description={`Líquido real ${getRangeText()}`}
          accent={mainMetric === 'lucro'}
        />
        <KpiCard 
          title="Margem de Contribuição" 
          value={`${metrics.margemMedia.toFixed(1)}%`} 
          icon={Percent} 
          description={`Média ${getRangeText()}`}
          accent={mainMetric === 'margem'}
        />
        <KpiCard 
          title="ROAS Médio" 
          value={metrics.roasMedio.toFixed(2)} 
          icon={BarChart} 
          description="Retorno Ads no período"
        />
        <KpiCard 
          title="Rentabilidade %" 
          value={`${metrics.rentabilidadePercentual.toFixed(1)}%`} 
          icon={Activity} 
          description="Eficiência sobre faturamento"
        />
        <KpiCard 
          title="Score Estratégico" 
          value={`${metrics.scoreMedio.toFixed(2)} / 3.0`} 
          icon={LayoutGrid} 
          description="Saúde global do catálogo"
        />
        <KpiCard 
          title="Produtos Aprovados" 
          value={metrics.produtosAprovados} 
          icon={CheckCircle2} 
          description="Performando acima do benchmark"
        />
        <KpiCard 
          title="Alertas (Atenção/Crítico)" 
          value={metrics.produtosAtencao + metrics.produtosCriticos} 
          icon={AlertCircle} 
          description="SKUs necessitando intervenção"
          className={metrics.produtosCriticos > 0 ? "border-rose-500/20" : ""}
        />
      </div>

      {/* Comparison Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
                  <TrendingUp className="h-5 w-5 text-emerald-500" /> Comparativo de Faturamento
                </CardTitle>
                <CardDescription>Crescimento vs período anterior.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Bar dataKey="faturamento" name="Faturamento" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
                  <DollarSign className="h-5 w-5 text-amber-500" /> Comparativo de Lucro Líquido
                </CardTitle>
                <CardDescription>Rentabilidade real vs período anterior.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Bar dataKey="lucro" name="Lucro Líquido" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-channel Performance Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
                  <Layers className="h-5 w-5 text-primary" /> Performance por Canal
                </CardTitle>
                <CardDescription>Visão comparativa de Faturamento e Lucro por Marketplace.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full mt-4">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={channelPerformanceData} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill: '#888', fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#888', fontSize: 10 }} width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                    <Legend />
                    <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="lucro" name="Lucro" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
              <PieChartIcon className="h-5 w-5 text-accent" /> Participação de Canal
            </CardTitle>
            <CardDescription>Contribuição por Receita.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[300px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="w-full space-y-3 mt-4">
              {channelDistributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between group p-2 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-black uppercase tracking-tight truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ABC Curve, Alerts & Catalog Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
              <TrendingDown className="h-5 w-5 text-accent" /> Curva ABC & Pareto
            </CardTitle>
            <CardDescription>Participação estratégica do catálogo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Distribuição SKU</h5>
                <Badge variant="outline" className="text-[10px] border-white/10">{metrics.totalProdutos} SKUs</Badge>
              </div>
              <div className="space-y-5">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-black uppercase text-[10px]">Classe A (80% Fat.)</span>
                    <span className="text-accent font-black">{countA} SKUs</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(countA / (metrics.totalProdutos || 1)) * 100}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-black uppercase text-[10px]">Classe B (15% Fat.)</span>
                    <span className="text-accent font-black">{countB} SKUs</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(countB / (metrics.totalProdutos || 1)) * 100}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-black uppercase text-[10px]">Classe C (5% Fat.)</span>
                    <span className="text-accent font-black">{countC} SKUs</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/30" style={{ width: `${(countC / (metrics.totalProdutos || 1)) * 100}%` }} />
                  </div>
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
                      <p className="text-xs font-black uppercase tracking-wider">SKUs Críticos</p>
                      <p className="text-[10px] text-rose-500/70 font-medium">{metrics.produtosCriticos} produtos com margem negativa ou prejuízo líquido.</p>
                    </div>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-4">
                  <Info className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider">Integridade da API</p>
                    <p className="text-[10px] text-primary/70 font-medium">Fontes de dados sincronizadas com sucesso para {selectedChannel === 'all' ? 'todos os canais' : selectedChannel}.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Trend Evolution Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
              <LineChartIcon className="h-5 w-5 text-primary" /> Evolução do Faturamento
            </CardTitle>
            <CardDescription>Tendência histórica dos últimos 6 períodos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="faturamento" name="Faturamento" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden border-none">
          <CardHeader className="bg-white/[0.02] p-6 border-b border-white/5">
            <div className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                  <ArrowUpRight className="h-6 w-6 text-primary" /> Catálogo {getRangeText()}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/[0.01]">
                <TableRow className="border-white/5">
                  <TableHead className="font-black uppercase text-[10px] py-4 px-6 tracking-widest">Produto / SKU</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] py-4 px-6 tracking-widest">Lucro {getRangeText()}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.slice(0, 5).map((p) => (
                  <TableRow key={p.sku} className="border-white/5 hover:bg-white/5 transition-all">
                    <TableCell className="py-4 px-6">
                      <p className="font-black text-xs truncate max-w-[150px]">{p.nomeProduto}</p>
                      <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{p.sku}</p>
                    </TableCell>
                    <TableCell className={cn("text-right font-black font-mono text-xs py-4 px-6", p.lucroLiquido < 0 ? "text-rose-400" : "text-emerald-400")}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.lucroLiquido)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
