export type Question = {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  placeholder: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "inicio",
    title: "O começo",
    prompt: "Como vocês se conheceram?",
    hint: "Pode ser curto. O que importa é parecer de vocês.",
    placeholder: "Foi num sábado, por um amigo em comum. Eu quase não fui...",
  },
  {
    id: "detalhe",
    title: "O detalhe",
    prompt: "O que você mais ama nessa pessoa?",
    hint: "Um gesto pequeno vende mais emoção do que um discurso.",
    placeholder: "O jeito de rir com os olhos. O cuidado quando eu chego cansado(a)...",
  },
  {
    id: "memoria",
    title: "A memória",
    prompt: "Qual memória você nunca quer esquecer?",
    hint: "Viagem, madrugada, padaria na esquina. Vale tudo.",
    placeholder: "Aquela chuva na volta pra casa. Seu casaco. A gente rindo sem motivo...",
  },
  {
    id: "frase",
    title: "A frase",
    prompt: "Qual frase, apelido ou piada é só de vocês dois?",
    hint: "Se não tiver, inventa uma promessa. Fica lindo.",
    placeholder: "‘Meu bem’ dito de um jeito que só a gente entende...",
  },
];

export function emptyAnswers(): { id: string; text: string; photoId: string }[] {
  return QUESTIONS.map((question) => ({ id: question.id, text: "", photoId: "" }));
}

export function normalizeAnswers(
  answers: { id?: string; text?: string; photoId?: string }[] | undefined,
) {
  return QUESTIONS.map((question) => {
    const found = answers?.find((item) => item?.id === question.id);
    return {
      id: question.id,
      text: String(found?.text ?? "").slice(0, 4000),
      photoId: String(found?.photoId ?? "").slice(0, 40),
    };
  });
}
