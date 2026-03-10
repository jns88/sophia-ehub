"use client"

import { useState, useMemo } from "react"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { Info, Target, TrendingUp, AlertTriangle, Database, ShoppingBag, PieChart as PieIcon } from "lucide-react"

export default function AnalysisPage() {
  const [selectedChannel, setSelectedChannel] = useState("all")
  const [selectedABC, setSelectedABC] = useState("all")

  const products = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchChannel = selectedChannel === "all" || p.marketplace === selectedChannel
      const matchABC = selectedABC === "all" || p.classificacaoABC === selectedABC
      return matchChannel && matchABC
    })
  }, [selectedChannel, selectedABC])
  
  const rankingLucro = [...products].sort((a, b) => b.lucroLiquido - a.lucroLiquido)
  const rankingMargem = [...products].sort((a, b) => b.margemPercentual - a.margemPercentual)
  const rankingRoas = products
    .filter(p => typeof p.roas === 'number')
    .sort((a, b) => (b.roas as number) - (a.roas as number))

  const channelData = useMemo(() => {
    const channels = Array.from(new Set(MOCK_PRODUCTS.map(p => p.marketplace)))
    return channels.map(c => {
      const pByC = MOCK_PRODUCTS.filter(p => p.marketplace === c)
      return {
        name: c,
        revenue: pByC.reduce((acc, p) => acc + p.precoVenda, 0),
        profit: pByC.reduce((acc, p) => acc + p.lucroLiquido, 0),
        count: pByC.length
      }
    }).sort((a, b) => b.revenue - a.revenue)
  }, [])

  const abcData = [
    { name: 'Classe A', value: products.filter(p => p.classificacaoABC === 'A').length, color: '#7070C2', desc: '80% Faturamento' },
    { name: 'Classe B', value: products.filter(p => p.classificacaoABC === 'B').length, color: '#63DBFF', desc: '15% Faturamento' },
    { name: 'Classe C', value: products.filter(p => p.classificacaoABC === 'C').length, color: '#4B4B8F', desc: '5% Faturamento' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-headline">Análises Profundas</h1>
          <p className="text-muted-foreground font-medium">Segmentação estratégica por Marketplace e Curva ABC.</p>
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-[180px] bg-secondary/50 border-white/5 h-10 font-bold">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Canais</SelectItem>
              <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
              <SelectItem value="Amazon">Amazon</SelectItem>
              <SelectItem value="Shopee">Shopee</SelectItem>
              <SelectItem value="Magalu">Magalu</SelectItem>
              <SelectItem value="B2W / Americanas">B2W / Americanas</SelectItem>
              <SelectItem value="Loja Própria / Site">Loja Própria / Site</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedABC} onValueChange={setSelectedABC}>
            <SelectTrigger className="w-[180px] bg-secondary/50 border-white/5 h-10 font-bold">
              <SelectValue placeholder="Classe ABC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Classes</SelectItem>
              <SelectItem value="A">Classe A</SelectItem>
              <SelectItem value="B">Classe B</SelectItem>
              <SelectItem value="C">Classe C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="rankings" className="space-y-6">
        <TabsList className="bg-secondary/50 border border-white/5 p-1">
          <TabsTrigger value="rankings" className="data-[state=active]:bg-primary font-bold">Marketplace & Rankings</TabsTrigger>
          <TabsTrigger value="abc" className="data-[state=active]:bg-primary font-bold">Pareto (ABC) Estratégico</TabsTrigger>
          <TabsTrigger value="operation" className="data-[state=active]:bg-primary font-bold">Origem & Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-primary" /> Top Lucro Líquido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rankingLucro.slice(0, 8).map((p, i) => (
                    <div key={p.sku} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white/20 group-hover:text-primary transition-colors">0{i+1}</span>
                        <div className="truncate max-w-[140px]">
                          <p className="text-xs font-bold truncate text-white">{p.nomeProduto}</p>
                          <p className="text-[9px] text-muted-foreground">{p.marketplace}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-400 font-mono">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.lucroLiquido)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-accent" /> Eficiência ROAS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rankingRoas.slice(0, 8).map((p, i) => (
                    <div key={p.sku} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white/20 group-hover:text-white transition-colors">0{i+1}</span>
                        <div className="truncate max-w-[140px]">
                          <p className="text-xs font-bold truncate text-white">{p.nomeProduto}</p>
                          <p className="text-[9px] text-muted-foreground">{p.marketplace}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-white">{(p.roas as number).toFixed(2)}</span>
                        <span className="text-[8px] text-muted-foreground uppercase font-bold">Retorno</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-primary" /> Receita por Canal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#888' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#10102D', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="abc" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card lg:col-span-1 flex flex-col justify-center items-center p-8">
              <CardHeader className="text-center p-0 mb-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieIcon className="h-5 w-5 text-accent" /> Composição de Faturamento
                </CardTitle>
                <CardDescription>Pareto: {selectedChannel === 'all' ? 'Todos os Canais' : selectedChannel}</CardDescription>
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
                      contentStyle={{ backgroundColor: '#10102D', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 w-full mt-4">
                {abcData.map(item => (
                  <div key={item.name} className="text-center">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">{item.name}</p>
                    <p className="text-lg font-black text-white">{item.value}</p>
                    <p className="text-[8px] text-accent/70 uppercase font-bold">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Produtos Segmentados</CardTitle>
                <CardDescription>Visão estratégica de margem e faturamento para SKUs Classe {selectedABC}.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5">
                      <TableHead>SKU / Produto</TableHead>
                      <TableHead>Marketplace</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                      <TableHead className="text-right">Margem %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.slice(0, 15).map(p => (
                      <TableRow key={p.sku} className="border-white/5 hover:bg-white/5">
                        <TableCell>
                          <p className="text-xs font-black text-white truncate max-w-[200px]">{p.nomeProduto}</p>
                          <p className="font-mono text-[9px] text-muted-foreground uppercase">{p.sku}</p>
                        </TableCell>
                        <TableCell className="text-[10px] font-bold text-accent uppercase">{p.marketplace}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.precoVenda)}</TableCell>
                        <TableCell className="text-right text-accent font-black">{p.margemPercentual.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operation" className="space-y-6">
          <Card className="glass-card shadow-xl border-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-500" /> Alertas Operacionais por Origem
                </CardTitle>
                <CardDescription>Monitoramento de integridade dos dados e rentabilidade.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5">
                    <TableHead>Produto / Canal</TableHead>
                    <TableHead>Origem dos Dados</TableHead>
                    <TableHead>Motivo do Alerta</TableHead>
                    <TableHead className="text-right">Ação Recomendada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.filter(p => p.status !== 'APROVADO').map(p => (
                    <TableRow key={p.sku} className="border-white/5 hover:bg-rose-500/5 transition-colors">
                      <TableCell>
                        <p className="text-sm font-black text-white">{p.nomeProduto}</p>
                        <p className="text-[10px] text-accent font-bold uppercase">{p.marketplace}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-bold flex items-center gap-1.5 w-fit bg-white/5">
                          <Database className="h-3 w-3" /> {p.origemDados}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.margemPercentual < 0 ? (
                          <Badge variant="destructive" className="text-[9px] font-black uppercase">Prejuízo Líquido</Badge>
                        ) : p.reclamacaoPercentual > 3 ? (
                          <Badge variant="outline" className="text-[9px] border-amber-500 text-amber-500 font-black uppercase">Reclamações Altas</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] border-white/20 text-white/50 font-black uppercase">Baixa Rentabilidade</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-[10px] bg-primary/20 text-primary px-3 py-1.5 rounded-lg font-black uppercase cursor-pointer hover:bg-primary/30 transition-all">Ver Sophia Insight</span>
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
