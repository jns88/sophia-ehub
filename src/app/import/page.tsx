"use client"

import { useState, useEffect } from "react"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Table as TableIcon, Link as LinkIcon, Layers, ChevronRight, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { DEFAULT_COMPANY_ID } from "@/lib/mock-data"
import { calculateProductMetrics, applyABCClassification } from "@/lib/engine"
import { Product } from "@/lib/types"
import * as XLSX from "xlsx"

const REQUIRED_COLUMNS = ["sku", "nomeProduto", "precoVenda", "custoProduto"]

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>("")
  const [activeCompanyId, setActiveCompanyId] = useState(DEFAULT_COMPANY_ID)
  const [importError, setImportError] = useState<string | null>(null)
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const companyId = localStorage.getItem('sophia_active_company_id') || DEFAULT_COMPANY_ID
    setActiveCompanyId(companyId)
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    setPreviewData(null)
    setAvailableSheets([])
    setSelectedSheet("")
    setWorkbook(null)

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const extension = selectedFile.name.split('.').pop()?.toLowerCase()
      
      if (extension !== 'csv' && extension !== 'xlsx') {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo CSV ou XLSX.",
          variant: "destructive"
        })
        return
      }

      setFile(selectedFile)

      try {
        const data = await selectedFile.arrayBuffer()
        const wb = XLSX.read(data, { type: 'array' })
        setWorkbook(wb)
        
        const sheets = wb.SheetNames
        setAvailableSheets(sheets)

        // Prioritize "Importacao_App"
        const primarySheet = sheets.find(s => s.toLowerCase() === "importacao_app") || sheets[0]
        setSelectedSheet(primarySheet)
        handleSheetChange(primarySheet, wb)

      } catch (err: any) {
        console.error("Erro ao ler arquivo:", err)
        setImportError(`Falha ao ler o arquivo: ${err.message || 'Erro desconhecido'}`)
        toast({
          title: "Erro de Leitura",
          description: "Não foi possível processar o arquivo. Verifique se ele não está corrompido.",
          variant: "destructive"
        })
      }
    }
  }

  const handleSheetChange = (sheetName: string, wbOverride?: XLSX.WorkBook) => {
    const activeWb = wbOverride || workbook
    if (!activeWb) return

    try {
      const sheet = activeWb.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)
      
      if (jsonData.length === 0) {
        setImportError(`A aba "${sheetName}" está vazia.`)
        setPreviewData(null)
        return
      }

      // Basic column validation check on the first row
      const firstRowKeys = Object.keys(jsonData[0] as object).map(k => k.toLowerCase())
      const missing = REQUIRED_COLUMNS.filter(col => !firstRowKeys.includes(col.toLowerCase()))
      
      if (missing.length > 0) {
        setImportError(`Colunas obrigatórias ausentes na aba "${sheetName}": ${missing.join(", ")}.`)
      } else {
        setImportError(null)
      }

      setPreviewData(jsonData.slice(0, 10)) // Amostra para preview
    } catch (err: any) {
      console.error("Erro ao processar aba:", err)
      setImportError(`Erro ao processar dados da aba: ${err.message}`)
    }
  }

  const handleImport = async () => {
    if (!file || !workbook || !selectedSheet) return
    
    setImporting(true)
    setImportError(null)

    try {
      const sheet = workbook.Sheets[selectedSheet]
      const jsonData = XLSX.utils.sheet_to_json(sheet) as any[]

      if (jsonData.length === 0) {
        throw new Error("Não há dados para importar nesta aba.")
      }

      // Final full validation
      const firstRow = jsonData[0]
      const columns = Object.keys(firstRow).map(k => k.toLowerCase())
      const missing = REQUIRED_COLUMNS.filter(col => !columns.includes(col.toLowerCase()))

      if (missing.length > 0) {
        throw new Error(`Validação falhou. Colunas ausentes: ${missing.join(", ")}`)
      }

      // Map spreadsheet columns to Product interface (case-insensitive)
      const normalizedData = jsonData.map(row => {
        const normalizedRow: any = {}
        Object.keys(row).forEach(key => {
          const lowerKey = key.toLowerCase()
          normalizedRow[lowerKey] = row[key]
        })

        // Specific mapping if spreadsheet uses different names
        return {
          sku: String(normalizedRow.sku || ''),
          nomeProduto: String(normalizedRow.nomeproduto || normalizedRow.productname || ''),
          categoria: String(normalizedRow.categoria || normalizedRow.category || 'Geral'),
          marketplace: String(normalizedRow.marketplace || normalizedRow.channel || 'Mercado Livre'),
          marca: String(normalizedRow.marca || normalizedRow.brand || 'N/A'),
          tipoEnvio: String(normalizedRow.tipoenvio || normalizedRow.shippingtype || 'N/A'),
          precoVenda: Number(normalizedRow.precovenda || normalizedRow.saleprice || 0),
          custoProduto: Number(normalizedRow.custoproduto || normalizedRow.productcost || 0),
          comissaoMarketplace: Number(normalizedRow.comissaomarketplace || normalizedRow.marketplacecommission || 0),
          custoLogistico: Number(normalizedRow.custologistico || normalizedRow.logisticscost || 0),
          investimentoAds: Number(normalizedRow.investimentoads || normalizedRow.adinvestment || 0),
          reclamacaoPercentual: Number(normalizedRow.reclamacaopercentual || normalizedRow.complaintrate || 0) / 100,
        }
      }).filter(p => p.sku && p.sku !== "undefined")

      if (normalizedData.length === 0) {
        throw new Error("Nenhum dado válido encontrado após a normalização (verifique SKUs).")
      }

      // Process through analytics engine
      const processedProducts = normalizedData.map(p => calculateProductMetrics({
        ...p,
        companyId: activeCompanyId,
        origemDados: file.name.endsWith('.csv') ? 'CSV' : 'XLSX'
      } as Partial<Product>))

      const finalizedProducts = applyABCClassification(processedProducts)

      // Persist to Workspace
      const storedKey = `sophia_products_${activeCompanyId}`
      const existingProductsRaw = localStorage.getItem(storedKey)
      const existingProducts: Product[] = existingProductsRaw ? JSON.parse(existingProductsRaw) : []
      
      const existingSkus = new Set(existingProducts.map(p => p.sku))
      const uniqueNewProducts = finalizedProducts.filter(p => !existingSkus.has(p.sku))
      
      const updatedCatalog = [...existingProducts, ...uniqueNewProducts]
      localStorage.setItem(storedKey, JSON.stringify(updatedCatalog))

      toast({
        title: "Ingestão Concluída!",
        description: `${uniqueNewProducts.length} novos SKUs foram integrados.`,
      })
      
      // Cleanup
      setFile(null)
      setPreviewData(null)
      setAvailableSheets([])
      setSelectedSheet("")
      setWorkbook(null)
      
    } catch (error: any) {
      console.error("Erro no processamento de importação:", error)
      setImportError(error.message || "Erro inesperado durante a ingestão.")
      toast({
        title: "Falha na Importação",
        description: "Não foi possível completar a ingestão. Verifique o arquivo.",
        variant: "destructive"
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white font-headline">Importar Dados</h1>
          <p className="text-muted-foreground text-lg font-medium">Conecte planilhas ao motor analítico com segurança.</p>
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
              <CardDescription>Formatos aceitos: .csv, .xlsx</CardDescription>
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
                    <p className="text-base font-black text-white">{file ? file.name : "Selecionar Planilha"}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">Clique para abrir o explorador</p>
                  </div>
                </label>
              </div>

              {availableSheets.length > 0 && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                    <Layers className="h-3 w-3" /> Aba do Workbook
                  </Label>
                  <Select value={selectedSheet} onValueChange={(val) => {
                    setSelectedSheet(val)
                    handleSheetChange(val)
                  }}>
                    <SelectTrigger className="h-12 bg-secondary/40 border-white/5 rounded-xl font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSheets.map(sheet => (
                        <SelectItem key={sheet} value={sheet} className="font-bold">
                          {sheet} {sheet.toLowerCase() === "importacao_app" && "(Recomendada)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {importError && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl animate-in shake duration-500">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle className="font-black uppercase text-[10px]">Erro de Validação</AlertTitle>
                  <AlertDescription className="text-xs font-medium">
                    {importError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={handleImport} 
                  disabled={!file || importing || !!importError || !previewData} 
                  className="w-full h-14 text-lg font-black rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" /> Ingerindo...
                    </>
                  ) : (
                    "Carregar para Sistema"
                  )}
                </Button>
                <Button variant="outline" className="w-full h-12 border-white/5 opacity-50 cursor-not-allowed rounded-xl font-bold">
                  <LinkIcon className="h-4 w-4 mr-2" /> API Marketplace (Breve)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none">
            <CardHeader className="p-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Colunas Necessárias</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <ul className="text-[10px] space-y-3 font-bold uppercase tracking-widest">
                <li className="flex items-center gap-3 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> SKU (ID Único)</li>
                <li className="flex items-center gap-3 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> NomeProduto</li>
                <li className="flex items-center gap-3 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> PrecoVenda</li>
                <li className="flex items-center gap-3 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> CustoProduto</li>
              </ul>
              <p className="mt-4 text-[9px] text-muted-foreground/60 italic">
                * Se o arquivo falhar, exporte a aba como CSV e tente novamente.
              </p>
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
                  <CardDescription>Dados detectados na aba: <span className="text-primary font-black">{selectedSheet}</span></CardDescription>
                </div>
                <Badge className="h-8 px-4 bg-primary text-[10px] font-black uppercase rounded-lg">Amostra de Dados</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5">
                        <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest">Linha</TableHead>
                        {Object.keys(previewData[0] || {}).slice(0, 4).map(key => (
                          <TableHead key={key} className="py-6 text-[10px] font-black uppercase tracking-widest">{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, idx) => (
                        <TableRow key={idx} className="border-white/5 hover:bg-white/[0.01]">
                          <TableCell className="py-6 px-8 text-[10px] font-mono text-muted-foreground">{idx + 1}</TableCell>
                          {Object.values(row as object).slice(0, 4).map((val, vIdx) => (
                            <TableCell key={vIdx} className="py-6 text-sm font-medium text-white/80">
                              {String(val)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Validação estrutural concluída para a amostra acima.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-card/30 p-12 text-center space-y-8 group transition-all hover:bg-card/50">
              <div className="h-24 w-24 rounded-full bg-secondary/30 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white">Aguardando Planilha</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">Carregue um arquivo para validar o esquema e iniciar a ingestão analítica.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}