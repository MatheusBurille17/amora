"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GiftExperience } from "@/components/GiftExperience";
import { Logo } from "@/components/Logo";
import { BRAND } from "@/lib/brand";
import { isGiftComplete } from "@/lib/gift";
import { compressImage } from "@/lib/image";
import { QUESTIONS } from "@/lib/questions";
import { randomId } from "@/lib/slug";
import { getSessionEmail, getLocalGiftById, loadDraft, saveDraft, setSessionEmail, upsertLocalGift } from "@/lib/store";
import type { Gift } from "@/lib/types";
import { extractYoutubeId } from "@/lib/youtube";
import { useAuth } from "@/components/AuthProvider";
import { firebaseEnabled, getFirebaseAuth } from "@/lib/firebase/client";
import { getGiftRemote, saveGiftRemote } from "@/lib/firebase/gifts";
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
        if (isGiftComplete(draft)) setStep(6);
      }
      if (!draft.email) draft.email = user?.email ?? getSessionEmail();
      setGift(draft);
    })();
  }, [user, search, router]);

  function update(patch: Partial<Gift>) {
    setGift((current) => {
      if (!current) return current;
      return saveDraft({ ...current, ...patch });
    });
  }

  async function onPhotos(files: FileList | null) {
    if (!files || !gift) return;
    const remaining = 7 - gift.photos.length;
    const picked = Array.from(files).slice(0, remaining);
    const photos = [...gift.photos];
    for (const file of picked) {
      const src = await compressImage(file);
      photos.push({ id: randomId(6), src, caption: "" });
    }
    update({ photos });
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
      if (firebaseEnabled) {
        const auth = getFirebaseAuth();
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
      const data = await startCheckout(paidLocal.email, paidLocal.id);
      if (data.demo) {
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
  const answer = gift.answers.find((item) => item.id === question.id)?.text ?? "";

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
        <GiftExperience gift={gift} preview />
      ) : (
        <main className="mx-auto max-w-3xl px-5 pb-24">
          <div className="mb-6 h-2 overflow-hidden rounded-full bg-blush">
            <div className="h-full bg-berry transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-berry">
            {STEPS[step]} · {step + 1}/{STEPS.length}
          </p>

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
              <p className="text-muted">As melhores. Sem filtro de agência. Foto ruim e verdadeira ganha.</p>
              <label className="soft-card flex cursor-pointer flex-col items-center rounded-3xl border-dashed p-8 text-center">
                <span className="font-extrabold text-berry">Escolher fotos</span>
                <span className="text-sm text-muted">{gift.photos.length}/7</span>
                <input className="hidden" type="file" accept="image/*" multiple onChange={(e) => void onPhotos(e.target.files)} />
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gift.photos.map((photo) => (
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
                    <button
                      className="w-full py-2 text-sm font-bold text-berry"
                      onClick={() => update({ photos: gift.photos.filter((item) => item.id !== photo.id) })}
                    >
                      Tirar
                    </button>
                  </figure>
                ))}
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
              <h1 className="font-display text-4xl">{question.title}</h1>
              <p className="text-xl">{question.prompt}</p>
              <p className="text-sm text-muted">{question.hint}</p>
              <textarea
                className="field min-h-40"
                value={answer}
                placeholder={question.placeholder}
                onChange={(e) =>
                  update({
                    answers: gift.answers.map((item) =>
                      item.id === question.id ? { ...item, text: e.target.value } : item,
                    ),
                  })
                }
              />
              <div className="flex gap-3">
                <button
                  className="rounded-full px-4 py-3 font-bold text-muted"
                  onClick={() => setQuestionIndex((value) => Math.max(0, value - 1))}
                >
                  Anterior
                </button>
                {questionIndex < QUESTIONS.length - 1 ? (
                  <button className="btn-primary" onClick={() => setQuestionIndex((value) => value + 1)}>
                    Próxima pergunta
                  </button>
                ) : (
                  <button className="btn-primary" onClick={() => setStep(5)}>
                    Ir para a carta
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
            </section>
          ) : null}

          {step === 6 ? (
            <section className="mt-4 space-y-4">
              <h1 className="font-display text-4xl">Liberar o recado</h1>
              <p className="text-muted">
                {BRAND.priceLabel} uma vez. Cria sua conta, paga, e o QR fica no seu painel para sempre.
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
                  {gift.photos.length} fotos · {gift.letter.trim() ? "carta pronta" : "falta a carta"} · {gift.startDate || "sem data"}
                </p>
              </div>
              {error ? <p className="font-bold text-berry">{error}</p> : null}
              <button className="btn-primary w-full" disabled={busy} onClick={() => void checkout()}>
                {busy ? "Abrindo pagamento..." : `Pagar ${BRAND.priceLabel} e gerar QR`}
              </button>
              <p className="text-center text-sm text-muted">Pix e cartão via Mercado Pago. Sem mensalidade.</p>
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
              <button className="btn-primary" onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}>
                Continuar
              </button>
            </div>
          ) : null}

          {step === 6 ? (
            <button className="mt-4 font-bold text-muted" onClick={() => setStep(5)}>
              Voltar e revisar
            </button>
          ) : null}
        </main>
      )}
    </div>
  );
}
