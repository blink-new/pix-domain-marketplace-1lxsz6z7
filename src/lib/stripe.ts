import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key')
}

export const stripe = loadStripe(stripePublishableKey)

export const PLANS = {
  single: {
    id: 'single',
    name: '1 Chave Pix',
    price: 49,
    description: 'Perfeito para uso pessoal',
    features: [
      '1 chave Pix personalizada',
      'Domínio chavepix.club',
      'Suporte por email',
      'Configuração gratuita'
    ]
  },
  five_pack: {
    id: 'five_pack',
    name: '5 Chaves Pix',
    price: 99,
    description: 'Ideal para pequenos negócios',
    features: [
      '5 chaves Pix personalizadas',
      'Domínio chavepix.club',
      'Suporte prioritário',
      'Configuração gratuita',
      'Painel de gerenciamento'
    ]
  }
} as const

export type PlanType = keyof typeof PLANS