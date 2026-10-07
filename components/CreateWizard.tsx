"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { GiftExperience } from "@/components/GiftExperience";
import { Logo } from "@/components/Logo";
import { PhraseSuggestions } from "@/components/PhraseSuggestions";
import { BRAND } from "@/lib/brand";
import { isGiftComplete } from "@/lib/gift";
import { compressImage } from "@/lib/image";
import { normalizeAnswers, QUESTIONS } from "@/lib/questions";
import { captionSuggestions, letterSuggestions, questionSuggestions } from "@/lib/suggestions";
import { randomId } from "@/lib/slug";
import { getSessionEmail, getLocalGiftById, loadDraft, saveDraft, setSessionEmail, upsertLocalGift } from "@/lib/store";
import type { Gift, GiftAnswer } from "@/lib/types";
import { extractYoutubeId } from "@/lib/youtube";
import { useAuth } from "@/components/AuthProvider";
import { firebaseEnabled, getFirebaseAuth } from "@/lib/firebase/client";
import { getGiftRemote, saveGiftRemote } from "@/lib/firebase/gifts";
import { isComplimentaryEmail } from "@/lib/complimentary";
import { startCheckout } from "@/lib/pay";
import {
  authErrorMessage,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from "@/lib/firebase/auth";

const STEPS = ["Nomes", "Data", "Fotos", "Música", "Recados", "Carta", "Pagar"] as const;

export function CreateWizard() {
  const router = useRouter();
  const search = useSearchParams();
  const { user } = useAuth();
  const [gift, setGift] = useState<Gift | null>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const editId = search.get("editar");
  const [hub, setHub] = useState(Boolean(editId));
  const editOpened = useRef(false);

  useEffect(() => {
    if (!editId || editOpened.current) return;
    editOpened.current = true;
    setHub(true);
  }, [editId]);

  useEffect(() => {
    const editId = search.get("editar");
    const failedPay = search.get("pagamento") === "falhou";
    if (failedPay) setError("O pagamento não entrou. Você pode tentar de novo — o recado continua salvo.");

    void (async () => {
      let draft = loadDraft();
      if (editId) {
        const remote = user ? await getGiftRemote(editId).catch(() => null) : null;
        const local = getLocalGiftById(editId);
        draft = remote ?? local ?? draft;
        if (draft.paid) {
          router.replace(`/painel/${draft.id}`);
          return;
        }
        saveDraft(draft);
      }
      if (!draft.email) draft.email = user?.email ?? getSessionEmail();
      setGift({ ...draft, answers: normalizeAnswers(draft.answers) });
    })();
  }, [user, search, router]);

  function update(patch: Partial<Gift>) {
    setGift((current) => {
      if (!current) return current;
      return saveDraft({ ...current, ...patch });
    });
  }

  function withAnswers(questionId: string, patch: Partial<GiftAnswer>) {
    return normalizeAnswers(gift?.answers).map((item) =>
      item.id === questionId ? { ...item, ...patch } : item,
    );
  }

  async function onPhotos(files: FileList | null) {
    if (!files || !gift) return;
    const remaining = 7 - gift.photos.length;
    if (remaining <= 0) {
      setError("O presente aceita até 7 fotos. Tira uma para colocar outra.");
      return;
    }
    setError("");
    const picked = Array.from(files).slice(0, remaining);
    const photos = [...gift.photos];
    for (const file of picked) {
      const src = await compressImage(file);
      photos.push({ id: randomId(6), src, caption: "" });
    }
    update({ photos });
  }

  async function uploadQuestionPhoto(questionId: string, files: FileList | null) {
    const file = files?.[0];
    if (!file || !gift) return;
    if (gift.photos.length >= 7) {
      setError("O presente aceita até 7 fotos. Escolhe uma que já está aqui, ou tira outra.");
      return;
    }
    setError("");
    const src = await compressImage(file);
    const photo = { id: randomId(6), src, caption: "" };
    update({
      photos: [...gift.photos, photo],
      answers: withAnswers(questionId, { photoId: photo.id }),
    });
  }

  function removePhoto(photoId: string) {
    if (!gift) return;
    update({
      photos: gift.photos.filter((item) => item.id !== photoId),
      answers: normalizeAnswers(gift.answers).map((item) =>
        item.photoId === photoId ? { ...item, photoId: "" } : item,
      ),
    });
  }

  function openSection(nextStep: number, nextQuestion?: number) {
    if (nextQuestion !== undefined) setQuestionIndex(nextQuestion);
    setStep(nextStep);
    setHub(false);
    setError("");
  }

  async function checkout() {
    if (!gift) return;
    setError("");
    if (!isGiftComplete(gift)) {
      setError("Preencha nomes, data, pelo menos uma foto e a carta.");
      return;
    }
    const email = (user?.email || gift.email).trim().toLowerCase();
    if (!email) {
      setError("Coloca um e-mail para criar sua conta.");
      return;
    }
    if (firebaseEnabled && !user && password.length < 6) {
      setError("Cria uma senha com pelo menos 6 caracteres. É com ela que você acha o QR depois.");
      return;
    }
    setBusy(true);
    setSessionEmail(email);
    const paidLocal = { ...gift, email, updatedAt: new Date().toISOString() };
    saveDraft(paidLocal);
    try {
      const auth = getFirebaseAuth();
      if (firebaseEnabled) {
        let uid = auth?.currentUser?.uid ?? user?.uid;
        if (!uid) {
          const account =
            authMode === "login"
              ? await signInWithEmail(paidLocal.email, password)
              : await signUpWithEmail(paidLocal.email, password);
          uid = account.uid;
        }
        await saveGiftRemote({ ...paidLocal, paid: false, status: "draft" }, uid);
      }
      const idToken = await auth?.currentUser?.getIdToken();
      const data = await startCheckout(paidLocal.email, paidLocal.id, idToken);
      if (data.demo || data.complimentary) {
        const published = {
          ...paidLocal,
          paid: true,
          status: "published" as const,
          publishedAt: new Date().toISOString(),
        };
        saveDraft(published);
        upsertLocalGift(published);
        router.push(`/painel/${published.id}`);
        return;
      }
      if (data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }
      throw new Error("Checkout sem destino");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);
  if (!gift) return <div className="min-h-dvh bg-paper" />;

  const question = QUESTIONS[questionIndex];
  const answers = normalizeAnswers(gift.answers);
  const currentAnswer = answers.find((item) => item.id === question?.id) ?? answers[0];
  const linkedPhoto = gift.photos.find((photo) => photo.id === currentAnswer.photoId) ?? null;
  const answer = currentAnswer.text;

  return (
    <div className="min-h-dvh bg-paper">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link href="/">
          <Logo />
        </Link>
        <button className="text-sm font-bold text-berry" onClick={() => setPreview((value) => !value)}>
          {preview ? "Voltar ao editor" : "Ver prévia"}
        </button>
      </header>

      {preview ? (
        <GiftExperience gift={{ ...gift, answers }} preview />
      ) : hub ? (
        <main className="mx-auto max-w-3xl px-5 pb-24">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-berry">Editar</p>
          <h1 className="mt-2 font-display text-4xl">O que você quer mudar?</h1>
          <p className="mt-2 text-muted">Cada pergunta fica com a foto dela. Toque numa parte para abrir.</p>
          <div className="mt-6 grid gap-3">
            <button className="soft-card rounded-3xl p-4 text-left" onClick={() => openSection(0)}>
              <p className="text-sm font-bold text-muted">Nomes</p>
              <p className="font-extrabold">{gift.authorName || "Seu nome"} → {gift.recipientName || "quem recebe"}</p>
            </button>
            <button className="soft-card rounded-3xl p-4 text-left" onClick={() => openSection(1)}>
              <p className="text-sm font-bold text-muted">Data</p>
              <p className="font-extrabold">{gift.startDate || "Ainda sem data"}</p>
            </button>
            <button className="soft-card rounded-3xl p-4 text-left" onClick={() => openSection(2)}>
              <p className="text-sm font-bold text-muted">Fotos</p>
              <p className="font-extrabold">{gift.photos.length} de 7</p>
            </button>
            <button className="soft-card rounded-3xl p-4 text-left" onClick={() => openSection(3)}>
              <p className="text-sm font-bold text-muted">Música</p>
              <p className="truncate font-extrabold">{gift.youtubeUrl || "Nenhuma ainda"}</p>
            </button>
          </div>
          <h2 className="mt-8 font-display text-3xl">Perguntas</h2>
          <div className="mt-4 grid gap-3">
            {QUESTIONS.map((item, index) => {
              const itemAnswer = answers.find((entry) => entry.id === item.id);
              const itemPhoto = gift.photos.find((photo) => photo.id === itemAnswer?.photoId);
              return (
                <button
                  key={item.id}
                  className="soft-card flex gap-3 rounded-3xl p-3 text-left"
                  onClick={() => openSection(4, index)}
                >
                  {itemPhoto ? (
                    <img src={itemPhoto.src} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                  ) : (
                    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-blush text-xs font-extrabold text-berry">
                      Sem foto
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-berry">{item.title}</span>
                    <span className="block font-extrabold">{item.prompt}</span>
                    <span className="mt-1 block truncate text-sm text-muted">
                      {itemAnswer?.text.trim() || "Resposta em branco"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <button className="soft-card mt-3 w-full rounded-3xl p-4 text-left" onClick={() => openSection(5)}>
            <p className="text-sm font-bold text-muted">Carta</p>
            <p className="truncate font-extrabold">{gift.letter.trim() || "Ainda sem carta"}</p>
          </button>
          <button className="btn-primary mt-8 w-full" onClick={() => openSection(6)}>
            Ir para liberar
          </button>
        </main>
      ) : (
        <main className="mx-auto max-w-3xl px-5 pb-24">
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-blush">
            <div className="h-full bg-berry transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STEPS.map((label, index) => (
              <button
                key={label}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-extrabold ${index === step ? "bg-berry text-white" : "bg-white text-muted"}`}
                onClick={() => openSection(index)}
              >
                {label}
              </button>
            ))}
          </div>
          {editId ? (
            <button className="mt-3 text-sm font-bold text-berry" onClick={() => setHub(true)}>
              ← Voltar à revisão
            </button>
          ) : null}

          {step === 0 ? (
            <section className="mt-4 space-y-4">
              <h1 className="font-display text-4xl">De quem para quem?</h1>
              <label className="block">
                <span className="mb-2 block text-sm font-bold">Seu nome</span>
                <input className="field" value={gift.authorName} onChange={(e) => update({ authorName: e.target.value })} placeholder="Ex.: Léo" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold">Nome de quem vai receber</span>
                <input className="field" value={gift.recipientName} onChange={(e) => update({ recipientName: e.target.value })} placeholder="Ex.: Maya" />
              </label>
            </section>
          ) : null}

          {step === 1 ? (
            <section className="mt-4 space-y-4">
              <h1 className="font-display text-4xl">Quando a história começou?</h1>
              <p className="text-muted">A data vira o contador ao vivo. Primeiro beijo, pedido, ou o dia que vocês assumiram.</p>
              <input className="field" type="date" value={gift.startDate} onChange={(e) => update({ startDate: e.target.value })} />
            </section>
          ) : null}

          {step === 2 ? (
            <section className="mt-4 space-y-4">
              <h1 className="font-display text-4xl">Manda até 7 fotos</h1>
              <p className="text-muted">
                As melhores. Na hora da pergunta, você escolhe qual foto acompanha cada resposta.
              </p>
              {error ? <p className="font-bold text-berry">{error}</p> : null}
              <label className="soft-card flex cursor-pointer flex-col items-center rounded-3xl border-dashed p-8 text-center">
                <span className="font-extrabold text-berry">Escolher fotos</span>
                <span className="text-sm text-muted">{gift.photos.length}/7</span>
                <input className="hidden" type="file" accept="image/*" multiple onChange={(e) => void onPhotos(e.target.files)} />
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gift.photos.map((photo, index) => {
                  const linkedTitle = QUESTIONS.filter((item) =>
                    answers.some((entry) => entry.id === item.id && entry.photoId === photo.id),
                  )
                    .map((item) => item.title)
                    .join(", ");
                  return (
                  <figure key={photo.id} className="overflow-hidden rounded-2xl bg-white">
                    <img src={photo.src} alt="" className="h-36 w-full object-cover" />
                    <input
                      className="field rounded-none border-0 text-sm"
                      placeholder="Legenda (opcional)"
                      value={photo.caption}
                      onChange={(e) =>
                        update({
                          photos: gift.photos.map((item) =>
                            item.id === photo.id ? { ...item, caption: e.target.value } : item,
                          ),
                        })
                      }
                    />
                    {linkedTitle ? (
                      <p className="px-3 pt-2 text-xs font-extrabold text-berry">Foto de {linkedTitle}</p>
                    ) : null}
                    <PhraseSuggestions
                      compact
                      seed={index}
                      suggestions={captionSuggestions()}
                      value={photo.caption}
                      onPick={(caption) =>
                        update({
                          photos: gift.photos.map((item) =>
                            item.id === photo.id ? { ...item, caption } : item,
                          ),
                        })
                      }
                    />
                    <button
                      className="w-full py-2 text-sm font-bold text-berry"
                      onClick={() => removePhoto(photo.id)}
                    >
                      Tirar
                    </button>
                  </figure>
                  );
                })}
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="mt-4 space-y-4">
              <h1 className="font-display text-4xl">A música de vocês</h1>
              <p className="text-muted">Cola o link do YouTube. Quando o recado abrir, a trilha toca.</p>
              <input
                className="field"
                value={gift.youtubeUrl}
                onChange={(e) => update({ youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {extractYoutubeId(gift.youtubeUrl) ? (
                <p className="text-sm font-bold text-berry">Música reconhecida. Pode seguir.</p>
              ) : (
                <p className="text-sm text-muted">Pode pular e colocar depois, mas a emoção cai pela metade.</p>
              )}
            </section>
          ) : null}

          {step === 4 && question ? (
            <section className="mt-4 space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {QUESTIONS.map((item, index) => {
                  const itemAnswer = answers.find((entry) => entry.id === item.id);
                  const hasPhoto = gift.photos.some((photo) => photo.id === itemAnswer?.photoId);
                  return (
                    <button
                      key={item.id}
                      className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${index === questionIndex ? "bg-ink text-white" : "bg-white"}`}
                      onClick={() => setQuestionIndex(index)}
                    >
                      {index + 1}
                      {hasPhoto ? " · foto" : ""}
                    </button>
                  );
                })}
              </div>
              <h1 className="font-display text-4xl">{question.title}</h1>
              <p className="text-xl">{question.prompt}</p>
              <p className="text-sm text-muted">{question.hint} A foto escolhida aparece junto com a resposta.</p>
              {linkedPhoto ? (
                <figure className="overflow-hidden rounded-3xl bg-white">
                  <img src={linkedPhoto.src} alt="" className="h-64 w-full object-cover" />
                  <figcaption className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="font-extrabold">Foto desta pergunta</span>
                    <button className="font-bold text-berry" onClick={() => update({ answers: withAnswers(question.id, { photoId: "" }) })}>
                      Desvincular
                    </button>
                  </figcaption>
                </figure>
              ) : (
                <label className="soft-card flex h-48 cursor-pointer flex-col items-center justify-center rounded-3xl border-dashed text-center">
                  <span className="font-extrabold text-berry">Escolher a foto desta pergunta</span>
                  <span className="mt-1 text-sm text-muted">Ela abre junto com a resposta</span>
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      void uploadQuestionPhoto(question.id, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
              {gift.photos.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {gift.photos.map((photo) => (
                    <button
                      key={photo.id}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl ${photo.id === currentAnswer.photoId ? "ring-2 ring-berry ring-offset-2" : "opacity-80"}`}
                      onClick={() => update({ answers: withAnswers(question.id, { photoId: photo.id }) })}
                      aria-label={`Usar foto em ${question.title}`}
                    >
                      <img src={photo.src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
              <label className="inline-flex cursor-pointer font-bold text-berry">
                Enviar outra foto
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    void uploadQuestionPhoto(question.id, e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              {error ? <p className="font-bold text-berry">{error}</p> : null}
              <textarea
                className="field min-h-40"
                value={answer}
                placeholder={question.placeholder}
                onChange={(e) => update({ answers: withAnswers(question.id, { text: e.target.value }) })}
              />
              <PhraseSuggestions
                key={question.id}
                suggestions={questionSuggestions(question.id)}
                value={answer}
                onPick={(text) => update({ answers: withAnswers(question.id, { text }) })}
              />
              <div className="flex gap-3">
                <button
                  className="rounded-full px-4 py-3 font-bold text-muted"
                  onClick={() => {
                    if (questionIndex === 0) setStep(3);
                    else setQuestionIndex((value) => value - 1);
                  }}
                >
                  Anterior
                </button>
                {questionIndex < QUESTIONS.length - 1 ? (
                  <button className="btn-primary" onClick={() => setQuestionIndex((value) => value + 1)}>
                    Próxima pergunta
                  </button>
                ) : (
                  <button className="btn-primary" onClick={() => (editId ? setHub(true) : setStep(5))}>
                    {editId ? "Voltar à revisão" : "Ir para a carta"}
                  </button>
                )}
              </div>
            </section>
          ) : null}

          {step === 5 ? (
            <section className="mt-4 space-y-4">
              <h1 className="font-display text-4xl">A carta. A parte que emociona.</h1>
              <p className="text-muted">Escreve como se fosse um áudio que você nunca teve coragem de mandar.</p>
              <textarea
                className="field min-h-56"
                value={gift.letter}
                onChange={(e) => update({ letter: e.target.value })}
                placeholder="Maya, eu podia te dar qualquer coisa hoje..."
              />
              <PhraseSuggestions
                suggestions={letterSuggestions(gift.authorName, gift.recipientName)}
                value={gift.letter}
                onPick={(letter) => update({ letter })}
              />
            </section>
          ) : null}

          {step === 6 ? (
            <section className="mt-4 space-y-4">
              <h1 className="font-display text-4xl">Liberar o recado</h1>
              <p className="text-muted">
                {isComplimentaryEmail(user?.email)
                  ? "Sua conta libera o recado sem pagamento. O QR fica no seu painel para sempre."
                  : `${BRAND.priceLabel} uma vez. Cria sua conta, paga, e o QR fica no seu painel para sempre.`}
              </p>
              {user ? (
                <div className="soft-card rounded-3xl p-5">
                  <p className="text-sm font-bold text-muted">Conectado como</p>
                  <p className="font-extrabold">{user.email}</p>
                  <button className="mt-3 text-sm font-bold text-berry" onClick={() => void signOutUser()}>
                    Usar outro e-mail
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-extrabold ${authMode === "signup" ? "bg-berry text-white" : "bg-white"}`}
                      onClick={() => setAuthMode("signup")}
                    >
                      Criar conta
                    </button>
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-extrabold ${authMode === "login" ? "bg-berry text-white" : "bg-white"}`}
                      onClick={() => setAuthMode("login")}
                    >
                      Já tenho conta
                    </button>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold">E-mail</span>
                    <input
                      className="field"
                      type="email"
                      value={gift.email}
                      onChange={(e) => update({ email: e.target.value })}
                      placeholder="voce@email.com"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold">Senha</span>
                    <input
                      className="field"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </label>
                </>
              )}
              <div className="soft-card rounded-3xl p-5">
                <p className="font-extrabold">{gift.authorName} → {gift.recipientName}</p>
                <p className="text-sm text-muted">
                  {gift.photos.length} fotos · {answers.filter((item) => item.photoId && gift.photos.some((photo) => photo.id === item.photoId)).length}/4 perguntas com foto · {gift.letter.trim() ? "carta pronta" : "falta a carta"}
                </p>
              </div>
              {error ? <p className="font-bold text-berry">{error}</p> : null}
              <button className="btn-primary w-full" disabled={busy} onClick={() => void checkout()}>
                {busy
                  ? isComplimentaryEmail(user?.email)
                    ? "Liberando..."
                    : "Abrindo pagamento..."
                  : isComplimentaryEmail(user?.email)
                    ? "Liberar e gerar QR"
                    : `Pagar ${BRAND.priceLabel} e gerar QR`}
              </button>
              {isComplimentaryEmail(user?.email) ? null : (
                <p className="text-center text-sm text-muted">Pix e cartão via Mercado Pago. Sem mensalidade.</p>
              )}
            </section>
          ) : null}

          {step !== 4 && step !== 6 ? (
            <div className="mt-8 flex items-center justify-between">
              <button
                className="font-bold text-muted"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                disabled={step === 0}
              >
                Voltar
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setError("");
                  if (editId) setHub(true);
                  else setStep((value) => Math.min(STEPS.length - 1, value + 1));
                }}
              >
                {editId ? "Voltar à revisão" : "Continuar"}
              </button>
            </div>
          ) : null}

          {step === 6 ? (
            <button className="mt-4 font-bold text-muted" onClick={() => (editId ? setHub(true) : setStep(5))}>
              {editId ? "Voltar à revisão" : "Voltar e revisar"}
            </button>
          ) : null}
        </main>
      )}
    </div>
  );
}
