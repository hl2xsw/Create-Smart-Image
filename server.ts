import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parser middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializer for GoogleGenAI
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. AI Studio 설정에서 비밀키를 확인해주세요.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Prompt optimization endpoint
app.post("/api/optimize-prompt", async (req, res) => {
  try {
    const { rawPrompt, style = "photorealistic", aspectRatio = "1:1", extraDetails = "" } = req.body;

    if (!rawPrompt || typeof rawPrompt !== "string" || rawPrompt.trim() === "") {
      return res.status(400).json({ error: "Rough prompt is required." });
    }

    const ai = getGeminiClient();

    // Custom system instructions based on styles to craft amazing prompts
    const systemInstruction = `You are an expert AI Image Generation Prompt Engineer.
Your task is to take a rough, basic, or poorly phrased user prompt (often in Korean or English) and expand/transform it into a highly detailed, professional, and descriptive image generation prompt in English.
The optimized prompt must be optimized for state-of-the-art models like Midjourney, Stable Diffusion, and Imagen 3.

Style Guidelines:
- "photorealistic": photorealistic, 8k resolution, cinematic lighting, dramatic shadows, realistic textures, hyper-detailed, raytracing, sharp focus.
- "anime": beautifully detailed anime illustration, vibrant colors, clean lines, cell-shaded, high quality, expressive characters, beautiful background scenery.
- "cinematic-3d": Octane render, Unreal Engine 5 style, 3D digital art, volumetric fog, realistic light scattering, depth of field, masterpiece.
- "cyberpunk": futuristic cyberpunk aesthetic, neon glows, rainy streets, reflections, high-tech gadgets, dark atmospheric mood.
- "fantasy": magical, mystical, fairytale atmosphere, glowing particles, ethereal lighting, rich brushstrokes, epic scale fantasy scenery.
- "pixel-art": detailed 16-bit/32-bit pixel art, retro video game aesthetic, clean grid, vibrant color palette.
- "minimalist": clean minimalist vector illustration, flat design, elegant composition, high contrast, aesthetic color palette, beautiful negative space.
- "oil-painting": fine art oil painting, rich canvas textures, classical composition, dramatic chiaroscuro lighting, visible impasto brushstrokes.

Please return a JSON response matching the requested schema. Provide:
1. "optimizedPrompt": The perfect expanded English prompt. It must be descriptive, detailing the subject, setting, composition, camera shot type, lighting, textures, colors, and styling cues. Keep it in English.
2. "negativePrompt": Suitable negative prompt modifiers to avoid bad proportions, blurry details, etc.
3. "koreanTranslation": A beautiful, accurate Korean translation of the optimized prompt.
4. "enhancements": List of specific keywords, elements, and ideas you added to enrich the user's rough description.
5. "compositionNotes": Details about the camera shot, angle, and framing.
6. "lightingNotes": Details about the lighting mood, color palette, and atmospheric effects.

Ensure that even if the input is short (e.g. "검은 고양이"), you expand it into an epic masterpiece scene based on the chosen style!`;

    const promptText = `User Rough Prompt: "${rawPrompt}"
Chosen Style: ${style}
Aspect Ratio: ${aspectRatio}
Extra User Details/Mood: "${extraDetails}"

Generate the perfect detailed English prompt and structured details.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedPrompt: {
              type: Type.STRING,
              description: "The complete, highly detailed prompt written in English for maximum image quality."
            },
            negativePrompt: {
              type: Type.STRING,
              description: "Negative prompt to exclude undesired elements (e.g., blurry, low-quality, distorted limbs)."
            },
            koreanTranslation: {
              type: Type.STRING,
              description: "The Korean translation of the optimized English prompt."
            },
            enhancements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key elements, camera terms, or texture keywords added during optimization."
            },
            compositionNotes: {
              type: Type.STRING,
              description: "A description of the camera angle, framing, or perspective."
            },
            lightingNotes: {
              type: Type.STRING,
              description: "A description of the lighting, time of day, shadows, and color temperature."
            }
          },
          required: ["optimizedPrompt", "negativePrompt", "koreanTranslation", "enhancements", "compositionNotes", "lightingNotes"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gemini 모델로부터 응답을 받지 못했습니다.");
    }

    const data = JSON.parse(resultText.trim());
    return res.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error("Optimize prompt error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "프롬프트를 최적화하는 도중 에러가 발생했습니다."
    });
  }
});

// 2. Real image generation endpoint using Free and Unlimited Pollinations AI Image Generator
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required for generating an image." });
    }

    // Map the string aspect ratio to pixel dimensions for Pollinations AI
    let width = 1024;
    let height = 1024;
    
    if (aspectRatio === "9:16") {
      width = 576;
      height = 1024;
    } else if (aspectRatio === "16:9") {
      width = 1024;
      height = 576;
    } else if (aspectRatio === "3:4") {
      width = 768;
      height = 1024;
    } else if (aspectRatio === "4:3") {
      width = 1024;
      height = 768;
    }

    const seed = Math.floor(Math.random() * 9999999);
    // Use pollinations.ai for beautiful, instant, and completely free unlimited generations without paid key boundaries
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&private=true&enhance=false`;

    console.log(`[Free Image Gen] Fetching from Pollinations URL: ${pollinationsUrl}`);

    const imageResponse = await fetch(pollinationsUrl);
    if (!imageResponse.ok) {
      throw new Error(`이미지 생성 서버 응답 실패 (상태 코드: ${imageResponse.status})`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    return res.json({
      success: true,
      imageUrl: `data:image/jpeg;base64,${base64Image}`
    });
  } catch (error: any) {
    console.error("Generate image error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "무료 이미지 서버 통신 중 일시적 오류가 발생했습니다."
    });
  }
});

// Vite / static file serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
