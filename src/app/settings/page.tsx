
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Building2, Palette, Info, History, Moon, Sun, PlusCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { toast } = useToast()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Persistent States
  const [companyData, setCompanyData] = useState({
    nomeFantasia: "E-Hub Corporate",
    razaoSocial: "Jonas Vendas Digitais LTDA",
    cnpj: "00.000.000/0001-00",
    timezone: "America/Sao_Paulo"
  })

  useEffect(() => {
    setMounted(true)
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
    
    // Load persisted data
    const savedData = localStorage.getItem('sophia_company_settings')
    if (savedData) {
      setCompanyData(JSON.parse(savedData))
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    setAvailableYears(Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString()));

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
      description: "A interface foi atualizada.",
    })
  }

  const handleSave = () => {
    localStorage.setItem('sophia_company_settings', JSON.stringify(companyData))
    toast({
      title: "Configurações salvas!",
      description: "As informações da empresa foram persistidas com sucesso.",
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight font-headline">Configurações Gerenciais</h1>
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
                <DialogDescription className="text-muted-foreground">Inicie um novo ambiente de trabalho para uma empresa diferente.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-6">
                <div className="space-y-2">
                  <Label>Nome Fantasia</Label>
                  <Input placeholder="Ex: Sophia Vendas" className="bg-secondary/40 border-white/5 rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Razão Social</Label>
                  <Input placeholder="Nome Jurídico LTDA" className="bg-secondary/40 border-white/5 rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input placeholder="00.000.000/0001-00" className="bg-secondary/40 border-white/5 rounded-xl h-11 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select defaultValue="America/Sao_Paulo">
                    <SelectTrigger className="bg-secondary/40 border-white/5 rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (UTC-3)</SelectItem>
                      <SelectItem value="UTC">UTC (Padrão)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Canal Principal</Label>
                  <Select>
                    <SelectTrigger className="bg-secondary/40 border-white/5 rounded-xl h-11">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">Mercado Livre</SelectItem>
                      <SelectItem value="amz">Amazon</SelectItem>
                      <SelectItem value="sho">Shopee</SelectItem>
                      <SelectItem value="mag">Magalu</SelectItem>
                      <SelectItem value="b2w">B2W / Americanas</SelectItem>
                      <SelectItem value="site">Loja Própria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full h-12 font-black rounded-xl" onClick={() => {
                  toast({title: "Workspace Criado!", description: "Bem-vindo ao novo ambiente de trabalho."});
                  window.location.reload();
                }}>
                  Criar Empresa e Limpar Dados
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} size="lg" className="px-10 h-12 rounded-xl font-black shadow-xl shadow-primary/20">Salvar Alterações</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card shadow-xl border-none">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter">
                <Building2 className="h-6 w-6 text-primary" />
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Nome Fantasia</Label>
                  <Input 
                    value={companyData.nomeFantasia} 
                    onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                    className="bg-secondary/40 border-white/5 focus-visible:ring-primary h-12 rounded-xl font-bold" 
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Razão Social</Label>
                  <Input 
                    value={companyData.razaoSocial} 
                    onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                    className="bg-secondary/40 border-white/5 focus-visible:ring-primary h-12 rounded-xl font-bold" 
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">CNPJ</Label>
                  <Input 
                    value={companyData.cnpj} 
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    className="bg-secondary/40 border-white/5 focus-visible:ring-primary h-12 rounded-xl font-bold font-mono" 
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Fuso Horário Global</Label>
                  <Select 
                    value={companyData.timezone} 
                    onValueChange={(v) => handleInputChange('timezone', v)}
                  >
                    <SelectTrigger className="bg-secondary/40 border-white/5 h-12 rounded-xl font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                      <SelectItem value="UTC">UTC (Tempo Universal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Modo de Exibição</Label>
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
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-xl border-none">
            <CardHeader className="p-6">
              <CardTitle className="text-base flex items-center gap-2 font-black uppercase tracking-wider">
                <Info className="h-4 w-4 text-primary" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-muted-foreground uppercase tracking-wider">Versão Hub:</span>
                <span className="font-mono">v1.6.2-stable</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-muted-foreground uppercase tracking-wider">Último Sync:</span>
                <span className="font-mono">{lastUpdate}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-muted-foreground uppercase tracking-wider">Padrão Data:</span>
                <span className="font-mono">dd/mm/aaaa</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-xl border-none">
            <CardHeader className="p-6">
              <CardTitle className="text-base flex items-center gap-2 font-black uppercase tracking-wider text-muted-foreground">
                <Clock className="h-4 w-4" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              <div className="space-y-2 border-l-2 border-primary/40 pl-4 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white">v1.6.2</span>
                  <span className="text-[9px] text-muted-foreground font-bold">• {lastUpdate.split(',')[0]}</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">Persistência de dados locais, download de relatórios e canais expandidos.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
