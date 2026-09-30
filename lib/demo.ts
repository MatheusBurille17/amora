import type { Gift } from "@/lib/types";
import { createDraft } from "@/lib/gift";

export const DEMO_GIFT: Gift = {
  ...createDraft({
    id: "demo",
    slug: "ensaio",
    status: "published",
    paid: true,
    authorName: "Léo",
    recipientName: "Maya",
    startDate: "2022-03-12",
    youtubeUrl: "https://www.youtube.com/watch?v=450p7goxZqg",
    letter:
      "Maya, eu podia te dar qualquer coisa hoje. Escolhi te mostrar o filme que a gente já vive, com a trilha que toca toda vez que eu penso em você. Obrigado por fazer os dias comuns parecerem recado secreto. Eu te escolho de novo amanhã.",
    publishedAt: new Date().toISOString(),
  }),
  photos: [
    {
      id: "1",
      src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
      caption: "O café que virou desculpa pra ficar mais um pouco",
    },
    {
      id: "2",
      src: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?auto=format&fit=crop&w=1200&q=80",
      caption: "A primeira viagem. Mapa errado, destino certo.",
    },
    {
      id: "3",
      src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
      caption: "Domingo preguiçoso. Melhor hora da semana.",
    },
    {
      id: "4",
      src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
      caption: "A gente, sem pose, do jeito que eu mais gosto.",
    },
  ],
  answers: [
    {
      id: "inicio",
      text: "Numa festa em que os dois queriam ir embora cedo. Acabamos fechando o lugar conversando na calçada.",
    },
    {
      id: "detalhe",
      text: "O jeito que você fala baixo quando está animada, como se o mundo fosse um segredo nosso.",
    },
    {
      id: "memoria",
      text: "Aquele pastel na chuva, compartilhando o fone, sem plano nenhum. Eu soube ali.",
    },
    {
      id: "frase",
      text: "‘Vem cá, amor’ — e eu já sei se é abraço, conselho ou pipoca.",
    },
  ],
};
