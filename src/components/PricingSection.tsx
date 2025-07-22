import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Check, Crown, Mail, MessageCircle } from 'lucide-react'
import { PLANS, PlanType } from '../lib/stripe'

interface PricingSectionProps {
  onSelectPlan: (planType: PlanType) => void
  isAuthenticated: boolean
  onAuthRequired: () => void
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  onSelectPlan, 
  isAuthenticated, 
  onAuthRequired 
}) => {
  const handlePlanSelect = (planType: PlanType) => {
    if (!isAuthenticated) {
      onAuthRequired()
      return
    }
    onSelectPlan(planType)
  }

  return (
    <section id="planos" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
            💰 Planos Acessíveis
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha seu plano no Chave Pix Club
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Domínio exclusivo <strong>chavepix.club</strong> para suas chaves Pix personalizadas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Single Plan */}
          <Card className="relative hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{PLANS.single.name}</CardTitle>
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardDescription className="text-lg">
                {PLANS.single.description}
              </CardDescription>
              <div className="text-4xl font-bold text-primary">
                R$ {PLANS.single.price}
                <span className="text-lg font-normal text-muted-foreground">/único</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {PLANS.single.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handlePlanSelect('single')}
              >
                Escolher Plano
              </Button>
            </CardContent>
          </Card>

          {/* Five Pack Plan */}
          <Card className="relative hover:shadow-lg transition-shadow border-primary">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
              Mais Popular
            </Badge>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{PLANS.five_pack.name}</CardTitle>
                <Crown className="h-8 w-8 text-accent" />
              </div>
              <CardDescription className="text-lg">
                {PLANS.five_pack.description}
              </CardDescription>
              <div className="text-4xl font-bold text-primary">
                R$ {PLANS.five_pack.price}
                <span className="text-lg font-normal text-muted-foreground">/único</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Apenas R$ {(PLANS.five_pack.price / 5).toFixed(0)} por chave
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {PLANS.five_pack.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handlePlanSelect('five_pack')}
              >
                Escolher Plano
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise CTA */}
        <Card className="max-w-2xl mx-auto text-center bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Precisa de mais chaves ou domínio personalizado?</CardTitle>
            <CardDescription className="text-lg">
              Para empresas, volumes maiores ou domínios alternativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Falar no WhatsApp
              </Button>
              <Button variant="outline" size="lg" className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Enviar Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}