var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY \uD658\uACBD \uBCC0\uC218\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. AI Studio \uC124\uC815\uC5D0\uC11C \uBE44\uBC00\uD0A4\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694.");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.post("/api/optimize-prompt", async (req, res) => {
  try {
    const { rawPrompt, style = "photorealistic", aspectRatio = "1:1", extraDetails = "" } = req.body;
    if (!rawPrompt || typeof rawPrompt !== "string" || rawPrompt.trim() === "") {
      return res.status(400).json({ error: "Rough prompt is required." });
    }
    const ai = getGeminiClient();
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

Ensure that even if the input is short (e.g. "\uAC80\uC740 \uACE0\uC591\uC774"), you expand it into an epic masterpiece scene based on the chosen style!`;
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
          type: import_genai.Type.OBJECT,
          properties: {
            optimizedPrompt: {
              type: import_genai.Type.STRING,
              description: "The complete, highly detailed prompt written in English for maximum image quality."
            },
            negativePrompt: {
              type: import_genai.Type.STRING,
              description: "Negative prompt to exclude undesired elements (e.g., blurry, low-quality, distorted limbs)."
            },
            koreanTranslation: {
              type: import_genai.Type.STRING,
              description: "The Korean translation of the optimized English prompt."
            },
            enhancements: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING },
              description: "Key elements, camera terms, or texture keywords added during optimization."
            },
            compositionNotes: {
              type: import_genai.Type.STRING,
              description: "A description of the camera angle, framing, or perspective."
            },
            lightingNotes: {
              type: import_genai.Type.STRING,
              description: "A description of the lighting, time of day, shadows, and color temperature."
            }
          },
          required: ["optimizedPrompt", "negativePrompt", "koreanTranslation", "enhancements", "compositionNotes", "lightingNotes"]
        }
      }
    });
    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gemini \uBAA8\uB378\uB85C\uBD80\uD130 \uC751\uB2F5\uC744 \uBC1B\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }
    const data = JSON.parse(resultText.trim());
    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Optimize prompt error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "\uD504\uB86C\uD504\uD2B8\uB97C \uCD5C\uC801\uD654\uD558\uB294 \uB3C4\uC911 \uC5D0\uB7EC\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
});
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required for generating an image." });
    }
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
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&private=true&enhance=false`;
    console.log(`[Free Image Gen] Fetching from Pollinations URL: ${pollinationsUrl}`);
    const imageResponse = await fetch(pollinationsUrl);
    if (!imageResponse.ok) {
      throw new Error(`\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC11C\uBC84 \uC751\uB2F5 \uC2E4\uD328 (\uC0C1\uD0DC \uCF54\uB4DC: ${imageResponse.status})`);
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    return res.json({
      success: true,
      imageUrl: `data:image/jpeg;base64,${base64Image}`
    });
  } catch (error) {
    console.error("Generate image error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "\uBB34\uB8CC \uC774\uBBF8\uC9C0 \uC11C\uBC84 \uD1B5\uC2E0 \uC911 \uC77C\uC2DC\uC801 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
