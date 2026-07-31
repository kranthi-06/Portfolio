"use client";

import { useEffect, useState } from "react";
import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  Code2,
  Download,
  ExternalLink,
  Github,
  Layers3,
  Linkedin,
  Mail,
  Menu,
  Moon,
  Send,
  Sparkles,
  Sun,
  X,
  Zap,
} from "lucide-react";

const links = {
  email: "kasakk2006@gmail.com",
  github: "https://github.com/kranthi-06",
  linkedin: "https://www.linkedin.com/in/kasakranthikiran06/",
  lakshyaTrack: "https://lakshyatrack.vercel.app/",
  srecCommunity: "https://srec-community.vercel.app/",
};

const projects = [
  {
    number: "01",
    name: "LakshyaTrack",
    label: "Featured product",
    description:
      "A live project focused on making goals feel clearer, calmer, and easier to return to.",
    detail: "Live product · Explore the experience",
    url: links.lakshyaTrack,
    tone: "plum",
  },
  {
    number: "02",
    name: "SREC Community",
    label: "Featured product",
    description:
      "A community-focused web experience built for the SREC ecosystem.",
    detail: "Live product · Explore the experience",
    url: links.srecCommunity,
    tone: "blue",
  },
] as const;

const skillSets = {
  "AI systems": ["Python", "LangChain", "PyTorch", "OpenCV", "RAG", "TensorFlow"],
  "Product web": ["Next.js", "React", "TypeScript", "Tailwind", "Framer Motion", "Figma"],
  Backend: ["Node.js", "FastAPI", "PostgreSQL", "MongoDB", "Docker", "AWS"],
} as const;

const marqueeSkills = Object.values(skillSets).flat();
const themes = ["pearl", "midnight", "aurora"] as const;
type Theme = (typeof themes)[number];

function Logo() {
  return (
    <a href="#top" className="brand" aria-label="Kasa Kranthi Kiran home">
      <i>kk</i>
      <span>Kasa Kranthi Kiran</span>
    </a>
  );
}

function resumeRequestUrl() {
  const subject = encodeURIComponent("Resume request — Kasa Kranthi Kiran");
  const body = encodeURIComponent("Hi Kasa Kranthi Kiran,\n\nI'd like to request your resume.\n\nThanks,");
  return `mailto:${links.email}?subject=${subject}&body=${body}`;
}

export default function Home() {
  const [theme, setTheme] = useState<Theme>("pearl");
  const [menu, setMenu] = useState(false);
  const [skill, setSkill] = useState<keyof typeof skillSets>("AI systems");
  const [submitted, setSubmitted] = useState(false);
  const [typedWord, setTypedWord] = useState("useful.");

  useEffect(() => {
    const saved = localStorage.getItem("kk-theme");
    if (themes.includes(saved as Theme)) setTheme(saved as Theme);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = document.querySelectorAll<HTMLElement>("[data-reveal]");

    if (reducedMotion) {
      revealItems.forEach((item) => item.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = ["useful.", "human.", "practical."];
    let wordIndex = 0;
    let characterIndex = words[0].length;
    let deleting = true;
    let timeout: number;

    const tick = () => {
      const word = words[wordIndex];
      characterIndex += deleting ? -1 : 1;
      setTypedWord(word.slice(0, characterIndex));

      if (deleting && characterIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        timeout = window.setTimeout(tick, 210);
        return;
      }

      if (!deleting && characterIndex === word.length) {
        deleting = true;
        timeout = window.setTimeout(tick, 1600);
        return;
      }

      timeout = window.setTimeout(tick, deleting ? 55 : 90);
    };

    timeout = window.setTimeout(tick, 1500);
    return () => window.clearTimeout(timeout);
  }, []);

  const changeTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    localStorage.setItem("kk-theme", nextTheme);
  };

  const handleHeroPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    event.currentTarget.style.setProperty("--pointer-x", x.toFixed(3));
    event.currentTarget.style.setProperty("--pointer-y", y.toFixed(3));
  };

  const resetHeroPointer = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--pointer-x", "0");
    event.currentTarget.style.setProperty("--pointer-y", "0");
  };

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const name = String(values.get("name") ?? "").trim();
    const email = String(values.get("email") ?? "").trim();
    const message = String(values.get("message") ?? "").trim();
    const subject = encodeURIComponent(`Portfolio message${name ? ` from ${name}` : ""}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply to: ${email}`);

    window.location.href = `mailto:${links.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const nav = [
    ["Work", "#work"],
    ["Story", "#story"],
    ["Capabilities", "#capabilities"],
    ["Contact", "#contact"],
  ] as const;

  return (
    <div className="site" data-theme={theme} id="top">
      <header className="topbar">
        <Logo />
        <nav className={menu ? "nav nav-open" : "nav"} aria-label="Primary navigation">
          {nav.map(([item, href]) => (
            <a onClick={() => setMenu(false)} href={href} key={item}>
              {item}
            </a>
          ))}
          <a className="nav-resume" href={resumeRequestUrl()} onClick={() => setMenu(false)}>
            <Download size={15} /> Request résumé
          </a>
        </nav>
        <div className="top-actions">
          <div className="theme-switch" aria-label="Choose appearance">
            {themes.map((option) => (
              <button
                aria-label={`${option} theme`}
                aria-pressed={theme === option}
                className={theme === option ? "chosen" : ""}
                key={option}
                onClick={() => changeTheme(option)}
                type="button"
              >
                {option === "pearl" ? <Sun size={15} /> : option === "midnight" ? <Moon size={15} /> : <Sparkles size={15} />}
              </button>
            ))}
          </div>
          <button className="menu-button" onClick={() => setMenu(!menu)} aria-label="Toggle menu" aria-expanded={menu} type="button">
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title" onPointerLeave={resetHeroPointer} onPointerMove={handleHeroPointerMove}>
          <div className="hero-copy reveal is-revealed" data-reveal>
            <p className="eyebrow"><span /> AI engineer · product builder</p>
            <h1 id="hero-title">
              Making AI feel<br />
              <em><span aria-hidden="true">{typedWord}<b /></span><span className="sr-only">useful.</span></em>
            </h1>
            <p className="hero-intro">
              I&apos;m Kasa Kranthi Kiran. I build considered AI experiences and full-stack products that make complex technology easier to use.
            </p>
            <div className="hero-cta">
              <a href="#work" className="button button-ink">View projects <ArrowDownRight size={18} /></a>
              <a href="#contact" className="plain-link"><Mail size={17} /> Contact me</a>
            </div>
          </div>

          <div className="hero-art reveal is-revealed" data-reveal aria-label="Portrait of Kasa Kranthi Kiran">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="portrait-card">
              <Image
                alt="Kasa Kranthi Kiran in a professional suit"
                fill
                priority
                sizes="(max-width: 800px) 260px, 330px"
                src="/assets/images/kranthi-kiran-portrait.png"
              />
              <div className="portrait-info">
                <span>AI engineer &amp; product builder</span>
                <b>Intelligence, shaped into<br />clearer experiences.</b>
              </div>
            </div>
            <div className="art-note note-one"><Bot size={15} /> AI-native thinking</div>
            <div className="art-note note-two"><Code2 size={15} /> Product-minded code</div>
          </div>

          <div className="hero-strip" aria-label="Portfolio overview">
            <span>01 / 02 live projects</span>
            <div />
            <span>Based in India · working globally</span>
          </div>
        </section>

        <section className="manifesto" id="story" aria-labelledby="story-title">
          <div className="reveal" data-reveal>
            <p className="eyebrow">A little context</p>
            <div className="manifesto-grid">
              <h2 id="story-title">The interesting work begins when a difficult problem becomes <em>legible.</em></h2>
              <div className="story-copy">
                <p>I&apos;m drawn to the space where intelligent systems meet everyday decisions. The goal is not technology for its own sake—it&apos;s a product that earns a place in someone&apos;s day.</p>
                <p>That means getting close to the problem, shaping the system carefully, and refining the interaction until it feels calm, clear, and genuinely useful.</p>
                <a href="#contact" className="text-arrow">Let&apos;s make something useful <ArrowUpRight size={17} /></a>
              </div>
            </div>
          </div>
          <div className="proof-row reveal" data-reveal>
            <div><b>AI</b><p>systems with a human<br />point of view</p></div>
            <div><b>Web</b><p>product thinking from<br />interface to delivery</p></div>
            <div><b>02</b><p>live projects to<br />explore today</p></div>
            <div className="proof-statement"><Zap size={20} /><p>Build with intention.<br />Learn by making.</p></div>
          </div>
        </section>

        <section id="work" className="work-section" aria-labelledby="work-title">
          <div className="section-title reveal" data-reveal>
            <p className="eyebrow">Selected work / live</p>
            <h2 id="work-title">Built like a product,<br />not a portfolio piece.</h2>
          </div>
          <div className="project-list">
            {projects.map((project) => (
              <article className={`project ${project.tone} reveal`} data-reveal key={project.name}>
                <div className="project-index">{project.number}<span>Live</span></div>
                <div className="project-visual" aria-hidden="true">
                  <div className="visual-noise" />
                  <div className="visual-ui">
                    <div className="ui-top"><i /><i /><i /><b>{project.name}</b></div>
                    <div className="ui-body">
                      <aside><span /><span /><span /></aside>
                      <main><div /><div /><div /><div /></main>
                    </div>
                  </div>
                  <span className="visual-label">{project.label}</span>
                </div>
                <div className="project-content">
                  <p className="project-kicker">{project.label}</p>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <div className="project-meta"><span>{project.detail}</span></div>
                  <div className="project-actions">
                    <a href={project.url} target="_blank" rel="noreferrer" className="case-link">Visit live product <ExternalLink size={16} /></a>
                    <a href={links.github} target="_blank" rel="noreferrer" className="secondary-link">GitHub profile <ArrowUpRight size={16} /></a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="capabilities" className="capabilities" aria-labelledby="capabilities-title">
          <div className="skills-intro reveal" data-reveal>
            <p className="eyebrow">Capabilities</p>
            <h2 id="capabilities-title">Equal parts<br /><em>curious &amp; practical.</em></h2>
            <p>I work across the product surface—from a system&apos;s behaviour to the last interaction in its interface.</p>
          </div>
          <div className="skills-lab reveal" data-reveal>
            <div className="skill-tabs" role="tablist" aria-label="Skill categories">
              {(Object.keys(skillSets) as Array<keyof typeof skillSets>).map((item, index) => (
                <button
                  aria-controls="skill-panel"
                  aria-selected={item === skill}
                  className={item === skill ? "active" : ""}
                  id={`skill-tab-${index}`}
                  key={item}
                  onClick={() => setSkill(item)}
                  role="tab"
                  type="button"
                >
                  <span>0{index + 1}</span>{item}<ChevronRight size={16} />
                </button>
              ))}
            </div>
            <div aria-labelledby={`skill-tab-${(Object.keys(skillSets) as Array<keyof typeof skillSets>).indexOf(skill)}`} className="skills-stage" id="skill-panel" role="tabpanel">
              <p>Working vocabulary / {skill}</p>
              <div className="skill-cloud">
                {skillSets[skill].map((item) => <span key={item}>{item}</span>)}
              </div>
              <div className="skill-footer"><Layers3 size={19} /><span>Strong foundations, always expanding.</span></div>
            </div>
          </div>
          <div className="marquee" aria-label="Technology and tools">
            <div className="marquee-track">
              {[...marqueeSkills, ...marqueeSkills].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
            </div>
          </div>
        </section>

        <section className="approach-section" aria-labelledby="approach-title">
          <div className="approach-head reveal" data-reveal>
            <p className="eyebrow">The practice</p>
            <h2 id="approach-title">Start with the signal.<br /><em>Ship with intent.</em></h2>
          </div>
          <div className="approach-list">
            <article className="reveal" data-reveal><span>01</span><h3>Understand</h3><p>Find the real constraint before deciding what the product should become.</p></article>
            <article className="reveal" data-reveal><span>02</span><h3>Prototype</h3><p>Make the idea tangible early enough to learn from it.</p></article>
            <article className="reveal" data-reveal><span>03</span><h3>Refine</h3><p>Give the final interaction the same care as the system beneath it.</p></article>
          </div>
        </section>

        <section className="github-section" id="github" aria-labelledby="github-title">
          <div className="reveal" data-reveal>
            <p className="eyebrow">Open source / in progress</p>
            <h2 id="github-title">The workshop is<br /><em>always open.</em></h2>
            <a className="text-arrow" href={links.github} target="_blank" rel="noreferrer">Visit @kranthi-06 <ArrowUpRight size={17} /></a>
          </div>
          <div className="github-card reveal" data-reveal>
            <div className="github-top"><Github size={22} /><span>GitHub profile</span><i>open</i></div>
            <p className="github-copy">Projects, experiments, and works in progress—all gathered in one place.</p>
            <div className="github-actions">
              <a href={links.github} target="_blank" rel="noreferrer"><Github size={16} /><span>Explore the profile</span><ArrowUpRight size={16} /></a>
              <a href={links.lakshyaTrack} target="_blank" rel="noreferrer"><span><b>LakshyaTrack</b><small>Live product</small></span><ExternalLink size={16} /></a>
              <a href={links.srecCommunity} target="_blank" rel="noreferrer"><span><b>SREC Community</b><small>Live product</small></span><ExternalLink size={16} /></a>
            </div>
          </div>
        </section>

        <section className="network-section" aria-labelledby="network-title">
          <div className="network-card reveal" data-reveal>
            <div className="network-icon"><Linkedin size={28} /></div>
            <div>
              <p className="eyebrow">Professional network</p>
              <h2 id="network-title">Let&apos;s stay in the loop.</h2>
              <p>For professional updates, collaborations, and a closer look at the work, connect with me on LinkedIn.</p>
            </div>
            <a href={links.linkedin} target="_blank" rel="noreferrer" className="button button-ink">Connect on LinkedIn <ArrowUpRight size={17} /></a>
          </div>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="contact-pitch reveal" data-reveal>
            <p className="eyebrow">Your next idea</p>
            <h2 id="contact-title">Worth a<br /><em>conversation?</em></h2>
            <p>Whether it&apos;s an AI concept, a product problem, or a team looking for a thoughtful builder—I&apos;d love to hear where you&apos;re headed.</p>
            <div className="contact-links">
              <a href={`mailto:${links.email}`}><Mail size={17} /> {links.email}</a>
              <a href={links.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17} /> LinkedIn</a>
              <a href={links.github} target="_blank" rel="noreferrer"><Github size={17} /> GitHub</a>
              <a href={resumeRequestUrl()}><Download size={17} /> Request résumé</a>
            </div>
          </div>
          <form className="contact-form reveal" data-reveal onSubmit={send}>
            {submitted ? (
              <div className="sent" aria-live="polite">
                <Check size={30} />
                <h3>Your email draft is ready.</h3>
                <p>Your email app should have opened with the details filled in. You can send it whenever you&apos;re ready.</p>
                <button type="button" onClick={() => setSubmitted(false)}>Write another message</button>
              </div>
            ) : (
              <>
                <label>Your name<input required name="name" placeholder="How should I address you?" /></label>
                <label>Email address<input required type="email" name="email" placeholder="you@company.com" /></label>
                <label>What are we thinking about?<textarea required name="message" rows={4} placeholder="A short note is perfect." /></label>
                <button className="button button-ink" type="submit">Open email draft <Send size={17} /></button>
              </>
            )}
          </form>
        </section>
      </main>

      <footer>
        <Logo />
        <p>Designed and developed by Kasa Kranthi Kiran © 2026</p>
        <div className="footer-links">
          <a href={links.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="#top">Back to top <ArrowUpRight size={15} /></a>
        </div>
      </footer>
    </div>
  );
}
