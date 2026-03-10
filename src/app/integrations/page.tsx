"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ExternalLink, ShieldCheck, ShoppingBag, Terminal, Key, Globe, Link2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const platforms = [
  { id: "ml", name: "Mercado Livre", status: "Conectado", color: "bg-yellow-400", api: "https://api.mercadolibre.com" },
  { id: "amz", name: "Amazon", status: "Pendente", color: "bg-orange-500", api: "https://sellingpartnerapi-na.amazon.com" },
  { id: "sho", name: "Shopee", status: "Desconectado", color: "bg-orange-600", api: "https://partner.shopeemobile.com/api" },
  { id: "mag", name: "Magalu", status: "Em Breve", color: "bg-blue-600", api: "https://api-mktplace.magazineluiza.com.br" },
  { id: "b2w", name: "B2W / Americanas", status: "Em Breve", color: "bg-red-600", api: "https://api.skyhub.com.br" },
  { id: "site", name: "Loja Própria / Site", status: "Conectado", color: "bg-primary", api: "https://api.meusite.com.br/v1" },
]

export default function IntegrationsPage() {
  const { toast } = useToast()

  const handleTestConnection = (platform: string) => {
    toast({
      title: `Testando conexão: ${platform}`,
      description: "Iniciando handshake com a API e validando tokens...",
    })
    setTimeout(() => {
      toast({
        title: "Conexão estabelecida!",
        description: `O Sophia E-Hub está recebendo dados de ${platform} com sucesso.`,
      })
    }, 1500)
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white font-headline">Configuração de APIs</h1>
          <p className="text-muted-foreground text-lg font-medium">Gestão de credenciais e sincronização em tempo real.</p>
        </div>
        <Button className="font-black rounded-xl px-8 h-12 shadow-xl shadow-primary/20">
          <RefreshCw className="h-4 w-4 mr-2" /> Sincronizar Tudo
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {platforms.map((platform) => (
          <Card key={platform.id} className="glass-card border-none overflow-hidden group hover:border-primary/20 transition-all duration-300 shadow-2xl">
            <div className={`h-1 w-full ${platform.color}`} />
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl ${platform.color} flex items-center justify-center text-white shadow-xl`}>
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black">{platform.name}</CardTitle>
                  <Badge variant={platform.status === 'Conectado' ? 'default' : 'secondary'} className="text-[10px] font-black uppercase mt-1.5 tracking-widest">
                    {platform.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase">Ativo</Label>
                <Switch defaultChecked={platform.status === 'Conectado'} />
              </div>
            </CardHeader>
            
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] flex items-center gap-1.5">
                    <Key className="h-3 w-3" /> Client ID
                  </Label>
                  <Input defaultValue="••••••••••••••••" className="h-11 bg-secondary/40 border-white/5 text-xs font-mono rounded-xl focus-visible:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" /> Client Secret
                  </Label>
                  <Input type="password" defaultValue="secret_token_example" className="h-11 bg-secondary/40 border-white/5 text-xs font-mono rounded-xl focus-visible:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] flex items-center gap-1.5">
                    <Link2 className="h-3 w-3" /> Access Token
                  </Label>
                  <Input defaultValue="at_ml_prod_749283..." className="h-11 bg-secondary/40 border-white/5 text-xs font-mono rounded-xl focus-visible:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] flex items-center gap-1.5">
                    <RefreshCw className="h-3 w-3" /> Refresh Token
                  </Label>
                  <Input defaultValue="rt_ml_prod_110293..." className="h-11 bg-secondary/40 border-white/5 text-xs font-mono rounded-xl focus-visible:ring-primary" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] flex items-center gap-1.5">
                  <Globe className="h-3 w-3" /> URL Base da API
                </Label>
                <Input defaultValue={platform.api} className="h-11 bg-secondary/40 border-white/5 text-xs font-mono rounded-xl text-primary font-bold" />
              </div>
            </CardContent>

            <CardFooter className="p-8 pt-0 border-t border-white/5 bg-white/[0.02] flex gap-4">
              <Button 
                variant="ghost" 
                className="flex-1 font-black text-[11px] uppercase tracking-widest hover:bg-white/5 rounded-xl border border-white/5"
                onClick={() => handleTestConnection(platform.name)}
              >
                <Terminal className="h-3.5 w-3.5 mr-2" /> Testar Conexão
              </Button>
              <Button variant="outline" className="flex-1 font-black text-[11px] uppercase tracking-widest rounded-xl border-white/10">
                <ExternalLink className="h-3.5 w-3.5 mr-2" /> Documentação
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
