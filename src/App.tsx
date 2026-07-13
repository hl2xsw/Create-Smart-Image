import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  RefreshCw, 
  Layers, 
  Layout, 
  Compass, 
  Palette, 
  Download, 
  ArrowRight, 
  Camera, 
  Sliders,
  HelpCircle,
  AlertCircle,
  Code,
  Info,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types for prompt optimization response
interface OptimizationResult {
  optimizedPrompt: string;
  negativePrompt: string;
  koreanTranslation: string;
  enhancements: string[];
  compositionNotes: string;
  lightingNotes: string;
}

// Preset style definition
interface StylePreset {
  id: string;
  name: string;
  engName: string;
  description: string;
  emoji: string;
  bgColor: string;
  accentColor: string;
  keywords: string[];
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: "photorealistic",
    name: "시네마틱 실사",
    engName: "Photorealistic",
    description: "실제 사진 같은 정교함과 극적인 영화적 조명 효과",
    emoji: "📸",
    bgColor: "from-amber-500/20 to-orange-600/20",
    accentColor: "border-orange-500 text-orange-400",
    keywords: ["8k resolution", "photorealistic", "cinematic lighting", "raytracing", "sharp focus"]
  },
  {
    id: "anime",
    name: "고퀄리티 애니",
    engName: "Anime / Manga",
    description: "선명한 라인과 화려한 색감의 고품질 일본 애니메이션 풍",
    emoji: "✨",
    bgColor: "from-pink-500/20 to-rose-600/20",
    accentColor: "border-pink-500 text-pink-400",
    keywords: ["vibrant colors", "anime illustration", "clean line art", "cell-shaded", "masterpiece background"]
  },
  {
    id: "cinematic-3d",
    name: "3D 시네마틱 렌더",
    engName: "3D Cinematic Render",
    description: "Unreal Engine 5 느낌의 입체적이고 극적인 3D 그래픽",
    emoji: "👾",
    bgColor: "from-purple-500/20 to-indigo-600/20",
    accentColor: "border-purple-500 text-purple-400",
    keywords: ["Octane render", "volumetric fog", "Unreal Engine 5 style", "depth of field", "3D digital art"]
  },
  {
    id: "cyberpunk",
    name: "사이버펑크",
    engName: "Cyberpunk",
    description: "비 내리는 밤거리, 홀로그램과 강렬한 네온 불빛",
    emoji: "🌃",
    bgColor: "from-blue-500/20 to-cyan-600/20",
    accentColor: "border-cyan-500 text-cyan-400",
    keywords: ["neon glows", "rainy streets", "futuristic tech", "metallic reflections", "cyberpunk aesthetic"]
  },
  {
    id: "fantasy",
    name: "판타지 / 몽환",
    engName: "Fantasy / Dreamy",
    description: "신비롭고 동화 같은 마법 세계와 빛나는 입자 효과",
    emoji: "🔮",
    bgColor: "from-emerald-500/20 to-teal-600/20",
    accentColor: "border-emerald-500 text-emerald-400",
    keywords: ["magical atmosphere", "glowing particles", "ethereal lighting", "mythic scale", "whimsical"]
  },
  {
    id: "pixel-art",
    name: "레트로 픽셀 아트",
    engName: "Retro Pixel Art",
    description: "귀엽고 아기자기한 16-bit/32-bit 고전 게임 도트 감성",
    emoji: "👾",
    bgColor: "from-yellow-500/20 to-amber-600/20",
    accentColor: "border-yellow-500 text-yellow-400",
    keywords: ["16-bit pixel art", "retro game aesthetic", "grid-aligned", "vibrant limited palette"]
  },
  {
    id: "minimalist",
    name: "감성 미니멀리즘",
    engName: "Minimalist Vector",
    description: "정갈한 선과 고급스러운 여백, 모던한 평면 일러스트",
    emoji: "🌿",
    bgColor: "from-teal-500/20 to-emerald-600/20",
    accentColor: "border-teal-500 text-teal-400",
    keywords: ["minimalist vector", "flat design", "elegant negative space", "harmonious color scheme"]
  },
  {
    id: "oil-painting",
    name: "클래식 유화",
    engName: "Classical Oil Painting",
    description: "웅장한 명화 질감과 강렬한 명암 대조, 붓터치 표현",
    emoji: "🎨",
    bgColor: "from-red-500/20 to-orange-600/20",
    accentColor: "border-red-500 text-red-400",
    keywords: ["oil painting", "impasto brushstrokes", "chiaroscuro lighting", "canvas texture", "rich pigment"]
  }
];

const ASPECT_RATIOS = [
  { id: "1:1", name: "1:1 (정사각형)", widthClass: "w-10 h-10", label: "Square" },
  { id: "16:9", name: "16:9 (와이드)", widthClass: "w-14 h-8", label: "Landscape" },
  { id: "9:16", name: "9:16 (릴스/숏츠)", widthClass: "w-8 h-14", label: "Portrait" },
  { id: "4:3", name: "4:3 (표준)", widthClass: "w-12 h-9", label: "Standard" },
  { id: "3:4", name: "3:4 (인물)", widthClass: "w-9 h-12", label: "Tall" }
];

const SAMPLE_PROMPTS = [
  "검은 고양이가 우주선 조종사 헬멧을 쓰고 있는 모습",
  "안개 자욱한 가을 아침, 햇살이 부서지는 숲속 오두막",
  "화려한 홀로그램 간판이 가득한 비 내리는 서울 밤거리 사이버펑크 골목",
  "하늘에 떠 있는 마법 성과 핑크빛 구름 위를 날아다니는 고래",
  "따뜻한 불빛이 흐르는 레트로 카페에서 조용히 코딩하고 있는 소녀"
];

export default function App() {
  // Input states
  const [rawPrompt, setRawPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("photorealistic");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [extraDetails, setExtraDetails] = useState("");

  // API key configuration for static deployments (e.g. GitHub Pages)
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem("USER_GEMINI_API_KEY") || "";
    } catch {
      return "";
    }
  });
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Loading & UX states
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeStep, setOptimizeStep] = useState(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Results
  const [optimizedData, setOptimizedData] = useState<OptimizationResult | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Copy indicator states
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Loading message animation helper
  useEffect(() => {
    let interval: any;
    if (isOptimizing) {
      interval = setInterval(() => {
        setOptimizeStep((prev) => (prev + 1) % 4);
      }, 1500);
    } else {
      setOptimizeStep(0);
    }
    return () => clearInterval(interval);
  }, [isOptimizing]);

  const optimizeStepsText = [
    "핵심 아이디어를 분석하는 중입니다...",
    "웅장한 구도와 정교한 디테일을 추가하는 중...",
    "선택하신 테마 스타일의 감성을 입히는 중...",
    "State-of-the-art AI 전용 영어 프롬프트로 최종 정제 중..."
  ];

  // Local Rule-Based Prompt Optimization Engine (Fallback for Offline / No-API-Key deployments)
  const generateLocalFallbackOptimization = (
    rawPrompt: string,
    style: string,
    aspectRatio: string,
    extraDetails: string
  ): OptimizationResult => {
    let styleKeywords: string[] = [];
    let styleDescription = "";
    let negativePrompt = "";
    let enhancements: string[] = [];
    let compositionNotes = "";
    let lightingNotes = "";

    switch (style) {
      case "photorealistic":
        styleKeywords = ["photorealistic", "ultra-detailed 8k resolution", "cinematic lighting", "dramatic shadows", "realistic textures", "raytracing", "sharp focus", "highly detailed skin/surface texture", "professional commercial photography"];
        styleDescription = "시네마틱 실사 영화 사진";
        negativePrompt = "blurry, low quality, distorted anatomy, extra limbs, bad proportions, bad hands, deformed, cartoon, illustration, drawing";
        enhancements = [
          "실제 전문 카메라(Sony A7R V)로 촬영한 듯한 초고화질 실사 텍스처 구현",
          "피부 모공 및 사물 표면 질감의 극사실적 시각화",
          "시네마틱 피사계 심도(Depth of Field)와 아웃포커싱 적용",
          "레이트레이싱을 적용한 정교한 빛 반사와 그림자 매핑"
        ];
        compositionNotes = "골든 아워 시점의 안정적인 3분할 시네마틱 카메라 앵글";
        lightingNotes = "빛의 스펙트럼이 은은하게 퍼지는 소프트 디퓨즈 시네마틱 라이트";
        break;
      case "anime":
        styleKeywords = ["beautifully detailed anime illustration", "vibrant colors", "clean line art", "cell-shaded", "masterpiece background scenery", "aesthetic lighting", "Makoto Shinkai style inspired", "Kyoto Animation style"];
        styleDescription = "고퀄리티 명작 애니메이션";
        negativePrompt = "photorealistic, real-life photo, 3d render, low quality, bad anatomy, deformed, sketch, monochrome, text, watermark";
        enhancements = [
          "인기 감성 애니메이션 거장들의 풍부한 파스텔 톤 색감 적용",
          "깔끔하고 완성도 높은 디지털 벡터 스타일의 선화 처리",
          "구름, 빛갈라짐 등 서정적이고 웅장한 배경 요소 정교화",
          "캐릭터의 생동감 넘치는 눈빛과 섬세한 감정선 표현 추가"
        ];
        compositionNotes = "감성 애니메이션 영화의 한 장면 같은 구도";
        lightingNotes = "오후의 따스한 햇살이 부서지는 감성적이고 투명한 역광 효과";
        break;
      case "cinematic-3d":
        styleKeywords = ["Octane render", "Unreal Engine 5 style", "3D digital art", "volumetric fog", "realistic light scattering", "depth of field", "raytraced ambient occlusion", "highly detailed 3D model", "stunning masterpiece"];
        styleDescription = "3D 시네마틱 그래픽";
        negativePrompt = "2d, drawing, painting, sketch, low quality, flat shading, noise, compressed image, simple illustration";
        enhancements = [
          "최신 언리얼 엔진 5 기반의 압도적인 입체 질감과 밀도감 형성",
          "정교한 스페큘러 매핑을 통한 사물 표면 광택 및 디테일 극대화",
          "미세한 먼지 파티클 및 공기 중 수증기 묘사 추가",
          "3D 그래픽 아티스트의 정밀한 디지털 조소 퀄리티 재현"
        ];
        compositionNotes = "피사체의 웅장함을 극대화하는 다이내믹 로우 앵글 구도";
        lightingNotes = "신비로운 안개(volumetric fog) 속을 뚫고 나오는 신성한 볼륨 광원";
        break;
      case "cyberpunk":
        styleKeywords = ["futuristic cyberpunk aesthetic", "neon glows", "rainy streets with vivid neon reflections", "high-tech gadgets", "dark atmospheric mood", "night scene", "cybernetic enhancements", "cyberpunk cityscape", "synthwave/retrowave vibe"];
        styleDescription = "네온 사이버펑크";
        negativePrompt = "bright daylight, peaceful nature, historical, country, rustic, sunny sky, traditional, low quality";
        enhancements = [
          "네온 핑크, 사이언 블루가 대조를 이루는 화려한 사이버 테크 톤 주입",
          "비에 젖은 아스팔트 바닥과 금속 철골에 반사되는 네온 불빛 정밀화",
          "미래형 무인 드론, 홀로그램 디스플레이 등 SF 요소 배치",
          "고독하고 세련된 디스토피아 밤거리 특유의 깊이 있는 음영 묘사"
        ];
        compositionNotes = "도심의 복잡한 원근감을 극대화하는 깊은 투시도 앵글";
        lightingNotes = "어둠 속에서 강렬하게 발산되는 네온 인공 광원과 간접 반사광";
        break;
      case "fantasy":
        styleKeywords = ["magical mystical fairytale atmosphere", "glowing particles", "ethereal lighting", "rich fantasy scenery", "high-fantasy adventure", "mythic scale masterpiece", "concept art", "dreamy and whimsical art"];
        styleDescription = "몽환적 마법 판타지";
        negativePrompt = "modern, mundane, technology, sci-fi, realistic photo, industrial, office, boring, ugly, low quality";
        enhancements = [
          "마치 동화 속에 들어온 듯한 몽환적인 파스텔 톤 텍스처 가미",
          "주변을 부유하며 빛을 내는 엘프의 눈가루 및 정령 광원 효과",
          "신비로운 고대 유적, 마법 생명체 등 모험적 디테일 추가",
          "아티스트의 풍부하고 부드러운 유화풍 브러시 터치 재현"
        ];
        compositionNotes = "미지의 세계를 탐험하는 영웅의 시선을 연출한 와이드 전경 구도";
        lightingNotes = "하늘에서 은은하게 쏟아져 내리는 성스러운 빛구름과 오로라 광채";
        break;
      case "pixel-art":
        styleKeywords = ["detailed 16-bit 32-bit pixel art", "retro video game aesthetic", "clean grid alignment", "vibrant limited color palette", "cozy pixel graphics", "pixelated masterpiece", "nostalgic game art"];
        styleDescription = "레트로 픽셀 도트 아트";
        negativePrompt = "photorealistic, 3d, realistic, smooth gradients, blurry, oil painting, watercolor, fuzzy";
        enhancements = [
          "레트로 명작 게임의 감성을 재현하는 정교한 수작업 도트 질감 구현",
          "풍부하면서도 고전적인 한정적 컬러 팔레트를 사용한 색상 조화",
          "정감 가고 디테일한 아이템 데코레이션 요소 배치",
          "추억의 16비트 명작 타이틀의 시각적 해상도와 정갈함 복원"
        ];
        compositionNotes = "아늑함이 극대화되는 쿼터뷰(Isometric) 혹은 정면 사이드뷰 구도";
        lightingNotes = "도트 타일의 입체감을 살려주는 아늑하고 명확한 픽셀 그림자 기법";
        break;
      case "minimalist":
        styleKeywords = ["clean minimalist vector illustration", "flat design vector art", "elegant composition", "high contrast", "aesthetic pastel color scheme", "beautiful negative space", "modern graphics", "Scandinavian style design"];
        styleDescription = "감성 미니멀 벡터 일러스트";
        negativePrompt = "complex, messy, hyperrealistic, noisy, busy background, detailed textures, photorealistic, 3d, oil painting";
        enhancements = [
          "복잡하고 어지러운 세부 사항을 걷어낸 세련된 실루엣 기하학 구조",
          "넓은 여백의 미를 살려 피사체의 존재감을 감각적으로 강조",
          "현대 디자인 트렌드에 어울리는 엄선된 파스텔 파우더 배색 적용",
          "어떤 공간에나 어울리는 모던한 미적 감각의 평면 레이아웃 구성"
        ];
        compositionNotes = "시선의 편안함을 유도하는 중심 정렬 혹은 감각적인 황금비율 구도";
        lightingNotes = "그림자를 극소화한 소프트 플랫 디퓨즈 광원으로 눈이 편안한 밝기 구현";
        break;
      case "oil-painting":
        styleKeywords = ["fine art oil painting", "rich canvas textures", "classical masterpiece composition", "dramatic chiaroscuro lighting", "visible impasto brushstrokes", "classical academic art", "timeless painting on canvas"];
        styleDescription = "명화 클래식 유화";
        negativePrompt = "photographic, digital art, flat, clean lines, modern, futuristic, low quality, vector art, photo";
        enhancements = [
          "실제 캔버스 위에 거칠게 물감을 얹은 듯한 입체 임파스토 붓터치 묘사",
          "시간이 흐른 고전 명화 특유의 진중하고 웅장한 갈색조 질감 재현",
          "피사체의 입체감을 극적으로 살리는 명암 대조 기법 주입",
          "유명 아카데미 화가들이 그린 듯한 예술적 아우라 복원"
        ];
        compositionNotes = "피사체의 위엄을 중후하게 연출하는 클래식 대칭형 명화 구도";
        lightingNotes = "방 한 구석에서 들어오는 드라마틱한 명암 대비의 단일 창가 조명";
        break;
      default:
        styleKeywords = ["highly detailed", "masterpiece", "high resolution"];
        styleDescription = "커스텀 예술";
        negativePrompt = "blurry, low quality, ugly";
        enhancements = ["피사체 본연의 디테일과 특징 정밀 묘사", "선명한 포커싱과 화질 가미"];
        compositionNotes = "안정적이고 균형감 있는 최적의 구도 설계";
        lightingNotes = "피사체를 가장 입체적으로 살려주는 부드러운 자연 광원";
    }

    const cleanRaw = rawPrompt.trim();
    const extraString = extraDetails.trim() ? `, ${extraDetails.trim()}` : "";
    const optimizedPromptText = `${cleanRaw}${extraString}, ${styleKeywords.join(", ")}, dynamic composition, masterpiece quality`;

    return {
      optimizedPrompt: optimizedPromptText,
      negativePrompt,
      koreanTranslation: `${cleanRaw} (${styleDescription} 스타일로 최적화됨)`,
      enhancements,
      compositionNotes,
      lightingNotes
    };
  };

  // Client-side fallback for static deployments (like GitHub Pages)
  const callGeminiClientSide = async (
    rawPrompt: string,
    style: string,
    aspectRatio: string,
    extraDetails: string
  ) => {
    const apiKey = customApiKey || (import.meta as any).env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.log("No API Key detected. Using high-fidelity local prompt optimization engine fallback.");
      return generateLocalFallbackOptimization(rawPrompt, style, aspectRatio, extraDetails);
    }

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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText
                }
              ]
            }
          ],
          systemInstruction: {
            parts: [
              {
                text: systemInstruction
              }
            ]
          },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                optimizedPrompt: { type: "STRING" },
                negativePrompt: { type: "STRING" },
                koreanTranslation: { type: "STRING" },
                enhancements: { type: "ARRAY", items: { type: "STRING" } },
                compositionNotes: { type: "STRING" },
                lightingNotes: { type: "STRING" }
              },
              required: ["optimizedPrompt", "negativePrompt", "koreanTranslation", "enhancements", "compositionNotes", "lightingNotes"]
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API 호출 실패 (코드: ${response.status}): ${errText}`);
    }

    const json = await response.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini API로부터 올바른 응답을 받지 못했습니다.");
    }

    return JSON.parse(text.trim());
  };

  // Action: Handle Prompt Optimization
  const handleOptimize = async () => {
    if (!rawPrompt.trim()) return;

    setIsOptimizing(true);
    setOptimizedData(null);
    setGeneratedImageUrl(null);
    setImageError(null);

    try {
      let data = null;

      // 1. Try server API first
      try {
        const response = await fetch("/api/optimize-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawPrompt,
            style: selectedStyle,
            aspectRatio: selectedRatio,
            extraDetails
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.data) {
            data = resData.data;
          }
        }
      } catch (serverErr) {
        console.log("Server optimization API unavailable or failed, falling back to client-side direct Gemini call...", serverErr);
      }

      // 2. Client-side Gemini API fallback
      if (!data) {
        data = await callGeminiClientSide(rawPrompt, selectedStyle, selectedRatio, extraDetails);
      }

      setOptimizedData(data);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "프롬프트를 최적화하는 도중 에러가 발생했습니다.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Action: Handle Image Generation
  const handleGenerateImage = async (customPrompt?: string) => {
    const promptToUse = customPrompt || optimizedData?.optimizedPrompt;
    if (!promptToUse) return;

    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);
    setImageError(null);

    // Map the string aspect ratio to pixel dimensions for Pollinations AI
    let width = 1024;
    let height = 1024;
    
    if (selectedRatio === "9:16") {
      width = 576;
      height = 1024;
    } else if (selectedRatio === "16:9") {
      width = 1024;
      height = 576;
    } else if (selectedRatio === "3:4") {
      width = 768;
      height = 1024;
    } else if (selectedRatio === "4:3") {
      width = 1024;
      height = 768;
    }

    const seed = Math.floor(Math.random() * 9999999);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptToUse)}?width=${width}&height=${height}&seed=${seed}&nologo=true&private=true&enhance=false`;

    try {
      let imageUrlToSet = null;

      // 1. Try server API first
      try {
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: promptToUse,
            aspectRatio: selectedRatio
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.imageUrl) {
            imageUrlToSet = resData.imageUrl;
          }
        }
      } catch (serverErr) {
        console.log("Server image API unavailable, using direct Pollinations client URL...", serverErr);
      }

      // 2. Client-side direct Pollinations fallback
      if (!imageUrlToSet) {
        try {
          const imageRes = await fetch(pollinationsUrl);
          if (!imageRes.ok) throw new Error(`이미지 서버 응답 실패 (상태 코드: ${imageRes.status})`);
          const blob = await imageRes.blob();
          imageUrlToSet = URL.createObjectURL(blob);
        } catch (fetchErr) {
          console.warn("Direct image blob fetch failed, falling back to raw image URL...", fetchErr);
          imageUrlToSet = pollinationsUrl;
        }
      }

      setGeneratedImageUrl(imageUrlToSet);
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || "이미지 생성 중 알 수 없는 에러가 발생했습니다.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Auto-trigger image generation as soon as prompt optimization is completed successfully
  useEffect(() => {
    if (optimizedData) {
      handleGenerateImage(optimizedData.optimizedPrompt);
    }
  }, [optimizedData]);

  // Clipboard copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Quick prompt chip select
  const handleSelectSample = (sample: string) => {
    setRawPrompt(sample);
  };

  const currentStylePreset = STYLE_PRESETS.find(s => s.id === selectedStyle) || STYLE_PRESETS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-500/30 selection:text-violet-200">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Prompt Wizard
              </h1>
              <p className="text-xs text-slate-500 font-mono">Smart AI Image Prompt Optimizer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all duration-200 ${
                customApiKey
                  ? "bg-emerald-950/40 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/30"
                  : "bg-amber-950/40 border-amber-900/50 text-amber-400 hover:bg-amber-900/30 animate-pulse"
              }`}
              title="GitHub Pages 등 정적 호스팅 환경용 API Key 설정"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{customApiKey ? "API Key 설정됨" : "API Key 설정"}</span>
            </button>
            <span className={`hidden sm:flex text-xs font-semibold px-2.5 py-1.5 rounded-full border items-center gap-1.5 transition-all duration-200 ${
              customApiKey
                ? "bg-violet-950/40 border-violet-900/50 text-violet-400"
                : "bg-indigo-950/40 border-indigo-900/50 text-indigo-400"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                customApiKey ? "bg-violet-400" : "bg-indigo-400"
              }`}></span>
              {customApiKey ? "Gemini AI Engine" : "Local Smart Engine"}
            </span>
          </div>
        </div>
      </header>

      {/* API Key Drawer/Panel */}
      <AnimatePresence>
        {showKeyInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-slate-900/90 border-b border-slate-800"
          >
            <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Key className="w-4 h-4 text-violet-400" />
                    Gemini API Key 설정 (GitHub Pages 등 정적 호스팅 환경 전용)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    본 서비스는 API Key 없이도 <strong>내장된 로컬 스마트 엔진</strong>을 통해 모든 기능을 100% 즉시 이용하실 수 있습니다. 다만, 더욱 깊이 있는 문맥 분석과 고차원적인 맞춤형 AI 최적화를 원하신다면 본인의 Gemini API Key를 입력해 보세요. 키는 외부로 절대 전송되지 않으며 오직 <strong>본인 브라우저의 로컬 저장소(localStorage)</strong>에만 보관됩니다.
                  </p>
                </div>
                <button
                  onClick={() => setShowKeyInput(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1"
                >
                  닫기
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="AIzaSy로 시작하는 API Key를 입력하세요"
                  value={customApiKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    setCustomApiKey(key);
                    try {
                      if (key.trim()) {
                        localStorage.setItem("USER_GEMINI_API_KEY", key.trim());
                      } else {
                        localStorage.removeItem("USER_GEMINI_API_KEY");
                      }
                    } catch (err) {
                      console.error("Failed to save API key to localStorage:", err);
                    }
                  }}
                  className="flex-1 text-sm bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
                />
                {customApiKey && (
                  <button
                    onClick={() => {
                      setCustomApiKey("");
                      try {
                        localStorage.removeItem("USER_GEMINI_API_KEY");
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="text-xs px-3 bg-red-950/50 text-red-400 border border-red-900/30 rounded-lg hover:bg-red-900/30 transition-all"
                  >
                    지우기
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-500 flex flex-col gap-1 leading-relaxed">
                <span className="flex items-center gap-1.5 text-amber-500/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <strong>API Key 발급 방법:</strong> <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-400 font-bold">Google AI Studio</a>에서 무료로 즉시 발급 가능합니다.
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  본 웹사이트는 서버 백엔드 통신 없이, 브라우저 내에서 직접 구글 API 서버로 직접 연결하므로 타인에게 키가 누출되지 않고 절대적으로 안전합니다.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        
        {/* Intro Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/30 border border-violet-800/40 text-violet-400 text-xs font-semibold mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            말하듯 대충 쓴 한국어를 압도적인 고화질 AI 전용 영어 프롬프트로 변환
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
            내가 대충 말해도 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">완벽한 AI 이미지 프롬프트</span>로
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            원하는 테마와 비율을 선택하고 대충 설명해 보세요. 
            인물 구도, 황금빛 조명, 초정밀 텍스처 등 최고급 수식어가 더해진 영문 프롬프트와 실제 테스트 이미지가 완성됩니다.
          </p>
        </div>

        {/* Main Grid: Input / Output Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Creator Panel & Prompt Optimization Result Cards (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Prompt Creator Form Card */}
            <section className="bg-slate-900/30 backdrop-blur-xl border border-slate-900 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-slate-200">프롬프트 제작 마법사</h3>
                </div>
                <span className="text-xs text-slate-500">Step 1 & 2</span>
              </div>

              {/* Input textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>1. 만들고 싶은 장면 설명하기 (대충 쓰기)</span>
                  <span className="text-slate-500 lowercase font-normal">한국어/영어 모두 가능</span>
                </label>
                <textarea
                  value={rawPrompt}
                  onChange={(e) => setRawPrompt(e.target.value)}
                  placeholder="예: 검은 고양이가 우주선 안에서 지구가 보이는 우주창을 바라보는 장면"
                  className="w-full min-h-[110px] bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 text-sm resize-none transition-all"
                  maxLength={400}
                  id="raw-prompt-input"
                />
                
                {/* Sample helper chips */}
                <div className="pt-1">
                  <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    클릭해서 빠른 테스트하기:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_PROMPTS.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSample(sample)}
                        className="text-[11px] bg-slate-950/50 hover:bg-slate-800 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg px-2.5 py-1 text-left transition-all truncate max-w-full cursor-pointer"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Style Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-pink-400" />
                    <span>2. 원하는 작가/미술 테마 스타일 선택</span>
                  </label>
                  <span className="text-[11px] font-mono text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-950/50 uppercase border border-indigo-900/40">
                    {currentStylePreset.engName}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {STYLE_PRESETS.map((style) => {
                    const isSelected = selectedStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`relative overflow-hidden text-left rounded-xl p-3 border transition-all cursor-pointer ${
                          isSelected 
                            ? `bg-gradient-to-br ${style.bgColor} border-violet-500/80 shadow-md shadow-violet-500/10` 
                            : "bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-950/80"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{style.emoji}</span>
                          <span className={`text-xs font-semibold ${isSelected ? "text-slate-100" : "text-slate-300"}`}>
                            {style.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                          {style.description}
                        </p>
                        
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3. 이미지 가로세로 비율 설정</span>
                </label>
                
                <div className="grid grid-cols-5 gap-2">
                  {ASPECT_RATIOS.map((ratio) => {
                    const isSelected = selectedRatio === ratio.id;
                    return (
                      <button
                        key={ratio.id}
                        onClick={() => setSelectedRatio(ratio.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-indigo-950/30 border-cyan-500/80 text-slate-200" 
                            : "bg-slate-950/30 border-slate-900 text-slate-500 hover:text-slate-300 hover:border-slate-800"
                        }`}
                      >
                        <div className="h-14 flex items-center justify-center mb-1">
                          <div className={`rounded border ${isSelected ? "border-cyan-400 bg-cyan-400/10" : "border-slate-700 bg-slate-800/10"} ${ratio.widthClass} transition-all`}></div>
                        </div>
                        <span className="text-[10px] font-bold tracking-tight">{ratio.id}</span>
                        <span className="text-[9px] text-slate-500 scale-90">{ratio.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Extras & Mood Inputs */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>4. 세부 조명 또는 추가 요구사항 (선택)</span>
                  <span className="text-slate-500 text-[10px]">직접 수식어 입력</span>
                </label>
                <input
                  type="text"
                  value={extraDetails}
                  onChange={(e) => setExtraDetails(e.target.value)}
                  placeholder="예: 해질녘 황금빛, 신비로운 안개 효과, 8k 디테일..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-xs transition-all"
                />
              </div>

              {/* Action Trigger Button */}
              <button
                onClick={handleOptimize}
                disabled={!rawPrompt.trim() || isOptimizing}
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                  !rawPrompt.trim() 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800/50" 
                    : isOptimizing
                      ? "bg-slate-900 border border-slate-800 text-violet-400 cursor-wait"
                      : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-[0.98]"
                }`}
                id="optimize-btn"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
                    <span>{optimizeStepsText[optimizeStep]}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse text-yellow-300" />
                    <span>완벽한 프롬프트로 완성하기 ✨</span>
                  </>
                )}
              </button>
            </section>

            {/* Prompt Optimization Result Area (Appends smoothly underneath) */}
            <AnimatePresence>
              {optimizedData && !isOptimizing && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-900/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-xs">최적화 영문 프롬프트</h4>
                        <p className="text-[9px] text-slate-500 font-mono">Best for SD, Midjourney, Imagen</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleCopy(optimizedData.optimizedPrompt, "optimized")}
                      className="text-[11px] bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md px-2.5 py-1 flex items-center gap-1 text-slate-400 hover:text-slate-100 transition-all active:scale-95 cursor-pointer"
                    >
                      {copiedText === "optimized" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">복사 완료</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>프롬프트 복사</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Copyable English Prompt */}
                  <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-900 relative">
                    <p className="text-slate-200 text-xs leading-relaxed font-mono select-all max-h-[160px] overflow-y-auto custom-scrollbar text-left">
                      {optimizedData.optimizedPrompt}
                    </p>
                  </div>

                  {/* Korean Translation */}
                  <div className="bg-slate-900/30 rounded-lg p-3.5 border border-slate-950/50 space-y-1 text-left">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">한국어 번역 해석</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {optimizedData.koreanTranslation}
                    </p>
                  </div>

                  {/* Enhancements */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">보강된 수식어구</span>
                    <div className="flex flex-wrap gap-1">
                      {optimizedData.enhancements.map((tag, i) => (
                        <span 
                          key={i} 
                          className="text-[10px] bg-violet-950/20 border border-violet-900/30 px-2.5 py-1 rounded text-violet-400 font-medium"
                        >
                          ✦ {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Negative Prompt */}
                  <div className="border-t border-slate-900/80 pt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] font-bold text-rose-400 bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-900/40 shrink-0">NEGATIVE</span>
                      <span className="text-[10px] text-slate-500 truncate font-mono select-all" title={optimizedData.negativePrompt}>
                        {optimizedData.negativePrompt}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(optimizedData.negativePrompt, "negative")}
                      className="text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded p-1 text-slate-400 hover:text-slate-100 transition-all active:scale-95 shrink-0 cursor-pointer"
                      title="부정 프롬프트 복사"
                    >
                      {copiedText === "negative" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Camera and Lighting details */}
                  <div className="border-t border-slate-900/80 pt-3 text-[11px] text-slate-400 space-y-1.5 text-left">
                    <div className="flex items-start gap-1">
                      <span className="text-indigo-400 font-bold uppercase tracking-wider text-[9px] mt-0.5 shrink-0">Composition:</span>
                      <span className="leading-relaxed text-slate-300">{optimizedData.compositionNotes}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-amber-400 font-bold uppercase tracking-wider text-[9px] mt-0.5 shrink-0">Lighting:</span>
                      <span className="leading-relaxed text-slate-300">{optimizedData.lightingNotes}</span>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right Side: Large Prominent Image Canvas Panel (col-span-7) */}
          <section className="lg:col-span-7 bg-slate-900/30 border border-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col min-h-[650px] justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-200 text-sm">실시간 AI 이미지 캔버스</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Unlimited Free High-Quality Image Generator</p>
                </div>
              </div>
              {optimizedData && (
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/30 px-2.5 py-0.5 rounded-full">
                  {selectedRatio} 비율 설정
                </span>
              )}
            </div>

            {/* Dynamic Stage Canvas Area */}
            <div className="flex-1 my-5 bg-slate-950/60 rounded-xl border border-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden min-h-[420px]">
              
              {/* Case 1: Prompt optimization standby (initial state) */}
              {!isOptimizing && !optimizedData && (
                <div className="text-center max-w-sm space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400">
                    <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-200 text-sm">AI 이미지 생성 대기 중</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      왼쪽에서 아이디어를 작성하고 <b>&quot;완벽한 프롬프트로 완성하기&quot;</b> 버튼을 누르면,
                      이곳에 환상적인 실제 AI 그림이 즉시 무료로 생성됩니다!
                    </p>
                  </div>
                  
                  {/* Guide tip */}
                  <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-900 text-left text-[11px] text-slate-500 space-y-1.5">
                    <p className="text-indigo-400 font-semibold flex items-center gap-1 text-[10px]">
                      <Info className="w-3 h-3" /> 이 앱의 특징:
                    </p>
                    <p>• <b>100% 무제한 무료:</b> 사용 한도 없이 나만의 아이디어를 무제한으로 마음껏 그릴 수 있습니다.</p>
                    <p>• <b>실시간 렌더링:</b> 대기 시간이 현저히 짧고 고품질 실사/애니 등 8대 테마를 완벽 반영합니다.</p>
                  </div>
                </div>
              )}

              {/* Case 2: Prompt optimization in progress */}
              {isOptimizing && (
                <div className="text-center space-y-5">
                  <div className="relative mx-auto w-16 h-16">
                    <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-400 animate-spin"></div>
                    <Sparkles className="w-5 h-5 text-violet-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <h5 className="font-bold text-xs text-slate-300">최적의 수식어 공식 배합 중...</h5>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      {optimizeStepsText[optimizeStep]}
                    </p>
                  </div>
                </div>
              )}

              {/* Case 3: Prompt is optimized but currently generating image */}
              {optimizedData && isGeneratingImage && (
                <div className="text-center space-y-5">
                  <div className="relative mx-auto w-16 h-16">
                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                    <ImageIcon className="w-5 h-5 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <h5 className="font-bold text-xs text-slate-300">무료 AI 고성능 브러시 작동 중...</h5>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      작성된 수식어를 바탕으로 화려한 이미지를 그리고 있습니다. 대략 3초 정도 소요됩니다.
                    </p>
                  </div>
                </div>
              )}

              {/* Case 4: Image creation succeeded */}
              {optimizedData && generatedImageUrl && !isGeneratingImage && (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                  <div className="relative rounded-lg border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl max-w-full max-h-[460px] flex items-center justify-center">
                    <img 
                      src={generatedImageUrl} 
                      alt="Generated AI Preview" 
                      className="max-h-[400px] object-contain transition-all duration-500 hover:scale-[1.01]"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Badge */}
                    <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase text-slate-200 flex items-center gap-1.5">
                      <span>{selectedRatio}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-violet-400">{currentStylePreset.engName}</span>
                    </div>
                  </div>

                  {/* Action Group */}
                  <div className="flex items-center gap-2.5">
                    <a 
                      href={generatedImageUrl} 
                      download={`prompt_wizard_${Date.now()}.jpg`}
                      className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95 font-semibold"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>이미지 다운로드</span>
                    </a>
                    <button
                      onClick={() => handleGenerateImage(optimizedData.optimizedPrompt)}
                      className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95 font-semibold cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-violet-400" />
                      <span>다른 연출로 다시 그리기</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Case 5: Image generation error */}
              {optimizedData && imageError && !isGeneratingImage && (
                <div className="max-w-md w-full bg-rose-950/10 border border-rose-900/30 rounded-xl p-5 space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-400 mt-0.5">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-rose-300">이미지 생성 일시적 제한 안내</h5>
                      <p className="text-[11px] text-rose-400/80 leading-relaxed">
                        {imageError}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-rose-900/20 pt-4 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      대체 해결책 및 대안 활용 가이드:
                    </span>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      무료 이미지 서버의 트래픽 과부하 등의 이유일 수 있습니다. 아래 <b>수동 그리기</b>를 눌러 재시도하시거나, 왼쪽 완성된 고품질 프롬프트를 복사하여 외부 무료 서비스에 붙여넣으셔도 훌륭한 결과물이 나옵니다.
                    </p>
                    
                    <div className="flex gap-2 pt-1.5">
                      <button
                        onClick={() => handleGenerateImage(optimizedData.optimizedPrompt)}
                        className="flex-1 py-2 bg-cyan-950/30 border border-cyan-900/60 hover:bg-cyan-900/40 text-cyan-400 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>다시 그리기 시도</span>
                      </button>
                      <button
                        onClick={() => handleCopy(optimizedData.optimizedPrompt, "optimized-again")}
                        className="flex-1 py-2 bg-indigo-950/30 border border-indigo-900/60 hover:bg-indigo-900/40 text-indigo-400 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedText === "optimized-again" ? "복사 성공!" : "영문 프롬프트 복사"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Case 6: Fallback trigger button if state gets idle */}
              {optimizedData && !generatedImageUrl && !isGeneratingImage && !imageError && (
                <div className="text-center max-w-sm space-y-4">
                  <div className="mx-auto w-10 h-10 rounded-full bg-cyan-950/40 border border-cyan-900/50 flex items-center justify-center text-cyan-400">
                    <ImageIcon className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-slate-300">정제된 프롬프트로 이미지 생성</h5>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      이미지가 자동으로 그려지지 않았거나 다시 시도하고 싶으시면 버튼을 눌러주세요.
                    </p>
                  </div>
                  <button
                    onClick={() => handleGenerateImage(optimizedData.optimizedPrompt)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 mx-auto active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>이미지 무료 그리기</span>
                  </button>
                </div>
              )}

            </div>

            {/* Bottom info banner */}
            <div className="text-center text-[10px] text-slate-500 border-t border-slate-900/50 pt-3 font-mono">
              <span>Canvas Renderer: Pollinations Super AI-Engine • No API key restrictions</span>
            </div>
          </section>

        </div>
      </main>

      {/* Footer bar */}
      <footer className="mt-16 border-t border-slate-900 py-8 px-6 text-center text-slate-600 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Prompt Wizard. Powered by Gemini Pro Prompt Engine.</p>
          <div className="flex items-center gap-3">
            <span className="bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-slate-500 uppercase">React 19</span>
            <span className="bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-slate-500 uppercase">Express & tsx</span>
            <span className="bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-slate-500 uppercase">Tailwind v4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
