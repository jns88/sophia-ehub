import { Product, ProductStatus, ABCClassification, ComplaintStatus, StatePerformance } from './types';

const REGION_MAP: Record<string, string> = {
  'SP': 'Sudeste', 'RJ': 'Sudeste', 'MG': 'Sudeste', 'ES': 'Sudeste',
  'PR': 'Sul', 'SC': 'Sul', 'RS': 'Sul',
  'BA': 'Nordeste', 'CE': 'Nordeste', 'PE': 'Nordeste', 'RN': 'Nordeste', 'PB': 'Nordeste', 'MA': 'Nordeste', 'PI': 'Nordeste', 'AL': 'Nordeste', 'SE': 'Nordeste',
  'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'DF': 'Centro-Oeste',
  'AM': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'AC': 'Norte', 'AP': 'Norte', 'TO': 'Norte'
};

const UFS = Object.keys(REGION_MAP);

export function calculateProductMetrics(data: Partial<Product>): Product {
  const precoVenda = data.precoVenda || 0;
  const custoProduto = data.custoProduto || 0;
  const comissaoMarketplace = data.comissaoMarketplace || 0;
  const custoLogistico = data.custoLogistico || 0;
  const investimentoAds = data.investimentoAds || 0;
  const reclamacaoPercentual = data.reclamacaoPercentual || 0;
  const quantidadeVendas = data.quantidadeVendas || 1;

  // 1. Margem percentual
  const margemPercentual = precoVenda > 0 ? (precoVenda - custoProduto) / precoVenda : 0;

  // 2. Lucro Líquido
  const lucroLiquido = precoVenda - custoProduto - comissaoMarketplace - custoLogistico - investimentoAds;

  // 3. ROAS
  const roas = investimentoAds > 0 ? precoVenda / investimentoAds : 'Orgânico';

  // 4. Score estratégico
  let score = 0;
  if (margemPercentual > 0.25) score = 3;
  else if (margemPercentual > 0.15) score = 2;
  else if (margemPercentual > 0) score = 1;
  else score = 0;

  // 5. Status do produto
  let status: ProductStatus = 'CRÍTICO';
  if (score >= 3) status = 'APROVADO';
  else if (score === 2) status = 'ATENÇÃO';

  // 6. Reclamação
  let statusReclamacao: ComplaintStatus = 'OK';
  if (reclamacaoPercentual > 0.03) statusReclamacao = 'ALERTA';
  else if (reclamacaoPercentual > 0) statusReclamacao = 'OBSERVAR';

  // Geographic Logic
  const randomUF = UFS[Math.floor(Math.random() * UFS.length)];
  const estado = (data.estado || randomUF).toUpperCase();
  const regiao = REGION_MAP[estado] || 'Outra';

  return {
    ...data,
    sku: data.sku || 'N/A',
    nomeProduto: data.nomeProduto || 'Produto Sem Nome',
    categoria: data.categoria || 'Geral',
    marketplace: data.marketplace || 'Manual',
    marca: data.marca || 'N/A',
    tipoEnvio: data.tipoEnvio || 'N/A',
    estado,
    regiao,
    quantidadeVendas,
    precoVenda,
    custoProduto,
    comissaoMarketplace,
    custoLogistico,
    investimentoAds,
    reclamacaoPercentual: reclamacaoPercentual * 100,
    margemPercentual: margemPercentual * 100,
    lucroLiquido,
    roas,
    score,
    status,
    classificacaoABC: 'C',
    statusReclamacao,
  } as Product;
}

export function applyABCClassification(products: Product[]): Product[] {
  if (products.length === 0) return [];

  const sorted = [...products].sort((a, b) => b.precoVenda - a.precoVenda);
  const totalRevenue = sorted.reduce((acc, p) => acc + p.precoVenda, 0);
  
  let accumulatedRevenue = 0;

  return sorted.map(p => {
    accumulatedRevenue += p.precoVenda;
    const ratio = accumulatedRevenue / (totalRevenue || 1);
    
    let classification: ABCClassification = 'C';
    if (ratio <= 0.8) classification = 'A';
    else if (ratio <= 0.95) classification = 'B';

    return { ...p, classificacaoABC: classification };
  });
}

/**
 * Aggregates product performance data by Brazilian state (UF).
 * @param products The list of products to aggregate.
 * @returns An array of StatePerformance objects.
 */
export function aggregateDataByState(products: Product[]): StatePerformance[] {
  const totals: Record<string, { faturamento: number; pedidos: number }> = {};
  
  products.forEach(p => {
    const uf = (p.estado || 'N/A').toUpperCase();
    if (uf === 'N/A') return;

    if (!totals[uf]) {
      totals[uf] = { faturamento: 0, pedidos: 0 };
    }
    
    // We consider 'precoVenda' as the revenue contribution of this product record
    totals[uf].faturamento += p.precoVenda;
    totals[uf].pedidos += p.quantidadeVendas || 1;
  });

  return Object.entries(totals)
    .map(([estado, data]) => ({
      estado,
      faturamento: data.faturamento,
      pedidos: data.pedidos,
      ticketMedio: data.pedidos > 0 ? data.faturamento / data.pedidos : 0
    }))
    .sort((a, b) => b.faturamento - a.faturamento);
}
