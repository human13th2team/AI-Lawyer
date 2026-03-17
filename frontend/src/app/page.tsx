"use client";

import { useState, useRef, useEffect } from "react";
import { 
  FileUp, 
  FolderUp, 
  Sparkles, 
  Monitor, 
  History, 
  Settings as SettingsIcon,
  Search,
  CheckCircle,
  Clock,
  MessageSquare,
  X,
  ChevronRight
} from "lucide-react";
import { AnalysisResultView } from "./analysis/AnalysisResultView";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<"detailed" | "simple">("detailed");
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // 챗봇 관련 상태
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 데모 데이터
  const demoData = {
    "timestamp": new Date().toISOString(),
    "fileName": "단기기간근로자 계약서_샘플.jpg",
    "result": {
      "document_type": "단시간근로자 근로계약서",
      "risk_score": 15,
      "deadline_date": "2027-12-31",
      "summary": "본 계약서는 근로기준법을 준수하며 작성되었으나, 마감일 관리 및 일부 특약 조항에서 협상의 여지가 발견되었습니다. AI가 추출한 핵심 일정을 확인해 보세요.",
      "analysis_items": [
        {
          "topic": "계약 갱신 및 마감일",
          "clause": "본 계약은 2027년 12월 31일부로 종료되며 자동 갱신되지 않는다.",
          "is_unfair": false,
          "explanation": "마감일이 명확히 명시되어 있어 기한 관리에 용이합니다. 다만, 갱신 의사가 있을 경우 1개월 전 서면 통보 절차를 추가하는 것이 안전합니다.",
          "legal_base": "민법 제660조 (기간의 약정과 해지)",
          "negotiation_script": "대표님, 계약 만료 30일 전에 상호 합의 하에 연장 여부를 검토한다는 조항을 넣는 것은 어떨까요?"
        }
      ]
    }
  };

  const handleDemo = () => {
    setLoading(true);
    setTimeout(() => {
      setResult(demoData);
      setShowResult(true);
      setLoading(false);
      
      // 알림 저장
      if (demoData.result.deadline_date) {
        const existingDocs = JSON.parse(localStorage.getItem("notifications") || "[]");
        const newNotification = {
          id: Date.now(),
          fileName: demoData.fileName,
          deadline: demoData.result.deadline_date,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem("notifications", JSON.stringify([newNotification, ...existingDocs]));
      }

      setMessages([{ role: "ai", content: `안녕하세요 대표님, ${analysisMode === "detailed" ? "정밀 상세" : "빠른 간략"} 분석이 완료되었습니다. 별도의 창으로 리포트를 띄워드렸습니다. 확인 후 궁금한 점은 언제든 말씀해 주세요!` }]);
    }, 1500);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      if (!user) {
        setShowLoginModal(true);
        return;
      }
      setFile(uploadedFile);
      setError(null);
      setMessages([{ role: "ai", content: `대표님, [${uploadedFile.name}] 파일이 준비되었습니다. 아래 분석 시작 버튼을 눌러주세요!` }]);
    }
  };

  const startAnalysis = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!file) {
      setError("먼저 파일을 첨부해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", analysisMode);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/api/analysis/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 403) {
            throw new Error("분석 권한이 없습니다. 다시 로그인해 주세요.");
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "분석 중 오류가 발생했습니다.");
      }

      const data = await response.json();
      setResult(data);
      setShowResult(true);

      // 알림 저장
      if (data.result.deadline_date) {
        const existingDocs = JSON.parse(localStorage.getItem("notifications") || "[]");
        const newNotification = {
          id: Date.now(),
          fileName: file.name,
          deadline: data.result.deadline_date,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem("notifications", JSON.stringify([newNotification, ...existingDocs]));
      }

      setMessages([{ role: "ai", content: "분석이 완료되었습니다, 대표님. 정밀 리포트를 확인해 보세요." }]);
    } catch (err: any) {
      setError(err.message);
      setMessages([{ role: "ai", content: `죄송합니다 대표님, 오류가 발생했습니다: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setMessages([...messages, { role: "user", content: userInput }]);
    setUserInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", content: "현재 분석된 내용을 바탕으로 대표님께 최적의 답변을 준비 중입니다." }]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F6F8FF] font-sans text-slate-800 selection:bg-indigo-100">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-violet-200/30 blur-[120px] rounded-full"></div>
      </div>

      <Navbar />

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] p-10 max-w-[400px] w-full shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-indigo-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[#1E1B4B]">로그인이 필요합니다</h3>
              <p className="text-slate-500 font-medium">정밀 분석 서비스는 대표님들의 <br/> 안전한 회원 정보가 꼭 필요합니다.</p>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={() => router.push("/login")}
                className="w-full py-4 bg-[#1E1B4B] text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all"
              >
                로그인하러 가기
              </button>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                나중에 하기
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto py-20 px-6 relative z-10 text-center">
        
        <div className="space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[11px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-3 h-3" /> 2024년 최신 판례 데이터 업데이트 완료
          </div>
          <h1 className="text-6xl font-black text-[#1E1B4B] tracking-tight leading-[1.1]">
            계약서 리스크를 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">단 3초 만에</span> 해결하세요
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            AI 검사가 복잡한 법률 용어를 해석하고, 숨겨진 리스크와 마감일을 <br />
            정밀하게 추출하여 완벽한 협상 가이드를 제공합니다.
          </p>
        </div>

        {/* Upload Interface */}
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Analysis Mode Selector */}
          <div className="flex justify-center">
            <div className="bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white shadow-sm inline-flex gap-2">
              <button 
                onClick={() => setAnalysisMode("detailed")}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${analysisMode === "detailed" ? "bg-[#1E1B4B] text-white shadow-lg" : "text-slate-500 hover:bg-white"}`}
              >
                <Sparkles className={`w-4 h-4 ${analysisMode === "detailed" ? "text-indigo-400" : "text-slate-400"}`} />
                정밀 상세 분석
              </button>
              <button 
                onClick={() => setAnalysisMode("simple")}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${analysisMode === "simple" ? "bg-[#1E1B4B] text-white shadow-lg" : "text-slate-500 hover:bg-white"}`}
              >
                <Monitor className={`w-4 h-4 ${analysisMode === "simple" ? "text-indigo-400" : "text-slate-400"}`} />
                빠른 간략 분석
              </button>
            </div>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(31,38,135,0.08)] p-4 border border-white relative group cursor-pointer transition-all ${file ? 'ring-4 ring-indigo-100' : ''}`}
          >
             <div className="border-2 border-dashed border-slate-100 rounded-[32px] p-20 flex flex-col items-center justify-center transition-all group-hover:border-indigo-200 group-hover:bg-slate-50/50">
               <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                 {file ? <CheckCircle className="text-green-500 w-10 h-10" /> : <FileUp className="text-indigo-600 w-10 h-10" />}
               </div>
               
               <h3 className="text-2xl font-black text-slate-800 mb-2">
                 {file ? `[${file.name}]` : "계약서 파일이나 폴더를 올려주세요"}
               </h3>
               <p className="text-slate-400 font-medium mb-10">
                 {file ? "파일이 준비되었습니다. 아래 버튼을 눌러 분석을 시작하세요." : "PDF, JPG, PNG 파일 및 디렉토리 업로드를 지원합니다."}
               </p>

               <div className="flex flex-wrap justify-center gap-4" onClick={(e) => e.stopPropagation()}>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png"
                 />
                 <button 
                   onClick={startAnalysis}
                   disabled={loading || !file}
                   className="flex items-center gap-3 px-10 py-5 bg-[#1E1B4B] text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 transition-all hover:-translate-y-1 hover:shadow-indigo-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {loading ? (
                     <span className="flex items-center gap-3">
                       <Clock className="w-6 h-6 animate-spin" /> 분석 진행 중...
                     </span>
                   ) : (
                     <span className="flex items-center gap-3">
                       <Sparkles className="w-6 h-6" /> {analysisMode === "detailed" ? "정밀 분석 시작하기" : "빠른 분석 시작하기"}
                     </span>
                   )}
                 </button>
                 
                 <button 
                  onClick={handleDemo}
                  className="flex items-center gap-3 px-10 py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-lg hover:border-indigo-100 hover:text-indigo-600 transition-all"
                 >
                   <Monitor className="w-6 h-6" /> 데모 실행
                 </button>
               </div>
             </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          {[
            { icon: Search, title: "정밀 조항 검출", desc: "독소 조항 및 불리한 조건을 AI가 즉시 감지합니다." },
            { icon: History, title: "마감일 알림", desc: "계약 종료 및 갱신일을 추출하여 스케줄을 관리합니다." },
            { icon: MessageSquare, title: "실시간 상담", desc: "분석 결과를 기반으로 최적의 협상안을 제시합니다." }
          ].map((item, i) => (
            <div key={i} className="text-left p-8 bg-white/50 rounded-3xl border border-white/50 hover:bg-white transition-all shadow-sm">
              <div className="w-12 h-12 bg-white shadow-md rounded-xl flex items-center justify-center mb-6">
                <item.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Analysis Result "Separate Window" (Modal Overlay) */}
      {showResult && result && (
        <AnalysisResultView 
          result={result} 
          onClose={() => setShowResult(false)} 
          onOpenChat={() => {
            setShowResult(false);
            setChatOpen(true);
          }}
        />
      )}

      {/* Floating Chatbot */}
      {result && (
        <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end">
          {chatOpen && (
            <div className="w-[400px] h-[600px] bg-white rounded-[32px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] border border-slate-100 flex flex-col mb-6 overflow-hidden animate-in slide-in-from-bottom-6 duration-500">
              <div className="bg-[#1E1B4B] p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-black text-sm">AI 리걸 컨설턴트</p>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Online · Hyper-personalized</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed ${msg.role === 'user' ? 'bg-[#1E1B4B] text-white rounded-tr-none shadow-lg' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 flex gap-3">
                <input 
                  type="text" 
                  value={userInput} 
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="추가로 궁금한 점이 있으신가요?" 
                  className="flex-1 text-sm outline-none border-none bg-slate-100 px-5 py-3 rounded-xl focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                />
                <button type="submit" className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
          
          <button 
            onClick={() => setChatOpen(!chatOpen)} 
            className={`w-16 h-16 rounded-[22px] shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 ${chatOpen ? 'bg-rose-500 rotate-90 shadow-rose-200' : 'bg-[#1E1B4B] shadow-indigo-200'}`}
          >
            {chatOpen ? <X className="text-white w-7 h-7" /> : <MessageSquare className="text-white w-7 h-7 fill-white/10" />}
          </button>
        </div>
      )}
    </div>
  );
}
