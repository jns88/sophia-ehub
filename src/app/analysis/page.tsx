
"use client"

import { useState, useMemo, useEffect } from "react"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts'
import { Target, TrendingUp, AlertTriangle, Database, PieChart as PieIcon, BarChart3, Calendar } from "lucide-react"

export default function AnalysisPage() {
  const [selectedChannel, setSelectedChannel] = useState("all")
  const [selectedABC, setSelectedABC] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOrigin, setSelectedOrigin] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [chartMetric, setChartMetric] = useState("faturamento")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const now = new Date();
    const currentYearNum = now.getFullYear();
    const yearsList = Array.from({ length: 5 }, (_, i) => (currentYearNum - 2 + i).toString());
    setAvailableYears(yearsList);
    setSelectedMonth((now.getMonth() + 1).toString().padStart(2, '0'));
    setSelectedYear(currentYearNum.toString());
  }, [])

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
    const totalRevenue = products.reduce((acc, p) => acc + p.precoVenda, 0);
    const aProducts = products.filter(p => p.classificacaoABC === 'A');
    const bProducts = products.filter(p => p.classificacaoABC === 'B');
    const cProducts = products.filter(p => p.classificacaoABC === 'C');

    const aRev = aProducts.reduce((acc, p) => acc + p.precoVenda, 0);
    const bRev = bProducts.reduce((acc, p) => acc + p.precoVenda, 0);
    const cRev = cProducts.reduce((acc, p) => acc + p.precoVenda, 0);

    return [
      { name: 'Classe A', value: aProducts.length, revenue: aRev, pct: totalRevenue ? (aRev/totalRevenue)*100 : 0, color: '#7070C2', desc: '80% Faturamento' },
      { name: 'Classe B', value: bProducts.length, revenue: bRev, pct: totalRevenue ? (bRev/totalRevenue)*100 : 0, color: '#63DBFF', desc: '15% Faturamento' },
      { name: 'Classe C', value: cProducts.length, revenue: cRev, pct: totalRevenue ? (cRev/totalRevenue)*100 : 0, color: '#4B4B8F', desc: '5% Faturamento' },
    ]
  }, [products])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-2xl border border-white/5">
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

          <Select value={selectedABC} onValueChange={setSelectedABC}>
            <SelectTrigger className="w-[140px] bg-secondary/50 border-white/5 h-10 font-bold">
              <SelectValue placeholder="Classe ABC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas ABC</SelectItem>
              <SelectItem value="A">Classe A</SelectItem>
              <SelectItem value="B">Classe B</SelectItem>
              <SelectItem value="C">Classe C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="panorama" className="space-y-6">
        <TabsList className="bg-card border border-white/5 p-1 h-12">
          <TabsTrigger value="panorama" className="data-[state=active]:bg-primary font-bold px-8 h-10">Panorama Geral</TabsTrigger>
          <TabsTrigger value="abc" className="data-[state=active]:bg-primary font-bold px-8 h-10">Curva ABC (Pareto)</TabsTrigger>
          <TabsTrigger value="origin" className="data-[state=active]:bg-primary font-bold px-8 h-10">Origem & Alertas</TabsTrigger>
        </TabsList>

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
                <Select value={chartMetric} onValueChange={setChartMetric}>
                  <SelectTrigger className="w-[160px] h-8 text-[10px] font-bold border-white/5 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faturamento">Faturamento</SelectItem>
                    <SelectItem value="lucro">Lucro Líquido</SelectItem>
                    <SelectItem value="margem">Margem Média</SelectItem>
                    <SelectItem value="roas">ROAS Médio</SelectItem>
                    <SelectItem value="rentabilidade">Rentabilidade %</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                        <Tooltip 
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
                      <Tooltip 
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
                <Badge variant="outline" className="h-8 border-white/10 uppercase text-[9px] font-black">Filtrado: Classe {selectedABC}</Badge>
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
                        <TableCell className="py-4 font-mono text-xs">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.precoVenda)}</TableCell>
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
    </div>
  )
}
