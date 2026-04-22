
"use client"

import { useState, useMemo, useEffect, memo } from "react"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Target, AlertTriangle, Database, PieChart as PieIcon, Globe, Loader2, ListOrdered, ChevronRight, Zap, Package, ShoppingBag, Receipt, DollarSign, TrendingUp, MapPin } from "lucide-react"
import { Product, StatePerformance } from "@/lib/types"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { fetchGeoPerformanceData } from "@/lib/geo-analysis"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const ALL_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Memoized UF Card for maximum stability
const MemoUFCard = memo(({ uf, performance, isSelected, onClick }: { uf: string, performance?: StatePerformance, isSelected: boolean, onClick: () => void }) => {
  const getBorderColor = () => {
    if (!performance) return "border-l-muted";
    if (performance.pareto_class === 'A') return "border-l-rose-500";
    if (performance.pareto_class === 'B') return "border-l-amber-500";
    return "border-l-emerald-500";
  };

  return (
    <div 
      className={cn(
        "group relative p-4 rounded-xl border bg-card flex flex-col items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer border-l-4",
        getBorderColor(),
        isSelected ? "ring-2 ring-primary bg-primary/5 border-primary/50" : "hover:bg-white/[0.03]"
      )}
      onClick={onClick}
    >
      <span className="text-sm font-black tracking-tighter text-foreground">{uf}</span>
      {performance && (
        <span className="text-[8px] font-black uppercase text-muted-foreground/60">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(performance.faturamento)}
        </span>
      )}
    </div>
  );
});

MemoUFCard.displayName = "MemoUFCard";

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
          description: "Falha na conexão com a API. Exibindo base de dados local.",
          variant: "destructive"
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

  const monthlyData = useMemo(() => [
    { name: "Jan", faturamento: 142000, pedidos: 850, margem: 18.5 },
    { name: "Fev", faturamento: 151000, pedidos: 920, margem: 19.2 },
    { name: "Mar", faturamento: 148000, pedidos: 880, margem: 17.8 },
    { name: "Abr", faturamento: 159000, pedidos: 1040, margem: 20.1 },
    { name: "Mai", faturamento: 162000, pedidos: 1100, margem: 21.4 },
    { name: "Jun", faturamento: 175000, pedidos: 1150, margem: 22.8 },
  ], []);
  
  const stateAggregation = useMemo(() => {
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
      
      // ABC Logic: A (80%), B (15% -> 95%), C (5% -> 100%)
      let classification: 'A' | 'B' | 'C' = 'C';
      if (ratio <= 0.8) classification = 'A';
      else if (ratio <= 0.95) classification = 'B';

      return { 
        ...state, 
        pareto_class: classification,
        ticketMedio: state.pedidos > 0 ? state.faturamento / state.pedidos : 0
      };
    });
    return result;
  }, [products, geoRawData])

  // Pareto Distribution for Pie Chart (A/B/C Summary)
  const paretoDistributionData = useMemo(() => {
    const summary = [
      { name: 'Classe A', value: 0, color: '#EF4444', label: '80% Impacto' },
      { name: 'Classe B', value: 0, color: '#F59E0B', label: '15% Impacto' },
      { name: 'Classe C', value: 0, color: '#3B82F6', label: '5% Impacto' },
    ];

    stateAggregation.forEach(s => {
      if (s.pareto_class === 'A') summary[0].value += s.faturamento;
      else if (s.pareto_class === 'B') summary[1].value += s.faturamento;
      else summary[2].value += s.faturamento;
    });

    const total = summary.reduce((acc, curr) => acc + curr.value, 0);
    
    return summary.map(item => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0
    }));
  }, [stateAggregation]);

  const statePerformanceMap = useMemo(() => {
    const map: Record<string, StatePerformance> = {};
    stateAggregation.forEach(s => {
      map[s.estado] = s;
    });
    return map;
  }, [stateAggregation]);

  const selectedStateData = useMemo(() => {
    if (!selectedUF) return null;
    return stateAggregation.find(s => s.estado === selectedUF) || null;
  }, [selectedUF, stateAggregation])

  const selectedStateChannels = useMemo(() => {
    if (!selectedUF) return [];
    const data = geoRawData.length > 0 ? geoRawData : products;
    const stateData = data.filter(p => String(p.estado || 'N/A').toUpperCase() === selectedUF);
    
    const channelMap: Record<string, number> = {};
    stateData.forEach(p => {
      const channel = p.marketplace || p.canal || 'Canal não identificado';
      if (!channelMap[channel]) channelMap[channel] = 0;
      channelMap[channel] += (p.faturamento || (p.precoVenda * (p.quantidade || 1)));
    });

    const total = Object.values(channelMap).reduce((acc, v) => acc + v, 0);
    return Object.entries(channelMap).map(([channel, revenue]) => ({
        channel,
        revenue,
        percentage: (revenue / total) * 100
    })).sort((a, b) => b.revenue - a.revenue);
  }, [selectedUF, products, geoRawData]);

  const selectedStateProducts = useMemo(() => {
    if (!selectedUF) return [];
    
    const dataToFilter = geoRawData.length > 0 ? geoRawData : products;
    const stateProds = dataToFilter.filter(p => String(p.estado || 'N/A').toUpperCase() === selectedUF);
    
    const sortedProds = [...stateProds].sort((a, b) => {
      const fatA = a.faturamento || (a.precoVenda * (a.quantidade || 1));
      const fatB = b.faturamento || (b.precoVenda * (b.quantidade || 1));
      return fatB - fatA;
    });
    
    const totalStateRevenue = sortedProds.reduce((acc, p) => acc + (p.faturamento || (p.precoVenda * (p.quantidade || 1))), 0);
    let accumulatedStateRevenue = 0;

    return sortedProds.map(p => {
      const currentFat = p.faturamento || (p.precoVenda * (p.quantidade || 1));
      accumulatedStateRevenue += currentFat;
      const ratio = accumulatedStateRevenue / (totalStateRevenue || 1);
      
      // ABC Logic: A (80%), B (15% -> 95%), C (5% -> 100%)
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
    }).slice(0, 6);
  }, [selectedUF, products, geoRawData])

  return (
    <div className="space-y-8 animate-in fade-in duration-500 stable-grid-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-2xl border border-border shadow-2xl relative z-10">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 relative z-0">
        <TabsList className="bg-card border border-border p-1 h-12">
          <TabsTrigger value="panorama" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-8 h-10">Panorama Geral</TabsTrigger>
          <TabsTrigger value="abc" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-8 h-10">Curva ABC (Pareto)</TabsTrigger>
          <TabsTrigger value="geografico" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-8 h-10">Regional</TabsTrigger>
          <TabsTrigger value="origin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-8 h-10">Origem & Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="geografico" className="space-y-6 overflow-visible">
          <Card className="glass-card border-none shadow-2xl overflow-visible relative z-10">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter text-foreground">
                <MapPin className="h-6 w-6 text-primary" /> Distribuição Regional (UF)
              </CardTitle>
              <CardDescription>Visualização por performance regional e classificação Pareto.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 overflow-visible">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
                {ALL_UFS.map((uf) => (
                  <MemoUFCard 
                    key={uf} 
                    uf={uf} 
                    performance={statePerformanceMap[uf]}
                    isSelected={selectedUF === uf}
                    onClick={() => setSelectedUF(uf)}
                  />
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 p-4 bg-muted/20 rounded-xl border border-border">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Legenda Pareto (80/15/5):</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <span className="text-[9px] font-bold uppercase text-foreground">Classe A (80% Faturamento)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="text-[9px] font-bold uppercase text-foreground">Classe B (15% Faturamento)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                  <span className="text-[9px] font-bold uppercase text-foreground">Classe C (5% Faturamento)</span>
                </div>
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
                    <BarChart3 className="h-4 w-4 text-primary" /> Panorama Mensal
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
                          isAnimationActive={false}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                          wrapperClassName="chart-tooltip"
                        />
                        <Line isAnimationActive={false} type="monotone" dataKey={chartMetric} name={chartMetric} stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                  <Target className="h-4 w-4 text-accent" /> Top SKUs Lucro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 7).sort((a, b) => b.lucroLiquido - a.lucroLiquido).map((p, i) => (
                    <div key={p.sku} className="flex items-center justify-between group p-3 rounded-xl hover:bg-secondary transition-all cursor-default">
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
                  <PieIcon className="h-5 w-5 text-accent" /> Distribuição Pareto
                </CardTitle>
                <CardDescription>Critério: A(80%), B(15%), C(5%)</CardDescription>
              </CardHeader>
              <div className="h-[250px] w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        isAnimationActive={false}
                        data={paretoDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"
                        outerRadius="80%"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percentage }) => percentage > 5 ? `${name.split(' ')[1]} (${percentage.toFixed(0)}%)` : null}
                        labelLine={false}
                      >
                        {paretoDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        isAnimationActive={false} 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="chart-tooltip">
                                <p className="text-[10px] font-black uppercase mb-1">{data.name}</p>
                                <p className="text-xs font-bold text-foreground">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.value)}
                                </p>
                                <p className="text-[9px] font-bold text-muted-foreground mt-0.5">
                                  {data.percentage.toFixed(1)}% do faturamento total
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-black uppercase tracking-tighter text-foreground">Produtos Segmentados</CardTitle>
                <CardDescription>Listagem por impacto no faturamento total (ABC)</CardDescription>
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
                    {products.slice(0, 10).map(p => (
                      <TableRow key={p.sku} className="border-border hover:bg-muted/50">
                        <TableCell className="py-4 px-8">
                          <p className="text-xs font-black truncate max-w-[200px] text-foreground">{p.nomeProduto}</p>
                          <p className="font-mono text-[9px] text-muted-foreground uppercase">{p.sku} • {p.marketplace} • Classe {p.classificacaoABC}</p>
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
              <CardTitle className="text-xl font-black flex items-center gap-3 text-foreground">
                <AlertTriangle className="h-6 w-6 text-rose-500" /> Auditoria & Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border">
                    <TableHead className="font-black uppercase text-[10px] py-6 px-8 tracking-widest text-muted-foreground">Produto / SKU</TableHead>
                    <TableHead className="font-black uppercase text-[10px] py-6 tracking-widest text-muted-foreground">Motivo</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] py-6 px-8 tracking-widest text-muted-foreground">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.filter(p => p.status !== 'APROVADO').slice(0, 10).map(p => (
                    <TableRow key={p.sku} className="border-border hover:bg-rose-500/5 transition-all">
                      <TableCell className="py-6 px-8">
                        <p className="text-sm font-black text-foreground">{p.nomeProduto}</p>
                        <p className="text-[10px] text-accent font-bold uppercase">{p.marketplace}</p>
                      </TableCell>
                      <TableCell className="py-6">
                        {p.margemPercentual < 0 ? (
                          <Badge variant="destructive" className="text-[9px] font-black uppercase">Prejuízo</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] border-border text-muted-foreground font-black uppercase">Observar</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-6 px-8">
                        <span className="text-[10px] bg-primary/20 text-primary px-3 py-1.5 rounded-lg font-black uppercase">Auditar</span>
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
        <SheetContent className="w-full sm:max-w-2xl p-0 overflow-y-auto">
          {selectedStateData && (
            <div className="p-8 space-y-10 h-full">
              <SheetHeader className="text-left">
                <div className="flex items-center gap-4 mb-2">
                  <div className={cn(
                    "h-16 w-16 rounded-3xl flex items-center justify-center font-black text-2xl text-white shadow-2xl",
                    selectedStateData.pareto_class === 'A' ? "bg-[#EF4444]" : 
                    selectedStateData.pareto_class === 'B' ? "bg-[#F59E0B]" : 
                    "bg-[#3B82F6]"
                  )}>
                    {selectedStateData.estado}
                  </div>
                  <div>
                    <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-foreground">Detalhamento Regional</SheetTitle>
                    <SheetDescription asChild>
                       <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] font-black px-2 py-0.5 border-border uppercase text-foreground">Estado: {selectedUF} • Classe {selectedStateData.pareto_class}</Badge>
                       </div>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

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

              <div className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> Marketshare Canal
                 </h3>
                 <div className="rounded-2xl border border-border overflow-hidden bg-muted/20">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow className="border-border">
                          <TableHead className="font-black uppercase text-[10px] py-4 px-6 text-muted-foreground">Canal</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] py-4 px-6 text-muted-foreground">% Part.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedStateChannels.map(item => (
                          <TableRow key={item.channel} className="border-border">
                            <TableCell className="py-4 px-6 font-bold text-xs text-foreground">{item.channel}</TableCell>
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

              <div className="space-y-6 pb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Pareto Regional: Top SKUs
                </h3>

                <div className="space-y-4">
                  {selectedStateProducts.map((p, i) => (
                    <div key={p.sku} className="group bg-muted/20 border border-border p-6 rounded-2xl" style={{ transform: 'none' }}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-muted-foreground/30">#0{i+1}</span>
                          <div>
                            <p className="text-sm font-black text-foreground">{p.nomeProduto}</p>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase">{p.sku} • {p.marketplace} • Classe {p.local_abc}</p>
                          </div>
                        </div>
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
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
