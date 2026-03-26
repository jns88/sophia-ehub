
"use client"

import { useState, useMemo, useEffect } from "react"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { KpiCard } from "@/components/kpi-card"
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  AlertCircle,
  Clock,
  Calendar,
  Filter,
  Info,
  Users,
  MousePointerClick,
  ShoppingCart,
  CheckCircle2,
  Receipt,
  Target,
  UserPlus,
  Maximize2,
  Minimize2,
  BarChart3,
  ArrowRight,
  LineChart as LineChartIcon,
  LayoutGrid
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { cn } from "@/lib/utils"
import { TimeRange, StoreMetrics } from "@/lib/types"
import { useSidebar } from "@/components/ui/sidebar"

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
  const { setOpen } = useSidebar()
  const [selectedChannel, setSelectedChannel] = useState("all")
  const [selectedSource, setSelectedSource] = useState("all")
  const [timeRange, setTimeRange] = useState<TimeRange>("mes")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [currentTime, setCurrentTime] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [trendMetric, setTrendMetric] = useState("traffic")

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

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(e => console.error(e))
      setOpen(false)
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
      setOpen(true)
    }
    setIsFullscreen(!isFullscreen)
  }

  // Handle ESC key for fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
        setOpen(true)
      }
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [setOpen])

  const filteredProducts = useMemo(() => {
    if (!mounted) return [];
    let multiplier = 1
    if (timeRange === 'hoje') multiplier = 0.03
    if (timeRange === 'semana') multiplier = 0.22
    if (timeRange === 'mes') multiplier = 1
    if (timeRange === 'ano') multiplier = 12

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
      }))
  }, [selectedChannel, selectedSource, timeRange, mounted])
  
  const metrics = useMemo(() => {
    const products = filteredProducts
    if (products.length === 0) return {
      receitaTotal: 0, lucroLiquidoTotal: 0, margemMedia: 0, roasMedio: 0, 
      totalProdutos: 0, produtosAprovados: 0, produtosAtencao: 0, produtosCriticos: 0,
      scoreMedio: 0
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

    return {
      receitaTotal, lucroLiquidoTotal, margemMedia, roasMedio,
      totalProdutos, produtosAprovados, produtosAtencao, produtosCriticos,
      scoreMedio
    }
  }, [filteredProducts])

  // New Operational Metrics (Aggregated/Mocked for prototype)
  const storeMetrics: StoreMetrics = useMemo(() => {
    let baseTraffic = 45000;
    if (timeRange === 'hoje') baseTraffic = 1500;
    if (timeRange === 'semana') baseTraffic = 10000;
    if (timeRange === 'ano') baseTraffic = 540000;

    return {
      traffic: baseTraffic,
      conversionRate: 2.4,
      abandonedCarts: Math.floor(baseTraffic * 0.12),
      salesCount: Math.floor(baseTraffic * 0.024),
      approvalRate: 94.2,
      roi: 3.8,
      rejectionRate: 1.8,
      averageTicket: metrics.receitaTotal / (baseTraffic * 0.024 || 1),
      cac: 45.50,
      ltv: 850.00
    }
  }, [timeRange, metrics.receitaTotal])

  const chartData = useMemo(() => [
    { name: 'Seg', traffic: 4200, sales: 120, conversion: 2.1 },
    { name: 'Ter', traffic: 5100, sales: 145, conversion: 2.4 },
    { name: 'Qua', traffic: 4800, sales: 130, conversion: 2.2 },
    { name: 'Qui', traffic: 5900, sales: 180, conversion: 2.8 },
    { name: 'Sex', traffic: 6200, sales: 210, conversion: 3.1 },
    { name: 'Sáb', traffic: 3800, sales: 90, conversion: 1.9 },
    { name: 'Dom', traffic: 3500, sales: 85, conversion: 1.8 },
  ], [])

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

  const pipelineData = [
    { name: 'Tráfego', value: storeMetrics.traffic, fill: '#7070C2' },
    { name: 'Conversão', value: Math.floor(storeMetrics.traffic * 0.15), fill: '#63DBFF' },
    { name: 'Carrinhos', value: storeMetrics.abandonedCarts, fill: '#F59E0B' },
    { name: 'Aprovados', value: Math.floor(storeMetrics.salesCount * 0.94), fill: '#10B981' },
    { name: 'Vendas', value: storeMetrics.salesCount, fill: '#F43F5E' },
  ]

  return (
    <div className={cn("space-y-8 animate-in fade-in duration-700", isFullscreen && "fixed inset-0 z-[100] bg-background p-10 overflow-auto h-screen w-screen")}>
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-2xl border border-white/5 shadow-2xl">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight font-headline">Hub analítico para ajudar a vida do Jonas</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-6 px-3 font-mono text-[10px] border-primary/20 text-primary bg-primary/5 flex items-center gap-2">
              <Clock className="h-3 w-3" /> {mounted ? currentTime : "--:--"}
            </Badge>
            <p className="text-muted-foreground text-sm font-medium">Controle operacional em tempo real.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-secondary/30 p-1 rounded-xl">
            {['hoje', 'semana', 'mes', 'ano'].map((range) => (
              <button 
                key={range}
                onClick={() => setTimeRange(range as TimeRange)} 
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all", 
                  timeRange === range ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white/5"
                )}
              >
                {range === 'mes' ? 'Mês' : range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-[180px] bg-secondary/50 border-white/5 h-11 font-bold">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Consolidado</SelectItem>
              {CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="icon" 
            className="h-11 w-11 rounded-xl border-white/10"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* 10 Strategic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Tráfego" value={storeMetrics.traffic.toLocaleString()} icon={Users} description="Visitas únicas" accent />
        <KpiCard title="Taxa de Conversão" value={`${storeMetrics.conversionRate}%`} icon={MousePointerClick} description="Sessões com venda" />
        <KpiCard title="Carrinhos Aband." value={storeMetrics.abandonedCarts.toLocaleString()} icon={ShoppingCart} description="Perda no checkout" trend={{ value: 12, positive: false }} />
        <KpiCard title="Número de Vendas" value={storeMetrics.salesCount.toLocaleString()} icon={Receipt} description="Pedidos totais" accent />
        <KpiCard title="Aprovação" value={`${storeMetrics.approvalRate}%`} icon={CheckCircle2} description="Pagamentos confirmados" />
        
        <KpiCard title="ROI" value={`${storeMetrics.roi}x`} icon={Target} description="Retorno investimento" accent />
        <KpiCard title="Taxa de Rejeição" value={`${storeMetrics.rejectionRate}%`} icon={AlertCircle} description="Bounce rate" trend={{ value: 5, positive: true }} />
        <KpiCard title="Ticket Médio" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(storeMetrics.averageTicket)} icon={DollarSign} description="Valor por pedido" />
        <KpiCard title="CAC" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(storeMetrics.cac)} icon={UserPlus} description="Custo de aquisição" />
        <KpiCard title="Lifetime Value (LTV)" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(storeMetrics.ltv)} icon={TrendingUp} description="Valor vitalício cliente" accent />
      </div>

      {/* Main Charts & Pipeline */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Pipeline Section */}
        <Card className="glass-card xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
              <LayoutGrid className="h-5 w-5 text-primary" /> Pipeline de Vendas
            </CardTitle>
            <CardDescription>Fluxo do tráfego à conversão final</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {pipelineData.map((step, i) => (
                <div key={step.name} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{step.name}</span>
                    <span className="text-xs font-black">{step.value.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000" 
                      style={{ 
                        width: `${(step.value / storeMetrics.traffic) * 100}%`,
                        backgroundColor: step.fill
                      }} 
                    />
                  </div>
                  {i < pipelineData.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowRight className="h-3 w-3 text-muted-foreground/30 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Trend Chart */}
        <Card className="glass-card xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
                <LineChartIcon className="h-5 w-5 text-accent" /> Evolução de Performance
              </CardTitle>
              <CardDescription>Análise temporal de KPIs selecionados</CardDescription>
            </div>
            <Select value={trendMetric} onValueChange={setTrendMetric}>
              <SelectTrigger className="w-[140px] h-9 text-xs bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="traffic">Tráfego</SelectItem>
                <SelectItem value="sales">Vendas</SelectItem>
                <SelectItem value="conversion">Conversão %</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: 'none', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }} 
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={trendMetric} 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorMetric)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-channel Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
              <BarChart3 className="h-5 w-5 text-emerald-500" /> Distribuição de Receita por Canal
            </CardTitle>
            <CardDescription>Participação de mercado interna</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={channelDistributionData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={90} 
                      paddingAngle={5} 
                      dataKey="value"
                    >
                      {channelDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
              {channelDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black uppercase truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
              <TrendingUp className="h-5 w-5 text-primary" /> Curva ABC e Alertas
            </CardTitle>
            <CardDescription>Monitoramento preventivo do catálogo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Classe A</p>
                <p className="text-2xl font-black">{metrics.produtosAprovados}</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Classe B</p>
                <p className="text-2xl font-black">{metrics.produtosAtencao}</p>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Classe C</p>
                <p className="text-2xl font-black">{metrics.produtosCriticos}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                <div>
                  <p className="text-xs font-black uppercase">Risco de Ruptura</p>
                  <p className="text-[10px] text-muted-foreground">3 produtos da Classe A com estoque baixo.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Info className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs font-black uppercase">Oportunidade Ads</p>
                  <p className="text-[10px] text-muted-foreground">ROAS orgânico em 2 SKUs Classe B acima de 5x.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
