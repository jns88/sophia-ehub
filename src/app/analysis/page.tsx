"use client"

import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { Info, Target, TrendingUp, AlertTriangle } from "lucide-react"

export default function AnalysisPage() {
  const products = MOCK_PRODUCTS
  
  const rankingLucro = [...products].sort((a, b) => b.lucroLiquido - a.lucroLiquido)
  const rankingMargem = [...products].sort((a, b) => b.margemPercentual - a.margemPercentual)
  const rankingRoas = products
    .filter(p => typeof p.roas === 'number')
    .sort((a, b) => (b.roas as number) - (a.roas as number))

  const countA = products.filter(p => p.classificacaoABC === 'A').length
  const countB = products.filter(p => p.classificacaoABC === 'B').length
  const countC = products.filter(p => p.classificacaoABC === 'C').length

  const abcData = [
    { name: 'Classe A', value: countA, color: '#7070C2', desc: '80% Faturamento' },
    { name: 'Classe B', value: countB, color: '#63DBFF', desc: '15% Faturamento' },
    { name: 'Classe C', value: countC, color: '#4B4B8F', desc: '5% Faturamento' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-headline">Análises Profundas</h1>
        <p className="text-muted-foreground">Exploração de performance comercial, rentabilidade e curva ABC.</p>
      </div>

      <Tabs defaultValue="rankings" className="space-y-6">
        <TabsList className="bg-secondary/50 border border-white/5 p-1">
          <TabsTrigger value="rankings" className="data-[state=active]:bg-primary">Performance & Rankings</TabsTrigger>
          <TabsTrigger value="abc" className="data-[state=active]:bg-primary">Curva ABC Estratégica</TabsTrigger>
          <TabsTrigger value="operation" className="data-[state=active]:bg-primary">Alertas Operacionais</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Top Lucro Líquido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rankingLucro.slice(0, 8).map((p, i) => (
                    <div key={p.sku} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white/20 group-hover:text-primary transition-colors">0{i+1}</span>
                        <div className="truncate max-w-[140px]">
                          <p className="text-xs font-bold truncate text-white">{p.nomeProduto}</p>
                          <p className="text-[9px] text-muted-foreground">{p.sku}</p>
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
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Top Margem %</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rankingMargem.slice(0, 8).map((p, i) => (
                    <div key={p.sku} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white/20 group-hover:text-accent transition-colors">0{i+1}</span>
                        <div className="truncate max-w-[140px]">
                          <p className="text-xs font-bold truncate text-white">{p.nomeProduto}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-accent">{p.margemPercentual.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Eficiência ROAS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rankingRoas.slice(0, 8).map((p, i) => (
                    <div key={p.sku} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white/20 group-hover:text-white transition-colors">0{i+1}</span>
                        <div className="truncate max-w-[140px]">
                          <p className="text-xs font-bold truncate text-white">{p.nomeProduto}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-white">{(p.roas as number).toFixed(2)}</span>
                        <span className="text-[8px] text-muted-foreground">Retorno/Inv</span>
                      </div>
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
                <CardTitle className="text-lg">Composição do Faturamento</CardTitle>
                <CardDescription>Critério de Pareto aplicado ao catálogo.</CardDescription>
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
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">{item.name}</p>
                    <p className="text-lg font-black text-white">{item.value}</p>
                    <p className="text-[8px] text-accent/70">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Produtos Classe A</CardTitle>
                <CardDescription>O núcleo da sua receita. Requerem monitoramento constante de margem.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5">
                      <TableHead>SKU</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                      <TableHead className="text-right">Margem %</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.filter(p => p.classificacaoABC === 'A').map(p => (
                      <TableRow key={p.sku} className="border-white/5 hover:bg-white/5">
                        <TableCell className="font-mono text-[10px] text-muted-foreground">{p.sku}</TableCell>
                        <TableCell className="text-xs font-bold text-white truncate max-w-[200px]">{p.nomeProduto}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.precoVenda)}</TableCell>
                        <TableCell className="text-right text-accent font-black">{p.margemPercentual.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={p.status === 'APROVADO' ? 'default' : 'secondary'} className="text-[9px]">
                            {p.status}
                          </Badge>
                        </TableCell>
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
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                  Plano de Ação: Alertas Ativos
                </CardTitle>
                <CardDescription>Produtos que estão prejudicando a performance global e exigem decisão.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5">
                    <TableHead>Produto / SKU</TableHead>
                    <TableHead>Principal Ofensor</TableHead>
                    <TableHead className="text-right">Impacto Financeiro</TableHead>
                    <TableHead className="text-right">Sugestão Sophia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.filter(p => p.status !== 'APROVADO').map(p => (
                    <TableRow key={p.sku} className="border-white/5 hover:bg-rose-500/5 transition-colors">
                      <TableCell>
                        <p className="text-sm font-bold text-white">{p.nomeProduto}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{p.sku}</p>
                      </TableCell>
                      <TableCell>
                        {p.margemPercentual < 0 ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="text-[9px] font-black">MARGEM NEGATIVA</Badge>
                          </div>
                        ) : p.reclamacaoPercentual > 3 ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] border-amber-500 text-amber-500 font-black">RECLAMAÇÃO ALTA</Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] border-white/20 text-white/50 font-black">RENTABILIDADE BAIXA</Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-rose-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.lucroLiquido)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded font-bold uppercase cursor-pointer hover:bg-primary/30 transition-all">Ver Insight IA</span>
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
