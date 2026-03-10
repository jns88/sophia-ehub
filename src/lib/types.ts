export type ProductStatus = 'APROVADO' | 'ATENÇÃO' | 'CRÍTICO';
export type ABCClassification = 'A' | 'B' | 'C';
export type ComplaintStatus = 'OK' | 'OBSERVAR' | 'ALERTA';

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
  
  // Calculated fields
  margemPercentual: number;
  lucroLiquido: number;
  roas: number | string;
  score: number;
  status: ProductStatus;
  classificacaoABC: ABCClassification;
  statusReclamacao: ComplaintStatus;
}

export interface DashboardMetrics {
  receitaTotal: number;
  lucroLiquidoTotal: number;
  margemMedia: number;
  roasMedio: number;
  totalProdutos: number;
  produtosAprovados: number;
  produtosAtencao: number;
  produtosCriticos: number;
}
