"use client"

import { useState, useMemo } from "react"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts'
import { Target, TrendingUp, AlertTriangle, Database, ShoppingBag, PieChart as PieIcon, BarChart3, Calendar } from "lucide-react"

export default function AnalysisPage() {
  const [selectedChannel, setSelectedChannel] = useState("all")
  const [selectedABC, setSelectedABC] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOrigin, setSelectedOrigin] = useState("all")

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
  
  // Dados simulados para panorama mensal
  const monthlyData = [
    { name: 'Jan', faturamento: 45000, lucro: 8000 },
    { name: 'Fev', faturamento: 52000, lucro: 12000 },
    { name: 'Mar', faturamento: 48000, lucro: 9000 },
    { name: 'Abr', faturamento: 61000, lucro: 15000 },
    { name: 'Mai', faturamento: 55000, lucro: 11000 },
    { name: 'Jun', faturamento: 67000, lucro: 18000 },
  ]

  const abcData = [
    { name: 'Classe A', value: products.filter(p => p.classificacaoABC === 'A').length, color: '#7070C2', desc: '80% Faturamento' },
    { name: 'Classe B', value: products.filter(p => p.classificacaoABC === 'B').length, color: '#63DBFF', desc: '15% Faturamento' },
    { name: 'Classe C', value: products.filter(p => p.classificacaoABC === 'C').length, color: '#4B4B8F', desc: '5% Faturamento' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-headline">Análises Estratégicas</h1>
          <p className="text-muted-foreground font-medium">Panorama completo de rentabilidade e Curva ABC.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
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

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px] bg-secondary/50 border-white/5 h-10 font-bold">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="APROVADO">Aprovados</SelectItem>
              <SelectItem value="ATENÇÃO">Atenção</SelectItem>
              <SelectItem value="CRÍTICO">Críticos</SelectItem>
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
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Panorama de Performance Mensal
                </CardTitle>
                <CardDescription>Evolução de faturamento e lucro líquido consolidado.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="faturamento" name="Faturamento" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                      <Line type="monotone" dataKey="lucro" name="Lucro" stroke="#63DBFF" strokeWidth={3} dot={{ fill: '#63DBFF' }} />
                    </LineChart>
                  </ResponsiveContainer>
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
                        <span className="text-[10px] font-black text-white/20">0{i+1}</span>
                        <div className="truncate max-w-[140px]">
                          <p className="text-[11px] font-black truncate text-white uppercase">{p.nomeProduto}</p>
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
              </div>
              <div className="grid grid-cols-3 gap-4 w-full mt-8">
                {abcData.map(item => (
                  <div key={item.name} className="text-center">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">{item.name}</p>
                    <p className="text-xl font-black text-white">{item.value}</p>
                    <p className="text-[8px] text-accent/70 uppercase font-bold">{item.desc}</p>
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
                          <p className="text-xs font-black text-white truncate max-w-[200px]">{p.nomeProduto}</p>
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
                <div className="flex gap-4">
                  <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                    <SelectTrigger className="w-[180px] bg-secondary/50 border-white/5 h-10 font-bold">
                      <SelectValue placeholder="Origem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Origens</SelectItem>
                      <SelectItem value="API Mercado Livre">API Mercado Livre</SelectItem>
                      <SelectItem value="API Amazon">API Amazon</SelectItem>
                      <SelectItem value="API Site">API Site</SelectItem>
                      <SelectItem value="XLSX">XLSX</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <p className="text-sm font-black text-white">{p.nomeProduto}</p>
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
