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
  Info
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

  // Client-side fallback for static deployments (like GitHub Pages)
  const callGeminiClientSide = async (
    rawPrompt: string,
    style: string,
    aspectRatio: string,
    extraDetails: string
  ) => {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GitHub Pages 등 정적 호스팅 환경에서는 프롬프트 최적화를 위해 VITE_GEMINI_API_KEY 설정이 필요합니다.\n\n로컬 .env 파일에 VITE_GEMINI_API_KEY를 설정하시거나, GitHub Secrets에 주입하여 빌드해 주세요."
      );
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
        const imageRes = await fetch(pollinationsUrl);
        if (!imageRes.ok) throw new Error(`이미지 서버 응답 실패 (상태 코드: ${imageRes.status})`);
        const blob = await imageRes.blob();
        imageUrlToSet = URL.createObjectURL(blob);
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
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-950/40 border border-indigo-900/50 text-indigo-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Gemini 3.5 Turbo Prompt Engine
            </span>
          </div>
        </div>
      </header>

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
