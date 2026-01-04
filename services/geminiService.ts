
import { GoogleGenAI } from "@google/genai";
import { Person } from "../types";

export const getHRInsights = async (people: Person[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const stats = people.reduce((acc: any, person) => {
      acc[person.situacao] = (acc[person.situacao] || 0) + 1;
      return acc;
    }, {});

    const prompt = `
      Como um consultor sênior de RH, analise os seguintes dados do sistema de gestão de pessoas e forneça um breve resumo executivo (em português) em no máximo 3 parágrafos.
      Dados Atuais:
      - Total de registros: ${people.length}
      - Distribuição por situação: ${JSON.stringify(stats)}
      
      Dê conselhos práticos sobre como lidar com os casos em "IH", "RFB" ou "Pendente". Use um tom profissional e amigável.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Erro ao conectar com a inteligência artificial. Verifique sua conexão.";
  }
};
