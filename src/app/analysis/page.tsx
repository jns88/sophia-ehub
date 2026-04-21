"use client"

import { useState, useMemo, useEffect } from "react"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Target, AlertTriangle, Database, PieChart as PieIcon, Globe, Loader2, ListOrdered, ChevronRight, Zap, Package, ShoppingBag, Receipt, DollarSign, TrendingUp } from "lucide-react"
import { Product, StatePerformance } from "@/lib/types"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { fetchGeoPerformanceData } from "@/lib/geo-analysis"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function AnalysisPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("panorama")
  const [selectedChannel, setSelectedChannel] = useState("all")
  const [selectedABC, setSelectedABC] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOrigin, setSelectedOrigin] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [chartMetric, setChartMetric] = useState("faturamento")
  const [mounted, setMounted] = useState(false)
  const [selectedUF, setSelectedUF] = useState<string | null>(null)

  // Geo API Integration States
  const [geoRawData, setGeoRawData] = useState<any[]>([])
  const [isGeoLoading, setIsGeoLoading] = useState(false)
  const [geoOrigin, setGeoOrigin] = useState<'api' | 'local' | 'fallback'>('local')

  useEffect(() => {
    setMounted(true)
    const now = new Date();
    const currentYearNum = now.getFullYear();
    const yearsList = Array.from({ length: 5 }, (_, i) => (currentYearNum - 2 + i).toString());
    setAvailableYears(yearsList);
    setSelectedMonth((now.getMonth() + 1).toString().padStart(2, '0'));
    setSelectedYear(currentYearNum.toString());
  }, [])

  // Lazy Loading for Geo Data
  useEffect(() => {
    if (activeTab === 'geografico' && geoRawData.length === 0 && !isGeoLoading) {
      loadGeoData();
    }
  }, [activeTab])

  const loadGeoData = async () => {
    console.time("geo_data_fetch");
    setIsGeoLoading(true);
    try {
      const { data, origin } = await fetchGeoPerformanceData(MOCK_PRODUCTS as Product[]);
      setGeoRawData(data);
      setGeoOrigin(origin);

      if (origin === 'fallback') {
        toast({
          title: "Dados em Tempo Real Indisponíveis",
          description: "Falha na conexão com a API. Exibindo base de dados local para auditoria.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to load geo data", error);
    } finally {
      setIsGeoLoading(false);
      console.timeEnd("geo_data_fetch");
    }
  };

  const products = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchChannel = selectedChannel === "all" || p.marketplace === selectedChannel
      const matchABC = selectedABC === "all" || p.classificacaoABC === selectedABC
      const matchStatus = selectedStatus === "all" || p.status === selectedStatus
      const matchOrigin = selectedOrigin === "all" || p.origemDados === selectedOrigin
      return matchChannel && matchABC && matchStatus && matchOrigin
    })
  }, [selectedChannel, selectedABC, selectedStatus, selectedOrigin])
  
  const rankingLucro = useMemo(() => {
    return [...products].sort((a, b) => b.lucroLiquido - a.lucroLiquido)
  }, [products])
  
  const monthlyData = useMemo(() => [
    { name: 'Jan', faturamento: 45000, lucro: 8000, margem: 17, roas: 4.2 },
    { name: 'Fev', faturamento: 52000, lucro: 12000, margem: 23, roas: 4.5 },
    { name: 'Mar', faturamento: 48000, lucro: 9000, margem: 19, roas: 4.1 },
    { name: 'Abr', faturamento: 61000, lucro: 15000, margem: 24, roas: 4.8 },
    { name: 'Mai', faturamento: 55000, lucro: 11000, margem: 20, roas: 4.3 },
    { name: 'Jun', faturamento: 67000, lucro: 18000, margem: 26, roas: 5.2 },
  ], [])

  const abcData = useMemo(() => {
    const totalRevenue = products.reduce((acc, p) => acc + (p.precoVenda * p.quantidade), 0);
    const aProducts = products.filter(p => p.classificacaoABC === 'A');
    const bProducts = products.filter(p => p.classificacaoABC === 'B');
    const cProducts = products.filter(p => p.classificacaoABC === 'C');

    const aRev = aProducts.reduce((acc, p) => acc + (p.precoVenda * p.quantidade), 0);
    const bRev = bProducts.reduce((acc, p) => acc + (p.precoVenda * p.quantidade), 0);
    const cRev = cProducts.reduce((acc, p) => acc + (p.precoVenda * p.quantidade), 0);

    return [
      { name: 'Classe A', value: aProducts.length, revenue: aRev, pct: totalRevenue ? (aRev/totalRevenue)*100 : 0, color: '#F43F5E' },
      { name: 'Classe B', value: bProducts.length, revenue: bRev, pct: totalRevenue ? (bRev/totalRevenue)*100 : 0, color: '#F59E0B' },
      { name: 'Classe C', value: cProducts.length, revenue: cRev, pct: totalRevenue ? (cRev/totalRevenue)*100 : 0, color: '#3B82F6' },
    ]
  }, [products])

  const stateAggregation = useMemo(() => {
    console.time("state_aggregation");
    const dataToAggregate = geoRawData.length > 0 ? geoRawData : products;
    const agg: Record<string, StatePerformance> = {};
    
    dataToAggregate.forEach(p => {
      const uf = String(p.estado || 'N/A').toUpperCase();
      if (!uf || uf === 'UNDEFINED' || uf === 'N/A') return;
      
      if (!agg[uf]) {
        agg[uf] = {
          estado: uf,
          faturamento: 0,
          pedidos: 0,
          itens: 0,
          ticketMedio: 0,
          dominantChannel: ''
        };
      }
      
      const faturamentoItem = p.faturamento || (p.precoVenda * (p.quantidade || 1));
      agg[uf].faturamento += faturamentoItem;
      agg[uf].pedidos += (p.pedidos || 1); 
      agg[uf].itens += (p.quantidade || 1);
    });

    const sorted = Object.values(agg).sort((a, b) => b.faturamento - a.faturamento);
    const totalRevenue = sorted.reduce((acc, curr) => acc + curr.faturamento, 0);
    let accumulatedRevenue = 0;

    const result = sorted.map(state => {
      accumulatedRevenue += state.faturamento;
      const ratio = accumulatedRevenue / (totalRevenue || 1);
      
      let classification: 'A' | 'B' | 'C' = 'C';
      if (ratio <= 0.8) classification = 'A';
      else if (ratio <= 0.95) classification = 'B';

      return { 
        ...state, 
        pareto_class: classification,
        ticketMedio: state.pedidos > 0 ? state.faturamento / state.pedidos : 0
      };
    });
    console.timeEnd("state_aggregation");
    return result;
  }, [products, geoRawData])

  const selectedStateData = useMemo(() => {
    if (!selectedUF) return null;
    return stateAggregation.find(s => s.estado === selectedUF) || null;
  }, [selectedUF, stateAggregation])

  const selectedStateChannels = useMemo(() => {
    if (!selectedUF) return [];
    console.time(`channels_uf_${selectedUF}`);
    const data = geoRawData.length > 0 ? geoRawData : products;
    const stateData = data.filter(p => String(p.estado || 'N/A').toUpperCase() === selectedUF);
    
    const channelMap: Record<string, number> = {};
    stateData.forEach(p => {
      const channel = p.marketplace || p.canal || 'Canal não identificado';
      if (!channelMap[channel]) channelMap[channel] = 0;
      channelMap[channel] += (p.faturamento || (p.precoVenda * (p.quantidade || 1)));
    });

    const total = Object.values(channelMap).reduce((acc, v) => acc + v, 0);
    const result = Object.entries(channelMap).map(([channel, revenue]) => ({
        channel,
        revenue,
        percentage: (revenue / total) * 100
    })).sort((a, b) => b.revenue - a.revenue);
    
    console.timeEnd(`channels_uf_${selectedUF}`);
    return result;
  }, [selectedUF, products, geoRawData]);

  const selectedStateProducts = useMemo(() => {
    if (!selectedUF) return [];
    console.time(`pareto_uf_${selectedUF}`);
    
    const dataToFilter = geoRawData.length > 0 ? geoRawData : products;
    const stateProds = dataToFilter.filter(p => String(p.estado || 'N/A').toUpperCase() === selectedUF);
    
    const sortedProds = [...stateProds].sort((a, b) => {
      const fatA = a.faturamento || (a.precoVenda * (a.quantidade || 1));
      const fatB = b.faturamento || (b.precoVenda * (b.quantidade || 1));
      return fatB - fatA;
    });
    
    const totalStateRevenue = sortedProds.reduce((acc, p) => acc + (p.faturamento || (p.precoVenda * (p.quantidade || 1))), 0);
    let accumulatedStateRevenue = 0;

    const mapped = sortedProds.map(p => {
      const currentFat = p.faturamento || (p.precoVenda * (p.quantidade || 1));
      accumulatedStateRevenue += currentFat;
      const ratio = accumulatedStateRevenue / (totalStateRevenue || 1);
      let classification: 'A' | 'B' | 'C' = 'C';
      if (ratio <= 0.8) classification = 'A';
      else if (ratio <= 0.95) classification = 'B';
      
      return {
        sku: p.sku,
        nomeProduto: p.nomeProduto || p.produto,
        marketplace: p.marketplace || p.canal,
        local_abc: classification,
        faturamento_total: currentFat,
        quantidade: p.quantidade || 1,
        margemPercentual: p.margemPercentual || p.margem || 0
      }
    });

    const a = mapped.filter(p => p.local_abc === 'A').slice(0, 3);
    const b = mapped.filter(p => p.local_abc === 'B').slice(0, 2);
    const c = mapped.filter(p => p.local_abc === 'C').slice(0, 1);

    console.timeEnd(`pareto_uf_${selectedUF}`);
    return [...a, ...b, ...c];
  }, [selectedUF, products, geoRawData])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-2xl border border-border shadow-2xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight font-headline text-foreground">Análises Estratégicas</h1>
          <p className="text-muted-foreground font-medium">Panorama completo de rentabilidade e Curva ABC.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {mounted && (
            <>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[120px] bg-secondary/50 border-border h-10 font-bold text-foreground">
                  <SelectValue placeholder="Mês" />
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
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] bg-secondary/50 border-border h-10 font-bold text-foreground">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-[160px] bg-secondary/50 border-border h-10 font-bold text-foreground">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Canais</SelectItem>
              <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
              <SelectItem value="Amazon">Amazon</SelectItem>
              <SelectItem value="Shopee">Shopee</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border p-1 h-12">
          <TabsTrigger value="panorama" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-8 h-10">Panorama Geral</TabsTrigger>
          <TabsTrigger value="abc" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-8 h-10">Curva ABC (Pareto)</TabsTrigger>
          <TabsTrigger value="geografico" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-8 h-10">Regional</TabsTrigger>
          <TabsTrigger value="origin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-8 h-10">Origem & Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="geografico" className="space-y-6">
          <Card className="glass-card border-none shadow-2xl">
            <CardHeader className="p-8">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter text-foreground">
                      <ListOrdered className="h-6 w-6 text-primary" /> Performance Regional por Estado
                    </CardTitle>
                    {isGeoLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    {geoOrigin !== 'local' && (
                      <Badge variant="secondary" className="text-[8px] font-black uppercase bg-primary/20 text-primary">
                        {geoOrigin === 'api' ? 'API Real-Time' : 'Fallback Local'}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Distribuição de faturamento, pedidos e ticket médio por UF.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stateAggregation.length > 0 ? stateAggregation.map((state) => (
                  <div 
                    key={state.estado} 
                    className={cn(
                      "group relative p-6 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-95 flex flex-col justify-between",
                      state.pareto_class === 'A' ? "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40" : 
                      state.pareto_class === 'B' ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" : 
                      "bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30",
                      selectedUF === state.estado && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedUF(state.estado)}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg text-white",
                            state.pareto_class === 'A' ? "bg-rose-500" : 
                            state.pareto_class === 'B' ? "bg-amber-500" : 
                            "bg-blue-500"
                          )}>
                            {state.estado}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{state.estado}</p>
                            <Badge variant="outline" className={cn(
                              "text-[8px] font-black uppercase px-2 h-5",
                              state.pareto_class === 'A' ? "border-rose-500 text-rose-500" : 
                              state.pareto_class === 'B' ? "border-amber-500 text-amber-500" : 
                              "border-blue-500 text-blue-500"
                            )}>
                              Classe {state.pareto_class}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Faturamento</p>
                          <p className="text-xl font-black font-mono text-foreground">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(state.faturamento)}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                          <div>
                            <p className="text-[8px] font-black uppercase text-muted-foreground">Pedidos</p>
                            <p className="text-xs font-black text-foreground">{state.pedidos}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-black uppercase text-muted-foreground">Ticket Médio</p>
                            <p className="text-xs font-black font-mono text-primary">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(state.ticketMedio)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : !isGeoLoading && (
                  <div className="col-span-full py-20 text-center opacity-40">
                     <Globe className="h-8 w-8 mx-auto mb-2" />
                     <p className="text-[10px] font-black uppercase">Nenhum dado regional encontrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="panorama" className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-4 w-4 text-primary" /> Panorama de Performance Mensal
                  </CardTitle>
                  <CardDescription>Análise temporal de KPIs fundamentais.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                          wrapperClassName="chart-tooltip"
                        />
                        <Line type="monotone" dataKey={chartMetric} name={chartMetric.charAt(0).toUpperCase() + chartMetric.slice(1)} stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                  <Target className="h-4 w-4 text-accent" /> Top SKUs por Lucro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rankingLucro.slice(0, 7).map((p, i) => (
                    <div key={p.sku} className="flex items-center justify-between group p-3 rounded-xl hover:bg-secondary transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-muted-foreground/30">0{i+1}</span>
                        <div className="truncate max-w-[140px]">
                          <p className="text-[11px] font-black truncate uppercase text-foreground">{p.nomeProduto}</p>
                          <p className="text-[9px] text-muted-foreground font-bold">{p.marketplace}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-emerald-500 font-mono">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.lucroLiquido)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="abc" className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card lg:col-span-1 flex flex-col justify-center items-center p-8">
              <CardHeader className="text-center p-0 mb-6">
                <CardTitle className="text-lg flex items-center gap-2 font-black uppercase tracking-tighter text-foreground">
                  <PieIcon className="h-5 w-5 text-accent" /> Composição Pareto
                </CardTitle>
                <CardDescription>Segmentação estratégica do catálogo.</CardDescription>
              </CardHeader>
              <div className="h-[250px] w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={abcData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {abcData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        wrapperClassName="chart-tooltip"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 w-full mt-8">
                {abcData.map(item => (
                  <div key={item.name} className="text-center">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">{item.name}</p>
                    <p className="text-xl font-black text-foreground">{item.value} Prod.</p>
                    <p className="text-[8px] text-accent/70 uppercase font-bold">{item.pct.toFixed(0)}% Faturam.</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-card lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter text-foreground">Produtos Segmentados</CardTitle>
                  <CardDescription>Listagem detalhada de rentabilidade por Classe ABC.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border">
                      <TableHead className="font-black uppercase text-[10px] py-4 px-8 text-muted-foreground">Produto</TableHead>
                      <TableHead className="font-black uppercase text-[10px] py-4 text-muted-foreground">Faturamento</TableHead>
                      <TableHead className="text-right font-black uppercase text-[10px] py-4 px-8 text-muted-foreground">Margem %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.slice(0, 12).map(p => (
                      <TableRow key={p.sku} className="border-border hover:bg-muted/50">
                        <TableCell className="py-4 px-8">
                          <p className="text-xs font-black truncate max-w-[200px] text-foreground">{p.nomeProduto}</p>
                          <p className="font-mono text-[9px] text-muted-foreground uppercase">{p.sku} • {p.marketplace}</p>
                        </TableCell>
                        <TableCell className="py-4 font-mono text-xs text-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.precoVenda * p.quantidade)}</TableCell>
                        <TableCell className="text-right text-accent font-black py-4 px-8">{p.margemPercentual.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="origin" className="space-y-6">
          <Card className="glass-card border-none">
            <CardHeader className="p-8">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black flex items-center gap-3 text-foreground">
                    <AlertTriangle className="h-6 w-6 text-rose-500" /> Auditoria de Origem e Alertas
                  </CardTitle>
                  <CardDescription>Monitoramento de integridade e rentabilidade por SKU.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border">
                    <TableHead className="font-black uppercase text-[10px] py-6 px-8 tracking-widest text-muted-foreground">Produto / SKU</TableHead>
                    <TableHead className="font-black uppercase text-[10px] py-6 tracking-widest text-muted-foreground">Origem</TableHead>
                    <TableHead className="font-black uppercase text-[10px] py-6 tracking-widest text-muted-foreground">Motivo</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] py-6 px-8 tracking-widest text-muted-foreground">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.filter(p => p.status !== 'APROVADO').map(p => (
                    <TableRow key={p.sku} className="border-border hover:bg-rose-500/5 transition-all">
                      <TableCell className="py-6 px-8">
                        <p className="text-sm font-black text-foreground">{p.nomeProduto}</p>
                        <p className="text-[10px] text-accent font-bold uppercase">{p.marketplace}</p>
                      </TableCell>
                      <TableCell className="py-6">
                        <Badge variant="outline" className="text-[10px] font-bold flex items-center gap-1.5 w-fit bg-secondary/50 border-border text-foreground">
                          <Database className="h-3 w-3" /> {p.origemDados}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-6">
                        {p.margemPercentual < 0 ? (
                          <Badge variant="destructive" className="text-[9px] font-black uppercase">Prejuízo Líquido</Badge>
                        ) : p.reclamacaoPercentual > 3 ? (
                          <Badge variant="outline" className="text-[9px] border-amber-500 text-amber-500 font-black uppercase">Reclamações Altas</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] border-border text-muted-foreground font-black uppercase">Baixa Rentabilidade</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-6 px-8">
                        <span className="text-[10px] bg-primary/20 text-primary px-3 py-1.5 rounded-lg font-black uppercase cursor-pointer hover:bg-primary/30 transition-all">Ação Necessária</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedUF} onOpenChange={(open) => !open && setSelectedUF(null)}>
        <SheetContent className="glass-card border-none w-full sm:max-w-2xl p-0 overflow-y-auto">
          {selectedStateData && (
            <div className="p-8 space-y-10 h-full">
              <SheetHeader className="text-left">
                <div className="flex items-center gap-4 mb-2">
                  <div className={cn(
                    "h-16 w-16 rounded-3xl flex items-center justify-center font-black text-2xl text-white shadow-2xl",
                    selectedStateData.pareto_class === 'A' ? "bg-rose-500" : 
                    selectedStateData.pareto_class === 'B' ? "bg-amber-500" : 
                    "bg-blue-500"
                  )}>
                    {selectedStateData.estado}
                  </div>
                  <div>
                    <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-foreground">Detalhamento Regional</SheetTitle>
                    <SheetDescription asChild>
                       <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] font-black px-2 py-0.5 border-border uppercase text-foreground">Estado: {selectedUF}</Badge>
                          <Badge className={cn(
                            "text-[10px] font-black px-2 py-0.5 uppercase text-white",
                            selectedStateData.pareto_class === 'A' ? "bg-rose-500" : 
                            selectedStateData.pareto_class === 'B' ? "bg-amber-500" : 
                            "bg-blue-500"
                          )}>Classe {selectedStateData.pareto_class} Pareto</Badge>
                       </div>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* KPIs do Estado */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/40 p-5 rounded-2xl border border-border space-y-2">
                  <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-3 w-3" /> Faturamento</p>
                  <p className="text-xl font-black font-mono text-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedStateData.faturamento)}</p>
                </div>
                <div className="bg-secondary/40 p-5 rounded-2xl border border-border space-y-2">
                  <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Receipt className="h-3 w-3" /> Pedidos</p>
                  <p className="text-2xl font-black text-foreground">{selectedStateData.pedidos}</p>
                </div>
                <div className="bg-secondary/40 p-5 rounded-2xl border border-border space-y-2">
                  <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> Ticket Médio</p>
                  <p className="text-xl font-black font-mono text-accent">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedStateData.ticketMedio)}</p>
                </div>
              </div>

              {/* Análise por Canal */}
              <div className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> Marketshare Regional por Canal
                 </h3>
                 <div className="rounded-2xl border border-border overflow-hidden bg-muted/20">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow className="border-border">
                          <TableHead className="font-black uppercase text-[10px] py-4 px-6 text-muted-foreground">Canal</TableHead>
                          <TableHead className="font-black uppercase text-[10px] py-4 text-muted-foreground">Faturamento</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] py-4 px-6 text-muted-foreground">% Part.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedStateChannels.map(item => (
                          <TableRow key={item.channel} className="border-border">
                            <TableCell className="py-4 px-6 font-bold text-xs text-foreground">{item.channel}</TableCell>
                            <TableCell className="py-4 font-mono text-xs text-foreground/80">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.revenue)}</TableCell>
                            <TableCell className="text-right py-4 px-6">
                               <Badge variant="secondary" className="text-[10px] font-black bg-secondary border-border text-foreground">{item.percentage.toFixed(1)}%</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                 </div>
              </div>

              <Separator className="bg-border" />

              {/* Pareto ABC (TOP PRODUTOS DO ESTADO) */}
              <div className="space-y-6 pb-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Pareto Regional: Top SKUs
                  </h3>
                  <Badge variant="outline" className="text-[9px] opacity-50 uppercase font-black text-muted-foreground">{selectedStateProducts.length} Produtos Recomendados</Badge>
                </div>

                <div className="space-y-4">
                  {selectedStateProducts.map((p, i) => (
                    <div key={p.sku} className="group bg-muted/20 border border-border p-6 rounded-2xl hover:bg-muted/40 hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-muted-foreground/30">#0{i+1}</span>
                          <div>
                            <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{p.nomeProduto}</p>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase">{p.sku} • {p.marketplace}</p>
                          </div>
                        </div>
                        <Badge className={cn(
                          "text-[9px] font-black uppercase text-white",
                          p.local_abc === 'A' ? "bg-rose-500" : 
                          p.local_abc === 'B' ? "bg-amber-500" : 
                          "bg-blue-500"
                        )}>
                          Classe {p.local_abc} (Local)
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase text-muted-foreground">Faturamento</p>
                          <p className="text-xs font-black font-mono text-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.faturamento_total)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase text-muted-foreground">Qtde</p>
                          <p className="text-xs font-black text-foreground">{p.quantidade} un.</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[8px] font-black uppercase text-muted-foreground">Margem</p>
                          <p className={cn(
                            "text-xs font-black font-mono",
                            p.margemPercentual > 20 ? "text-emerald-500" : "text-rose-500"
                          )}>{p.margemPercentual.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedStateProducts.length === 0 && (
                    <div className="py-20 text-center opacity-30 flex flex-col items-center gap-3">
                      <Package className="h-10 w-10" />
                      <p className="text-xs font-black uppercase">Nenhum produto com faturamento registrado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
