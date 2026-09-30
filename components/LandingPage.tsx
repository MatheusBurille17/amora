import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PhonePreview } from "@/components/PhonePreview";
import { BRAND } from "@/lib/brand";

const STEPS = [
  {
    n: "01",
    title: "Monte em 5 minutos",
    text: "Nomes, fotos, a música e um recado. Na hora de pagar você cria uma conta com e-mail e senha.",
  },
  {
    n: "02",
    title: "Pague uma vez",
    text: `${BRAND.priceLabel} vitalício. Pix ou cartão. Sem mensalidade, sem sumir amanhã.`,
  },
  {
    n: "03",
    title: "Receba link e QR",
    text: "Baixa o QR, cola numa caixinha, manda no WhatsApp, esconde no cardápio. Você escolhe.",
  },
  {
    n: "04",
    title: "Vê a reação",
    text: "A pessoa aponta a câmera, a música toca, as fotos entram, o tempo de vocês não para.",
  },
];

const INCLUDED = [
  { title: "Contador ao vivo", text: "Anos, meses, dias, horas e segundos juntos. O tempo de vocês batendo na tela, sem parar." },
  { title: "Filme de fotos", text: "Até 7 fotos em tela cheia, com legenda. A pessoa toca e vai passando, como um recado que não cabe no WhatsApp." },
  { title: "Música do casal", text: "Cola o link do YouTube. O recado abre com a trilha de vocês." },
  { title: "Perguntas que puxam lágrima", text: "Como se conheceram, o que mais ama, a memória, a frase secreta. Quatro. Rápidas. Opcionais." },
  { title: "Carta final", text: "O recado de verdade. A parte que faz chorar." },
  { title: "QR Code para imprimir", text: "Alta resolução, pronto para cartão, quadro, bolo, espelho, caixa de bombom." },
];

const FAQS = [
  {
    q: "O que a pessoa recebe?",
    a: "Um site só de vocês. Abre no celular, sem app. Fotos, música, contador e o recado que você escreveu. Também vai um QR Code para imprimir e esconder no presente físico.",
  },
  {
    q: "Fica no ar para sempre?",
    a: "Sim. R$ 19,90 uma vez. Sem plano de 24 horas, sem letra miúda. Você pode editar depois.",
  },
  {
    q: "Preciso de conta?",
    a: "Sim, na hora de pagar: e-mail e senha. Assim você acha o QR depois, em qualquer celular. Quem recebe o presente não precisa de conta.",
  },
  {
    q: "Precisa saber mexer em site?",
    a: "Não. É um passo a passo de uns 5 minutos. Se souber mandar foto no WhatsApp, sabe criar um recado Amora.",
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
  return (
    <div className="bg-paper text-ink">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo light />
          <div className="flex items-center gap-3">
            <Link href="/entrar" className="hidden text-sm font-bold text-white/80 sm:inline">
              Entrar
            </Link>
            <Link href="/criar" className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-berry">
              Criar presente
            </Link>
          </div>
        </div>
      </header>

      <section className="amora-gradient grain overflow-hidden text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-28 lg:grid-cols-[1.05fr_.95fr] lg:pt-32">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
              Presente digital para casal
            </p>
            <h1 className="font-display text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Surpreenda seu amor com um site só de vocês.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              Fotos, a música do casal, um recado secreto e o tempo juntos batendo ao vivo. Ela aponta o QR Code e chora. Você parece ter planejado isso há meses — mesmo fazendo em 5 minutos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/criar" className="btn-primary bg-white text-berry">
                Criar meu presente · {BRAND.priceLabel}
              </Link>
              <Link href="/r/ensaio" className="btn-ghost">
                Ver uma demo
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              <span>Pagamento único</span>
              <span>Fica no ar para sempre</span>
              <span>Pix ou cartão</span>
              <span>Pronto em 5 minutos</span>
            </div>
          </div>
          <PhonePreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-berry">O que vai no recado</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
          Tudo que faz o presente emocionar — em um recado só de vocês.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {INCLUDED.map((item) => (
            <article key={item.title} className="soft-card rounded-3xl p-6">
              <h3 className="font-display text-2xl">{item.title}</h3>
              <p className="mt-2 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-blush">Como funciona</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Quatro passos. Sem app.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <article key={step.n} className="rounded-3xl bg-white/5 p-6">
                <div className="font-display text-3xl text-gold">{step.n}</div>
                <h3 className="mt-4 text-xl font-extrabold">{step.title}</h3>
                <p className="mt-2 text-white/70">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-berry">Entrega</p>
          <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            O QR Code é o presente físico. O site é a emoção.
          </h2>
          <p className="mt-5 text-lg text-muted">
            Imprime e cola no cartão, no espelho, na caixa de chocolate, no buquê, no livro, no bolo. Ou manda o link no WhatsApp. A pessoa abre no navegador — não precisa baixar nada.
          </p>
          <ul className="mt-6 space-y-3 text-ink">
            {[
              "QR em alta para impressão",
              "Link curto para WhatsApp",
              "Funciona no iPhone e no Android",
              "Você edita depois, se quiser trocar foto ou texto",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-berry" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="soft-card rounded-[2rem] p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-berry">Ideias prontas</p>
          <div className="mt-5 space-y-4">
            {[
              ["Caixinha", "QR no fundo, por cima de uma joia ou um doce."],
              ["Meia-noite", "Link no WhatsApp com a música já escolhida."],
              ["Jantar", "QR no verso do cardápio ou no guardanapo."],
              ["Aniversário", "No envelope da carta, antes do presente grande."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl bg-paper p-4">
                <div className="font-extrabold">{title}</div>
                <p className="text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="preco" className="bg-blush/40 py-20">
        <div className="mx-auto max-w-xl px-5 text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-berry">Preço honesto</p>
          <h2 className="mt-3 font-display text-5xl">Um plano. Para sempre.</h2>
          <div className="soft-card mt-8 rounded-[2rem] p-8 text-left">
            <p className="text-sm font-bold uppercase tracking-wide text-berry">Vitalício</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-6xl">{BRAND.priceLabel}</span>
              <span className="mb-2 text-muted">pagamento único</span>
            </div>
            <ul className="mt-6 space-y-3">
              {[
                "Página no ar para sempre",
                "Edição liberada",
                "Até 7 fotos",
                "Música do YouTube",
                "Contador ao vivo",
                "Carta + 4 recados",
                "Link + QR Code",
                "Pix ou cartão",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-berry">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link href="/criar" className="btn-primary mt-8 w-full">
              Quero criar agora
            </Link>
            <p className="mt-4 text-center text-sm text-muted">
              Sem 24 horas. Sem mensalidade. Sem sumir com o presente.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="font-display text-4xl">Perguntas frequentes</h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((item) => (
            <details key={item.q} className="soft-card rounded-2xl px-5 py-4">
              <summary className="cursor-pointer list-none font-extrabold">{item.q}</summary>
              <p className="mt-3 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="amora-gradient grain py-16 text-center text-white">
        <h2 className="font-display text-4xl sm:text-5xl">Faz hoje. Entrega hoje.</h2>
        <p className="mx-auto mt-4 max-w-lg text-white/75">
          Presente de última hora que não parece de última hora. {BRAND.priceLabel}, e o recado não some.
        </p>
        <Link href="/criar" className="btn-primary mx-auto mt-8 bg-white text-berry">
          Criar meu presente
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
