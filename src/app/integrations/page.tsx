"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ExternalLink, ShieldCheck, ShoppingBag } from "lucide-react"

const platforms = [
  { name: "Mercado Livre", status: "Conectado", icon: "https://picsum.photos/seed/ml/40/40", color: "bg-yellow-400" },
  { name: "Amazon", status: "Pendente", icon: "https://picsum.photos/seed/amz/40/40", color: "bg-orange-500" },
  { name: "Shopee", status: "Desconectado", icon: "https://picsum.photos/seed/sho/40/40", color: "bg-orange-600" },
  { name: "Magalu", status: "Em Breve", icon: "https://picsum.photos/seed/mag/40/40", color: "bg-blue-600" },
  { name: "B2W Americanas", status: "Em Breve", icon: "https://picsum.photos/seed/b2w/40/40", color: "bg-red-600" },
  { name: "Loja Própria (Site)", status: "Conectado", icon: "https://picsum.photos/seed/site/40/40", color: "bg-primary" },
]

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Integrações</h1>
        <p className="text-muted-foreground">Conecte suas contas de marketplaces para automação de leitura de dados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <Card key={platform.name} className="glass-card group hover:border-primary/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${platform.color} flex items-center justify-center text-white overflow-hidden`}>
                  <img src={platform.icon} alt={platform.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <CardTitle className="text-base">{platform.name}</CardTitle>
                  <Badge variant={platform.status === 'Conectado' ? 'default' : 'secondary'} className="text-[10px] mt-1">
                    {platform.status}
                  </Badge>
                </div>
              </div>
              <Switch checked={platform.status === 'Conectado'} />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Client ID</Label>
                <Input value="••••••••••••••••" readOnly className="h-8 bg-secondary/50 border-white/5 text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Client Secret</Label>
                <Input value="••••••••••••••••" readOnly className="h-8 bg-secondary/50 border-white/5 text-xs font-mono" />
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/5 pt-4">
              <Button variant="ghost" className="w-full text-xs hover:bg-white/5 gap-2">
                <ExternalLink className="h-3 w-3" />
                Gerenciar Conexão
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-dashed border-primary/30">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-white">Precisa de outra integração?</h3>
            <p className="text-muted-foreground text-sm">Estamos expandindo nossas conexões. Entre em contato com o suporte para sugerir novas plataformas.</p>
          </div>
          <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">Sugerir Integração</Button>
        </CardContent>
      </Card>
    </div>
  )
}
