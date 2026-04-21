"use client"

import { useState, useMemo, useEffect } from "react"
import { MOCK_PRODUCTS, DEFAULT_COMPANY_ID } from "@/lib/mock-data"
import { KpiCard } from "@/components/kpi-card"
import { 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
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
  LayoutGrid,
  FileSpreadsheet,
  PackagePlus,
  Zap,
  Info
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts'
import { cn } from "@/lib/utils"
import { TimeRange, StoreMetrics, Product } from "@/lib/types"
import { useSidebar } from "@/components/ui/sidebar"
import Link from "next/link"

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
  const [timeRange, setTimeRange] = useState<TimeRange>("mes")
  const [mounted, setMounted] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [trendMetric, setTrendMetric] = useState("traffic")
  const [activeCompanyId, setActiveCompanyId] = useState<string>(DEFAULT_COMPANY_ID)
  const [companyProducts, setCompanyProducts] = useState<Product[]>([])

  useEffect(() => {
    setMounted(true)
    
    // Simular atraso de carregamento para demonstrar skeletons de forma progressiva
    const timer = setTimeout(() => {
      const savedActiveId = localStorage.getItem('sophia_active_company_id');
      const finalId = savedActiveId || DEFAULT_COMPANY_ID;
      setActiveCompanyId(finalId);
      
      const stored = localStorage.getItem(`sophia_products_${finalId}`);
      if (stored) {
        setCompanyProducts(JSON.parse(stored));
      } else if (finalId === DEFAULT_COMPANY_ID) {
        setCompanyProducts(MOCK_PRODUCTS);
        localStorage.setItem(`sophia_products_${DEFAULT_COMPANY_ID}`, JSON.stringify(MOCK_PRODUCTS));
      } else {
        setCompanyProducts([]);
      }
      setIsInitialLoading(false);
    }, 800);

    return () => clearTimeout(timer);
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

  const filteredProducts = useMemo(() => {
    if (!mounted || companyProducts.length === 0) return [];
    
    let multiplier = 1
    if (timeRange === 'hoje') multiplier = 0.03
    if (timeRange === 'semana') multiplier = 0.22
    if (timeRange === 'mes') multiplier = 1
    if (timeRange === 'ano') multiplier = 12

    return companyProducts
      .filter(p => selectedChannel === "all" || p.marketplace === selectedChannel)
      .map(p => ({
        ...p,
        precoVenda: p.precoVenda * multiplier,
        lucroLiquido: p.lucroLiquido * multiplier,
      }))
  }, [selectedChannel, timeRange, mounted, companyProducts])
  
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

  const storeMetrics: StoreMetrics = useMemo(() => {
    if (filteredProducts.length === 0) return {
      traffic: 0, conversionRate: 0, abandonedCarts: 0, salesCount: 0,
      approvalRate: 0, roi: 0, rejectionRate: 0, averageTicket: 0, cac: 0, ltv: 0
    };

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
  }, [timeRange, metrics.receitaTotal, filteredProducts])

  const channelDistributionData = useMemo(() => {
    if (filteredProducts.length === 0) return [];
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

  if (!mounted) return null;

  if (!isInitialLoading && companyProducts.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-2xl border border-border shadow-2xl">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-headline bg-gradient-to-r from-blue-700 via-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              Sophia E-Hub
            </h1>
            <p className="text-muted-foreground text-sm font-medium">A colega de trabalho que todo analista merecia ter.</p>
          </div>
        </div>

        <div className="min-h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl bg-card/30 p-12 text-center space-y-8">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <LayoutGrid className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-foreground">Nenhum dado carregado ainda</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Importe uma planilha ou adicione produtos manualmente para iniciar a análise.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="h-12 px-8 rounded-xl font-black">
              <Link href="/import">
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Importar Planilha
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-8 rounded-xl font-black border-border hover:bg-secondary">
              <Link href="/products">
                <PackagePlus className="h-4 w-4 mr-2" /> Adicionar Produto
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8 animate-in fade-in duration-700 pb-20", isFullscreen && "fixed inset-0 z-[100] bg-background p-10 overflow-auto h-screen w-screen")}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-2xl border border-border shadow-2xl">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-headline bg-gradient-to-r from-blue-700 via-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            Sophia E-Hub
          </h1>
          <p className="text-muted-foreground text-sm font-medium">A colega de trabalho que todo analista merecia ter.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-secondary/30 p-1 rounded-xl">
            {['hoje', 'semana', 'mes', 'ano'].map((range) => (
              <button 
                key={range}
                onClick={() => setTimeRange(range as TimeRange)} 
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all", 
                  timeRange === range ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {range === 'mes' ? 'Mês' : range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-[180px] bg-secondary/50 border-border h-11 font-bold text-foreground">
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
            className="h-11 w-11 rounded-xl border-border text-foreground"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard isLoading={isInitialLoading} title="Tráfego" value={storeMetrics.traffic.toLocaleString()} icon={Users} description="Visitas únicas" accent />
        <KpiCard isLoading={isInitialLoading} title="Taxa de Conversão" value={`${storeMetrics.conversionRate}%`} icon={MousePointerClick} description="Sessões com venda" />
        <KpiCard isLoading={isInitialLoading} title="Carrinhos Aband." value={storeMetrics.abandonedCarts.toLocaleString()} icon={ShoppingCart} description="Perda no checkout" trend={{ value: 12, positive: false }} />
        <KpiCard isLoading={isInitialLoading} title="Número de Vendas" value={storeMetrics.salesCount.toLocaleString()} icon={Receipt} description="Pedidos totais" accent />
        <KpiCard isLoading={isInitialLoading} title="Aprovação" value={`${storeMetrics.approvalRate}%`} icon={CheckCircle2} description="Pagamentos confirmados" />
        
        <KpiCard isLoading={isInitialLoading} title="ROI" value={`${storeMetrics.roi}x`} icon={Target} description="Retorno investimento" accent />
        <KpiCard isLoading={isInitialLoading} title="Taxa de Rejeição" value={`${storeMetrics.rejectionRate}%`} icon={AlertCircle} description="Bounce rate" trend={{ value: 5, positive: true }} />
        <KpiCard isLoading={isInitialLoading} title="Ticket Médio" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(storeMetrics.averageTicket)} icon={DollarSign} description="Valor por pedido" />
        <KpiCard isLoading={isInitialLoading} title="CAC" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(storeMetrics.cac)} icon={UserPlus} description="Custo de aquisição" />
        <KpiCard isLoading={isInitialLoading} title="Lifetime Value (LTV)" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(storeMetrics.ltv)} icon={TrendingUp} description="Valor vitalício cliente" accent />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="glass-card xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter text-foreground">
              <LayoutGrid className="h-5 w-5 text-primary" /> Pipeline de Vendas
            </CardTitle>
            <CardDescription>Fluxo do tráfego à conversão final</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isInitialLoading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16 card-loading" />
                      <Skeleton className="h-3 w-10 card-loading" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-full card-loading" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { name: 'Tráfego', value: storeMetrics.traffic, fill: '#7070C2' },
                  { name: 'Conversão', value: Math.floor(storeMetrics.traffic * 0.15), fill: '#63DBFF' },
                  { name: 'Carrinhos', value: storeMetrics.abandonedCarts, fill: '#F59E0B' },
                  { name: 'Aprovados', value: Math.floor(storeMetrics.salesCount * 0.94), fill: '#10B981' },
                  { name: 'Vendas', value: storeMetrics.salesCount, fill: '#F43F5E' },
                ].map((step, i) => (
                  <div key={step.name} className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{step.name}</span>
                      <span className="text-xs font-black text-foreground">{step.value.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000" 
                        style={{ 
                          width: `${(step.value / (storeMetrics.traffic || 1)) * 100}%`,
                          backgroundColor: step.fill
                        }} 
                      />
                    </div>
                    {i < 4 && (
                      <div className="flex justify-center my-1">
                        <ArrowRight className="h-3 w-3 text-muted-foreground/30 rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter text-foreground">
                <LineChartIcon className="h-5 w-5 text-accent" /> Evolução de Performance
              </CardTitle>
              <CardDescription>Análise temporal de KPIs selecionados</CardDescription>
            </div>
            {!isInitialLoading && (
              <Select value={trendMetric} onValueChange={setTrendMetric}>
                <SelectTrigger className="w-[140px] h-9 text-xs bg-secondary/50 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traffic">Tráfego</SelectItem>
                  <SelectItem value="sales">Vendas</SelectItem>
                  <SelectItem value="conversion">Conversão %</SelectItem>
                </SelectContent>
              </Select>
            )}
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <Skeleton className="h-[300px] w-full card-loading rounded-xl" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Seg', traffic: 4200, sales: 120, conversion: 2.1 },
                    { name: 'Ter', traffic: 5100, sales: 145, conversion: 2.4 },
                    { name: 'Qua', traffic: 4800, sales: 130, conversion: 2.2 },
                    { name: 'Qui', traffic: 5900, sales: 180, conversion: 2.8 },
                    { name: 'Sex', traffic: 6200, sales: 210, conversion: 3.1 },
                    { name: 'Sáb', traffic: 3800, sales: 90, conversion: 1.9 },
                    { name: 'Dom', traffic: 3500, sales: 85, conversion: 1.8 },
                  ]}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" x1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} 
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                      wrapperClassName="chart-tooltip"
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter text-foreground">
              <BarChart3 className="h-5 w-5 text-emerald-500" /> Distribuição por Canal
            </CardTitle>
            <CardDescription>Participação de mercado interna</CardDescription>
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Skeleton className="h-48 w-48 rounded-full card-loading" />
              </div>
            ) : (
              <div className="h-[300px] w-full">
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
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {channelDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      wrapperClassName="chart-tooltip"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" /> Saúde do Catálogo e Alertas
            </CardTitle>
            <CardDescription>Monitoramento preventivo de rentabilidade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Aprovados</p>
                {isInitialLoading ? <Skeleton className="h-8 w-10 mx-auto mt-1 card-loading" /> : <p className="text-2xl font-black text-emerald-500">{metrics.produtosAprovados}</p>}
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Atenção</p>
                {isInitialLoading ? <Skeleton className="h-8 w-10 mx-auto mt-1 card-loading" /> : <p className="text-2xl font-black text-amber-500">{metrics.produtosAtencao}</p>}
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Críticos</p>
                {isInitialLoading ? <Skeleton className="h-8 w-10 mx-auto mt-1 card-loading" /> : <p className="text-2xl font-black text-rose-500">{metrics.produtosCriticos}</p>}
              </div>
            </div>
            
            <div className="space-y-3">
              {isInitialLoading ? (
                <>
                  <Skeleton className="h-14 w-full rounded-xl card-loading" />
                  <Skeleton className="h-14 w-full rounded-xl card-loading" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <AlertCircle className="h-5 w-5 text-rose-500" />
                    <div>
                      <p className="text-xs font-black uppercase text-foreground">Ruptura Financeira</p>
                      <p className="text-[10px] text-muted-foreground">Detectados SKUs com margem negativa em escala.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs font-black uppercase text-foreground">Oportunidade de Escala</p>
                      <p className="text-[10px] text-muted-foreground">Classe A com ROAS acima da média detectada.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
