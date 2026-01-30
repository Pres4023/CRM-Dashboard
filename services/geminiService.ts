
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Fix: Initialized GoogleGenAI strictly using process.env.API_KEY as per the library guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInventoryInsights = async (products: Product[]) => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analiza el siguiente inventario de productos y proporciona:
    1. Una lista de productos en riesgo de quiebre de stock.
    2. Sugerencias de optimización de espacio basadas en categorías.
    3. Recomendaciones de compras urgentes.
    
    Productos: ${JSON.stringify(products.map(p => ({ sku: p.sku, name: p.name, stock: p.stock, min: p.minStock })))}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskProducts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sku: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["riskProducts", "recommendations"]
        }
      }
    });

    // Fix: Accessing the extracted string output via the .text property as per guidelines.
    const text = response.text || "{}";
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return null;
  }
};
