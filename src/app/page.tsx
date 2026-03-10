import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { KpiCard } from "@/components/kpi-card"
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  BarChart, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Info
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const products = MOCK_PRODUCTS
  
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

  const topMargem = [...products].sort((a, b) => b.margemPercentual - a.margemPercentual).slice(0, 10)
  const topPrejuizo = [...products].sort((a, b) => a.lucroLiquido - b.lucroLiquido).slice(0, 10)

  // ABC logic for visual display
  const countA = products.filter(p => p.classificacaoABC === 'A').length
  const countB = products.filter(p => p.classificacaoABC === 'B').length
  const countC = products.filter(p => p.classificacaoABC === 'C').length

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white font-headline">Dashboard Operacional</h1>
          <p className="text-muted-foreground text-lg">Leitura estratégica e rentabilidade do catálogo.</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="px-4 py-2 border-primary/30 bg-primary/5 text-primary text-sm font-semibold">
            Status: Consolidado
          </Badge>
          <Badge variant="outline" className="px-4 py-2 border-accent/30 bg-accent/5 text-accent text-sm font-semibold">
            {totalProdutos} SKUs Ativos
          </Badge>
        </div>
      </div>

      <div className="dashboard-grid">
        <KpiCard 
          title="Receita Total" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitaTotal)} 
          icon={TrendingUp} 
          trend={{ value: 12.4, positive: true }}
          description="vs. mês anterior"
        />
        <KpiCard 
          title="Lucro Líquido" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucroLiquidoTotal)} 
          icon={DollarSign} 
          accent
          trend={{ value: 4.8, positive: true }}
          description="Líquido real"
        />
        <KpiCard 
          title="Margem Média" 
          value={`${margemMedia.toFixed(1)}%`} 
          icon={Percent} 
          description="Meta global: 18%"
        />
        <KpiCard 
          title="ROAS Geral" 
          value={roasMedio.toFixed(2)} 
          icon={BarChart} 
          description="Eficiência de Ads"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card md:col-span-1 border-none shadow-xl flex flex-col justify-center items-center text-center p-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h4 className="text-4xl font-black text-white">{totalProdutos}</h4>
          <p className="text-muted-foreground uppercase text-xs tracking-widest font-bold mt-1">Produtos no Hub</p>
        </Card>
        <div className="grid grid-cols-3 md:col-span-3 gap-6">
          <div className="glass-card border-none bg-emerald-500/5 p-6 rounded-xl flex items-center justify-between group hover:bg-emerald-500/10 transition-colors">
            <div>
              <p className="text-xs font-bold text-emerald-400/70 uppercase tracking-widest">Aprovados</p>
              <h4 className="text-3xl font-black text-white mt-1">{produtosAprovados}</h4>
              <p className="text-[10px] text-emerald-400 mt-1 font-medium">Operação saudável</p>
            </div>
            <CheckCircle2 className="h-10 w-10 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="glass-card border-none bg-amber-500/5 p-6 rounded-xl flex items-center justify-between group hover:bg-amber-500/10 transition-colors">
            <div>
              <p className="text-xs font-bold text-amber-400/70 uppercase tracking-widest">Atenção</p>
              <h4 className="text-3xl font-black text-white mt-1">{produtosAtencao}</h4>
              <p className="text-[10px] text-amber-400 mt-1 font-medium">Requer análise</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
          </div>
          <div className="glass-card border-none bg-rose-500/5 p-6 rounded-xl flex items-center justify-between group hover:bg-rose-500/10 transition-colors">
            <div>
              <p className="text-xs font-bold text-rose-400/70 uppercase tracking-widest">Críticos</p>
              <h4 className="text-3xl font-black text-white mt-1">{produtosCriticos}</h4>
              <p className="text-[10px] text-rose-400 mt-1 font-medium">Risco imediato</p>
            </div>
            <AlertCircle className="h-10 w-10 text-rose-500/40 group-hover:text-rose-500 transition-colors" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                Top 10 por Margem
              </CardTitle>
              <CardDescription>Produtos com maior rentabilidade percentual.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topMargem.map((p, idx) => (
                  <TableRow key={p.sku} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <p className="font-medium text-sm truncate max-w-[280px] text-white">{p.nomeProduto}</p>
                      <p className="text-[10px] text-muted-foreground">{p.sku}</p>
                    </TableCell>
                    <TableCell className="text-right text-emerald-400 font-black">{p.margemPercentual.toFixed(1)}%</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.lucroLiquido)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-accent" />
              Alertas e Curva ABC
            </CardTitle>
            <CardDescription>Resumo operacional do catálogo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Distribuição ABC</h5>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">Classe A (80% Receita)</span>
                    <span className="text-accent">{countA} SKUs</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(countA/totalProdutos)*100}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">Classe B (15% Receita)</span>
                    <span className="text-accent">{countB} SKUs</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(countB/totalProdutos)*100}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">Classe C (5% Receita)</span>
                    <span className="text-accent">{countC} SKUs</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/30" style={{ width: `${(countC/totalProdutos)*100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alertas Operacionais</h5>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Margem Negativa Detectada</p>
                    <p className="text-[10px] text-rose-300/70">{produtosCriticos} SKUs estão operando com prejuízo líquido.</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-3">
                  <Info className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">ROAS Abaixo da Meta</p>
                    <p className="text-[10px] text-amber-300/70">Média de 2.45 em campanhas ativas. Meta: 4.00</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ArrowDownRight className="h-5 w-5 text-rose-500" />
            Top 10 Maiores Prejuízos / Riscos
          </CardTitle>
          <CardDescription>Produtos que estão consumindo a margem global.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Lucro Líquido</TableHead>
                <TableHead className="text-right">Ação Recomendada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPrejuizo.map((p, idx) => (
                <TableRow key={p.sku} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell>
                    <p className="font-medium text-sm truncate max-w-[300px] text-white">{p.nomeProduto}</p>
                    <p className="text-[10px] text-muted-foreground">{p.sku}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'CRÍTICO' ? 'destructive' : 'secondary'} className="text-[10px] font-bold">
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn("text-right font-black font-mono text-xs", p.lucroLiquido < 0 ? "text-rose-400" : "text-white")}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.lucroLiquido)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-[10px] text-accent font-medium cursor-pointer hover:underline">Analisar na Consulta</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
