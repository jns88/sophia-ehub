import { Product, ProductStatus, ABCClassification, ComplaintStatus } from './types';

export function calculateProductMetrics(data: Partial<Product>): Product {
  const precoVenda = data.precoVenda || 0;
  const custoProduto = data.custoProduto || 0;
  const comissaoMarketplace = data.comissaoMarketplace || 0;
  const custoLogistico = data.custoLogistico || 0;
  const investimentoAds = data.investimentoAds || 0;
  const reclamacaoPercentual = data.reclamacaoPercentual || 0;

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

  return {
    ...data,
    sku: data.sku || 'N/A',
    nomeProduto: data.nomeProduto || 'Produto Sem Nome',
    categoria: data.categoria || 'Geral',
    marketplace: data.marketplace || 'Manual',
    marca: data.marca || 'N/A',
    tipoEnvio: data.tipoEnvio || 'N/A',
    precoVenda,
    custoProduto,
    comissaoMarketplace,
    custoLogistico,
    investimentoAds,
    reclamacaoPercentual: reclamacaoPercentual * 100, // UI displays as %, internal is decimal for calc
    margemPercentual: margemPercentual * 100,
    lucroLiquido,
    roas,
    score,
    status,
    classificacaoABC: 'C', // Calculated later based on full dataset
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
    const ratio = accumulatedRevenue / totalRevenue;
    
    let classification: ABCClassification = 'C';
    if (ratio <= 0.8) classification = 'A';
    else if (ratio <= 0.95) classification = 'B';

    return { ...p, classificacaoABC: classification };
  });
}
