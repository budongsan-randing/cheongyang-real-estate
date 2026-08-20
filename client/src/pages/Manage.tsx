/**
 * Style reminder — 산자락의 여백: 현장 기록을 닮은 차분한 운영 데스크.
 * 콘텐츠 수정은 명료하게, 저장 상태와 공개 반영 행동은 즉시 알 수 있게 표현한다.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, ClipboardList, FilePenLine, ImagePlus, KeyRound, LoaderCircle, LogOut, MapPin, MessageSquareText, Plus, Save, Settings2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { defaultSiteContent, type ManagedJournal, type ManagedProperty, type ManagedSiteContent } from "@/lib/site-content";
import "@/brand-enhancements.css";

type AdminTab = "site" | "listings" | "journal" | "inquiries";

const emptyProperty: ManagedProperty = { kind: "토지", title: "새 매물 제목", location: "청양군", detail: "매물의 핵심 조건과 현장 설명을 입력해 주세요.", size: "면적 입력", price: "가격 상담", imageUrl: null, tint: "cream" };
const emptyJournal: ManagedJournal = { category: "답사 노트", title: "새 청양 노트", excerpt: "이 글의 요약을 짧고 명료하게 적어 주세요.", dateLabel: new Date().toLocaleDateString("ko-KR"), readTime: "3분 읽기" };

const readAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("파일을 읽지 못했습니다."));
  reader.onerror = () => reject(new Error("파일을 읽지 못했습니다."));
  reader.readAsDataURL(file);
});

export default function Manage() {
  const [content, setContent] = useState<ManagedSiteContent>(defaultSiteContent);
  const [activeTab, setActiveTab] = useState<AdminTab>("site");
  const [adminPin, setAdminPin] = useState("");
  const [pinDraft, setPinDraft] = useState("");
  const utils = trpc.useUtils();
  const contentQuery = trpc.content.get.useQuery();
  const isAdmin = adminPin === "1234";
  const verifyPin = trpc.content.verifyPin.useMutation({
    onSuccess: () => {
      setAdminPin(pinDraft);
      setPinDraft("");
      toast.success("유지보수 화면에 입장했습니다.");
    },
    onError: () => toast.error("관리자번호가 올바르지 않습니다."),
  });
  const inquiriesQuery = trpc.inquiry.list.useQuery({ adminPin }, { enabled: isAdmin && activeTab === "inquiries" });
  const saveContent = trpc.content.save.useMutation({
    onSuccess: (saved) => {
      setContent(saved);
      utils.content.get.setData(undefined, saved);
      toast.success("저장되었습니다. 공개 사이트에 바로 반영됩니다.");
    },
    onError: (error) => toast.error(error.message || "저장에 실패했습니다. 다시 시도해 주세요."),
  });
  const uploadImage = trpc.content.uploadImage.useMutation({
    onError: (error) => toast.error(error.message || "이미지 업로드에 실패했습니다."),
  });

  useEffect(() => {
    if (contentQuery.data) setContent(contentQuery.data);
  }, [contentQuery.data]);

  const update = <K extends keyof ManagedSiteContent>(key: K, value: ManagedSiteContent[K]) => setContent((current) => ({ ...current, [key]: value }));
  const updateProperty = <K extends keyof ManagedProperty>(index: number, key: K, value: ManagedProperty[K]) => update("properties", content.properties.map((property, propertyIndex) => propertyIndex === index ? { ...property, [key]: value } : property));
  const updateJournal = <K extends keyof ManagedJournal>(index: number, key: K, value: ManagedJournal[K]) => update("journal", content.journal.map((entry, entryIndex) => entryIndex === index ? { ...entry, [key]: value } : entry));

  const handleUpload = async (file: File | undefined, apply: (url: string) => void) => {
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|webp)$/)) {
      toast.error("PNG, JPG, WEBP 이미지만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("이미지는 5MB 이하로 올려 주세요.");
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(file);
      const result = await uploadImage.mutateAsync({ adminPin, fileName: file.name, dataUrl });
      apply(result.url);
      toast.success("이미지를 올렸습니다. 저장 버튼을 누르면 사이트에 반영됩니다.");
    } catch {
      toast.error("이미지 파일을 처리하지 못했습니다.");
    }
  };

  const save = () => saveContent.mutate({ adminPin, content });
  const enterMaintenance = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    verifyPin.mutate({ adminPin: pinDraft });
  };

  if (contentQuery.isLoading) {
    return <main className="manage-loading"><LoaderCircle className="animate-spin" size={23} /> 운영 화면을 준비하고 있습니다.</main>;
  }
  if (!isAdmin) {
    return <main className="manage-gate"><div><img src="/manus-storage/cheongyang-logo-mark_0d5e9394.png" alt="" /><span className="eyebrow">SIMPLE CONTENT DESK</span><h1>관리자번호를<br />입력해 주세요.</h1><p>매물, 사진, 글, 대표 문구를 바로 수정하려면 관리자번호를 입력하세요.</p><form className="pin-entry-form" onSubmit={enterMaintenance}><label>관리자번호<input autoFocus inputMode="numeric" type="password" value={pinDraft} onChange={(e) => setPinDraft(e.target.value)} placeholder="관리자번호 4자리" /></label><button disabled={verifyPin.isPending} className="save-button" type="submit"><KeyRound size={16} /> {verifyPin.isPending ? "확인 중" : "유지보수 페이지 열기"}</button></form><Link href="/" className="gate-back">공개 사이트로 돌아가기 <ArrowLeft size={15} /></Link></div></main>;
  }

  return (
    <main className="manage-shell">
      <aside className="manage-sidebar">
        <Link href="/" className="manage-back"><ArrowLeft size={15} /> 공개 사이트 보기</Link>
        <div className="manage-brand"><img src="/manus-storage/cheongyang-logo-mark_0d5e9394.png" alt="청양 부동산 심벌" /><div><span>LIVE CONTENT DESK</span><strong>{content.officeName}</strong></div></div>
        <nav className="manage-nav" aria-label="유지보수 메뉴">
          <button className={activeTab === "site" ? "is-active" : ""} onClick={() => setActiveTab("site")}><Settings2 size={17} /> 기본 정보</button>
          <button className={activeTab === "listings" ? "is-active" : ""} onClick={() => setActiveTab("listings")}><MapPin size={17} /> 매물 관리 <b>{content.properties.length}</b></button>
          <button className={activeTab === "journal" ? "is-active" : ""} onClick={() => setActiveTab("journal")}><FilePenLine size={17} /> 청양 노트 <b>{content.journal.length}</b></button>
          <button className={activeTab === "inquiries" ? "is-active" : ""} onClick={() => setActiveTab("inquiries")}><MessageSquareText size={17} /> 접수 문의</button>
        </nav>
        <div className="manage-guide"><span>LIVE PUBLISH</span><p>사진을 올리고 내용을 바꾼 뒤 저장하면, 데이터베이스에 기록되어 공개 사이트에서 바로 불러옵니다.</p><div><KeyRound size={14} /> 관리자번호 확인됨</div><button className="manage-logout" onClick={() => setAdminPin("")}><LogOut size={13} /> 잠금</button></div>
      </aside>

      <section className="manage-main">
        <header className="manage-header"><div><span className="eyebrow">LIVE WEBSITE MAINTENANCE</span><h1>{activeTab === "site" ? "기본 정보" : activeTab === "listings" ? "매물 관리" : activeTab === "journal" ? "청양 노트" : "접수 문의"}</h1></div>{activeTab !== "inquiries" && <div className="manage-actions"><Link href="/" className="text-button">사이트 확인</Link><button className="save-button" onClick={save} disabled={saveContent.isPending}>{saveContent.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}{saveContent.isPending ? "저장 중" : "저장하고 즉시 반영"}</button></div>}</header>

        {activeTab === "site" && <div className="editor-grid">
          <section className="editor-panel"><div className="panel-title"><span>01</span><h2>소개 문구</h2></div><label>사무소 이름<input value={content.officeName} onChange={(e) => update("officeName", e.target.value)} /></label><label>상단 작은 문구<input value={content.heroEyebrow} onChange={(e) => update("heroEyebrow", e.target.value)} /></label><label>메인 제목<textarea rows={3} value={content.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} /></label><label>소개 문장<textarea rows={3} value={content.heroDescription} onChange={(e) => update("heroDescription", e.target.value)} /></label></section>
          <section className="editor-panel"><div className="panel-title"><span>02</span><h2>대표 이미지 · 상담</h2></div><div className="admin-image-preview hero-upload-preview">{content.heroImageUrl ? <img src={content.heroImageUrl} alt="현재 메인 이미지" /> : <ImagePlus size={28} />}</div><label className="image-upload-button"><Upload size={15} /> 메인 이미지 교체<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void handleUpload(e.target.files?.[0], (url) => update("heroImageUrl", url))} /></label><label>대표 전화<input value={content.phone} onChange={(e) => update("phone", e.target.value)} /></label><div className="phone-preview"><span>홈 화면 전화 버튼</span><strong>{content.phone}</strong><small>저장 후 헤더와 상담 영역에 동시에 반영됩니다.</small></div><div className="editor-tip"><Check size={17} /> 대표 사진과 문구, 전화번호까지 이 화면에서 실제 운영 데이터로 교체할 수 있습니다.</div></section>
        </div>}

        {activeTab === "listings" && <div className="editor-list"><div className="admin-list-intro"><p>매물을 추가·수정·삭제하고 사진을 바꾼 뒤 저장하면 공개 페이지의 카드가 즉시 갱신됩니다.</p><button className="add-button" onClick={() => update("properties", [...content.properties, { ...emptyProperty }])}><Plus size={15} /> 매물 추가</button></div>{content.properties.map((property, index) => <section className="listing-editor-card admin-edit-card" key={`${property.title}-${index}`}><div className="listing-order">{String(index + 1).padStart(2, "0")}</div><div className="listing-editor-fields"><label>분류<select value={property.kind} onChange={(e) => updateProperty(index, "kind", e.target.value as ManagedProperty["kind"])}><option>토지</option><option>전원주택</option><option>농지</option></select></label><label>카드 색상<select value={property.tint} onChange={(e) => updateProperty(index, "tint", e.target.value as ManagedProperty["tint"])}><option value="cream">미색</option><option value="pine">솔잎녹색</option><option value="clay">토분색</option></select></label><label>매물 제목<input value={property.title} onChange={(e) => updateProperty(index, "title", e.target.value)} /></label><label>위치<input value={property.location} onChange={(e) => updateProperty(index, "location", e.target.value)} /></label><label>핵심 설명<textarea rows={3} value={property.detail} onChange={(e) => updateProperty(index, "detail", e.target.value)} /></label><label>면적<input value={property.size} onChange={(e) => updateProperty(index, "size", e.target.value)} /></label><label>가격 또는 상담 문구<input value={property.price} onChange={(e) => updateProperty(index, "price", e.target.value)} /></label></div><div className="listing-image-manager"><div className="admin-image-preview">{property.imageUrl ? <img src={property.imageUrl} alt="등록 매물 이미지" /> : <><ImagePlus size={23} /><span>사진 없음</span></>}</div><label className="image-upload-button"><Upload size={14} /> 사진 교체<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void handleUpload(e.target.files?.[0], (url) => updateProperty(index, "imageUrl", url))} /></label><button className="delete-button" onClick={() => content.properties.length > 1 ? update("properties", content.properties.filter((_, propertyIndex) => propertyIndex !== index)) : toast.error("매물은 최소 한 개가 필요합니다.")}><Trash2 size={14} /> 삭제</button></div></section>)}</div>}

        {activeTab === "journal" && <div className="editor-list journal-editor-list"><div className="admin-list-intro journal-intro"><p>지역 정보와 답사 노트를 블로그 글처럼 관리합니다. 제목과 요약을 바꾸면 홈 화면의 노트 카드에 표시됩니다.</p><button className="add-button" onClick={() => update("journal", [...content.journal, { ...emptyJournal }])}><Plus size={15} /> 노트 추가</button></div>{content.journal.map((entry, index) => <section className="journal-editor-card admin-edit-card" key={`${entry.title}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><label>카테고리<input value={entry.category} onChange={(e) => updateJournal(index, "category", e.target.value)} /></label><label>글 제목<input value={entry.title} onChange={(e) => updateJournal(index, "title", e.target.value)} /></label><label>요약<textarea rows={3} value={entry.excerpt} onChange={(e) => updateJournal(index, "excerpt", e.target.value)} /></label><div className="journal-meta-fields"><label>날짜<input value={entry.dateLabel} onChange={(e) => updateJournal(index, "dateLabel", e.target.value)} /></label><label>읽기 시간<input value={entry.readTime} onChange={(e) => updateJournal(index, "readTime", e.target.value)} /></label></div><button className="delete-button" onClick={() => content.journal.length > 1 ? update("journal", content.journal.filter((_, entryIndex) => entryIndex !== index)) : toast.error("노트는 최소 한 개가 필요합니다.")}><Trash2 size={14} /> 이 노트 삭제</button></div></section>)}</div>}

        {activeTab === "inquiries" && <section className="inquiry-admin-panel"><div className="inquiry-admin-intro"><ClipboardList size={22} /><div><h2>홈페이지에서 접수된 문의</h2><p>새 문의는 이 목록에서 확인할 수 있습니다. 실제 고객 응대 기록은 개인정보 보호 정책에 따라 관리해 주세요.</p></div></div>{inquiriesQuery.isLoading ? <div className="manage-loading"><LoaderCircle className="animate-spin" size={20} /> 문의를 불러오는 중입니다.</div> : inquiriesQuery.data?.length ? <div className="inquiry-table">{inquiriesQuery.data.map((inquiry) => <article key={inquiry.id}><div><strong>{inquiry.name}</strong><span>{new Date(inquiry.createdAt).toLocaleString("ko-KR")}</span></div><dl><div><dt>연락처</dt><dd>{inquiry.contact}</dd></div><div><dt>관심 유형</dt><dd>{inquiry.interest}</dd></div><div><dt>조건</dt><dd>{inquiry.message || "추가 메시지 없음"}</dd></div></dl></article>)}</div> : <div className="empty-inquiries"><MessageSquareText size={24} /><p>아직 접수된 문의가 없습니다.</p></div>}</section>}
      </section>
    </main>
  );
}
