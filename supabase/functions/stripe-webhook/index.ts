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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      throw new Error('Missing signature or webhook secret')
    }

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    console.log('Received event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { orderId, userId, planType } = session.metadata || {}

        if (!orderId || !userId || !planType) {
          console.error('Missing metadata in session:', session.metadata)
          break
        }

        // Update order status to completed
        const { error: orderError } = await supabaseClient
          .from('orders')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .eq('user_id', userId)

        if (orderError) {
          console.error('Error updating order:', orderError)
          break
        }

        console.log(`Order ${orderId} marked as completed for user ${userId}`)
        break
      }



      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { orderId, userId } = session.metadata || {}

        if (!orderId || !userId) {
          console.error('Missing metadata in session:', session.metadata)
          break
        }

        // Update order status to failed
        const { error: orderError } = await supabaseClient
          .from('orders')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .eq('user_id', userId)

        if (orderError) {
          console.error('Error updating failed order:', orderError)
          break
        }

        console.log(`Order ${orderId} marked as failed for user ${userId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})