import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Plus, Mail, Settings, LogOut, Crown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface PixKey {
  id: string
  email: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
}

interface Order {
  id: string
  plan_type: 'single' | 'five_pack'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const [pixKeys, setPixKeys] = useState<PixKey[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyEmail, setNewKeyEmail] = useState('')
  const [creatingKey, setCreatingKey] = useState(false)

  const fetchUserData = useCallback(async () => {
    if (!user) return

    try {
      // Fetch Pix keys
      const { data: keys, error: keysError } = await supabase
        .from('pix_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (keysError) throw keysError
      setPixKeys(keys || [])

      // Fetch orders
      const { data: userOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError
      setOrders(userOrders || [])
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user, fetchUserData])

  const createPixKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyEmail.trim() || !user) return

    // Validate email format
    const emailRegex = /^[^\s@]+$/
    if (!emailRegex.test(newKeyEmail)) {
      toast.error('Use apenas a parte antes do @ (ex: joao.silva)')
      return
    }

    setCreatingKey(true)
    try {
      const { data, error } = await supabase
        .from('pix_keys')
        .insert({
          user_id: user.id,
          email: `${newKeyEmail}@chavepix.club`,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      setPixKeys(prev => [data, ...prev])
      setNewKeyEmail('')
      toast.success('Chave Pix criada com sucesso!')
    } catch (error: any) {
      console.error('Error creating Pix key:', error)
      if (error.code === '23505') {
        toast.error('Esta chave já existe. Escolha outro nome.')
      } else {
        toast.error('Erro ao criar chave Pix')
      }
    } finally {
      setCreatingKey(false)
    }
  }

  const getAvailableKeys = () => {
    const completedOrders = orders.filter(order => order.status === 'completed')
    const totalKeys = completedOrders.reduce((sum, order) => {
      return sum + (order.plan_type === 'single' ? 1 : 5)
    }, 0)
    return totalKeys - pixKeys.length
  }

  const availableKeys = getAvailableKeys()

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
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Chave Pix Club</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Olá, {user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chaves Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pixKeys.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chaves Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{availableKeys}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter(o => o.status === 'completed').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Create New Key */}
        {availableKeys > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Criar Nova Chave Pix
              </CardTitle>
              <CardDescription>
                Você tem {availableKeys} chave(s) disponível(is) para criar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createPixKey} className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="email" className="sr-only">Email</Label>
                  <div className="flex">
                    <Input
                      id="email"
                      placeholder="seu.nome"
                      value={newKeyEmail}
                      onChange={(e) => setNewKeyEmail(e.target.value)}
                      className="rounded-r-none"
                      required
                    />
                    <div className="bg-muted border border-l-0 rounded-r-md px-3 flex items-center text-sm text-muted-foreground">
                      @chavepix.club
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={creatingKey}>
                  {creatingKey ? 'Criando...' : 'Criar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Pix Keys List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Suas Chaves Pix
            </CardTitle>
            <CardDescription>
              Gerencie suas chaves Pix personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pixKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma chave Pix criada ainda</p>
                {availableKeys === 0 && (
                  <p className="text-sm mt-2">Compre um plano para criar suas chaves personalizadas</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {pixKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-mono font-medium">{key.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Criada em {new Date(key.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                      {key.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Histórico de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum pedido encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {order.plan_type === 'single' ? '1 Chave Pix' : '5 Chaves Pix'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')} • R$ {order.amount}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        order.status === 'completed' ? 'default' : 
                        order.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {order.status === 'completed' ? 'Concluído' : 
                       order.status === 'pending' ? 'Pendente' : 'Falhou'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}