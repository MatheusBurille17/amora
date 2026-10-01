"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Logo } from "@/components/Logo";
import { PhonePreview } from "@/components/PhonePreview";
import { BRAND } from "@/lib/brand";
import { DEMO_GIFT } from "@/lib/demo";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MOMENTS = [
  "Ela aponta a câmera.",
  "A música de vocês começa.",
  "As fotos entram em tela cheia.",
  "O tempo juntos não para.",
];

const INSIDE = [
  { title: "O filme de vocês", text: "Até 7 fotos em tela cheia, com legenda. Um recado que não cabe no WhatsApp." },
  { title: "A trilha do casal", text: "Cola o YouTube. Quando o recado abre, a música toca sozinha." },
  { title: "O contador ao vivo", text: "Anos, meses, dias, horas, segundos. O tempo de vocês batendo na tela." },
  { title: "A carta", text: "O recado de verdade. A parte que faz chorar — e ficar." },
];

const STEPS = [
  { n: "01", title: "Você monta escondido", text: "Nomes, fotos, a música e uma carta. Cinco minutos. Sem app, sem complicação." },
  { n: "02", title: "Esconde o QR", text: "Imprime, cola numa caixinha, manda no WhatsApp, deixa no cardápio. Você escolhe a hora." },
  { n: "03", title: "A pessoa abre e para", text: "Aponta a câmera. A trilha começa. As fotos entram. Você parece ter planejado isso há meses." },
];

const IDEAS = [
  ["Caixinha", "QR no fundo, por cima de uma joia ou um doce."],
  ["Meia-noite", "O link chega com a música já escolhida."],
  ["Jantar", "No verso do cardápio. Ela acha no meio da sobremesa."],
  ["Aniversário", "No envelope da carta, antes do presente grande."],
];

const FAQS = [
  {
    q: "O que a pessoa recebe?",
    a: "Um site só de vocês. Abre no celular, sem app. Fotos, música, contador e o recado que você escreveu. Também vai um QR Code para imprimir e esconder no presente físico.",
  },
  {
    q: "Fica no ar para sempre?",
    a: `Sim. ${BRAND.priceLabel} uma vez. Sem plano de 24 horas, sem letra miúda. Você pode editar depois.`,
  },
  {
    q: "Preciso de conta?",
    a: "Sim, na hora de pagar: e-mail e senha. Assim você acha o QR depois, em qualquer celular. Quem recebe o presente não precisa de conta.",
  },
  {
    q: "Precisa saber mexer em site?",
    a: "Não. É um passo a passo. Se souber mandar foto no WhatsApp, sabe criar um recado Amora.",
  },
  {
    q: "Dá para fazer surpresa?",
    a: "É o uso mais comum. Você monta escondido, imprime o QR e coloca numa carta, buquê ou caixa. Ou manda o link à meia-noite.",
  },
  {
    q: "Quais pagamentos vocês aceitam?",
    a: "Pix e cartão pelo Mercado Pago. O link e o QR Code liberam assim que o pagamento confirma.",
  },
  {
    q: "E se eu não for bom de escrever?",
    a: "As perguntas puxam a história. Frase curta já funciona. O que emociona é foto + música + data + uma verdade pequena.",
  },
];

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-copy > *", {
          y: 28,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
        });
        gsap.from(".hero-phone", {
          y: 40,
          autoAlpha: 0,
          duration: 1.1,
          delay: 0.2,
          ease: "power3.out",
        });
        gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
          gsap.from(el, {
            y: 36,
            autoAlpha: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
              once: true,
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="bg-paper text-ink">
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          scrolled ? "border-b border-ink/8 bg-paper/90 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" aria-label="Amora">
            <Logo light={!scrolled} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/entrar"
              className={`text-sm font-bold ${scrolled ? "text-muted" : "text-white/80"}`}
            >
              Entrar
            </Link>
            <Link
              href="/criar"
              className={`rounded-full px-4 py-2 text-sm font-extrabold ${
                scrolled ? "bg-berry text-white" : "bg-white text-berry"
              }`}
            >
              Começar
            </Link>
          </div>
        </div>
      </header>

      <section className="amora-gradient grain overflow-hidden text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-28 lg:grid-cols-[1.08fr_.92fr] lg:pt-32">
          <div className="hero-copy">
            <p className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]">
              Um recado. Só de vocês.
            </p>
            <h1 className="font-display text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Faz ela parar no meio do dia.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              Não é um post. Não é um story que some. É um site só de vocês: as fotos, a música, o tempo juntos e a carta que você nunca mandou.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/criar" className="btn-primary bg-white text-berry">
                Começar o recado
              </Link>
              <Link href="/r/ensaio" className="btn-ghost">
                Ver como fica
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/65">Pronto em 5 minutos · Sem app · Fica para sempre</p>
          </div>
          <div className="hero-phone">
            <Link href="/r/ensaio" className="block" aria-label="Ver uma demo do recado">
              <PhonePreview />
            </Link>
          </div>
        </div>
      </section>

      <section className="overflow-hidden py-8">
        <div className="reveal mx-auto flex max-w-6xl gap-3 overflow-x-auto px-5 pb-2">
          {DEMO_GIFT.photos.map((photo) => (
            <figure key={photo.id} className="w-44 shrink-0 overflow-hidden rounded-3xl sm:w-56">
              <img src={photo.src} alt="" className="h-36 w-full object-cover sm:h-44" />
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:py-24">
        <p className="reveal text-sm font-extrabold uppercase tracking-[0.22em] text-berry">O momento</p>
        <div className="mt-6 space-y-4">
          {MOMENTS.map((line) => (
            <p key={line} className="reveal font-display text-4xl leading-tight text-ink sm:text-5xl">
              {line}
            </p>
          ))}
        </div>
        <p className="reveal mt-8 max-w-xl text-lg text-muted">
          Você parece ter planejado isso há meses. Mesmo fazendo hoje, escondido, no celular.
        </p>
      </section>

      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <p className="reveal text-sm font-extrabold uppercase tracking-[0.22em] text-blush">O que vai no recado</p>
          <h2 className="reveal mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Tudo que emociona — numa página que só ela abre.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {INSIDE.map((item, index) => (
              <article key={item.title} className="reveal border-t border-white/15 pt-6">
                <p className="text-sm font-bold text-gold">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-display text-3xl">{item.title}</h3>
                <p className="mt-3 text-white/70">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div className="reveal">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-berry">A surpresa</p>
          <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            O QR é o presente físico. O site é o que fica.
          </h2>
          <p className="mt-5 text-lg text-muted">
            Imprime e cola no cartão, no espelho, na caixa, no buquê. Ou manda o link. A pessoa abre no navegador — não precisa baixar nada.
          </p>
        </div>
        <div className="reveal space-y-3">
          {IDEAS.map(([title, text]) => (
            <div key={title} className="soft-card rounded-3xl p-5">
              <div className="font-extrabold">{title}</div>
              <p className="mt-1 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blush/35 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="reveal text-sm font-extrabold uppercase tracking-[0.22em] text-berry">Como funciona</p>
          <h2 className="reveal mt-3 font-display text-4xl sm:text-5xl">Três passos. Sem app.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <article key={step.n} className="reveal rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(27,16,20,.06)]">
                <div className="font-display text-3xl text-berry">{step.n}</div>
                <h3 className="mt-4 text-xl font-extrabold">{step.title}</h3>
                <p className="mt-2 text-muted">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="preco" className="mx-auto max-w-xl px-5 py-20 text-center">
        <p className="reveal text-sm font-extrabold uppercase tracking-[0.22em] text-berry">Quando você estiver pronto</p>
        <h2 className="reveal mt-3 font-display text-4xl sm:text-5xl">Um pagamento. O recado não some.</h2>
        <p className="reveal mx-auto mt-4 max-w-md text-muted">
          Sem mensalidade. Sem sumir amanhã. Você monta, libera, e o site de vocês fica no ar.
        </p>
        <div className="reveal soft-card mt-10 rounded-[2rem] p-8 text-left">
          <p className="text-sm font-bold uppercase tracking-wide text-berry">Vitalício</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-display text-6xl">{BRAND.priceLabel}</span>
            <span className="mb-2 text-muted">uma vez</span>
          </div>
          <ul className="mt-6 space-y-3">
            {[
              "Página no ar para sempre",
              "Edição liberada",
              "Fotos, música, contador e carta",
              "Link + QR Code",
              "Pix ou cartão",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-berry">✓</span> {item}
              </li>
            ))}
          </ul>
          <Link href="/criar" className="btn-primary mt-8 w-full">
            Quero criar o meu
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-20">
        <h2 className="reveal font-display text-4xl">Perguntas frequentes</h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((item) => (
            <details key={item.q} className="reveal soft-card rounded-2xl px-5 py-4">
              <summary className="cursor-pointer list-none font-extrabold">{item.q}</summary>
              <p className="mt-3 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="amora-gradient grain py-20 text-center text-white">
        <h2 className="reveal font-display text-4xl sm:text-6xl">Faz hoje. Entrega hoje.</h2>
        <p className="reveal mx-auto mt-4 max-w-lg text-white/75">
          Presente de última hora que não parece de última hora. O recado fica.
        </p>
        <Link href="/criar" className="reveal btn-primary mx-auto mt-8 bg-white text-berry">
          Começar o recado
        </Link>
      </section>

      <footer className="bg-ink px-5 py-10 text-sm text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo light />
          <p>© {new Date().getFullYear()} Amora. Um recado, para sempre.</p>
        </div>
      </footer>
    </div>
  );
}
