import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const { orderId, planType, amount, userEmail } = await req.json()

    if (!orderId || !planType || !amount || !userEmail) {
      throw new Error('Missing required parameters')
    }

    // Get user from JWT
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Map plan types to Stripe product IDs for one-time payments
    const productData = {
      single: {
        name: '1 Chave Pix Personalizada',
        description: 'Domínio chavepix.club - 1 chave Pix personalizada',
        amount: 4900 // R$ 49.00 in cents
      },
      five_pack: {
        name: '5 Chaves Pix Personalizadas', 
        description: 'Domínio chavepix.club - 5 chaves Pix personalizadas',
        amount: 9900 // R$ 99.00 in cents
      }
    }

    const product = productData[planType as keyof typeof productData]
    if (!product) {
      throw new Error(`Invalid plan type: ${planType}`)
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`,
      metadata: {
        orderId,
        userId: user.id,
        planType,
      },
    })

    // Update order with Stripe session ID
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ stripe_payment_intent_id: session.id })
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})