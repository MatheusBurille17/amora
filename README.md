# Amora

Presente digital para casal: fotos, música, contador ao vivo, recado e QR Code. **R$ 19,90 vitalício**.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Sem Firebase e Mercado Pago, o checkout libera o recado em modo local para você testar o fluxo inteiro.

## Variáveis de ambiente

Copie `.env.example`. As credenciais de produção entram na Vercel:

- Firebase Auth + Firestore (sem Storage)
- Mercado Pago Access Token
- `NEXT_PUBLIC_APP_URL` com a URL HTTPS do site

## Stack

Next.js, Firebase (Auth/Firestore), Mercado Pago Checkout Pro.
