"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Palette, Shield, Info, History, Settings2, Image as ImageIcon, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Configurações salvas!",
      description: "As alterações foram aplicadas ao seu hub analítico.",
    })
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-headline">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência corporativa no Sophia E-Hub.</p>
        </div>
        <Button onClick={handleSave} size="lg" className="px-8 shadow-xl">Salvar Tudo</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card shadow-xl border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Building2 className="h-5 w-5 text-primary" />
                Perfil da Empresa
              </CardTitle>
              <CardDescription>Estes dados serão usados nos cabeçalhos dos seus relatórios gerenciais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Nome da Empresa</Label>
                  <Input defaultValue="Minha Loja E-commerce" className="bg-secondary/40 border-white/5 focus-visible:ring-primary h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Razão Social</Label>
                  <Input defaultValue="Vendas Digitais LTDA" className="bg-secondary/40 border-white/5 focus-visible:ring-primary h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">CNPJ</Label>
                  <Input defaultValue="00.000.000/0001-00" className="bg-secondary/40 border-white/5 focus-visible:ring-primary h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Logotipo (.png ou .jpg)</Label>
                  <div className="flex gap-2">
                    <div className="h-11 w-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input type="file" className="bg-secondary/40 border-white/5 h-11 cursor-pointer" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-xl border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Settings2 className="h-5 w-5 text-primary" />
                Preferências do Dashboard
              </CardTitle>
              <CardDescription>Configure o comportamento padrão das telas analíticas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Período Padrão</Label>
                  <Select defaultValue="30d">
                    <SelectTrigger className="bg-secondary/40 border-white/5 h-11">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="15d">Últimos 15 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias (Mensal)</SelectItem>
                      <SelectItem value="90d">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Métrica Favorita de Destaque</Label>
                  <Select defaultValue="margem">
                    <SelectTrigger className="bg-secondary/40 border-white/5 h-11">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="margem">Margem %</SelectItem>
                      <SelectItem value="lucro">Lucro Líquido</SelectItem>
                      <SelectItem value="receita">Receita Bruta</SelectItem>
                      <SelectItem value="roas">ROAS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white">Exibir Curva ABC no Dashboard</p>
                    <p className="text-xs text-muted-foreground">Mostra o resumo de Pareto na tela inicial.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white">Alertas Operacionais em Tempo Real</p>
                    <p className="text-xs text-muted-foreground">Destaca SKUs críticos automaticamente.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card shadow-xl border-none overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 font-bold">
                <Palette className="h-4 w-4 text-accent" />
                Visual & Tema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Modo de Exibição</Label>
                <div className="flex gap-2">
                  <Button variant="default" className="flex-1 h-9 text-xs font-bold">Escuro</Button>
                  <Button variant="secondary" className="flex-1 h-9 text-xs font-bold opacity-50 cursor-not-allowed">Claro</Button>
                </div>
              </div>
              <Separator className="bg-white/5" />
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Cor de Acentuação</Label>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#7070C2] cursor-pointer ring-2 ring-white ring-offset-2 ring-offset-background" />
                  <div className="h-8 w-8 rounded-full bg-[#10B981] cursor-pointer hover:scale-110 transition-transform" />
                  <div className="h-8 w-8 rounded-full bg-[#F59E0B] cursor-pointer hover:scale-110 transition-transform" />
                  <div className="h-8 w-8 rounded-full bg-[#63DBFF] cursor-pointer hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-xl border-none">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 font-bold">
                <Info className="h-4 w-4 text-primary" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Versão:</span>
                <span className="text-white font-mono font-bold">v1.3.0-stable</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Última Atualização:</span>
                <span className="text-white font-mono font-bold">25 Out 2023</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Licença Hub:</span>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-3 w-3" /> ATIVA
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-xl border-none">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 font-bold">
                <History className="h-4 w-4 text-muted-foreground" />
                Changelog Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 border-l-2 border-primary/40 pl-4 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white">v1.3.0</span>
                  <span className="text-[9px] text-muted-foreground">• 25/10/2023</span>
                </div>
                <p className="text-[10px] text-white/70 font-medium">Implementação da curva ABC dinâmica e motor analítico otimizado.</p>
              </div>
              <div className="space-y-2 border-l-2 border-white/5 pl-4 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-muted-foreground">v1.2.4</span>
                  <span className="text-[9px] text-muted-foreground">• 15/10/2023</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Lançamento do Sophia Insight (IA) para análise de SKUs críticos.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
