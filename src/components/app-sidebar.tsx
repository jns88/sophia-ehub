"use client"

import { 
  LayoutDashboard, 
  Upload, 
  Search, 
  BarChart3, 
  FileText, 
  Link as LinkIcon, 
  Settings,
  PlusCircle,
  Building2,
  Package
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Company } from "@/lib/types"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Catálogo", href: "/products" },
  { icon: Upload, label: "Importar Dados", href: "/import" },
  { icon: Search, label: "Consulta", href: "/search" },
  { icon: BarChart3, label: "Análises", href: "/analysis" },
  { icon: FileText, label: "Relatórios", href: "/reports" },
  { icon: LinkIcon, label: "Integrações", href: "/integrations" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [activeCompanyName, setActiveCompanyName] = useState<string>("Sophia E-Hub")

  useEffect(() => {
    const savedActiveId = localStorage.getItem('sophia_active_company_id');
    const savedCompanies = JSON.parse(localStorage.getItem('sophia_companies') || '[]');
    
    if (savedActiveId && savedCompanies.length > 0) {
      const active = savedCompanies.find((c: Company) => c.id === savedActiveId);
      if (active) setActiveCompanyName(active.companyName);
    }
  }, [pathname])

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white truncate max-w-[140px]">{activeCompanyName}</span>
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1">
              <Building2 className="h-2 w-2" /> Workspace Ativo
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={`py-6 px-4 transition-all duration-200 ${
                  pathname === item.href 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                }`}
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        <Separator className="my-4 opacity-10" />
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="py-6 px-4 text-muted-foreground hover:text-foreground"
            >
              <Link href="/settings">
                <PlusCircle className="h-5 w-5 mr-3" />
                <span className="font-bold text-xs uppercase tracking-widest">+ Nova Empresa</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings"}
              className={`py-6 px-4 transition-all duration-200 ${
                pathname === "/settings" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-sidebar-accent text-sidebar-foreground"
              }`}
            >
              <Link href="/settings" className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                <span className="font-medium">Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
