
"use client"

import { useState, useMemo, useEffect } from "react"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts'
import { Target, TrendingUp, AlertTriangle, Database, PieChart as PieIcon, BarChart3, Calendar, Globe, Award, Package, ArrowRight, Zap, Loader2, ListOrdered, ChevronRight } from "lucide-react"
import { Product, StatePerformance } from "@/lib/types"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { fetchGeoPerformanceData } from "@/lib/geo-analysis"
import { useToast } from "@/hooks/use-toast"

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
      } else if (origin === 'api') {
        toast({
          title: "Conexão Estabelecida",
          description: "Dados geográficos sincronizados via API com sucesso.",
        });
      }
    } catch (error) {
      console.error("Failed to load geo data", error);
    } finally {
      setIsGeoLoading(false);
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
  
  const rankingLucro = [...products].sort((a, b) => b.lucroLiquido - a.lucroLiquido)
  
  const monthlyData = useMemo(() => [
    { name: 'Jan', faturamento: 45000, lucro: 8000, margem: 17, roas: 4.2, rentabilidade: 18 },
    { name: 'Fev', faturamento: 52000, lucro: 12000, margem: 23, roas: 4.5, rentabilidade: 23 },
    { name: 'Mar', faturamento: 48000, lucro: 9000, margem: 19, roas: 4.1, rentabilidade: 19 },
    { name: 'Abr', faturamento: 61000, lucro: 15000, margem: 24, roas: 4.8, rentabilidade: 25 },
    { name: 'Mai', faturamento: 55000, lucro: 11000, margem: 20, roas: 4.3, rentabilidade: 20 },
    { name: 'Jun', faturamento: 67000, lucro: 18000, margem: 26, roas: 5.2, rentabilidade: 27 },
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
      { name: 'Classe A', value: aProducts.length, revenue: aRev, pct: totalRevenue ? (aRev/totalRevenue)*100 : 0, color: '#F43F5E', desc: '80% Faturamento' },
      { name: 'Classe B', value: bProducts.length, revenue: bRev, pct: totalRevenue ? (bRev/totalRevenue)*100 : 0, color: '#F59E0B', desc: '15% Faturamento' },
      { name: 'Classe C', value: cProducts.length, revenue: cRev, pct: totalRevenue ? (cRev/totalRevenue)*100 : 0, color: '#3B82F6', desc: '5% Faturamento' },
    ]
  }, [products])

  const stateAggregation = useMemo(() => {
    const dataToAggregate = geoRawData.length > 0 ? geoRawData : products;
    const agg: Record<string, StatePerformance> = {};
    
    dataToAggregate.forEach(p => {
      const uf = String(p.estado).toUpperCase();
      if (!uf || uf === 'UNDEFINED' || uf === 'N/A') return;
      
      if (!agg[uf]) {
        agg[uf] = {
          estado: uf,
          faturamento: 0,
          pedidos: 0,
          itens: 0,
          ticketMedio: 0
        };
      }
      
      const faturamentoItem = p.faturamento || (p.precoVenda * p.quantidade);
      const itensItem = p.quantidade || 1;
      const pedidosItem = p.pedidos || 1;

      agg[uf].faturamento += faturamentoItem;
      agg[uf].pedidos += pedidosItem; 
      agg[uf].itens += itensItem;
    });

    const sorted = Object.values(agg).map(s => ({
      ...s,
      ticketMedio: s.pedidos > 0 ? s.faturamento / s.pedidos : 0
    })).sort((a, b) => b.faturamento - a.faturamento);

    const totalRevenue = sorted.reduce((acc, curr) => acc + curr.faturamento, 0);
    let accumulatedRevenue = 0;

    return sorted.map(state => {
      accumulatedRevenue += state.faturamento;
      const ratio = accumulatedRevenue / (totalRevenue || 1);
      
      let classification: 'A' | 'B' | 'C' = 'C';
      if (ratio <= 0.8) classification = 'A';
      else if (ratio <= 0.95) classification = 'B';

      return { ...state, pareto_class: classification };
    });
  }, [products, geoRawData])

  const selectedStateData = useMemo(() => {
    if (!selectedUF) return null;
    return stateAggregation.find(s => s.estado === selectedUF) || null;
  }, [selectedUF, stateAggregation])

  const selectedStateProducts = useMemo(() => {
    if (!selectedUF) return [];
    
    const dataToFilter = geoRawData.length > 0 ? geoRawData : products;
    const stateProds = dataToFilter.filter(p => String(p.estado).toUpperCase() === selectedUF);
    
    const sortedProds = [...stateProds].sort((a, b) => {
      const fatA = a.faturamento || (a.precoVenda * a.quantidade);
      const fatB = b.faturamento || (b.precoVenda * b.quantidade);
      return fatB - fatA;
    });
    
    const totalStateRevenue = sortedProds.reduce((acc, p) => acc + (p.faturamento || (p.precoVenda * p.quantidade)), 0);
    let accumulatedStateRevenue = 0;

    return sortedProds.map(p => {
      const currentFat = p.faturamento || (p.precoVenda * p.quantidade);
      accumulatedStateRevenue += currentFat;
      const ratio = accumulatedStateRevenue / (totalStateRevenue || 1);
      let classification: 'A' | 'B' | 'C' = 'C';
      if (ratio <= 0.8) classification = 'A';
      else if (ratio <= 0.95) classification = 'B';
      
      return {
        ...p,
        nomeProduto: p.nomeProduto || p.produto,
        local_abc: classification,
        faturamento_total: currentFat,
        quantidade: p.quantidade || 1,
        margemPercentual: p.margemPercentual || p.margem || 0
      }
    });
  }, [selectedUF, products, geoRawData])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight font-headline">Análises Estratégicas</h1>
          <p className="text-muted-foreground font-medium">Panorama completo de rentabilidade e Curva ABC.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {mounted && (
            <>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[120px] bg-secondary/50 border-white/5 h-10 font-bold">
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
                <SelectTrigger className="w-[100px] bg-secondary/50 border-white/5 h-10 font-bold">
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
            <SelectTrigger className="w-[160px] bg-secondary/50 border-white/5 h-10 font-bold">
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
        <TabsList className="bg-card border border-white/5 p-1 h-12">
          <TabsTrigger value="panorama" className="data-[state=active]:bg-primary font-bold px-8 h-10">Panorama Geral</TabsTrigger>
          <TabsTrigger value="abc" className="data-[state=active]:bg-primary font-bold px-8 h-10">Curva ABC (Pareto)</TabsTrigger>
          <TabsTrigger value="geografico" className="data-[state=active]:bg-primary font-bold px-8 h-10">Regional</TabsTrigger>
          <TabsTrigger value="origin" className="data-[state=active]:bg-primary font-bold px-8 h-10">Origem & Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="geografico" className="space-y-6">
          <Card className="glass-card border-none shadow-2xl">
            <CardHeader className="p-8">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                      <ListOrdered className="h-6 w-6 text-primary" /> Performance por Unidade Federativa
                    </CardTitle>
                    {isGeoLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    {geoOrigin !== 'local' && (
                      <Badge variant="secondary" className="text-[8px] font-black uppercase bg-primary/20 text-primary">
                        {geoOrigin === 'api' ? 'API Real-Time' : 'Fallback Local'}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Análise comparativa de faturamento e eficiência por estado.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stateAggregation.length > 0 ? stateAggregation.map((state) => (
                  <div 
                    key={state.estado} 
                    className={cn(
                      "group relative p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-95",
                      state.pareto_class === 'A' ? "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40" : 
                      state.pareto_class === 'B' ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" : 
                      "bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30",
                      selectedUF === state.estado && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                    onClick={() => setSelectedUF(state.estado)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm",
                          state.pareto_class === 'A' ? "bg-rose-500 text-white" : 
                          state.pareto_class === 'B' ? "bg-amber-500 text-white" : 
                          "bg-blue-500 text-white"
                        )}>
                          {state.estado}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-white/50">{state.estado}</p>
                          <Badge variant="outline" className={cn(
                            "text-[8px] font-black uppercase px-1.5 h-4",
                            state.pareto_class === 'A' ? "border-rose-500 text-rose-500" : 
                            state.pareto_class === 'B' ? "border-amber-500 text-amber-500" : 
                            "border-blue-500 text-blue-500"
                          )}>
                            Classe {state.pareto_class}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white transition-colors" />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-black uppercase text-muted-foreground mb-0.5">Faturamento</p>
                        <p className="text-lg font-black font-mono">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(state.faturamento)}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        <div>
                          <p className="text-[8px] font-black uppercase text-muted-foreground">Pedidos</p>
                          <p className="text-xs font-black">{state.pedidos}</p>
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
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
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
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" /> Top SKUs por Lucro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rankingLucro.slice(0, 7).map((p, i) => (
                    <div key={p.sku} className="flex items-center justify-between group p-3 rounded-xl hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-muted-foreground/30">0{i+1}</span>
                        <div className="truncate max-w-[140px]">
                          <p className="text-[11px] font-black truncate uppercase">{p.nomeProduto}</p>
                          <p className="text-[9px] text-muted-foreground font-bold">{p.marketplace}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-emerald-400 font-mono">
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
                <CardTitle className="text-lg flex items-center gap-2 font-black uppercase tracking-tighter">
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
                        contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 w-full mt-8">
                {abcData.map(item => (
                  <div key={item.name} className="text-center">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">{item.name}</p>
                    <p className="text-xl font-black">{item.value} Prod.</p>
                    <p className="text-[8px] text-accent/70 uppercase font-bold">{item.pct.toFixed(0)}% Faturam.</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-card lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Produtos Segmentados</CardTitle>
                  <CardDescription>Listagem detalhada de rentabilidade por Classe ABC.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/[0.01]">
                    <TableRow className="border-white/5">
                      <TableHead className="font-black uppercase text-[10px] py-4 px-8">Produto</TableHead>
                      <TableHead className="font-black uppercase text-[10px] py-4">Faturamento</TableHead>
                      <TableHead className="text-right font-black uppercase text-[10px] py-4 px-8">Margem %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.slice(0, 12).map(p => (
                      <TableRow key={p.sku} className="border-white/5 hover:bg-white/5">
                        <TableCell className="py-4 px-8">
                          <p className="text-xs font-black truncate max-w-[200px]">{p.nomeProduto}</p>
                          <p className="font-mono text-[9px] text-muted-foreground uppercase">{p.sku} • {p.marketplace}</p>
                        </TableCell>
                        <TableCell className="py-4 font-mono text-xs">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.precoVenda * p.quantidade)}</TableCell>
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
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-rose-500" /> Auditoria de Origem e Alertas
                  </CardTitle>
                  <CardDescription>Monitoramento de integridade e rentabilidade por SKU.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white/[0.01]">
                  <TableRow className="border-white/5">
                    <TableHead className="font-black uppercase text-[10px] py-6 px-8 tracking-widest">Produto / SKU</TableHead>
                    <TableHead className="font-black uppercase text-[10px] py-6 tracking-widest">Origem</TableHead>
                    <TableHead className="font-black uppercase text-[10px] py-6 tracking-widest">Motivo</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] py-6 px-8 tracking-widest">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.filter(p => p.status !== 'APROVADO').map(p => (
                    <TableRow key={p.sku} className="border-white/5 hover:bg-rose-500/5 transition-all">
                      <TableCell className="py-6 px-8">
                        <p className="text-sm font-black">{p.nomeProduto}</p>
                        <p className="text-[10px] text-accent font-bold uppercase">{p.marketplace}</p>
                      </TableCell>
                      <TableCell className="py-6">
                        <Badge variant="outline" className="text-[10px] font-bold flex items-center gap-1.5 w-fit bg-white/5 border-white/10">
                          <Database className="h-3 w-3" /> {p.origemDados}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-6">
                        {p.margemPercentual < 0 ? (
                          <Badge variant="destructive" className="text-[9px] font-black uppercase">Prejuízo Líquido</Badge>
                        ) : p.reclamacaoPercentual > 3 ? (
                          <Badge variant="outline" className="text-[9px] border-amber-500 text-amber-500 font-black uppercase">Reclamações Altas</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] border-white/20 text-white/50 font-black uppercase">Baixa Rentabilidade</Badge>
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
        <SheetContent className="glass-card border-none w-full sm:max-w-xl p-0 overflow-y-auto">
          {selectedStateData && (
            <div className="p-8 space-y-8 h-full">
              <SheetHeader className="text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl text-white",
                    selectedStateData.pareto_class === 'A' ? "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]" : 
                    selectedStateData.pareto_class === 'B' ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : 
                    "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  )}>
                    {selectedStateData.estado}
                  </div>
                  <div>
                    <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-white">Detalhamento Regional</SheetTitle>
                    <SheetDescription className="text-muted-foreground font-bold flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-black">ESTADO: {selectedUF}</Badge>
                      <Badge className={cn(
                        "text-[10px] font-black",
                        selectedStateData.pareto_class === 'A' ? "bg-rose-500 text-white" : 
                        selectedStateData.pareto_class === 'B' ? "bg-amber-500 text-white" : 
                        "bg-blue-500 text-white"
                      )}>CLASSE {selectedStateData.pareto_class} PARETO</Badge>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Faturamento</p>
                  <p className="text-lg font-black font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedStateData.faturamento)}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Pedidos</p>
                  <p className="text-xl font-black">{selectedStateData.pedidos}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Ticket Médio</p>
                  <p className="text-lg font-black font-mono text-accent">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedStateData.ticketMedio)}</p>
                </div>
              </div>

              <Separator className="bg-white/5" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Top Performance Local
                  </h3>
                  <Badge variant="outline" className="text-[9px] opacity-50">{selectedStateProducts.length} SKUs Ativos</Badge>
                </div>

                <div className="space-y-4">
                  {selectedStateProducts.slice(0, 3).map((p, i) => (
                    <div key={p.sku} className="group bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/5 hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-muted-foreground/30">#0{i+1}</span>
                          <div>
                            <p className="text-sm font-black text-white group-hover:text-primary transition-colors">{p.nomeProduto}</p>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase">{p.sku} • {p.marketplace}</p>
                          </div>
                        </div>
                        <Badge className={cn(
                          "text-[9px] font-black",
                          p.local_abc === 'A' ? "bg-rose-500 text-white" : 
                          p.local_abc === 'B' ? "bg-amber-500 text-white" : 
                          "bg-blue-500 text-white"
                        )}>
                          CLASSE {p.local_abc} (LOCAL)
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-black uppercase text-muted-foreground">Faturamento</p>
                          <p className="text-xs font-black font-mono text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.faturamento_total)}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-black uppercase text-muted-foreground">Qtde</p>
                          <p className="text-xs font-black text-white">{p.quantidade} un.</p>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <p className="text-[8px] font-black uppercase text-muted-foreground">Margem</p>
                          <p className={cn(
                            "text-xs font-black font-mono",
                            p.margemPercentual > 20 ? "text-emerald-400" : "text-rose-400"
                          )}>{p.margemPercentual.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedStateProducts.length === 0 && (
                    <div className="py-20 text-center opacity-30 flex flex-col items-center gap-3">
                      <Package className="h-10 w-10" />
                      <p className="text-xs font-black uppercase">Nenhum produto para este estado</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-8 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Relatório Regional Gerado em Tempo Real</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
