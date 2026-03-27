"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Package, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Filter, 
  ArrowUpDown,
  FileSpreadsheet,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Product, DataSource } from "@/lib/types"
import { calculateProductMetrics } from "@/lib/engine"
import { DEFAULT_COMPANY_ID } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [activeCompanyId, setActiveCompanyId] = useState(DEFAULT_COMPANY_ID)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    sku: "",
    nomeProduto: "",
    categoria: "Geral",
    marketplace: "Mercado Livre",
    marca: "",
    tipoEnvio: "Fulfillment",
    precoVenda: 0,
    custoProduto: 0,
    comissaoMarketplace: 0,
    custoLogistico: 0,
    investimentoAds: 0,
    reclamacaoPercentual: 0,
    origemDados: "Manual"
  })

  useEffect(() => {
    const companyId = localStorage.getItem('sophia_active_company_id') || DEFAULT_COMPANY_ID
    setActiveCompanyId(companyId)
    
    const stored = localStorage.getItem(`sophia_products_${companyId}`)
    if (stored) {
      setProducts(JSON.parse(stored))
    }
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.nomeProduto.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    )
  }, [products, search])

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts)
    localStorage.setItem(`sophia_products_${activeCompanyId}`, JSON.stringify(newProducts))
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData(product)
    } else {
      setEditingProduct(null)
      setFormData({
        sku: "",
        nomeProduto: "",
        categoria: "Geral",
        marketplace: "Mercado Livre",
        marca: "",
        tipoEnvio: "Fulfillment",
        precoVenda: 0,
        custoProduto: 0,
        comissaoMarketplace: 0,
        custoLogistico: 0,
        investimentoAds: 0,
        reclamacaoPercentual: 0,
        origemDados: "Manual"
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Calcular métricas antes de salvar
    const calculated = calculateProductMetrics({
      ...formData,
      companyId: activeCompanyId,
      origemDados: "Manual"
    } as Product)

    let newProducts: Product[]
    if (editingProduct) {
      newProducts = products.map(p => p.sku === editingProduct.sku ? calculated : p)
      toast({ title: "Produto Atualizado", description: "As alterações foram salvas com sucesso." })
    } else {
      if (products.some(p => p.sku === calculated.sku)) {
        toast({ title: "Erro", description: "SKU já cadastrado neste workspace.", variant: "destructive" })
        return
      }
      newProducts = [...products, calculated]
      toast({ title: "Produto Adicionado", description: "O novo SKU foi incluído no catálogo." })
    }

    saveProducts(newProducts)
    setIsDialogOpen(false)
  }

  const handleDelete = (sku: string) => {
    const newProducts = products.filter(p => p.sku !== sku)
    saveProducts(newProducts)
    toast({ title: "Produto Removido", description: "O item foi excluído do catálogo." })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white font-headline">Catálogo de Produtos</h1>
          <p className="text-muted-foreground font-medium">Gerenciamento manual e visualização do portfólio.</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={() => handleOpenDialog()} className="h-11 rounded-xl font-black shadow-xl shadow-primary/20 px-6">
              <Plus className="h-4 w-4 mr-2" /> Adicionar SKU
            </Button>
            <DialogContent className="glass-card border-none max-w-4xl text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                  {editingProduct ? "Editar Produto" : "Novo Produto Manual"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">Preencha os dados operacionais. Os indicadores financeiros serão calculados automaticamente.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-8 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">SKU (Identificador)</Label>
                    <Input 
                      value={formData.sku} 
                      onChange={e => setFormData({...formData, sku: e.target.value})}
                      placeholder="SOPH-000" 
                      className="bg-secondary/40 border-white/5 h-11 rounded-xl font-bold font-mono"
                      required
                      disabled={!!editingProduct}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Nome do Produto</Label>
                    <Input 
                      value={formData.nomeProduto} 
                      onChange={e => setFormData({...formData, nomeProduto: e.target.value})}
                      placeholder="Ex: Teclado Mecânico RGB" 
                      className="bg-secondary/40 border-white/5 h-11 rounded-xl font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Canal de Venda</Label>
                    <Select value={formData.marketplace} onValueChange={v => setFormData({...formData, marketplace: v})}>
                      <SelectTrigger className="bg-secondary/40 border-white/5 h-11 rounded-xl font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
                        <SelectItem value="Amazon">Amazon</SelectItem>
                        <SelectItem value="Shopee">Shopee</SelectItem>
                        <SelectItem value="Magalu">Magalu</SelectItem>
                        <SelectItem value="B2W / Americanas">B2W / Americanas</SelectItem>
                        <SelectItem value="Loja Própria / Site">Loja Própria / Site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Categoria</Label>
                    <Input 
                      value={formData.categoria} 
                      onChange={e => setFormData({...formData, categoria: e.target.value})}
                      placeholder="Eletrônicos" 
                      className="bg-secondary/40 border-white/5 h-11 rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Marca</Label>
                    <Input 
                      value={formData.marca} 
                      onChange={e => setFormData({...formData, marca: e.target.value})}
                      placeholder="TechBrand" 
                      className="bg-secondary/40 border-white/5 h-11 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary">Composição Financeira (R$)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-muted-foreground">Preço Venda</Label>
                      <Input 
                        type="number" step="0.01"
                        value={formData.precoVenda} 
                        onChange={e => setFormData({...formData, precoVenda: parseFloat(e.target.value)})}
                        className="bg-background border-white/10 h-10 rounded-lg font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-muted-foreground">Custo Produto</Label>
                      <Input 
                        type="number" step="0.01"
                        value={formData.custoProduto} 
                        onChange={e => setFormData({...formData, custoProduto: parseFloat(e.target.value)})}
                        className="bg-background border-white/10 h-10 rounded-lg font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-muted-foreground">Comissão (%)</Label>
                      <Input 
                        type="number" step="0.01"
                        value={formData.comissaoMarketplace} 
                        onChange={e => setFormData({...formData, comissaoMarketplace: parseFloat(e.target.value)})}
                        className="bg-background border-white/10 h-10 rounded-lg font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-muted-foreground">Logística</Label>
                      <Input 
                        type="number" step="0.01"
                        value={formData.custoLogistico} 
                        onChange={e => setFormData({...formData, custoLogistico: parseFloat(e.target.value)})}
                        className="bg-background border-white/10 h-10 rounded-lg font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-muted-foreground">Invest. Ads</Label>
                      <Input 
                        type="number" step="0.01"
                        value={formData.investimentoAds} 
                        onChange={e => setFormData({...formData, investimentoAds: parseFloat(e.target.value)})}
                        className="bg-background border-white/10 h-10 rounded-lg font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-muted-foreground">Reclamações (%)</Label>
                      <Input 
                        type="number" step="0.01"
                        value={formData.reclamacaoPercentual} 
                        onChange={e => setFormData({...formData, reclamacaoPercentual: parseFloat(e.target.value) / 100})}
                        className="bg-background border-white/10 h-10 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                  <Button type="submit" className="rounded-xl font-black px-10 shadow-xl shadow-primary/20">
                    {editingProduct ? "Salvar Alterações" : "Adicionar ao Catálogo"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glass-card border-none shadow-2xl">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por SKU ou Nome..." 
                className="pl-11 h-11 bg-secondary/30 border-white/5 rounded-xl font-medium"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-11 px-4 border-white/5 bg-white/5 font-black uppercase text-[10px]">
                {filteredProducts.length} Itens no Catálogo
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.01]">
              <TableRow className="border-white/5">
                <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest">Produto / SKU</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Canal</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-right">Preço Venda</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-right">Margem %</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="py-6 px-8 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <TableRow key={p.sku} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="py-6 px-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white">{p.nomeProduto}</span>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{p.sku} • {p.categoria}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge variant="outline" className="text-[9px] font-bold uppercase border-primary/20 bg-primary/5 text-primary">
                        {p.marketplace}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 text-right font-mono text-xs font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.precoVenda)}
                    </TableCell>
                    <TableCell className={cn(
                      "py-6 text-right font-black font-mono text-xs",
                      p.margemPercentual > 20 ? "text-emerald-400" : p.margemPercentual > 10 ? "text-amber-400" : "text-rose-400"
                    )}>
                      {p.margemPercentual.toFixed(1)}%
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5",
                        p.status === 'APROVADO' ? "bg-emerald-500" : p.status === 'ATENÇÃO' ? "bg-amber-500" : "bg-rose-500"
                      )}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-white/10 text-white">
                          <DropdownMenuItem onClick={() => handleOpenDialog(p)} className="flex items-center gap-2 cursor-pointer focus:bg-primary/20 focus:text-white">
                            <Edit2 className="h-3.5 w-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(p.sku)} className="flex items-center gap-2 cursor-pointer text-rose-400 focus:bg-rose-500/20 focus:text-rose-400">
                            <Trash2 className="h-3.5 w-3.5" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center opacity-40">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="h-10 w-10" />
                      <p className="font-bold">Nenhum produto encontrado neste catálogo.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
