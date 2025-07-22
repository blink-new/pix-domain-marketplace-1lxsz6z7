import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion'
import { 
  Shield, 
  Zap, 
  Crown, 
  ArrowRight, 
  Mail, 
  Lock,
  MessageCircle,
  Menu,
  X
} from 'lucide-react'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { AuthModal } from './components/auth/AuthModal'
import { PricingSection } from './components/PricingSection'
import { CheckoutModal } from './components/CheckoutModal'
import { Dashboard } from './components/Dashboard'
import { PlanType } from './lib/stripe'
import { Toaster } from './components/ui/toaster'

const HomePage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const { user, loading } = useAuth()

  const benefits = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Privacidade Total',
      description: 'Mantenha seu email pessoal protegido usando o domínio chavepix.club para suas chaves Pix.'
    },
    {
      icon: <Crown className="h-8 w-8 text-accent" />,
      title: 'Status Premium',
      description: 'Demonstre profissionalismo com uma chave Pix exclusiva do Chave Pix Club.'
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: 'Fácil de Lembrar',
      description: 'Domínio chavepix.club é intuitivo e seus clientes nunca vão esquecer.'
    },
    {
      icon: <Lock className="h-8 w-8 text-accent" />,
      title: 'Segurança BACEN',
      description: 'Totalmente compatível com as normas do Banco Central do Brasil.'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Escolha seu Plano',
      description: 'Selecione entre 1 chave (R$ 49) ou 5 chaves (R$ 99) no domínio chavepix.club.'
    },
    {
      number: '02',
      title: 'Realize o Pagamento',
      description: 'Pagamento seguro via Stripe. Ativação instantânea após confirmação.'
    },
    {
      number: '03',
      title: 'Configure suas Chaves',
      description: 'Use nosso painel para criar suas chaves Pix personalizadas.'
    },
    {
      number: '04',
      title: 'Registre no Banco',
      description: 'Cadastre sua nova chave Pix no seu banco ou instituição financeira.'
    },
    {
      number: '05',
      title: 'Comece a Usar',
      description: 'Receba pagamentos com sua chave Pix personalizada e profissional.'
    }
  ]

  const faqs = [
    {
      question: 'Como funciona o domínio chavepix.club?',
      answer: 'O chavepix.club é nosso domínio exclusivo para chaves Pix personalizadas. Por exemplo, ao invés de usar "joao@gmail.com", você pode usar "joao@chavepix.club". O sistema redireciona automaticamente para seu email real, mantendo sua privacidade.'
    },
    {
      question: 'É seguro usar o domínio chavepix.club para Pix?',
      answer: 'Sim, é totalmente seguro. Nosso domínio segue todas as normas do Banco Central e usa criptografia SSL. Além disso, você mantém controle total sobre sua chave e pode alterá-la a qualquer momento.'
    },
    {
      question: 'Posso usar em qualquer banco?',
      answer: 'Sim! Nossa solução é compatível com todos os bancos e instituições financeiras que oferecem Pix no Brasil. Basta cadastrar sua chave personalizada normalmente no app do seu banco.'
    },
    {
      question: 'Qual a diferença entre os planos?',
      answer: 'O plano de 1 chave (R$ 49) é perfeito para uso pessoal. O plano de 5 chaves (R$ 99) é ideal para pequenos negócios ou quem precisa de múltiplas chaves. Para volumes maiores ou domínios alternativos, entre em contato conosco.'
    },
    {
      question: 'Posso cancelar ou alterar minha chave depois?',
      answer: 'Sim, você pode gerenciar suas chaves através do nosso painel. Para alterações ou cancelamentos, entre em contato com nosso suporte.'
    }
  ]

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handlePlanSelect = (planType: PlanType) => {
    setSelectedPlan(planType)
    setCheckoutModalOpen(true)
  }

  const handleAuthRequired = () => {
    setAuthMode('signup')
    setAuthModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Chave Pix Club</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#como-funciona" className="text-sm font-medium hover:text-primary transition-colors">
              Como Funciona
            </a>
            <a href="#planos" className="text-sm font-medium hover:text-primary transition-colors">
              Planos
            </a>
            <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
              FAQ
            </a>
            {user ? (
              <Button asChild size="sm">
                <a href="/dashboard">Dashboard</a>
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => handleAuthClick('signin')}>
                  Entrar
                </Button>
                <Button size="sm" onClick={() => handleAuthClick('signup')}>
                  Criar Conta
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <a href="#como-funciona" className="block text-sm font-medium hover:text-primary transition-colors">
                Como Funciona
              </a>
              <a href="#planos" className="block text-sm font-medium hover:text-primary transition-colors">
                Planos
              </a>
              <a href="#faq" className="block text-sm font-medium hover:text-primary transition-colors">
                FAQ
              </a>
              {user ? (
                <Button asChild size="sm" className="w-full">
                  <a href="/dashboard">Dashboard</a>
                </Button>
              ) : (
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => handleAuthClick('signin')}>
                    Entrar
                  </Button>
                  <Button size="sm" onClick={() => handleAuthClick('signup')}>
                    Criar Conta
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
            🇧🇷 Domínio Exclusivo chavepix.club
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Chaves Pix Personalizadas
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transforme suas transações Pix com o domínio exclusivo <strong>chavepix.club</strong>. 
            Mais privacidade, profissionalismo e facilidade para seus clientes lembrarem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8" onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}>
              Ver Planos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}>
              Como Funciona
            </Button>
          </div>

          {/* Example */}
          <div className="bg-card border rounded-lg p-6 max-w-md mx-auto">
            <p className="text-sm text-muted-foreground mb-2">Exemplo de chave Pix personalizada:</p>
            <div className="flex items-center justify-center space-x-2 text-lg font-mono">
              <Mail className="h-5 w-5 text-primary" />
              <span>seu.nome@<span className="text-primary font-bold">chavepix.club</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que escolher o Chave Pix Club?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubra as vantagens de ter uma chave Pix única e profissional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como funciona em 5 passos simples
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Do plano à sua primeira transação Pix personalizada
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground mx-auto mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection 
        onSelectPlan={handlePlanSelect}
        isAuthenticated={!!user}
        onAuthRequired={handleAuthRequired}
      />

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-muted-foreground">
              Tire suas dúvidas sobre o Chave Pix Club
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para ter sua chave Pix personalizada?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se ao Chave Pix Club e tenha uma chave Pix única e profissional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}>
              Ver Planos
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <MessageCircle className="mr-2 h-5 w-5" />
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Chave Pix Club</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Chaves Pix personalizadas com o domínio exclusivo chavepix.club. Mais privacidade e profissionalismo para suas transações.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#como-funciona" className="hover:text-primary transition-colors">Como Funciona</a></li>
                <li><a href="#planos" className="hover:text-primary transition-colors">Planos</a></li>
                <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">WhatsApp</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Email</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Chave Pix Club. Todos os direitos reservados. Serviço em conformidade com as normas do Banco Central do Brasil.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        mode={authMode} 
      />
      
      <CheckoutModal 
        isOpen={checkoutModalOpen} 
        onClose={() => setCheckoutModalOpen(false)} 
        planType={selectedPlan} 
      />
    </div>
  )
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  )
}

export default App