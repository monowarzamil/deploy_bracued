import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function generateResponse(prompt: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-latest",
  });

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    return "Sorry, I couldn't process your request. Please try again.";
  }
}
