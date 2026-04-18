export type ProductStatus = 'APROVADO' | 'ATENÇÃO' | 'CRÍTICO';
export type ABCClassification = 'A' | 'B' | 'C';
export type ComplaintStatus = 'OK' | 'OBSERVAR' | 'ALERTA';

export type DataSource = 
  | 'CSV' 
  | 'XLSX' 
  | 'Google Sheets' 
  | 'API Mercado Livre' 
  | 'API Amazon' 
  | 'API Shopee' 
  | 'API Magalu' 
  | 'API B2W' 
  | 'API Site';

export type TimeRange = 'hoje' | 'semana' | 'mes' | 'ano';

export type IntegrationStatus = 'Não configurado' | 'Configurado' | 'Conectado';

export interface Product {
  id?: string;
  companyId: string; // Vínculo obrigatório com o workspace
  sku: string;
  nomeProduto: string;
  categoria: string;
  marketplace: string;
  marca: string;
  tipoEnvio: string;
  precoVenda: number;
  custoProduto: number;
  comissaoMarketplace: number;
  custoLogistico: number;
  investimentoAds: number;
  reclamacaoPercentual: number;
  origemDados: DataSource;
  
  // Geographic data
  estado?: string; // UF do estado (ex: SP, RJ, MG)
  quantidadeVendas?: number; // Volume de pedidos/vendas
  
  // Calculated fields
  margemPercentual: number;
  lucroLiquido: number;
  roas: number | string;
  score: number;
  status: ProductStatus;
  classificacaoABC: ABCClassification;
  statusReclamacao: ComplaintStatus;
}

export interface Company {
  id: string;
  companyName: string;
  corporateName: string;
  cnpj: string;
  logoUrl?: string;
  timezone: string;
  mainChannel: string;
  createdAt: string;
  isArchived?: boolean;
}

export interface StoreMetrics {
  traffic: number;
  conversionRate: number;
  abandonedCarts: number;
  salesCount: number;
  approvalRate: number;
  roi: number;
  rejectionRate: number;
  averageTicket: number;
  cac: number;
  ltv: number;
}

export interface StatePerformance {
  estado: string;
  faturamento: number;
  pedidos: number;
  ticketMedio: number;
}
