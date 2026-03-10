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

export type TimeRange = 'hoje' | 'semana' | 'mes';

export type IntegrationStatus = 'Não configurado' | 'Configurado' | 'Conectado';

export interface Product {
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
  
  // Calculated fields
  margemPercentual: number;
  lucroLiquido: number;
  roas: number | string;
  score: number;
  status: ProductStatus;
  classificacaoABC: ABCClassification;
  statusReclamacao: ComplaintStatus;
}

export interface Workspace {
  id: string;
  nome: string;
  razaoSocial: string;
  cnpj: string;
  logo?: string;
  timezone: string;
  canalPrincipal: string;
}
