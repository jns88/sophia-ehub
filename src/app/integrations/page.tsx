"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  ShoppingBag, 
  Terminal, 
  Key, 
  Globe, 
  RefreshCw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  Link2,
  ShieldCheck,
  Power,
  PowerOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ChannelIntegration, IntegrationStatus } from "@/lib/types"
import { DEFAULT_COMPANY_ID } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function IntegrationsPage() {
  const { toast } = useToast()
  const [integrations, setIntegrations] = useState<ChannelIntegration[]>([])
  const [activeCompanyId, setActiveCompanyId] = useState(DEFAULT_COMPANY_ID)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  
  // Abort controller reference to cancel pending requests
  const abortControllerRef = useRef<AbortController | null>(null)

  // Form State
  const [newForm, setNewForm] = useState({
    name: "",
    baseUrl: "",
    apiKey: ""
  })

  useEffect(() => {
    const companyId = localStorage.getItem('sophia_active_company_id') || DEFAULT_COMPANY_ID
    setActiveCompanyId(companyId)
    
    const stored = localStorage.getItem(`sophia_integrations_${companyId}`)
    if (stored) {
      setIntegrations(JSON.parse(stored))
    }
  }, [])

  const saveIntegrations = (items: ChannelIntegration[]) => {
    setIntegrations(items)
    localStorage.setItem(`sophia_integrations_${activeCompanyId}`, JSON.stringify(items))
  }

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(null)
      toast({
        title: "Operação Cancelada",
        description: "A solicitação foi interrompida com segurança.",
      })
    }
  }

  const handleTestConnectivity = async (integrationId: string | 'new') => {
    const target = integrationId === 'new' ? { ...newForm, id: 'new' } : integrations.find(i => i.id === integrationId)
    if (!target) return

    setLoading(integrationId)
    abortControllerRef.current = new AbortController()

    try {
      // Simulate API call with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          const success = Math.random() > 0.3 // 70% success rate for simulation
          if (success) resolve(true)
          else reject(new Error("Timeout: O servidor não respondeu a tempo."))
        }, 2000)
        
        abortControllerRef.current?.signal.addEventListener('abort', () => {
          clearTimeout(timeout)
          reject(new Error("Aborted"))
        })
      })

      toast({
        title: "Conexão Validada",
        description: `Endpoint de ${target.name} respondeu com sucesso.`,
      })

      if (integrationId !== 'new') {
        const updated = integrations.map(i => 
          i.id === integrationId ? { ...i, status: 'Conectado' as IntegrationStatus, lastSync: new Date().toISOString() } : i
        )
        saveIntegrations(updated)
      }
    } catch (err: any) {
      if (err.message === "Aborted") return

      toast({
        title: "Erro de Conexão",
        description: err.message || "Falha ao validar credenciais.",
        variant: "destructive"
      })
      
      if (integrationId !== 'new') {
        const updated = integrations.map(i => 
          i.id === integrationId ? { ...i, status: 'Erro' as IntegrationStatus, errorMessage: err.message } : i
        )
        saveIntegrations(updated)
      }
    } finally {
      setLoading(null)
      abortControllerRef.current = null
    }
  }

  const handleAddIntegration = async () => {
    if (!newForm.name || !newForm.baseUrl || !newForm.apiKey) {
      toast({ title: "Dados incompletos", description: "Preencha todos os campos obrigatórios.", variant: "destructive" })
      return
    }

    if (integrations.length >= 15) {
      toast({ title: "Limite atingido", description: "O Hub suporta até 15 canais ativos.", variant: "destructive" })
      return
    }

    setLoading('add')
    abortControllerRef.current = new AbortController()

    try {
      // Simulate connection request
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newIntegration: ChannelIntegration = {
        id: `int_${Date.now()}`,
        companyId: activeCompanyId,
        name: newForm.name,
        baseUrl: newForm.baseUrl,
        apiKey: newForm.apiKey,
        status: 'Conectado',
        lastSync: new Date().toISOString(),
        isActive: true
      }

      saveIntegrations([...integrations, newIntegration])
      setNewForm({ name: "", baseUrl: "", apiKey: "" })
      setIsAdding(false)
      toast({ title: "Canal Conectado", description: `${newIntegration.name} foi integrado com sucesso.` })
    } catch (err) {
      toast({ title: "Falha na Ingestão", description: "Não foi possível conectar ao endpoint.", variant: "destructive" })
    } finally {
      setLoading(null)
      abortControllerRef.current = null
    }
  }

  const handleRemove = (id: string) => {
    const updated = integrations.filter(i => i.id !== id)
    saveIntegrations(updated)
    toast({ title: "Integração Removida", description: "As credenciais foram excluídas do Hub." })
  }

  const toggleActive = (id: string) => {
    const updated = integrations.map(i => 
      i.id === id ? { ...i, isActive: !i.isActive } : i
    )
    saveIntegrations(updated)
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return "****"
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight font-headline">Canais de Integração</h1>
          <p className="text-muted-foreground text-lg font-medium">Gestão leve de APIs e sincronização multicanal.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "rounded-xl h-12 px-8 font-black shadow-xl transition-all",
            isAdding ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" : "bg-primary shadow-primary/20"
          )}
        >
          {isAdding ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {isAdding ? "Cancelar Cadastro" : "Conectar Novo Canal"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel */}
        {isAdding && (
          <Card className="glass-card border-none shadow-2xl animate-in slide-in-from-left-4 duration-300">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Configurar API</CardTitle>
              <CardDescription>Insira as credenciais do marketplace ou e-commerce próprio.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Nome do Canal</Label>
                  <Input 
                    placeholder="Ex: Amazon Brasil" 
                    value={newForm.name}
                    onChange={e => setNewForm({...newForm, name: e.target.value})}
                    className="bg-secondary/40 border-white/5 h-11 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">URL Base da API</Label>
                  <Input 
                    placeholder="https://api.vendas.com/v1" 
                    value={newForm.baseUrl}
                    onChange={e => setNewForm({...newForm, baseUrl: e.target.value})}
                    className="bg-secondary/40 border-white/5 h-11 rounded-xl font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Chave de Acesso (API Key)</Label>
                  <Input 
                    type="password"
                    placeholder="••••••••••••••••" 
                    value={newForm.apiKey}
                    onChange={e => setNewForm({...newForm, apiKey: e.target.value})}
                    className="bg-secondary/40 border-white/5 h-11 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0 flex flex-col gap-3">
              <Button 
                onClick={loading === 'add' ? handleCancelRequest : handleAddIntegration}
                className={cn(
                  "w-full h-12 font-black rounded-xl",
                  loading === 'add' ? "bg-amber-500 hover:bg-amber-600" : ""
                )}
                disabled={loading !== null && loading !== 'add'}
              >
                {loading === 'add' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cancelar</>
                ) : (
                  "Conectar API"
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 font-black rounded-xl border-white/5"
                onClick={() => handleTestConnectivity('new')}
                disabled={loading !== null || !newForm.baseUrl}
              >
                {loading === 'new' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Terminal className="h-4 w-4 mr-2" />}
                Testar Conectividade
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Integrations List */}
        <div className={cn("space-y-6", isAdding ? "lg:col-span-2" : "lg:col-span-3")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.length > 0 ? integrations.map((integration) => (
              <Card key={integration.id} className="glass-card border-none overflow-hidden group hover:border-primary/20 transition-all duration-300">
                <div className={cn(
                  "h-1 w-full",
                  integration.status === 'Conectado' ? "bg-emerald-500" : integration.status === 'Erro' ? "bg-rose-500" : "bg-muted"
                )} />
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-secondary/50 flex items-center justify-center text-primary shadow-inner">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black">{integration.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={cn(
                            "text-[8px] font-black uppercase px-2 h-4 border-none",
                            integration.status === 'Conectado' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                          )}>
                            {integration.status}
                          </Badge>
                          {integration.lastSync && (
                            <span className="text-[9px] text-muted-foreground font-bold">Sinc: {new Date(integration.lastSync).toLocaleTimeString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Switch 
                      checked={integration.isActive} 
                      onCheckedChange={() => toggleActive(integration.id)} 
                    />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase font-black text-muted-foreground tracking-widest">Endpoint</Label>
                      <p className="text-[10px] font-mono text-white/70 truncate bg-black/20 p-1.5 rounded-lg border border-white/5">{integration.baseUrl}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase font-black text-muted-foreground tracking-widest">API Key</Label>
                      <p className="text-[10px] font-mono text-white/70 bg-black/20 p-1.5 rounded-lg border border-white/5">{maskKey(integration.apiKey)}</p>
                    </div>
                  </div>
                  {integration.errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-rose-400 font-medium">{integration.errorMessage}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-[10px] font-black uppercase tracking-widest h-9"
                    onClick={() => handleTestConnectivity(integration.id)}
                    disabled={loading !== null}
                  >
                    {loading === integration.id ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                    {loading === integration.id ? "Testando..." : "Testar"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10"
                    onClick={() => handleRemove(integration.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-card/30 flex flex-col items-center gap-4 opacity-40">
                <Globe className="h-10 w-10 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-black uppercase tracking-widest text-xs">Nenhuma API Conectada</p>
                  <p className="text-[10px] max-w-[200px] mx-auto">Adicione canais para sincronizar KPIs e métricas operacionais.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
