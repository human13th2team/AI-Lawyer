"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 챗봇 관련 상태
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 데모 데이터 (마감일 포함)
  const demoData = {
    "timestamp": new Date().toISOString(),
    "fileName": "단기기간근로자 계약서_샘플.jpg",
    "result": {
      "document_type": "단시간근로자 근로계약서",
      "risk_score": 15,
      "deadline_date": "2027-12-31",
      "summary": "전반적으로 우수한 계약서이나, 지연 작성 등 일부 절차적 개선이 필요합니다. AI 분석을 통해 추출된 예상 마감일은 2027년 12월 31일입니다.",
      "analysis_items": [
        {
          "topic": "근로계약서 지연 작성",
          "clause": "근로개시일 대비 약 3주 후 작성됨",
          "is_unfair": true,
          "explanation": "근로기준법 제17조 위반 소지가 있습니다. 계약서는 업무 시작 전 작성이 원칙입니다.",
          "legal_base": "근로기준법 제17조",
          "negotiation_script": "사장님, 다음 계약부터는 업무 시작 첫날에 작성을 부탁드립니다!"
        }
      ]
    }
  };

  const handleDemo = () => {
    setLoading(true);
    setTimeout(() => {
      setResult(demoData);
      setLoading(false);
      setMessages([{ role: "ai", content: "안녕하세요 대표님, 계약서 분석이 완료되었습니다. 추출된 마감일 정보를 확인하신 후 궁금한 점은 질문해 주세요." }]);
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setMessages([...messages, { role: "user", content: userInput }]);
    setUserInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", content: "현재 데모 모드입니다. 분석 결과를 바탕으로 답변을 준비 중입니다." }]);
    }, 800);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    // 실제 API 호출 시뮬레이션
    setTimeout(handleDemo, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-[#2d3748] relative">
      {/* Navigation (Original Design) */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2c1a4c] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">L</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#2c1a4c]">AI-Lawyer</span>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex gap-6 text-sm font-medium text-[#4a5568]">
            <a href="/" className="text-[#2c1a4c] font-bold">분석하기</a>
            <a href="/dashboard" className="hover:text-[#2c1a4c]">대시보드</a>
            <a href="#" className="hover:text-[#2c1a4c]">분석 가이드</a>
            <a href="#" className="hover:text-[#2c1a4c]">문의하기</a>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#2c1a4c] mb-4 tracking-tight">스마트 계약서 정밀 분석</h1>
          <p className="text-lg text-[#718096]">AI가 계약서 내용을 꼼꼼히 읽고, 마감일과 리스크를 즉시 찾아냅니다.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#e2e8f0]">
          <div className="border-2 border-dashed border-[#cbd5e0] rounded-xl p-12 text-center">
            <p className="text-lg font-semibold text-[#2d3748] mb-4">분석할 파일을 선택해주세요</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleDemo} className="px-10 py-4 bg-[#2c1a4c] text-white rounded-xl font-bold hover:bg-[#3d2666] shadow-lg transition-all">
                {loading ? "AI 분석 중..." : "데모 분석 시작하기"}
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-400">파일을 업로드하면 실시간 리포트가 생성됩니다.</p>
          </div>
        </div>

        {result && (
          <div className="mt-12 space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#e2e8f0]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#2c1a4c]">{result.result.document_type} 분석 리포트</h2>
                <div className="flex flex-col items-end gap-1">
                  <div className="px-4 py-1.5 bg-[#f3f0ff] text-[#2c1a4c] rounded-full font-bold text-sm">안전 점수: {100 - result.result.risk_score}점</div>
                  <span className="text-xs text-rose-500 font-bold">예상 마감일: {result.result.deadline_date || "미추출"}</span>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500 mb-8">
                <p className="text-sm text-blue-800 font-bold mb-1">ℹ️ 실시간 분석 안내</p>
                <p className="text-xs text-blue-700">추출된 마감일 정보는 현재 리포트에만 표시되며 별도로 알림이 예약되지 않습니다.</p>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">{result.result.summary}</p>

              <div className="space-y-6">
                {result.result.analysis_items.map((item: any, idx: number) => (
                  <div key={idx} className="p-6 border border-[#e2e8f0] rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`w-2 h-2 rounded-full ${item.is_unfair ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                      <h4 className="font-bold text-lg">{item.topic}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-400 uppercase">분석 조항</p>
                        <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded-lg">"{item.clause}"</p>
                        <p className="text-sm text-gray-600">{item.explanation}</p>
                        <p className="text-xs font-bold text-[#2c1a4c]">⚖️ 근거: {item.legal_base}</p>
                      </div>
                      <div className="bg-[#f0fdf4] p-5 rounded-xl border border-[#dcfce7]">
                        <p className="text-sm font-bold text-[#166534] mb-2 flex items-center gap-1">
                          💬 권장 협상 스크립트
                        </p>
                        <p className="text-sm text-[#166534] italic">"{item.negotiation_script}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Chatbot */}
      {result && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
          {chatOpen && (
            <div className="w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="bg-[#2c1a4c] p-4 text-white flex justify-between items-center">
                <span className="font-bold text-sm">AI 법률 상담사</span>
                <button onClick={() => setChatOpen(false)}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fc]">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-[#2c1a4c] text-white rounded-tr-none' : 'bg-white text-gray-800 border border-[#e2e8f0] rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
                <input 
                  type="text" 
                  value={userInput} 
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="질문을 입력하세요..." 
                  className="flex-1 text-sm outline-none border-b focus:border-[#2c1a4c] py-1"
                />
                <button type="submit" className="text-[#2c1a4c]"><svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
              </form>
            </div>
          )}
          <button onClick={() => setChatOpen(!chatOpen)} className="w-14 h-14 bg-[#2c1a4c] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
