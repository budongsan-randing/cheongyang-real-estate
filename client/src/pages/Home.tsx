/**
 * Style reminder — 산자락의 여백: 청양의 장소성을 먼저 보여 주는 컨템퍼러리 코리안 에디토리얼.
 * 미색 바탕·먹빛 본문·솔잎녹색 행동 강조·비대칭 필드 노트 구성을 유지한다.
 */
import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowDownRight, ArrowRight, CheckCircle2, ChevronRight, FilePenLine, MapPin, MessageCircle, Phone, Sprout, Trees } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { defaultSiteContent, type PropertyKind } from "@/lib/site-content";
import "@/brand-enhancements.css";
import "@/layout-guard.css";

const filters: Array<"전체" | PropertyKind> = ["전체", "토지", "전원주택", "농지"];
const cheongyangAreas = ["청양읍 · 시내", "운곡면", "대치면", "정산면", "목면", "청남면", "장평면", "남양면", "비봉면", "화성면"];
const InquirySuccessModal = lazy(() => import("./InquirySuccessModal"));

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<"전체" | PropertyKind>("전체");
  const [form, setForm] = useState({ name: "", contact: "", interest: "토지", message: "" });
  const [isInquirySuccessOpen, setIsInquirySuccessOpen] = useState(false);
  const contentQuery = trpc.content.get.useQuery();
  const submitInquiry = trpc.inquiry.submit.useMutation({
    onSuccess: () => {
      setForm({ name: "", contact: "", interest: "토지", message: "" });
      setIsInquirySuccessOpen(true);
    },
    onError: () => toast.error("문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요."),
  });
  const content = contentQuery.data ?? defaultSiteContent;
  const visibleProperties = useMemo(
    () => activeFilter === "전체" ? content.properties : content.properties.filter((property) => property.kind === activeFilter),
    [activeFilter, content.properties],
  );
  const phoneHref = `tel:${content.phone.replace(/[^0-9+]/g, "")}`;
  const isDefaultHeroTitle = content.heroTitle === defaultSiteContent.heroTitle;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) {
      toast.error("성함과 연락처를 먼저 남겨 주세요.");
      return;
    }
    submitInquiry.mutate({ ...form, message: form.message.trim() || undefined });
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <a href="#top" className="brand" aria-label="청양 부동산 홈"><img src="/manus-storage/cheongyang-logo-mark_0d5e9394.png" alt="" /><span><strong>{content.officeName}</strong><small>CHEONGYANG FIELD ESTATE</small></span></a>
        <nav className="main-nav" aria-label="주요 메뉴"><a href="#properties">매물 보기</a><a href="#journal">청양 노트</a><Link href="/manage">유지보수</Link></nav>
        <a className="nav-call" href={phoneHref}><Phone size={15} /> 전화 상담</a>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-image" aria-hidden="true"><img src={content.heroImageUrl || "/manus-storage/cheongyang-hero-ridge_a94ba82e.jpg"} alt="" fetchPriority="high" decoding="async" /></div>
          <div className="hero-rail"><span>01</span><span>FIELD NOTE</span><i /></div>
          <div className="hero-copy">
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1 className={isDefaultHeroTitle ? "hero-calligraphy" : undefined}>{isDefaultHeroTitle ? <img src="/manus-storage/cheongyang-hero-calligraphy-clean_3b805a66.png" alt={content.heroTitle} decoding="async" /> : content.heroTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
            <p className="hero-description">{content.heroDescription}</p>
            <div className="hero-actions"><a href="#properties" className="primary-button">대표 매물 살펴보기 <ArrowDownRight size={18} /></a><a href="#inquiry" className="text-link">조건부터 남기기 <ArrowRight size={16} /></a></div>
          </div>
          <aside className="hero-note"><span>LOCAL DESK</span><p>청양읍 시내부터 산자락까지, 생활권을 알고 현장에서 다시 확인하는 중개.</p><div><Trees size={17} /><small>토지 · 전원주택 · 농지</small></div></aside>
        </section>

        <section className="area-section" aria-label="청양 지역 안내">
          <div className="section-side-title"><span>AREA NOTE</span><strong>청양을<br />읽는 법</strong></div>
          <div className="area-intro"><span className="dot-number">02</span><p>원하는 매물의 조건은 평수만으로 정해지지 않습니다. 청양읍 시내 생활권부터 산자락의 토지까지, 도로·경사·생활 동선과 계절의 표정을 함께 살핍니다.</p></div>
          <div className="area-pills">{cheongyangAreas.map((area) => <button type="button" key={area} aria-label={`${area} 지역 안내`}>{area} <ChevronRight size={15} /></button>)}</div>
        </section>

        <section id="properties" className="property-section">
          <div className="section-heading"><div><p className="eyebrow">FEATURED FIELD NOTES</p><h2>이번 주, 현장에서<br />다시 보는 조건들</h2></div><p>상담 전, 매물의 위치·방향·생활 조건을<br />천천히 살펴볼 수 있도록 정리했습니다.</p></div>
          <div className="property-tools"><div className="filter-pills">{filters.map((filter) => <button key={filter} className={activeFilter === filter ? "is-selected" : ""} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div><a href="#inquiry">찾는 조건 직접 남기기 <ArrowRight size={15} /></a></div>
          <div className="property-grid">
            {visibleProperties.map((property, index) => (
              <article className={`property-card property-${property.tint} ${!property.imageUrl ? "is-data-card" : ""}`} key={`${property.title}-${index}`}>
                {property.imageUrl ? <div className="property-image"><img src={property.imageUrl} alt={`${property.title} 매물 사진`} loading="lazy" decoding="async" /><span>FIELD LISTING</span></div> : <div className="data-card-art"><Sprout size={52} strokeWidth={1} /><span>FIELD<br />CHECK</span></div>}
                <div className="property-body"><div className="property-meta"><span>{property.kind}</span><span><MapPin size={13} /> {property.location}</span></div><h3>{property.title}</h3><p>{property.detail}</p><div className="property-field-note"><span>OBS. 0{index + 1}</span><span>방향 확인</span><span>진입 검토</span></div><div className="property-spec"><span>{property.size}</span><strong>{property.price}</strong></div><a href="#inquiry" className="property-link">이 매물 조건 문의 <ArrowRight size={15} /></a></div>
                <b className="property-index">0{index + 1}</b>
              </article>
            ))}
          </div>
        </section>

        <section className="approach-section">
          <div className="approach-copy"><p className="eyebrow">THE WAY WE LOOK</p><h2>매물 설명보다<br />먼저, 현장을 봅니다.</h2><p>사진으로 충분하지 않은 부분을 대신 확인합니다. 진입로의 폭, 볕이 드는 시간, 마을과의 거리, 그리고 실제 생활의 가능성까지 질문합니다.</p><a href="#inquiry" className="outline-button">답사 상담 남기기 <ArrowRight size={16} /></a></div>
          <div className="approach-steps"><div><span>01</span><h3>조건 듣기</h3><p>예산보다 먼저, 어떤 하루를 바라는지 듣습니다.</p></div><div><span>02</span><h3>현장 확인</h3><p>주소와 사진으로 보이지 않는 조건을 함께 봅니다.</p></div><div><span>03</span><h3>다음 결정</h3><p>확인한 사실을 바탕으로 천천히 선택합니다.</p></div></div>
        </section>

        <section id="journal" className="journal-section">
          <div className="journal-heading"><div><p className="eyebrow">CHEONGYANG JOURNAL</p><h2>청양을 알고<br />고르는 일</h2></div><Link href="/manage" className="journal-manage"><FilePenLine size={17} /><span>글처럼 바꾸는<br />유지보수 화면</span><ArrowRight size={16} /></Link></div>
          <div className="journal-grid">{content.journal.map((entry, index) => <article className={`journal-card journal-card-${index + 1}`} key={`${entry.title}-${index}`}><div className="journal-card-top"><span>{entry.category}</span><span>FIELD {String(index + 1).padStart(2, "0")}</span></div><h3>{entry.title}</h3><p>{entry.excerpt}</p><div><span>{entry.dateLabel} · {entry.readTime}</span><a href="#inquiry" aria-label={`${entry.title} 관련 상담`}>읽어보기 <ArrowRight size={15} /></a></div></article>)}</div>
        </section>

        <section id="inquiry" className="inquiry-section">
          <div className="inquiry-rail"><span>04</span><i /></div>
          <div className="inquiry-intro"><p className="eyebrow">LET'S START WITH A NOTE</p><h2>현장 확인이 필요한<br />매물이라면, 먼저<br />조건을 남겨 주세요.</h2><p>전화가 편하다면 바로 연결하고, 글로 남기고 싶다면 간단한 조건만 보내 주세요.</p><div className="inquiry-call"><span>전화 상담</span><a href={phoneHref}>{content.phone}<Phone size={18} /></a></div></div>
          <form className="inquiry-form" onSubmit={handleSubmit}>
            <div className="form-label"><MessageCircle size={18} /><span>QUICK INQUIRY</span></div>
            <label>성함<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="성함을 입력해 주세요" /></label>
            <label>연락처<input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="연락 가능한 번호" inputMode="tel" /></label>
            <label>관심 유형<select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })}><option>토지</option><option>전원주택</option><option>농지</option><option>기타 상담</option></select></label>
            <label>남기고 싶은 조건 <span>(선택)</span><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="예산, 원하는 면적, 방문 가능일 등을 적어 주세요." rows={4} /></label>
            <button type="submit" className="submit-button" disabled={submitInquiry.isPending}>{submitInquiry.isPending ? "접수 중입니다" : "상담 조건 접수하기"} <ArrowRight size={17} /></button><small><CheckCircle2 size={14} /> 입력한 정보는 상담 확인 용도로만 사용됩니다.</small>
          </form>
        </section>
      </main>
      <footer className="site-footer"><div className="footer-brand"><img src="/manus-storage/cheongyang-logo-mark_0d5e9394.png" alt="" /><span>{content.officeName}<small>CHEONGYANG FIELD ESTATE</small></span></div><p>사업자 정보와 소재지, 실제 대표번호는 개설 전 필수로 입력해 주세요.</p><div><Link href="/manage">유지보수</Link><a href="#top">맨 위로 <ArrowDownRight size={15} /></a></div></footer>
      <div className="mobile-action-bar"><a href={phoneHref}><Phone size={16} /> 전화 상담</a><a href="#inquiry"><MessageCircle size={16} /> 조건 남기기</a></div>
      {isInquirySuccessOpen && <Suspense fallback={null}><InquirySuccessModal onClose={() => setIsInquirySuccessOpen(false)} /></Suspense>}
    </div>
  );
}
