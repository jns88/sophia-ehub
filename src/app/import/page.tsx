
"use client"

import { useState, useEffect } from "react"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Table as TableIcon, Link as LinkIcon, Layers, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DEFAULT_COMPANY_ID } from "@/lib/mock-data"
import { calculateProductMetrics, applyABCClassification } from "@/lib/engine"
import { Product, DataSource } from "@/lib/types"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>("")
  const [activeCompanyId, setActiveCompanyId] = useState(DEFAULT_COMPANY_ID)
  const { toast } = useToast()

  useEffect(() => {
    const companyId = localStorage.getItem('sophia_active_company_id') || DEFAULT_COMPANY_ID
    setActiveCompanyId(companyId)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const extension = selectedFile.name.split('.').pop()?.toLowerCase()
      
      if (extension === 'csv' || extension === 'xlsx') {
        setFile(selectedFile)
        // Simula detecção de múltiplas abas em um Workbook
        if (extension === 'xlsx') {
          const sheets = ["Base_Raw", "Modelo_Calculos", "Importacao_App", "Vendas_Consolidado"]
          setAvailableSheets(sheets)
          setSelectedSheet("Importacao_App") // Sugere a aba de ingestão por padrão
        } else {
          setAvailableSheets(["CSV_Default"])
          setSelectedSheet("CSV_Default")
        }

        // Simula dados de preview baseados na aba (mock)
        setPreviewData([
          { sku: 'SOPH-101', nomeProduto: 'Fone de Ouvido BT', categoria: 'Áudio', marketplace: 'Mercado Livre', precoVenda: 199.90, custoProduto: 80, comissaoMarketplace: 30, custoLogistico: 15, investimentoAds: 10, reclamacaoPercentual: 0.01 },
          { sku: 'SOPH-102', nomeProduto: 'Carregador Turbo 20W', categoria: 'Acessórios', marketplace: 'Amazon', precoVenda: 89.00, custoProduto: 20, comissaoMarketplace: 13, custoLogistico: 10, investimentoAds: 5, reclamacaoPercentual: 0.00 },
          { sku: 'SOPH-103', nomeProduto: 'Cabo USB-C 2m', categoria: 'Acessórios', marketplace: 'Shopee', precoVenda: 35.00, custoProduto: 5, comissaoMarketplace: 6, custoLogistico: 8, investimentoAds: 0, reclamacaoPercentual: 0.02 },
        ])
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo CSV ou XLSX.",
          variant: "destructive"
        })
      }
    }
  }

  const handleImport = async () => {
    if (!file || !previewData) return
    
    setImporting(true)
    
    // Simula o tempo de processamento do motor analítico
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      // 1. Processa cada item do preview (ou da planilha completa simulada)
      const processedProducts = previewData.map(item => {
        return calculateProductMetrics({
          ...item,
          companyId: activeCompanyId,
          origemDados: file.name.endsWith('.csv') ? 'CSV' : 'XLSX'
        } as Partial<Product>)
      })

      // 2. Aplica a classificação ABC no lote total
      const finalizedProducts = applyABCClassification(processedProducts)

      // 3. Persiste no Workspace Ativo
      const storedKey = `sophia_products_${activeCompanyId}`
      const existingProductsRaw = localStorage.getItem(storedKey)
      const existingProducts: Product[] = existingProductsRaw ? JSON.parse(existingProductsRaw) : []
      
      // Evita duplicatas por SKU
      const existingSkus = new Set(existingProducts.map(p => p.sku))
      const uniqueNewProducts = finalizedProducts.filter(p => !existingSkus.has(p.sku))
      
      const updatedCatalog = [...existingProducts, ...uniqueNewProducts]
      localStorage.setItem(storedKey, JSON.stringify(updatedCatalog))

      setImporting(false)
      toast({
        title: "Ingestão Concluída!",
        description: `${uniqueNewProducts.length} novos SKUs foram integrados ao motor analítico da empresa.`,
      })
      
      // Limpa para novo upload
      setFile(null)
      setPreviewData(null)
      setAvailableSheets([])
      setSelectedSheet("")
      
    } catch (error) {
      setImporting(false)
      toast({
        title: "Erro na Ingestão",
        description: "Não foi possível processar a planilha. Verifique as colunas.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white font-headline">Importar Dados</h1>
          <p className="text-muted-foreground text-lg font-medium">Conecte planilhas e Workbooks ao motor analítico.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-card border-none shadow-2xl overflow-hidden">
            <div className="h-1.5 w-full bg-primary" />
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <Upload className="h-5 w-5 text-primary" /> Fonte de Dados
              </CardTitle>
              <CardDescription>Formatos: .csv, .xlsx (Workbooks)</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div 
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  file ? "border-primary bg-primary/5 shadow-inner" : "border-white/5 hover:border-primary/40 hover:bg-white/5"
                }`}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".csv,.xlsx" 
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer space-y-4 block">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center shadow-xl">
                    {file ? <FileSpreadsheet className="h-8 w-8 text-primary" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-base font-black text-white">{file ? file.name : "Clique para selecionar"}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">ou arraste e solte o arquivo</p>
                  </div>
                </label>
              </div>

              {availableSheets.length > 0 && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                    <Layers className="h-3 w-3" /> Aba Selecionada (Workbook)
                  </Label>
                  <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                    <SelectTrigger className="h-12 bg-secondary/40 border-white/5 rounded-xl font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSheets.map(sheet => (
                        <SelectItem key={sheet} value={sheet} className="font-bold">
                          {sheet} {sheet === "Importacao_App" && "(Recomendado)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={handleImport} 
                  disabled={!file || importing} 
                  className="w-full h-14 text-lg font-black rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" /> Ingerindo Dados...
                    </>
                  ) : (
                    "Carregar para Sistema"
                  )}
                </Button>
                <Button variant="outline" className="w-full h-12 border-white/5 opacity-50 cursor-not-allowed rounded-xl font-bold">
                  <LinkIcon className="h-4 w-4 mr-2" /> Conectar Google Sheets
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none">
            <CardHeader className="p-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Regras de Validação</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <ul className="text-[10px] space-y-3 font-bold uppercase tracking-widest">
                <li className="flex items-center gap-3 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Colunas de ID e Nome</li>
                <li className="flex items-center gap-3 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Valores Financeiros (R$)</li>
                <li className="flex items-center gap-3 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Aba de Ingestão Detectada</li>
                <li className="flex items-center gap-3 text-rose-400"><AlertCircle className="h-4 w-4" /> Sem valores nulos em SKU</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {previewData ? (
            <Card className="glass-card border-none shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700">
              <CardHeader className="flex flex-row items-center justify-between p-8">
                <div>
                  <CardTitle className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter text-white">
                    <TableIcon className="h-6 w-6 text-accent" /> Pré-visualização
                  </CardTitle>
                  <CardDescription>Validação inicial da aba: <span className="text-primary font-black">{selectedSheet}</span></CardDescription>
                </div>
                <Badge className="h-8 px-4 bg-primary text-[10px] font-black uppercase rounded-lg">{previewData.length} SKUs Detetados</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5">
                      <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest">SKU / Produto</TableHead>
                      <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Canal</TableHead>
                      <TableHead className="py-6 text-right text-[10px] font-black uppercase tracking-widest">Preço</TableHead>
                      <TableHead className="py-6 text-right text-[10px] font-black uppercase tracking-widest px-8">Custo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row) => (
                      <TableRow key={row.sku} className="border-white/5 hover:bg-white/[0.01]">
                        <TableCell className="py-6 px-8">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-white">{row.nomeProduto}</span>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">{row.sku} • {row.categoria}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <Badge variant="outline" className="text-[9px] font-bold uppercase border-white/10 bg-white/5">
                            {row.marketplace}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 text-right font-mono text-xs font-bold text-emerald-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.precoVenda)}
                        </TableCell>
                        <TableCell className="py-6 text-right font-mono text-xs text-muted-foreground px-8">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.custoProduto)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Exibindo amostra das primeiras linhas</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-card/30 p-12 text-center space-y-8 group transition-all hover:bg-card/50">
              <div className="h-24 w-24 rounded-full bg-secondary/30 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white">Nenhum Workbook Carregado</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">Faça o upload de uma planilha para validar os dados e iniciar a ingestão analítica.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
