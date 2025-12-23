export class AIService {
  private getApiKey(): string {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    return apiKey;
  }

  async generateResponse(
    context: string,
    responseTypes: Array<{ name: string; example: string }>,
    conversationHistory: Array<{ role: string; content: string }>,
    contactInfo?: { name: string; company?: string }
  ): Promise<string> {
    const apiKey = this.getApiKey();

    // Build system prompt
    let systemPrompt = `${context}\n\n`;

    if (contactInfo) {
      systemPrompt += `Información del contacto:\n`;
      systemPrompt += `- Nombre: ${contactInfo.name}\n`;
      if (contactInfo.company) {
        systemPrompt += `- Empresa: ${contactInfo.company}\n`;
      }
      systemPrompt += `\n`;
    }

    if (responseTypes.length > 0) {
      systemPrompt += `Tipos de respuestas disponibles:\n`;
      responseTypes.forEach((type) => {
        systemPrompt += `\n**${type.name}**\n${type.example}\n`;
      });
    }

    systemPrompt += `\nGenera una respuesta apropiada basándote en el contexto y los ejemplos anteriores. La respuesta debe ser natural y personalizada.`;

    // Build messages array
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
    ];

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }
}
