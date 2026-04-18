import { Product, ProductStatus, ABCClassification, ComplaintStatus, AgrupamentoGeografico, StatePerformance } from './types';

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
  
  // Quantidades para agregação
  const quantidade = data.quantidade || 1;
  const vendas = data.vendas || 1;

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
    quantidade,
    vendas,
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

  const sorted = [...products].sort((a, b) => (b.precoVenda * b.quantidade) - (a.precoVenda * a.quantidade));
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

/**
 * Agrupa dados de performance por estado conforme regras de negócio.
 * Retorna um objeto indexado pela UF para lookup eficiente.
 */
export function aggregateDataByState(products: Product[]): AgrupamentoGeografico {
  const agrupamento: AgrupamentoGeografico = {};
  
  products.forEach(p => {
    const uf = (p.estado || 'N/A').toUpperCase();
    if (uf === 'N/A') return;

    if (!agrupamento[uf]) {
      agrupamento[uf] = {
        faturamentoTotal: 0,
        totalPedidos: 0,
        totalItens: 0
      };
    }
    
    // Regras:
    // faturamentoTotal = soma(precoVenda * quantidade)
    // totalPedidos = soma(vendas)
    // totalItens = soma(quantidade)
    agrupamento[uf].faturamentoTotal += (p.precoVenda * (p.quantidade || 1));
    agrupamento[uf].totalPedidos += (p.vendas || 1);
    agrupamento[uf].totalItens += (p.quantidade || 1);
  });

  return agrupamento;
}

/**
 * Converte o agrupamento geográfico em uma lista para componentes de visualização.
 */
export function getFormattedGeographicList(agrupamento: AgrupamentoGeografico): StatePerformance[] {
  return Object.entries(agrupamento)
    .map(([estado, data]) => ({
      estado,
      faturamento: data.faturamentoTotal,
      pedidos: data.totalPedidos,
      ticketMedio: data.totalPedidos > 0 ? data.faturamentoTotal / data.totalPedidos : 0
    }))
    .sort((a, b) => b.faturamento - a.faturamento);
}
