"use client"

import { useState } from "react"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Table as TableIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const extension = selectedFile.name.split('.').pop()?.toLowerCase()
      
      if (extension === 'csv' || extension === 'xlsx') {
        setFile(selectedFile)
        // Simulate preview for the demo
        setPreviewData([
          { sku: 'SOPH-101', nome: 'Fone de Ouvido BT', categoria: 'Áudio', preco: 199.90 },
          { sku: 'SOPH-102', nome: 'Carregador Turbo 20W', categoria: 'Acessórios', preco: 89.00 },
          { sku: 'SOPH-103', nome: 'Cabo USB-C 2m', categoria: 'Acessórios', preco: 35.00 },
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
    if (!file) return
    
    setImporting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setImporting(false)
    toast({
      title: "Dados importados!",
      description: "3 novos produtos foram adicionados ao motor analítico.",
    })
    setFile(null)
    setPreviewData(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Importar Dados</h1>
        <p className="text-muted-foreground">Carregue planilhas de faturamento e custos para análise automática.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Fonte de Dados</CardTitle>
              <CardDescription>Formatos aceitos: .csv, .xlsx</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".csv,.xlsx" 
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
                  <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    {file ? <FileSpreadsheet className="h-6 w-6 text-primary" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file ? file.name : "Clique para selecionar"}</p>
                    <p className="text-xs text-muted-foreground mt-1">ou arraste e solte o arquivo aqui</p>
                  </div>
                </label>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleImport} 
                  disabled={!file || importing} 
                  className="w-full"
                >
                  {importing ? "Processando..." : "Carregar para Sistema"}
                </Button>
                <Button variant="outline" className="w-full border-white/5 opacity-50 cursor-not-allowed">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Conectar Google Sheets (Em breve)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">Requisitos da Planilha</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Colunas de Identificação (SKU, Nome)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Colunas Financeiras (Preço, Custo)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Colunas Operacionais (Logística, Ads)</li>
                <li className="flex items-center gap-2 text-rose-400 font-medium"><AlertCircle className="h-3 w-3" /> Formato numérico em colunas de valor</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {previewData ? (
            <Card className="glass-card animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TableIcon className="h-5 w-5 text-accent" />
                    Pré-visualização
                  </CardTitle>
                  <CardDescription>Validação inicial das primeiras linhas do arquivo.</CardDescription>
                </div>
                <Badge variant="secondary">{previewData.length} linhas detectadas</Badge>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Preço de Venda</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row) => (
                      <TableRow key={row.sku}>
                        <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                        <TableCell className="text-sm">{row.nome}</TableCell>
                        <TableCell>{row.categoria}</TableCell>
                        <TableCell className="text-right font-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.preco)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 opacity-50">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">Nenhum arquivo carregado para pré-visualização.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
