import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getHelpResponse(userMessage: string): Promise<string> {
  try {
    const systemPrompt = `You are a helpful support assistant for ServerWatch, a Linux server monitoring platform. 

Key features of ServerWatch:
- Monitor up to 10 Linux servers for free
- Real-time CPU and memory tracking
- Python monitoring agent for data collection
- API key-based server registration
- Beautiful charts and dashboards

Common user questions:
- How to add/setup servers
- Installing the Python monitoring agent
- Understanding charts and metrics
- Troubleshooting connection issues
- API key management

Provide clear, concise, and helpful responses. Be friendly but professional. If you don't know something specific about ServerWatch, say so and suggest they check the documentation or contact support.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: userMessage,
    });

    return response.text || "I'm sorry, I couldn't process your request right now. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm experiencing technical difficulties. Please try again in a moment or contact support if the issue persists.";
  }
}
