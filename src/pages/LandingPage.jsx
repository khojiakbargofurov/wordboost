import { Link } from 'react-router-dom';
import { BookOpen, Brain, Zap, Trophy, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';
import Button from '../components/Button';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing">

      {/* ── Navigation ─────────────────────────────────────── */}
      <header className="lp-nav-wrapper">
        <nav className="lp-nav">
          <div className="landing-logo">
            <div className="logo-icon">W</div>
            <span className="logo-text">WordBoost</span>
          </div>
          <div className="landing-auth">
            <Link to="/login">
              <Button variant="ghost">Kirish</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Boshlash</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="hero">
        {/* Ambient glow blobs */}
        <div className="glow glow-1" />
        <div className="glow glow-2" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            62,000+ so'z · A1 dan C1 gacha
          </div>

          <h1 className="hero-title">
            Nemis tilini{' '}
            <span className="text-gradient">Yangi Bosqichda</span>{' '}
            O'rganing
          </h1>

          <p className="hero-sub">
            WordBoost sun'iy intellekt va &ldquo;Spaced Repetition&rdquo; usulini birlashtirib,
            so'zlarni xotirangizga muhrlaydi. Kuniga 50 ta so'z — oddiy, samarali, qiziqarli.
          </p>

          <div className="hero-cta">
            <Link to="/register">
              <Button variant="primary" size="lg" icon={ArrowRight}>
                Bepul Boshlash
              </Button>
            </Link>
            <Link to="/login">
              <button className="cta-ghost">Kirish &rarr;</button>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">62,000+</span>
              <span className="stat-label">Nemis so'zlari</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">A1 – C1</span>
              <span className="stat-label">CEFR darajalari</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">3×</span>
              <span className="stat-label">Tezroq natija</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="features-section">
        <p className="section-eyebrow">Nima uchun WordBoost?</p>
        <h2 className="section-heading">Til o'rganishni to'g'ri qiling</h2>

        <div className="features-grid">
          <div className="feat-card">
            <div className="feat-icon blue"><Brain size={22} /></div>
            <h3>Intellektual Takrorlash</h3>
            <p>AI algoritm aynan siz unitayotgan so'zlarni aniqlaydi va vaqtida eslatib turadi.</p>
          </div>

          <div className="feat-card">
            <div className="feat-icon violet"><Zap size={22} /></div>
            <h3>Qiziqarli Testlar</h3>
            <p>Ko'p tanlovli, bo'shliq to'ldirish va moslashtirish testlari orqali bilimingizni mustahkamlang.</p>
          </div>

          <div className="feat-card">
            <div className="feat-icon green"><BookOpen size={22} /></div>
            <h3>Boy Lug'at Baza</h3>
            <p>Har so'z artikl, ko'plik shakl, fe'l tuslanishlari va jonli misollar bilan taqdim etiladi.</p>
          </div>

          <div className="feat-card">
            <div className="feat-icon amber"><Trophy size={22} /></div>
            <h3>Reyting va Darajalar</h3>
            <p>Tajriba yig'ing, ligalarda ko'tariling, kunlik streak saqlang va do'stlar bilan musobaqalashing.</p>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="cta-banner-glow" />
        <h2>Bugun boshlamoqchimisiz?</h2>
        <p>Ro'yxatdan o'tish bepul. Hech qanday kredit karta talab qilinmaydi.</p>
        <Link to="/register">
          <Button variant="primary" size="lg" icon={ArrowRight}>
            Bepul ro'yxatdan o'ting
          </Button>
        </Link>
      </section>

      {/* ── Footer (42.uz style) ────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-logo">
            <div className="logo-icon small">W</div>
          </div>

          <nav className="lp-footer-nav">
            <a href="#">Xususiyatlar</a>
            <a href="#">Darajalar</a>
            <a href="#">Biz haqimizda</a>
            <a href="#">FAQ</a>
          </nav>

          <div className="lp-footer-social">
            <a href="#" aria-label="Linkedin"><Linkedin size={17} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={17} /></a>
            <a href="#" aria-label="Github"><Github size={17} /></a>
          </div>

          <div className="lp-footer-legal">
            <a href="#">Maxfiylik siyosati</a>
            <a href="#">Foydalanish shartlari</a>
          </div>

          <p className="lp-footer-copy">
            &copy; {new Date().getFullYear()} WordBoost — O'zbekistonda yasalgan ❤️
          </p>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
