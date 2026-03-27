"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Palette, Info, Moon, Sun, PlusCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Company } from "@/lib/types"

export default function SettingsPage() {
  const { toast } = useToast()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const [activeCompany, setActiveCompany] = useState<Company | null>(null)
  
  // Dados do formulário para nova empresa
  const [newCompanyForm, setNewCompanyForm] = useState({
    companyName: "",
    corporateName: "",
    cnpj: "",
    timezone: "America/Sao_Paulo",
    mainChannel: ""
  })

  useEffect(() => {
    setMounted(true)
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
    
    // Recupera empresa ativa
    const savedActiveId = localStorage.getItem('sophia_active_company_id');
    const savedCompanies = JSON.parse(localStorage.getItem('sophia_companies') || '[]');
    
    if (savedActiveId && savedCompanies.length > 0) {
      const active = savedCompanies.find((c: Company) => c.id === savedActiveId);
      if (active) setActiveCompany(active);
    }

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
      createdAt: new Date().toISOString()
    };

    // Salva na lista de empresas
    const savedCompanies = JSON.parse(localStorage.getItem('sophia_companies') || '[]');
    localStorage.setItem('sophia_companies', JSON.stringify([...savedCompanies, newCompany]));
    
    // Define como ATIVA e limpa dashboard (ambiente novo)
    localStorage.setItem('sophia_active_company_id', newId);
    
    toast({
      title: "Workspace Criado!",
      description: "Iniciando novo ambiente de trabalho limpo.",
    });

    // Recarrega para aplicar o estado "limpo" do dashboard que filtra pelo novo activeCompanyId
    window.location.href = '/';
  }

  const handleUpdateActiveCompany = () => {
    if (!activeCompany) return;
    
    const savedCompanies = JSON.parse(localStorage.getItem('sophia_companies') || '[]');
    const updated = savedCompanies.map((c: Company) => c.id === activeCompany.id ? activeCompany : c);
    localStorage.setItem('sophia_companies', JSON.stringify(updated));
    
    toast({
      title: "Configurações salvas!",
      description: "As informações da empresa foram atualizadas.",
    })
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight font-headline text-white">Configurações Gerenciais</h1>
          <p className="text-muted-foreground font-medium">Gestão de perfil corporativo e identidade visual.</p>
        </div>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl border-white/10 h-12 px-6 font-black">
                <PlusCircle className="h-4 w-4 mr-2" /> Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-none max-w-2xl text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase">Criar Novo Workspace</DialogTitle>
                <DialogDescription className="text-muted-foreground">Inicie um ambiente de trabalho 100% limpo para uma nova operação.</DialogDescription>
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
                <div className="space-y-2">
                  <Label>Canal Principal</Label>
                  <Select 
                    value={newCompanyForm.mainChannel}
                    onValueChange={(v) => setNewCompanyForm({...newCompanyForm, mainChannel: v})}
                  >
                    <SelectTrigger className="bg-secondary/40 border-white/5 rounded-xl h-11">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
                      <SelectItem value="Amazon">Amazon</SelectItem>
                      <SelectItem value="Shopee">Shopee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full h-12 font-black rounded-xl" onClick={handleCreateCompany}>
                  Criar Empresa e Iniciar Limpo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleUpdateActiveCompany} size="lg" className="px-10 h-12 rounded-xl font-black shadow-xl shadow-primary/20">Salvar Alterações</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card shadow-xl border-none">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter">
                <Building2 className="h-6 w-6 text-primary" />
                Empresa Ativa
              </CardTitle>
              <CardDescription>Edite os dados da empresa que você está gerenciando no momento.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              {activeCompany ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Nome Fantasia</Label>
                    <Input 
                      value={activeCompany.companyName} 
                      onChange={(e) => setActiveCompany({...activeCompany, companyName: e.target.value})}
                      className="bg-secondary/40 border-white/5 h-12 rounded-xl font-bold" 
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Razão Social</Label>
                    <Input 
                      value={activeCompany.corporateName} 
                      onChange={(e) => setActiveCompany({...activeCompany, corporateName: e.target.value})}
                      className="bg-secondary/40 border-white/5 h-12 rounded-xl font-bold" 
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">CNPJ</Label>
                    <Input 
                      value={activeCompany.cnpj} 
                      onChange={(e) => setActiveCompany({...activeCompany, cnpj: e.target.value})}
                      className="bg-secondary/40 border-white/5 h-12 rounded-xl font-bold font-mono" 
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5 italic text-muted-foreground">
                  Nenhuma empresa ativa selecionada. Crie uma para começar.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card shadow-xl border-none overflow-hidden">
            <div className="h-1.5 w-full bg-primary" />
            <CardHeader className="p-6">
              <CardTitle className="text-base flex items-center gap-2 font-black uppercase tracking-wider">
                <Palette className="h-4 w-4 text-accent" />
                Tema Visual
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

          <Card className="glass-card shadow-xl border-none">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
