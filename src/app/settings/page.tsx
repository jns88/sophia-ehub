"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Building2, Palette, Info, History, Image as ImageIcon, CheckCircle2, Moon, Sun } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Configurações salvas!",
      description: "As informações da empresa e tema foram atualizadas.",
    })
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-headline">Configurações Gerenciais</h1>
          <p className="text-muted-foreground font-medium">Gestão de perfil corporativo e identidade visual.</p>
        </div>
        <Button onClick={handleSave} size="lg" className="px-10 h-12 rounded-xl font-black shadow-xl shadow-primary/20">Salvar Alterações</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card shadow-xl border-none">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter">
                <Building2 className="h-6 w-6 text-primary" />
                Perfil da Empresa
              </CardTitle>
              <CardDescription className="font-medium">Dados fundamentais para documentos e relatórios gerenciais.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Nome de Fantasia</Label>
                  <Input defaultValue="E-Hub Corporate" className="bg-secondary/40 border-white/5 focus-visible:ring-primary h-12 rounded-xl font-bold" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Razão Social</Label>
                  <Input defaultValue="Jonas Vendas Digitais LTDA" className="bg-secondary/40 border-white/5 focus-visible:ring-primary h-12 rounded-xl font-bold" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">CNPJ / Identificação Fiscal</Label>
                  <Input defaultValue="00.000.000/0001-00" className="bg-secondary/40 border-white/5 focus-visible:ring-primary h-12 rounded-xl font-bold font-mono" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Logotipo da Marca</Label>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <Input type="file" className="bg-secondary/40 border-white/5 h-12 rounded-xl cursor-pointer text-xs pt-3" />
                  </div>
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
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-xs font-black uppercase">
                    <Moon className="h-3.5 w-3.5" /> Escuro
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-white/5 text-muted-foreground text-xs font-black uppercase">
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
                <span className="text-white font-mono">v1.4.0-stable</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-muted-foreground uppercase tracking-wider">Último Sync:</span>
                <span className="text-white font-mono">Hoje, 10:45</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-muted-foreground uppercase tracking-wider">Assinatura:</span>
                <div className="flex items-center gap-1.5 text-emerald-400 font-black uppercase tracking-tighter">
                  <CheckCircle2 className="h-3 w-3" /> CORPORATE
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-xl border-none">
            <CardHeader className="p-6">
              <CardTitle className="text-base flex items-center gap-2 font-black uppercase tracking-wider">
                <History className="h-4 w-4 text-muted-foreground" />
                Histórico de Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              <div className="space-y-2 border-l-2 border-primary/40 pl-4 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white">v1.4.0</span>
                  <span className="text-[9px] text-muted-foreground font-bold">• 10/11/2023</span>
                </div>
                <p className="text-[10px] text-white/70 font-medium leading-relaxed">Novo dashboard temporal (Hoje/Semana/Mês) e migração de preferências operacionais.</p>
              </div>
              <div className="space-y-2 border-l-2 border-white/5 pl-4 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-muted-foreground">v1.3.0</span>
                  <span className="text-[9px] text-muted-foreground font-bold">• 25/10/2023</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">Implementação da curva ABC dinâmica e auditoria de origem de dados.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
