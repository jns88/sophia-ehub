
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
import { TimeRange } from "@/lib/types"

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
        const matchSource = selectedSource === "all" || p.origemDados.includes(selectedSource)
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

  // Multi-channel Performance Data
  const channelPerformanceData = useMemo(() => {
    return CHANNELS.map(channel => {
      const channelProducts = filteredProducts.filter(p => p.marketplace === channel)
      const revenue = channelProducts.reduce((acc, p) => acc + p.precoVenda, 0)
      const profit = channelProducts.reduce((acc, p) => acc + p.lucroLiquido, 0)
      return {
        name: channel,
        receita: Math.round(revenue),
        lucro: Math.round(profit)
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

  const getRangeText = () => {
    if (timeRange === 'hoje') return 'do dia'
    if (timeRange === 'semana') return 'da semana'
    if (timeRange === 'mes') return 'do mês'
    return ''
  }

  const getContextText = () => {
    let text = getRangeText()
    if (selectedChannel !== 'all') text += ` em ${selectedChannel}`
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
            <Clock className="h-3 w-3" /> {mounted ? currentTime : "--:--"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> Período
            </label>
            <div className="flex gap-1 bg-secondary/30 p-1 rounded-xl">
              <button onClick={() => setTimeRange('hoje')} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", timeRange === 'hoje' ? "bg-primary text-white" : "text-muted-foreground")}>Hoje</button>
              <button onClick={() => setTimeRange('semana')} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", timeRange === 'semana' ? "bg-primary text-white" : "text-muted-foreground")}>Semana</button>
              <button onClick={() => setTimeRange('mes')} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", timeRange === 'mes' ? "bg-primary text-white" : "text-muted-foreground")}>Mês</button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" /> Canal
            </label>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger className="bg-secondary/50 border-white/5 h-11 font-bold">
                <SelectValue placeholder="Todos os canais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Consolidado (Todos os Canais)</SelectItem>
                {CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3 w-3" /> Origem
            </label>
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="bg-secondary/50 border-white/5 h-11 font-bold">
                <SelectValue placeholder="Todas as origens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Consolidado (Todas as Origens)</SelectItem>
                <SelectItem value="API">Canais via API</SelectItem>
                <SelectItem value="Manual">Arquivos Manuais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
          description={`Média global`}
        />
        <KpiCard 
          title="Score Estratégico" 
          value={`${metrics.scoreMedio.toFixed(2)} / 3.0`} 
          icon={LayoutGrid} 
          description="Saúde do catálogo"
        />
      </div>

      {/* Comparison Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
              <TrendingUp className="h-5 w-5 text-emerald-500" /> Comparativo de Faturamento
            </CardTitle>
            <CardDescription>Performance vs Período Anterior</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: 'none', borderRadius: '12px' }} />
                    <Bar dataKey="faturamento" name="Faturamento" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
              <PieChartIcon className="h-5 w-5 text-accent" /> Participação por Canal
            </CardTitle>
            <CardDescription>Contribuição na Receita Total</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[300px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={channelDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {channelDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="w-full grid grid-cols-2 gap-2 mt-4">
              {channelDistributionData.slice(0, 6).map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-[10px] font-black uppercase truncate max-w-[80px]">{item.name}</span>
                  <span className="text-[10px] font-bold text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
