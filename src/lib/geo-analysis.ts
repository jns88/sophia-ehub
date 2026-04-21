
import { DataSource, Product } from './types';

/**
 * @fileOverview Serviço de integração e normalização de dados geográficos.
 * Gerencia fontes de dados (API/Local), cache, timeout e agregação.
 */

export interface GeoAnalysisConfig {
  mode: "api" | "local" | "auto";
  api_url: string;
  api_timeout: number;
  ttl: number;
}

export const geo_analysis_config: GeoAnalysisConfig = {
  mode: "auto",
  api_url: "https://api.example.com/v1/geo-performance", // URL Placeholder para integração
  api_timeout: 5000,
  ttl: 300000 // 5 minutos
};

interface GeoCache {
  data: any[] | null;
  lastUpdate: number | null;
  origin: 'api' | 'local' | 'fallback';
}

let cache: GeoCache = {
  data: null,
  lastUpdate: null,
  origin: 'local'
};

/**
 * Realiza o fetch controlado dos dados geográficos com suporte a fallback.
 */
export async function fetchGeoPerformanceData(localData: Product[]): Promise<{ data: any[], origin: 'api' | 'local' | 'fallback' }> {
  const now = Date.now();

  // 1. Verificar Cache
  if (cache.data && cache.lastUpdate && (now - cache.lastUpdate < geo_analysis_config.ttl)) {
    return { data: cache.data, origin: cache.origin };
  }

  // 2. Modo Local Forçado
  if (geo_analysis_config.mode === "local") {
    const normalized = normalizeData(localData);
    updateCache(normalized, 'local');
    return { data: normalized, origin: 'local' };
  }

  // 3. Tentativa de API (Auto ou API Only)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), geo_analysis_config.api_timeout);

    const response = await fetch(geo_analysis_config.api_url, {
      method: "GET",
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("API Response Error");

    const rawData = await response.json();
    const normalized = normalizeData(rawData);
    updateCache(normalized, 'api');
    return { data: normalized, origin: 'api' };

  } catch (error) {
    console.warn("Geo Analysis: API failed, falling back to local data.", error);
    
    // Fallback se não for modo "api" forçado
    if (geo_analysis_config.mode === "auto") {
      const normalized = normalizeData(localData);
      updateCache(normalized, 'fallback');
      return { data: normalized, origin: 'fallback' };
    }
    
    throw error;
  }
}

/**
 * Normaliza os dados da API ou Local para a estrutura interna de análise.
 */
function normalizeData(data: any[]): any[] {
  return data.map(item => ({
    estado: String(item.estado || item.state || 'N/A').toUpperCase(),
    produto: String(item.nomeProduto || item.produto || item.product || 'N/A'),
    sku: String(item.sku || 'N/A'),
    faturamento: Number(item.precoVenda || item.faturamento || 0) * (Number(item.quantidade) || 1),
    quantidade: Number(item.quantidade || 1),
    pedidos: Number(item.pedidos || 1),
    margem: Number(item.margemPercentual || item.margem || 0),
    marketplace: String(item.marketplace || item.canal || 'N/A')
  }));
}

function updateCache(data: any[], origin: 'api' | 'local' | 'fallback') {
  cache = {
    data,
    lastUpdate: Date.now(),
    origin
  };
}

export function clearGeoCache() {
  cache = { data: null, lastUpdate: null, origin: 'local' };
}
