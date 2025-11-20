import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, scrape_rules } = await req.json();

    if (!url) {
      throw new Error('URL is required');
    }

    // Fetch the web page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error('Failed to parse HTML');
    }

    // Extract products using scraping rules or AI-powered extraction
    const products = [];

    if (scrape_rules?.selector) {
      // Use CSS selector-based scraping
      const productElements = doc.querySelectorAll(scrape_rules.selector);

      for (const element of productElements) {
        const product = extractProductFromElement(element, scrape_rules);
        if (product) {
          products.push(product);
        }
      }
    } else {
      // Use AI-powered smart extraction
      const textContent = doc.body?.textContent || '';
      const aiProducts = await extractProductsWithAI(textContent, url);
      products.push(...aiProducts);
    }

    // Enrich products with AI analysis
    const enrichedProducts = await enrichProductsWithAI(products);

    return new Response(JSON.stringify({
      products: enrichedProducts,
      count: enrichedProducts.length,
      source_url: url,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-product-page:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractProductFromElement(element: any, rules: any) {
  try {
    const product: any = {};

    // Extract fields based on rules
    if (rules.product_name) {
      const nameElement = element.querySelector(rules.product_name);
      product.product_name = nameElement?.textContent?.trim();
    }

    if (rules.premium) {
      const premiumElement = element.querySelector(rules.premium);
      const premiumText = premiumElement?.textContent?.trim();
      product.premium_amount = extractPrice(premiumText);
    }

    if (rules.insurer_name) {
      const insurerElement = element.querySelector(rules.insurer_name);
      product.insurer_name = insurerElement?.textContent?.trim();
    }

    if (rules.link) {
      const linkElement = element.querySelector(rules.link);
      product.product_url = linkElement?.getAttribute('href');
    }

    // Extract coverage/benefits if specified
    if (rules.benefits) {
      const benefitsElements = element.querySelectorAll(rules.benefits);
      product.benefits = Array.from(benefitsElements).map((el: any) => el.textContent?.trim());
    }

    // Extract description/coverage summary
    if (rules.description) {
      const descElement = element.querySelector(rules.description);
      product.coverage_summary = descElement?.textContent?.trim();
    }

    return product;
  } catch (error) {
    console.error('Error extracting product:', error);
    return null;
  }
}

function extractPrice(text: string | undefined): number | null {
  if (!text) return null;

  // Remove currency symbols and extract number
  const priceMatch = text.match(/[\d,]+\.?\d*/);
  if (priceMatch) {
    return parseFloat(priceMatch[0].replace(/,/g, ''));
  }

  return null;
}

async function extractProductsWithAI(textContent: string, sourceUrl: string): Promise<any[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Truncate content if too long (max 8000 chars for context)
  const truncatedContent = textContent.slice(0, 8000);

  const prompt = `You are an AI that extracts insurance product information from web pages.

Analyze the following web page content and extract all insurance products mentioned.
For each product, extract:
- product_name: Name of the insurance product
- insurer_name: Name of the insurance company
- policy_type: Type (health, auto, life, home, travel, pet, business, other)
- premium_amount: Premium cost (number only, if available)
- premium_frequency: Payment frequency (monthly, annual, quarterly, one-time)
- coverage_summary: Brief description of what's covered
- benefits: List of key benefits
- exclusions: List of exclusions (if mentioned)

Web page content:
${truncatedContent}

Source URL: ${sourceUrl}

Return a JSON array of products. If no products found, return an empty array.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting structured insurance product data from unstructured web content. Always return valid JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const aiResponse = await response.json();
  const content = aiResponse.choices[0].message.content;

  try {
    const result = JSON.parse(content);
    return result.products || [];
  } catch {
    return [];
  }
}

async function enrichProductsWithAI(products: any[]): Promise<any[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openAIApiKey || products.length === 0) {
    return products;
  }

  // Enrich products in batches to avoid token limits
  const enrichedProducts = [];

  for (const product of products) {
    try {
      const prompt = `Analyze this insurance product and enrich the data:

Product: ${JSON.stringify(product, null, 2)}

Tasks:
1. Generate a clear, concise AI summary (2-3 sentences) explaining what this product offers
2. Extract and structure any coverage limits mentioned
3. Identify the policy type if not already specified
4. Standardize the premium frequency if present
5. Generate a risk score (0-100) based on coverage comprehensiveness

Return JSON with:
{
  "ai_summary": "...",
  "coverage_limits": {},
  "policy_type": "...",
  "premium_frequency": "...",
  "risk_score": number
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an insurance data analyst. Return valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        const enrichment = JSON.parse(aiResponse.choices[0].message.content);

        enrichedProducts.push({
          ...product,
          ...enrichment,
          external_id: product.external_id || generateProductId(product),
        });
      } else {
        enrichedProducts.push({
          ...product,
          external_id: product.external_id || generateProductId(product),
        });
      }
    } catch (error) {
      console.error('Error enriching product:', error);
      enrichedProducts.push({
        ...product,
        external_id: product.external_id || generateProductId(product),
      });
    }
  }

  return enrichedProducts;
}

function generateProductId(product: any): string {
  // Generate a unique ID based on product data
  const data = `${product.insurer_name}-${product.product_name}-${product.policy_type}`;
  return btoa(data).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
}
