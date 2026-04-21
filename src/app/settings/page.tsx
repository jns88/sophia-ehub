"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Palette, 
  Info, 
  Moon, 
  Sun, 
  PlusCircle, 
  Settings2, 
  SwitchCamera, 
  Archive, 
  Trash2, 
  Edit3,
  CheckCircle2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Company } from "@/lib/types"

export default function SettingsPage() {
  const { toast } = useToast()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const [activeCompanyId, setActiveCompanyId] = useState<string>("")
  const [companies, setCompanies] = useState<Company[]>([])
  const [activeCompany, setActiveCompany] = useState<Company | null>(null)
  
  // Onboarding Form
  const [newCompanyForm, setNewCompanyForm] = useState({
    companyName: "",
    corporateName: "",
    cnpj: "",
    timezone: "America/Sao_Paulo",
    mainChannel: "Mercado Livre"
  })

  // Edit Form
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
    
    loadData()

    const now = new Date();
    setLastUpdate(new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }).format(now))
  }, [])

  const loadData = () => {
    const savedActiveId = localStorage.getItem('sophia_active_company_id') || "";
    const savedCompanies = JSON.parse(localStorage.getItem('sophia_companies') || '[]');
    
    setCompanies(savedCompanies)
    setActiveCompanyId(savedActiveId)
    
    if (savedActiveId) {
      const active = savedCompanies.find((c: Company) => c.id === savedActiveId);
      if (active) setActiveCompany(active);
    }
  }

  const toggleTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    toast({
      title: `Tema alterado para ${newTheme === 'dark' ? 'Escuro' : 'Claro'}`,
    })
  }

  const handleCreateCompany = () => {
    if (!newCompanyForm.companyName || !newCompanyForm.cnpj) {
      toast({
        title: "Erro no cadastro",
        description: "Nome e CNPJ são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const newId = `comp_${Date.now()}`;
    const newCompany: Company = {
      ...newCompanyForm,
      id: newId,
      createdAt: new Date().toISOString(),
      isArchived: false
    };

    const updatedCompanies = [...companies, newCompany];
    localStorage.setItem('sophia_companies', JSON.stringify(updatedCompanies));
    localStorage.setItem('sophia_active_company_id', newId);
    
    toast({
      title: "Workspace Criado!",
      description: `Ambiente "${newCompany.companyName}" pronto para uso.`,
    });

    window.location.href = '/';
  }

  const handleSwitchCompany = (id: string) => {
    localStorage.setItem('sophia_active_company_id', id);
    toast({
      title: "Trocando Workspace",
      description: "Carregando dados da empresa selecionada...",
    });
    window.location.href = '/';
  }

  const handleArchiveCompany = (id: string) => {
    const updated = companies.map(c => 
      c.id === id ? { ...c, isArchived: !c.isArchived } : c
    );
    localStorage.setItem('sophia_companies', JSON.stringify(updated));
    setCompanies(updated);
    toast({
      title: "Status Atualizado",
      description: "O status de arquivamento foi alterado.",
    });
  }

  const handleDeleteCompany = (id: string) => {
    if (id === activeCompanyId) {
      toast({
        title: "Ação Negada",
        description: "Não é possível excluir o workspace ativo no momento.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm("Tem certeza que deseja excluir permanentemente esta empresa e todos os seus dados?")) return;

    const updated = companies.filter(c => c.id !== id);
    localStorage.setItem('sophia_companies', JSON.stringify(updated));
    localStorage.removeItem(`sophia_products_${id}`);
    setCompanies(updated);
    toast({
      title: "Empresa Excluída",
      description: "O workspace e seus produtos foram removidos.",
    });
  }

  const handleEditClick = (company: Company) => {
    setEditingCompany(company);
    setIsEditDialogOpen(true);
  }

  const handleUpdateCompany = () => {
    if (!editingCompany) return;
    const updated = companies.map(c => c.id === editingCompany.id ? editingCompany : c);
    localStorage.setItem('sophia_companies', JSON.stringify(updated));
    setCompanies(updated);
    if (editingCompany.id === activeCompanyId) {
      setActiveCompany(editingCompany);
    }
    setIsEditDialogOpen(false);
    toast({
      title: "Configurações Salvas",
      description: "As informações da empresa foram atualizadas.",
    });
  }

  return (
    <div className="space-y-10 max-w-6xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight font-headline text-foreground">Configurações Gerenciais</h1>
          <p className="text-muted-foreground text-lg font-medium">Gestão de perfil corporativo, workspaces e identidade visual.</p>
        </div>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 px-8 font-black shadow-xl shadow-primary/20">
                <PlusCircle className="h-4 w-4 mr-2" /> Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-none max-w-2xl text-foreground">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase">Criar Novo Workspace</DialogTitle>
                <DialogDescription className="text-muted-foreground">Inicie um ambiente de trabalho 100% limpo e independente.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-6">
                <div className="space-y-2">
                  <Label>Nome Fantasia</Label>
                  <Input 
                    value={newCompanyForm.companyName}
                    onChange={(e) => setNewCompanyForm({...newCompanyForm, companyName: e.target.value})}
                    placeholder="Ex: Sophia Vendas" 
                    className="bg-secondary/40 border-white/5 rounded-xl h-11" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Razão Social</Label>
                  <Input 
                    value={newCompanyForm.corporateName}
                    onChange={(e) => setNewCompanyForm({...newCompanyForm, corporateName: e.target.value})}
                    placeholder="Nome Jurídico LTDA" 
                    className="bg-secondary/40 border-white/5 rounded-xl h-11" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input 
                    value={newCompanyForm.cnpj}
                    onChange={(e) => setNewCompanyForm({...newCompanyForm, cnpj: e.target.value})}
                    placeholder="00.000.000/0001-00" 
                    className="bg-secondary/40 border-white/5 rounded-xl h-11 font-mono" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select 
                    value={newCompanyForm.timezone}
                    onValueChange={(v) => setNewCompanyForm({...newCompanyForm, timezone: v})}
                  >
                    <SelectTrigger className="bg-secondary/40 border-white/5 rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (UTC-3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full h-12 font-black rounded-xl" onClick={handleCreateCompany}>
                  Confirmar e Iniciar Workspace Limpo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Gestão de Workspaces */}
          <Card className="glass-card shadow-2xl border-none">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter">
                <SwitchCamera className="h-6 w-6 text-primary" />
                Gestão de Workspaces
              </CardTitle>
              <CardDescription>Visualize, alterne ou gerencie suas empresas cadastradas.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5">
                      <TableHead className="font-black uppercase text-[10px] tracking-widest py-4">Empresa</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest py-4">Status</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest py-4 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id} className={cn("border-white/5 hover:bg-white/[0.01]", company.id === activeCompanyId && "bg-primary/5")}>
                        <TableCell className="py-5">
                          <div className="flex flex-col">
                            <span className="font-black text-foreground flex items-center gap-2">
                              {company.companyName}
                              {company.id === activeCompanyId && <Badge className="h-4 px-1.5 text-[8px] uppercase bg-emerald-500">Ativo</Badge>}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">{company.cnpj}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {company.isArchived ? (
                            <Badge variant="outline" className="text-[9px] border-amber-500/20 text-amber-500 bg-amber-500/5">Arquivado</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-500 bg-emerald-500/5">Operacional</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {company.id !== activeCompanyId && (
                            <Button variant="ghost" size="icon" onClick={() => handleSwitchCompany(company.id)} className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10">
                              <SwitchCamera className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(company)} className="h-8 w-8 rounded-lg text-foreground hover:bg-white/5">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleArchiveCompany(company.id)} className="h-8 w-8 rounded-lg text-amber-400 hover:bg-amber-400/10">
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteCompany(company.id)} className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Dados da Empresa Ativa */}
          {activeCompany && (
            <Card className="glass-card shadow-2xl border-none">
              <CardHeader className="p-8">
                <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter">
                  <Settings2 className="h-6 w-6 text-primary" />
                  Dados da Empresa
                </CardTitle>
                <CardDescription>Informações cadastrais do workspace ativo.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Nome Fantasia</Label>
                  <Input readOnly value={activeCompany.companyName} className="bg-secondary/40 border-white/5 h-12 rounded-xl font-bold opacity-70" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Razão Social</Label>
                  <Input readOnly value={activeCompany.corporateName} className="bg-secondary/40 border-white/5 h-12 rounded-xl font-bold opacity-70" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">CNPJ</Label>
                  <Input readOnly value={activeCompany.cnpj} className="bg-secondary/40 border-white/5 h-12 rounded-xl font-bold font-mono opacity-70" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Fuso Horário Global</Label>
                  <Input readOnly value={activeCompany.timezone} className="bg-secondary/40 border-white/5 h-12 rounded-xl font-bold opacity-70" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          <Card className="glass-card shadow-2xl border-none overflow-hidden">
            <div className="h-1.5 w-full bg-primary" />
            <CardHeader className="p-6">
              <CardTitle className="text-base flex items-center gap-2 font-black uppercase tracking-wider">
                <Palette className="h-4 w-4 text-accent" />
                Interface Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              <div className="flex gap-3 bg-white/5 p-1 rounded-xl border border-white/5">
                <button 
                  onClick={() => toggleTheme('dark')}
                  className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition-all", theme === 'dark' ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5")}
                >
                  <Moon className="h-3.5 w-3.5" /> Escuro
                </button>
                <button 
                  onClick={() => toggleTheme('light')}
                  className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition-all", theme === 'light' ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5")}
                >
                  <Sun className="h-3.5 w-3.5" /> Claro
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-2xl border-none">
            <CardHeader className="p-6">
              <CardTitle className="text-base flex items-center gap-2 font-black uppercase tracking-wider">
                <Info className="h-4 w-4 text-primary" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-muted-foreground uppercase">Último Sync:</span>
                <span className="font-mono">{lastUpdate}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-muted-foreground uppercase">Versão:</span>
                <span className="text-accent">2.4.0-PRO</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-none max-w-2xl text-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase">Editar Workspace</DialogTitle>
            <DialogDescription>Atualize as informações do ambiente de trabalho.</DialogDescription>
          </DialogHeader>
          {editingCompany && (
            <div className="grid grid-cols-2 gap-6 py-6">
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input 
                  value={editingCompany.companyName}
                  onChange={(e) => setEditingCompany({...editingCompany, companyName: e.target.value})}
                  className="bg-secondary/40 border-white/5 rounded-xl h-11" 
                />
              </div>
              <div className="space-y-2">
                <Label>Razão Social</Label>
                <Input 
                  value={editingCompany.corporateName}
                  onChange={(e) => setEditingCompany({...editingCompany, corporateName: e.target.value})}
                  className="bg-secondary/40 border-white/5 rounded-xl h-11" 
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input 
                  value={editingCompany.cnpj}
                  onChange={(e) => setEditingCompany({...editingCompany, cnpj: e.target.value})}
                  className="bg-secondary/40 border-white/5 rounded-xl h-11 font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label>Fuso Horário</Label>
                <Select 
                  value={editingCompany.timezone}
                  onValueChange={(v) => setEditingCompany({...editingCompany, timezone: v})}
                >
                  <SelectTrigger className="bg-secondary/40 border-white/5 rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Brasília (UTC-3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
            <Button className="h-12 font-black rounded-xl px-10" onClick={handleUpdateCompany}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
