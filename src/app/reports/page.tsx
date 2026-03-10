"use client"

import { useState } from "react"
import { FileText, Download, CheckCircle2, LayoutList, Database, ShoppingBag, Filter, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

const metrics = [
  { id: "receita", label: "Receita Total" },
  { id: "lucro", label: "Lucro Líquido" },
  { id: "margem", label: "Margem %" },
  { id: "roas", label: "ROAS" },
  { id: "score", label: "Score Estratégico" },
  { id: "origem", label: "Origem dos Dados" },
  { id: "abc", label: "Classificação ABC" },
  { id: "status", label: "Status Operacional" },
]

export default function ReportsPage() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["receita", "lucro", "abc", "origem"])
  const [selectedChannel, setSelectedChannel] = useState("all")
  const [selectedSource, setSelectedSource] = useState("all")
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  const toggleMetric = (id: string) => {
    setSelectedMetrics(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const handleGenerate = async (format: string) => {
    setGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setGenerating(false)
    toast({
      title: "Relatório gerado com sucesso!",
      description: `Relatório ${selectedChannel === 'all' ? 'Geral' : selectedChannel} em formato ${format} pronto.`,
    })
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white font-headline">Gerador de Relatórios</h1>
        <p className="text-muted-foreground text-lg font-medium">Exportação gerencial para suporte à decisão corporativa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-none shadow-2xl">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <LayoutList className="h-6 w-6 text-primary" /> Configuração do Escopo
              </CardTitle>
              <CardDescription>Defina os canais, origens e métricas para o documento.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                    <ShoppingBag className="h-3 w-3" /> Canal / Marketplace
                  </Label>
                  <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                    <SelectTrigger className="bg-secondary/40 border-white/5 h-12 rounded-xl text-white font-bold">
                      <SelectValue placeholder="Selecione o canal..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Canais (Consolidado)</SelectItem>
                      <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
                      <SelectItem value="Amazon">Amazon</SelectItem>
                      <SelectItem value="Shopee">Shopee</SelectItem>
                      <SelectItem value="Magalu">Magalu</SelectItem>
                      <SelectItem value="B2W / Americanas">B2W / Americanas</SelectItem>
                      <SelectItem value="Loja Própria / Site">Loja Própria / Site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                    <Database className="h-3 w-3" /> Origem do Dado
                  </Label>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger className="bg-secondary/40 border-white/5 h-12 rounded-xl text-white font-bold">
                      <SelectValue placeholder="Selecione a origem..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Origens</SelectItem>
                      <SelectItem value="API">Apenas APIs Reais</SelectItem>
                      <SelectItem value="Manual">Apenas Manual (CSV/XLSX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                    <BarChart3 className="h-3 w-3" /> Classe ABC
                  </Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="bg-secondary/40 border-white/5 h-12 rounded-xl text-white font-bold">
                      <SelectValue placeholder="Todas as classes..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Classes (ABC)</SelectItem>
                      <SelectItem value="A">Apenas Classe A</SelectItem>
                      <SelectItem value="B">Apenas Classe B</SelectItem>
                      <SelectItem value="C">Apenas Classe C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                    <Filter className="h-3 w-3" /> Status do Produto
                  </Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="bg-secondary/40 border-white/5 h-12 rounded-xl text-white font-bold">
                      <SelectValue placeholder="Todos os status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="APROVADO">Apenas Aprovados</SelectItem>
                      <SelectItem value="ATENÇÃO">Apenas Atenção</SelectItem>
                      <SelectItem value="CRÍTICO">Apenas Críticos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-white/5" />

              <div className="space-y-6">
                <Label className="text-sm font-black uppercase tracking-widest text-white">Métricas de Auditoria</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer">
                      <Checkbox 
                        id={metric.id} 
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => toggleMetric(metric.id)}
                        className="rounded-md border-white/20"
                      />
                      <label 
                        htmlFor={metric.id} 
                        className="text-[10px] font-black uppercase tracking-wider leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-white/70"
                      >
                        {metric.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="glass-card h-full flex flex-col border-none shadow-2xl">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black">Exportação Gerencial</CardTitle>
              <CardDescription>Resumo estrutural do relatório.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 flex-1 space-y-6">
              <div className="bg-secondary/40 rounded-2xl p-6 space-y-4 border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Escopo:</span>
                  <span className="text-white font-black uppercase">{selectedChannel === 'all' ? 'Consolidado' : selectedChannel}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Origem:</span>
                  <span className="text-white font-black uppercase">{selectedSource === 'all' ? 'Híbrido' : selectedSource}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Métricas:</span>
                  <span className="text-primary font-black uppercase">{selectedMetrics.length} KPIs</span>
                </div>
              </div>
              
              <div className="text-[10px] text-muted-foreground italic flex gap-3 leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>O motor analítico Sophia processará os dados segmentados para gerar o documento solicitado.</span>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0 flex flex-col gap-4">
              <Button 
                onClick={() => handleGenerate('XLSX')} 
                className="w-full h-14 text-lg font-black rounded-xl shadow-xl shadow-primary/20" 
                disabled={generating}
              >
                <Download className="h-5 w-5 mr-3" />
                {generating ? "Processando..." : "Gerar Planilha (XLSX)"}
              </Button>
              <Button 
                onClick={() => handleGenerate('PDF')} 
                variant="outline" 
                className="w-full h-14 text-lg font-black rounded-xl border-white/10"
                disabled={generating}
              >
                <FileText className="h-5 w-5 mr-3" />
                Gerar PDF Gerencial
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
