/**
 * Style reminder — 산자락의 여백: 차분한 현장 기록을 닮은 에디토리얼 운영 화면.
 * 솔잎녹색의 행동 강조, 미색 바탕, 문서 같은 정보 위계를 유지한다.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, FilePenLine, ImagePlus, MapPin, Save, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { CONTENT_STORAGE_KEY, defaultContent, type SiteContent } from "@/data/content";

const loadDraft = (): SiteContent => {
  try {
    const saved = window.localStorage.getItem(CONTENT_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as SiteContent) : defaultContent;
  } catch {
    return defaultContent;
  }
};

export default function Manage() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [activeTab, setActiveTab] = useState<"site" | "journal" | "listings">("site");

  useEffect(() => {
    setContent(loadDraft());
  }, []);

  const update = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setContent((current) => ({ ...current, [key]: value }));
  };

  const savePreview = () => {
    window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
    toast.success("이 브라우저에 운영 미리보기를 저장했습니다.");
  };

  const resetPreview = () => {
    window.localStorage.removeItem(CONTENT_STORAGE_KEY);
    setContent(defaultContent);
    toast.message("기본 디자인 콘텐츠로 되돌렸습니다.");
  };

  return (
    <main className="manage-shell">
      <aside className="manage-sidebar">
        <Link href="/" className="manage-back"><ArrowLeft size={15} /> 사이트 보기</Link>
        <div className="manage-brand">
          <img src="/manus-storage/cheongyang-logo-mark_0d5e9394.png" alt="청양 부동산 심벌" />
          <div><span>CONTENT DESK</span><strong>청양 부동산</strong></div>
        </div>
        <nav className="manage-nav" aria-label="운영 메뉴">
          <button className={activeTab === "site" ? "is-active" : ""} onClick={() => setActiveTab("site")}><Settings2 size={17} /> 기본 정보</button>
          <button className={activeTab === "listings" ? "is-active" : ""} onClick={() => setActiveTab("listings")}><MapPin size={17} /> 대표 매물</button>
          <button className={activeTab === "journal" ? "is-active" : ""} onClick={() => setActiveTab("journal")}><FilePenLine size={17} /> 답사 노트</button>
        </nav>
        <div className="manage-guide"><span>DESIGN PREVIEW</span><p>지금은 디자인 검토용 브라우저 저장 방식입니다. 실제 운영 시에는 GitHub 기반 CMS 또는 관리 페이지로 연결할 수 있습니다.</p></div>
      </aside>

      <section className="manage-main">
        <header className="manage-header">
          <div><span className="eyebrow">EDITORIAL OPERATIONS</span><h1>{activeTab === "site" ? "기본 정보" : activeTab === "listings" ? "대표 매물" : "답사 노트"}</h1></div>
          <div className="manage-actions"><button className="text-button" onClick={resetPreview}>되돌리기</button><button className="save-button" onClick={savePreview}><Save size={16} /> 미리보기 저장</button></div>
        </header>

        {activeTab === "site" && (
          <div className="editor-grid">
            <section className="editor-panel">
              <div className="panel-title"><span>01</span><h2>소개 문구</h2></div>
              <label>사무소 이름<input value={content.officeName} onChange={(e) => update("officeName", e.target.value)} /></label>
              <label>상단 작은 문구<input value={content.heroEyebrow} onChange={(e) => update("heroEyebrow", e.target.value)} /></label>
              <label>메인 제목<textarea rows={3} value={content.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} /></label>
              <label>소개 문장<textarea rows={3} value={content.heroDescription} onChange={(e) => update("heroDescription", e.target.value)} /></label>
            </section>
            <section className="editor-panel">
              <div className="panel-title"><span>02</span><h2>상담 정보</h2></div>
              <label>대표 전화<input value={content.phone} onChange={(e) => update("phone", e.target.value)} /></label>
              <div className="phone-preview"><span>상담 버튼 미리보기</span><strong>{content.phone}</strong><small>홈 화면의 모든 전화 버튼에 반영됩니다.</small></div>
              <div className="editor-tip"><Check size={17} /> 내용만 바꾸고 저장하면, 코드를 고치지 않아도 최신 문구로 검토할 수 있는 운영 경험을 목표로 합니다.</div>
            </section>
          </div>
        )}

        {activeTab === "listings" && (
          <div className="editor-list">
            {content.properties.map((property, index) => (
              <section className="listing-editor-card" key={property.id}>
                <div className="listing-order">0{index + 1}</div>
                <div className="listing-editor-fields">
                  <label>분류<input value={property.kind} onChange={(e) => update("properties", content.properties.map((item, itemIndex) => itemIndex === index ? { ...item, kind: e.target.value as typeof item.kind } : item))} /></label>
                  <label>매물 제목<input value={property.title} onChange={(e) => update("properties", content.properties.map((item, itemIndex) => itemIndex === index ? { ...item, title: e.target.value } : item))} /></label>
                  <label>위치 및 표식<input value={property.location} onChange={(e) => update("properties", content.properties.map((item, itemIndex) => itemIndex === index ? { ...item, location: e.target.value } : item))} /></label>
                  <label>핵심 설명<textarea rows={2} value={property.detail} onChange={(e) => update("properties", content.properties.map((item, itemIndex) => itemIndex === index ? { ...item, detail: e.target.value } : item))} /></label>
                </div>
                <div className="listing-image-slot">{property.image ? <img src={property.image} alt="등록 매물 이미지" /> : <><ImagePlus size={22} /><span>사진 추가</span></>}</div>
              </section>
            ))}
          </div>
        )}

        {activeTab === "journal" && (
          <div className="editor-list journal-editor-list">
            {content.journal.map((entry, index) => (
              <section className="journal-editor-card" key={entry.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <label>카테고리<input value={entry.category} onChange={(e) => update("journal", content.journal.map((item, itemIndex) => itemIndex === index ? { ...item, category: e.target.value } : item))} /></label>
                  <label>글 제목<input value={entry.title} onChange={(e) => update("journal", content.journal.map((item, itemIndex) => itemIndex === index ? { ...item, title: e.target.value } : item))} /></label>
                  <label>요약<input value={entry.excerpt} onChange={(e) => update("journal", content.journal.map((item, itemIndex) => itemIndex === index ? { ...item, excerpt: e.target.value } : item))} /></label>
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

