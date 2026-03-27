
"use client"

import { useState, useEffect } from "react"
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Table as TableIcon, 
  Link as LinkIcon, 
  Layers, 
  Loader2, 
  XCircle,
  Info,
  Terminal,
  FileCode,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { DEFAULT_COMPANY_ID } from "@/lib/mock-data"
import { calculateProductMetrics, applyABCClassification } from "@/lib/engine"
import { Product } from "@/lib/types"
import * as XLSX from "xlsx"
import { cn } from "@/lib/utils"

const REQUIRED_COLUMNS = ["sku", "nomeProduto", "precoVenda", "custoProduto"]

type ImportStage = 'idle' | 'file-read' | 'workbook-parse' | 'sheet-selection' | 'column-validation' | 'data-mapping' | 'state-update' | 'success' | 'error';

interface DebugInfo {
  fileType: string;
  fileSize: string;
  sheets: string[];
  selectedSheet: string;
  columns: string[];
  rowCount: number;
  validationResult: string;
  importResult: string;
  lastErrorStage?: ImportStage;
}

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

  // Debug states
  const [currentStage, setCurrentStage] = useState<ImportStage>('idle')
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    fileType: '',
    fileSize: '',
    sheets: [],
    selectedSheet: '',
    columns: [],
    rowCount: 0,
    validationResult: '',
    importResult: ''
  })

  useEffect(() => {
    const companyId = localStorage.getItem('sophia_active_company_id') || DEFAULT_COMPANY_ID
    setActiveCompanyId(companyId)
  }, [])

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    setPreviewData(null)
    setAvailableSheets([])
    setSelectedSheet("")
    setWorkbook(null)
    setCurrentStage('idle')

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
      
      setDebugInfo(prev => ({
        ...prev,
        fileType: selectedFile.type || extension || 'unknown',
        fileSize: formatSize(selectedFile.size),
        validationResult: 'Aguardando parsing...'
      }))

      try {
        setCurrentStage('file-read')
        const data = await selectedFile.arrayBuffer()
        
        setCurrentStage('workbook-parse')
        const wb = XLSX.read(data, { type: 'array' })
        setWorkbook(wb)
        
        const sheets = wb.SheetNames
        setAvailableSheets(sheets)
        
        setDebugInfo(prev => ({
          ...prev,
          sheets: sheets,
          validationResult: 'Workbook carregado. Selecione a aba.'
        }))

        // Prioritize "Importacao_App"
        setCurrentStage('sheet-selection')
        const primarySheet = sheets.find(s => s.toLowerCase() === "importacao_app") || sheets[0]
        setSelectedSheet(primarySheet)
        handleSheetChange(primarySheet, wb)

      } catch (err: any) {
        console.error("Erro ao ler arquivo:", err)
        setCurrentStage('error')
        setImportError(`Falha ao ler o arquivo: ${err.message || 'Erro desconhecido'}`)
        setDebugInfo(prev => ({ ...prev, lastErrorStage: 'workbook-parse', validationResult: 'Falha crítica no parsing' }))
      }
    }
  }

  const handleSheetChange = (sheetName: string, wbOverride?: XLSX.WorkBook) => {
    const activeWb = wbOverride || workbook
    if (!activeWb) return

    try {
      setCurrentStage('column-validation')
      const sheet = activeWb.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)
      
      if (jsonData.length === 0) {
        setImportError(`A aba "${sheetName}" está vazia.`)
        setPreviewData(null)
        setDebugInfo(prev => ({ ...prev, rowCount: 0, columns: [], validationResult: 'Aba vazia' }))
        return
      }

      const firstRowKeys = Object.keys(jsonData[0] as object)
      const normalizedKeys = firstRowKeys.map(k => k.toLowerCase())
      const missing = REQUIRED_COLUMNS.filter(col => !normalizedKeys.includes(col.toLowerCase()))
      
      setDebugInfo(prev => ({
        ...prev,
        selectedSheet: sheetName,
        columns: firstRowKeys,
        rowCount: jsonData.length,
        validationResult: missing.length > 0 ? `Ausente: ${missing.join(', ')}` : 'Estrutura Válida'
      }))

      if (missing.length > 0) {
        setImportError(`Colunas obrigatórias ausentes: ${missing.join(", ")}.`)
      } else {
        setImportError(null)
      }

      setPreviewData(jsonData.slice(0, 10))
    } catch (err: any) {
      setCurrentStage('error')
      console.error("Erro ao processar aba:", err)
      setImportError(`Erro ao processar dados da aba: ${err.message}`)
    }
  }

  const handleImport = async () => {
    if (!file || !workbook || !selectedSheet) return
    
    setImporting(true)
    setImportError(null)

    try {
      setCurrentStage('data-mapping')
      const sheet = workbook.Sheets[selectedSheet]
      const jsonData = XLSX.utils.sheet_to_json(sheet) as any[]

      if (jsonData.length === 0) {
        throw new Error("Não há dados para importar nesta aba.")
      }

      const normalizedData = jsonData.map(row => {
        const normalizedRow: any = {}
        Object.keys(row).forEach(key => {
          const lowerKey = key.toLowerCase()
          normalizedRow[lowerKey] = row[key]
        })

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
        throw new Error("Nenhum dado válido encontrado após a normalização.")
      }

      setCurrentStage('state-update')
      const processedProducts = normalizedData.map(p => calculateProductMetrics({
        ...p,
        companyId: activeCompanyId,
        origemDados: file.name.endsWith('.csv') ? 'CSV' : 'XLSX'
      } as Partial<Product>))

      const finalizedProducts = applyABCClassification(processedProducts)

      const storedKey = `sophia_products_${activeCompanyId}`
      const existingProductsRaw = localStorage.getItem(storedKey)
      const existingProducts: Product[] = existingProductsRaw ? JSON.parse(existingProductsRaw) : []
      
      const existingSkus = new Set(existingProducts.map(p => p.sku))
      const uniqueNewProducts = finalizedProducts.filter(p => !existingSkus.has(p.sku))
      
      const updatedCatalog = [...existingProducts, ...uniqueNewProducts]
      localStorage.setItem(storedKey, JSON.stringify(updatedCatalog))

      setDebugInfo(prev => ({ ...prev, importResult: `Sucesso: ${uniqueNewProducts.length} novos SKUs.` }))
      setCurrentStage('success')

      toast({
        title: "Ingestão Concluída!",
        description: `${uniqueNewProducts.length} novos SKUs integrados.`,
      })
      
      setFile(null)
      setPreviewData(null)
      setAvailableSheets([])
      setSelectedSheet("")
      setWorkbook(null)
      
    } catch (error: any) {
      setCurrentStage('error')
      console.error("Erro na ingestão:", error)
      setImportError(error.message || "Erro inesperado durante a ingestão.")
      setDebugInfo(prev => ({ ...prev, lastErrorStage: currentStage, importResult: 'Falhou na execução' }))
      toast({
        title: "Falha na Importação",
        description: error.message,
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
          <p className="text-muted-foreground text-lg font-medium">Conecte planilhas ao motor analítico com diagnóstico em tempo real.</p>
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
              <CardDescription>Upload seguro para CSV e XLSX</CardDescription>
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
                  <AlertTitle className="font-black uppercase text-[10px]">Falha Detectada</AlertTitle>
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
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" /> {currentStage.toUpperCase()}...
                    </>
                  ) : (
                    "Ingerir Dados"
                  )}
                </Button>
                <Button variant="outline" className="w-full h-12 border-white/5 opacity-50 cursor-not-allowed rounded-xl font-bold">
                  <LinkIcon className="h-4 w-4 mr-2" /> API Marketplace (Breve)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Debug Mode Panel */}
          <Card className="glass-card border-none bg-black/40 shadow-inner overflow-hidden">
             <CardHeader className="p-6 border-b border-white/5 bg-white/5">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Terminal className="h-3 w-3" /> Diagnóstico de Ingestão
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase">Tipo Arquivo</p>
                      <p className="text-[11px] font-bold text-white font-mono truncate">{debugInfo.fileType || '-'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase">Tamanho</p>
                      <p className="text-[11px] font-bold text-white font-mono">{debugInfo.fileSize || '-'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase">Estágio Atual</p>
                      <Badge variant="outline" className="text-[8px] h-4 border-primary/20 bg-primary/10 text-primary font-black">{currentStage.toUpperCase()}</Badge>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase">Linhas Totais</p>
                      <p className="text-[11px] font-bold text-white font-mono">{debugInfo.rowCount || '0'}</p>
                   </div>
                </div>
                <Separator className="bg-white/5" />
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-muted-foreground uppercase">Colunas Detectadas</p>
                   <div className="flex flex-wrap gap-1">
                      {debugInfo.columns.length > 0 ? debugInfo.columns.map((col, i) => (
                         <Badge key={i} variant="secondary" className="text-[8px] bg-white/5 border-white/5 h-4">{col}</Badge>
                      )) : <span className="text-[10px] text-muted-foreground italic">Nenhuma coluna lida</span>}
                   </div>
                </div>
                <Separator className="bg-white/5" />
                <div className="space-y-2">
                   <div className="flex justify-between">
                      <p className="text-[9px] font-black text-muted-foreground uppercase">Validação</p>
                      {currentStage === 'success' && <Check className="h-3 w-3 text-emerald-500" />}
                   </div>
                   <p className={cn(
                      "text-[10px] font-bold",
                      currentStage === 'error' ? "text-rose-400" : "text-emerald-400"
                   )}>
                      {debugInfo.validationResult || 'Aguardando processamento...'}
                   </p>
                </div>
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
                  <CardDescription>Amostra de dados da aba: <span className="text-primary font-black">{selectedSheet}</span></CardDescription>
                </div>
                <Badge className="h-8 px-4 bg-primary text-[10px] font-black uppercase rounded-lg">Dados em Memória</Badge>
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
                <FileCode className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white">Aguardando Diagnóstico</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">Carregue um arquivo para iniciar a inspeção profunda de colunas e integridade.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
