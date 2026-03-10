'use server';
/**
 * @fileOverview This file implements a Genkit flow that generates AI-driven explanations
 * and suggested actions for e-commerce products with 'Attention' or 'Critical' statuses.
 *
 * - getAiProductInsight - A function that handles the generation of AI product insights.
 * - AiProductInsightInput - The input type for the getAiProductInsight function.
 * - AiProductInsightOutput - The return type for the getAiProductInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiProductInsightInputSchema = z.object({
  sku: z.string().describe('Unique identifier for the product.'),
  nomeProduto: z.string().describe('Name of the product.'),
  categoria: z.string().describe('Category of the product.'),
  marketplace: z.string().describe('Marketplace where the product is sold.'),
  marca: z.string().describe('Brand of the product.'),
  tipoEnvio: z.string().describe('Shipping type for the product.'),
  precoVenda: z.number().describe('Selling price of the product.'),
  custoProduto: z.number().describe('Cost of the product.'),
  comissaoMarketplace: z.number().describe('Commission paid to the marketplace.'),
  custoLogistico: z.number().describe('Logistics cost for the product.'),
  investimentoAds: z.number().describe('Advertising investment for the product.'),
  reclamacaoPercentual: z.number().describe('Percentage of customer complaints for the product.'),
  margemPercentual: z.number().describe('Calculated profit margin percentage.'),
  lucroLiquido: z.number().describe('Calculated net profit.'),
  roas: z.union([z.number(), z.string()]).describe('Calculated Return On Ad Spend (ROAS). Can be "Orgânico" if Ads Investment is zero.'),
  score: z.number().describe('Strategic score based on margin (0-3).'),
  status: z.enum(['APROVADO', 'ATENÇÃO', 'CRÍTICO']).describe('Overall status of the product.'),
  classificacaoABC: z.enum(['A', 'B', 'C']).describe('ABC classification of the product based on revenue contribution.'),
  statusReclamacao: z.enum(['OK', 'OBSERVAR', 'ALERTA']).describe('Status of complaints for the product.'),
}).describe('Input schema for generating AI product insights.');

export type AiProductInsightInput = z.infer<typeof AiProductInsightInputSchema>;

const AiProductInsightOutputSchema = z.object({
  explanation: z.string().describe('AI-generated explanation of the product status and potential root causes.'),
  suggestedActions: z.array(z.string()).describe('AI-generated actionable suggestions to improve the product performance.'),
}).describe('Output schema for AI product insights.');

export type AiProductInsightOutput = z.infer<typeof AiProductInsightOutputSchema>;

export async function getAiProductInsight(input: AiProductInsightInput): Promise<AiProductInsightOutput> {
  return aiProductInsightFlow(input);
}

const aiProductInsightPrompt = ai.definePrompt({
  name: 'aiProductInsightPrompt',
  input: { schema: AiProductInsightInputSchema },
  output: { schema: AiProductInsightOutputSchema },
  prompt: `Você é um analista de e-commerce experiente e perspicaz. Sua tarefa é analisar detalhadamente os dados de um produto específico que está com status 'ATENÇÃO' ou 'CRÍTICO'.

Com base nos dados fornecidos, identifique as causas prováveis da performance atual do produto e forneça uma explicação clara e concisa. Além disso, sugira ações práticas e objetivas que o analista de e-commerce pode tomar para melhorar o desempenho do produto.

Foque nos principais indicadores e como eles contribuem para o status atual. Se o 'score' for baixo e o 'margemPercentual' for negativo ou muito baixo, explique por que isso é problemático. Se o 'investimentoAds' for alto e o 'roas' baixo, destaque essa ineficiência. Se a 'reclamacaoPercentual' for alta, sugira investigar a qualidade do produto ou o atendimento.

Dados do Produto:
- SKU: {{{sku}}}
- Nome do Produto: {{{nomeProduto}}}
- Categoria: {{{categoria}}}
- Marketplace: {{{marketplace}}}
- Marca: {{{marca}}}
- Tipo de Envio: {{{tipoEnvio}}}
- Preço de Venda: {{{precoVenda}}}
- Custo do Produto: {{{custoProduto}}}
- Comissão Marketplace: {{{comissaoMarketplace}}}
- Custo Logístico: {{{custoLogistico}}}
- Investimento em Ads: {{{investimentoAds}}}
- Porcentagem de Reclamação: {{{reclamacaoPercentual}}}%
- Margem Percentual: {{{margemPercentual}}}%
- Lucro Líquido: {{{lucroLiquido}}}
- ROAS: {{{roas}}}
- Score Estratégico: {{{score}}}
- Status do Produto: {{{status}}}
- Classificação ABC: {{{classificacaoABC}}}
- Status de Reclamação: {{{statusReclamacao}}}

Análise e Sugestões:`,
});

const aiProductInsightFlow = ai.defineFlow(
  {
    name: 'aiProductInsightFlow',
    inputSchema: AiProductInsightInputSchema,
    outputSchema: AiProductInsightOutputSchema,
  },
  async (input) => {
    // Only generate insights for products that are 'ATENÇÃO' or 'CRÍTICO'
    if (input.status === 'APROVADO') {
      return {
        explanation: 'Este produto está com status APROVADO e não necessita de insights ou ações corretivas no momento.',
        suggestedActions: [],
      };
    }

    const { output } = await aiProductInsightPrompt(input);
    return output!;
  }
);
