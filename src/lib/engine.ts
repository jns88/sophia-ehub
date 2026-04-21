import { Product, ProductStatus, ABCClassification, ComplaintStatus } from './types';

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const REGIAO_MAP: Record<string, string> = {
  'AC': 'Norte', 'AM': 'Norte', 'AP': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
  'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
  'DF': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste',
  'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
  'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul'
};

export function calculateProductMetrics(data: Partial<Product>): Product {
  const precoVenda = data.precoVenda || 0;
  const custoProduto = data.custoProduto || 0;
  const comissaoMarketplace = data.comissaoMarketplace || 0;
  const custoLogistico = data.custoLogistico || 0;
  const investimentoAds = data.investimentoAds || 0;
  const reclamacaoPercentual = data.reclamacaoPercentual || 0;
  const quantidade = data.quantidade || 1;
  
  // Geográfico
  const estado = data.estado || UFS[Math.floor(Math.random() * UFS.length)];
  const regiao = REGIAO_MAP[estado] || 'Outra';

  // 1. Margem percentual
  const margemPercentual = precoVenda > 0 ? (precoVenda - custoProduto) / precoVenda : 0;

  // 2. Lucro Líquido (Unitário)
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
    estado,
    regiao,
    precoVenda,
    custoProduto,
    comissaoMarketplace,
    custoLogistico,
    investimentoAds,
    quantidade,
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
  const totalRevenue = sorted.reduce((acc, p) => acc + (p.precoVenda * p.quantidade), 0);
  
  let accumulatedRevenue = 0;

  return sorted.map(p => {
    accumulatedRevenue += (p.precoVenda * p.quantidade);
    const ratio = accumulatedRevenue / (totalRevenue || 1);
    
    let classification: ABCClassification = 'C';
    if (ratio <= 0.8) classification = 'A';
    else if (ratio <= 0.95) classification = 'B';

    return { ...p, classificacaoABC: classification };
  });
}
