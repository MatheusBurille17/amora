const CAPTIONS = [
  "O café que virou desculpa pra ficar",
  "Mapa errado, destino certo",
  "Domingo preguiçoso, do bom",
  "Sem pose, do jeito que eu gosto",
  "Rindo de nada. Meu dia favorito",
  "A foto que eu olho com saudade",
  "O lugar que virou nosso",
  "A luz boa e você, ainda melhor",
  "Um dia comum que eu não esqueço",
  "A gente, bem de perto",
];

const BY_QUESTION: Record<string, string[]> = {
  inicio: [
    "Foi num sábado, por um amigo em comum. Eu quase não fui.",
    "Numa festa em que os dois queriam ir embora cedo. Acabamos fechando o lugar conversando na calçada.",
    "Começou com uma conversa que era pra durar cinco minutos. Ainda não acabou.",
    "A gente se esbarrou sem plano. O resto virou história.",
    "Eu te vi primeiro. Demorei um pouco pra ter coragem de chegar perto.",
    "Um café marcado sem expectativa. Saí de lá já querendo o próximo.",
  ],
  detalhe: [
    "O jeito de rir com os olhos. O cuidado quando eu chego cansado(a).",
    "O jeito que você fala baixo quando está animado(a), como se o mundo fosse um segredo nosso.",
    "Como você lembra dos detalhes que eu mesmo esqueço.",
    "A calma que você traz quando o meu dia está alto demais.",
    "Seu jeito de cuidar sem fazer alarde.",
    "A risada que escapa quando você tenta ficar sério(a).",
  ],
  memoria: [
    "Aquela chuva na volta pra casa. Seu casaco. A gente rindo sem motivo.",
    "Aquele pastel na chuva, compartilhando o fone, sem plano nenhum. Eu soube ali.",
    "A madrugada em que a gente falou de tudo e o sol apareceu sem a gente perceber.",
    "A viagem em que a gente se perdeu e achou o melhor lugar do caminho.",
    "O domingo em casa, sem agenda, só a gente e o sofá.",
    "A primeira vez que eu te vi rir de verdade. Ficou gravado.",
  ],
  frase: [
    "“Meu bem”, dito de um jeito que só a gente entende.",
    "“Vem cá” — e eu já sei se é abraço, conselho ou pipoca.",
    "A gente tem um código: um olhar e já está combinado.",
    "“Cheguei.” E você já sabe que é pra abrir a porta.",
    "Aquela piada interna que não faz sentido pra mais ninguém.",
    "“Tá comigo?” A resposta é sempre sim.",
  ],
};

export function captionSuggestions() {
  return CAPTIONS;
}

export function questionSuggestions(questionId: string) {
  return BY_QUESTION[questionId] ?? [];
}

export function letterSuggestions(authorName: string, recipientName: string) {
  const recipient = recipientName.trim() || "amor";
  const author = authorName.trim();
  const sign = author ? `Com amor, ${author}.` : "Com amor.";

  return [
    `${recipient}, eu podia te dar qualquer coisa hoje. Escolhi este recado: as fotos, a música e o tempo que a gente já vive junto. Obrigado por fazer os dias comuns parecerem segredo nosso. Eu te escolho de novo amanhã.`,
    `${recipient}, se eu fosse resumir a gente numa frase, seria esta: você é a parte boa do meu dia, mesmo quando o dia é comum. Obrigado por ficar. Obrigado por ser casa.`,
    `${recipient}, eu não sou de discurso longo. Então vai o essencial: eu te amo no detalhe, no silêncio e no plano de amanhã. Quero continuar escolhendo você.`,
    `${recipient}, guarda isto. Quando o dia pesar, lembra que tem alguém torcendo por você em voz alta. ${sign}`,
  ];
}
