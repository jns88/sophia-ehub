"use client"

import { useState } from "react"
import { FileText, Download, CheckCircle2, ChevronRight, LayoutList, Calendar } from "lucide-react"
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
  { id: "status", label: "Status do Produto" },
  { id: "reclamacoes", label: "Reclamações" },
  { id: "abc", label: "Classificação ABC" },
]

export default function ReportsPage() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["receita", "lucro", "status"])
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
      description: `O arquivo em formato ${format} está pronto para download.`,
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Gerador de Relatórios</h1>
        <p className="text-muted-foreground">Crie relatórios gerenciais personalizados para exportação e apresentações.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LayoutList className="h-5 w-5 text-primary" />
                Configuração do Escopo
              </CardTitle>
              <CardDescription>Defina o período e os produtos que serão incluídos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Tipo de Período</Label>
                  <Select defaultValue="mensal">
                    <SelectTrigger className="bg-secondary/50 border-white/5">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="periodo">Por Período Customizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Filtro de Produtos</Label>
                  <Select defaultValue="todos">
                    <SelectTrigger className="bg-secondary/50 border-white/5">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Produtos</SelectItem>
                      <SelectItem value="criticos">Apenas Críticos</SelectItem>
                      <SelectItem value="atencao">Apenas Atenção</SelectItem>
                      <SelectItem value="abc_a">Apenas Curva A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-white/5" />

              <div className="space-y-4">
                <Label className="text-base">Métricas a Incluir</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={metric.id} 
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => toggleMetric(metric.id)}
                      />
                      <label 
                        htmlFor={metric.id} 
                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
          <Card className="glass-card h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Exportação</CardTitle>
              <CardDescription>Resumo do relatório configurado.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Período:</span>
                  <span className="text-white font-medium">Outubro 2023</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Métricas selecionadas:</span>
                  <span className="text-white font-medium">{selectedMetrics.length} métricas</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status do Catálogo:</span>
                  <span className="text-white font-medium">Consolidado</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground italic flex gap-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5" />
                Relatório gerencial pronto para suporte à decisão.
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                onClick={() => handleGenerate('XLSX')} 
                className="w-full" 
                disabled={generating}
              >
                <Download className="h-4 w-4 mr-2" />
                {generating ? "Processando..." : "Gerar XLSX"}
              </Button>
              <Button 
                onClick={() => handleGenerate('PDF')} 
                variant="outline" 
                className="w-full border-white/10"
                disabled={generating}
              >
                <FileText className="h-4 w-4 mr-2" />
                Gerar PDF Gerencial
              </Button>
              <Button variant="ghost" className="w-full text-xs text-muted-foreground">
                Exportação em CSV
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
