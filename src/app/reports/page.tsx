
"use client"

import { useState, useEffect } from "react"
import { FileText, Download, LayoutList, Database, ShoppingBag, CheckCircle2, Calendar, FileSpreadsheet, Loader2 } from "lucide-react"
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
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [generating, setGenerating] = useState<'none' | 'pdf' | 'xlsx'>('none')
  const [readyReport, setReadyReport] = useState<'none' | 'pdf' | 'xlsx'>('none')
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    const now = new Date();
    const currentYearNum = now.getFullYear();
    const yearsList = Array.from({ length: 5 }, (_, i) => (currentYearNum - 2 + i).toString());
    setAvailableYears(yearsList);
    setSelectedMonth((now.getMonth() + 1).toString().padStart(2, '0'));
    setSelectedYear(currentYearNum.toString());
  }, [])

  const toggleMetric = (id: string) => {
    setSelectedMetrics(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const handleGenerate = async (type: 'pdf' | 'xlsx') => {
    setGenerating(type)
    setReadyReport('none')
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    setGenerating('none')
    setReadyReport(type)
    
    toast({
      title: `Relatório ${type.toUpperCase()} Gerado!`,
      description: `O arquivo está pronto para exportação.`,
    })
  }

  const handleDownload = (type: 'pdf' | 'xlsx') => {
    toast({
      title: "Download Iniciado",
      description: `Iniciando transferência do arquivo ${type.toUpperCase()}...`,
    })
    // Reset state after "download"
    setTimeout(() => setReadyReport('none'), 1000)
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight font-headline">Gerador de Relatórios</h1>
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
                    <Calendar className="h-3 w-3" /> Período de Análise
                  </Label>
                  <div className="flex gap-2">
                    {mounted && (
                      <>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                          <SelectTrigger className="bg-secondary/40 border-white/5 h-12 rounded-xl font-bold flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="01">Jan</SelectItem>
                            <SelectItem value="02">Fev</SelectItem>
                            <SelectItem value="03">Mar</SelectItem>
                            <SelectItem value="04">Abr</SelectItem>
                            <SelectItem value="05">Mai</SelectItem>
                            <SelectItem value="06">Jun</SelectItem>
                            <SelectItem value="07">Jul</SelectItem>
                            <SelectItem value="08">Ago</SelectItem>
                            <SelectItem value="09">Set</SelectItem>
                            <SelectItem value="10">Out</SelectItem>
                            <SelectItem value="11">Nov</SelectItem>
                            <SelectItem value="12">Dez</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger className="bg-secondary/40 border-white/5 h-12 rounded-xl font-bold w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableYears.map(year => (
                              <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                    <ShoppingBag className="h-3 w-3" /> Canal / Marketplace
                  </Label>
                  <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                    <SelectTrigger className="bg-secondary/40 border-white/5 h-12 rounded-xl font-bold">
                      <SelectValue placeholder="Selecione o canal..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Consolidado (Todos os Canais)</SelectItem>
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
                    <SelectTrigger className="bg-secondary/40 border-white/5 h-12 rounded-xl font-bold">
                      <SelectValue placeholder="Selecione a origem..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Origens</SelectItem>
                      <SelectItem value="API">Canais via API</SelectItem>
                      <SelectItem value="Manual">Arquivos Manuais (CSV/XLSX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-white/5" />

              <div className="space-y-6">
                <Label className="text-sm font-black uppercase tracking-widest">Métricas de Auditoria</Label>
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
                        className="text-[10px] font-black uppercase tracking-wider text-muted-foreground cursor-pointer"
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
              <CardTitle className="xl font-black">Exportação</CardTitle>
              <CardDescription>Status da geração de arquivos.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 flex-1 space-y-6">
              <div className="bg-secondary/40 rounded-2xl p-6 space-y-4 border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Escopo:</span>
                  <span className="font-black uppercase text-white truncate max-w-[150px]">
                    {selectedChannel === 'all' ? 'Consolidado' : selectedChannel}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Período:</span>
                  <span className="font-black uppercase text-white">{selectedMonth}/{selectedYear}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Métricas:</span>
                  <span className="text-primary font-black uppercase">{selectedMetrics.length} KPIs</span>
                </div>
              </div>
              
              <div className="text-[10px] text-muted-foreground italic flex gap-3 leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>O Sophia E-Hub processará os dados filtrados respeitando as normas de auditoria e o fuso de Brasília.</span>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0 flex flex-col gap-4">
              {readyReport === 'none' ? (
                <>
                  <Button 
                    onClick={() => handleGenerate('xlsx')} 
                    className="w-full h-14 text-lg font-black rounded-xl shadow-xl shadow-primary/20" 
                    disabled={generating !== 'none'}
                  >
                    {generating === 'xlsx' ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : <FileSpreadsheet className="h-5 w-5 mr-3" />}
                    {generating === 'xlsx' ? "Gerando Planilha..." : "Gerar XLSX"}
                  </Button>
                  <Button 
                    onClick={() => handleGenerate('pdf')} 
                    variant="outline" 
                    className="w-full h-14 text-lg font-black rounded-xl border-white/10"
                    disabled={generating !== 'none'}
                  >
                    {generating === 'pdf' ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : <FileText className="h-5 w-5 mr-3" />}
                    {generating === 'pdf' ? "Gerando PDF..." : "Gerar PDF"}
                  </Button>
                </>
              ) : (
                <div className="space-y-4 w-full animate-in zoom-in-95">
                  <Button 
                    className="w-full h-14 text-lg font-black rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20" 
                    onClick={() => handleDownload(readyReport)}
                  >
                    <Download className="h-5 w-5 mr-3" />
                    Baixar {readyReport.toUpperCase()}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full text-xs font-black uppercase tracking-widest text-muted-foreground"
                    onClick={() => setReadyReport('none')}
                  >
                    Cancelar / Gerar outro
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
