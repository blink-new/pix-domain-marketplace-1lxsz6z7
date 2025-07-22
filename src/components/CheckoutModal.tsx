import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Check, CreditCard, Loader2, Shield } from 'lucide-react'
import { PLANS, PlanType } from '../lib/stripe'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  planType: PlanType | null
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, planType }) => {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  if (!planType) return null

  const plan = PLANS[planType]

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para continuar')
      return
    }

    setLoading(true)
    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          plan_type: planType,
          amount: plan.price,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          orderId: order.id,
          planType,
          amount: plan.price,
          userEmail: user.email
        }
      })

      if (error) throw error

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Finalizar Compra</DialogTitle>
          <DialogDescription>
            Confirme os detalhes do seu plano antes de prosseguir
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <Badge variant="secondary">{planType === 'five_pack' ? 'Mais Popular' : 'Básico'}</Badge>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary">R$ {plan.price}</span>
              </div>
              
              {planType === 'five_pack' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Apenas R$ {(plan.price / 5).toFixed(0)} por chave Pix
                </p>
              )}
            </CardContent>
          </Card>

          {/* Domain Info */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Seu domínio exclusivo:</h3>
                <div className="text-lg font-mono bg-background rounded-lg p-3 border">
                  seu.nome@<span className="text-primary font-bold">chavepix.club</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure suas chaves personalizadas após o pagamento
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Pagamento seguro processado pelo Stripe</span>
          </div>

          {/* Checkout Button */}
          <Button 
            onClick={handleCheckout} 
            disabled={loading} 
            className="w-full" 
            size="lg"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <CreditCard className="mr-2 h-4 w-4" />
            Pagar R$ {plan.price}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-primary hover:underline">Termos de Uso</a>{' '}
            e{' '}
            <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}