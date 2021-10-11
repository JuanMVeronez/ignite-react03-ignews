import { NextApiRequest, NextApiResponse } from "next"
import { Readable } from "stream"
import Stripe from "stripe"
import { stripe } from "../../services/stripe"
import { saveSubscription } from "./_lib/manageSubscription"

async function buffer(readable: Readable) {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks)
}

// Utilizado para que o conteudo não seja parseado (esperando formato json)
// e sim aja como uma streaming
export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

const webhooks = async (req: NextApiRequest, res: NextApiResponse) => {
  if(req.method === "POST") {
    const buf = await buffer(req)
    const secret = req.headers['stripe-signature'] // é o header que o stripe define para validação de acesso

    let event: Stripe.Event

    try {
      // esse event somente vai ter sucesso caso o secret for igual ao salvo no env, caso contrário terá erro
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      return res.status(400).send(`Stripe error: ${err.message}`)
    }
    
    const { type } = event
    
    if (!relevantEvents.has(type)) {
      return res.json({ received: true })
    }

    try {
      switch (type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription

          await saveSubscription(
            subscription.id, 
            subscription.customer.toString(),
            type === 'customer.subscription.created',
          )

          break
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session
          
          await saveSubscription(
            checkoutSession.subscription.toString(),
            checkoutSession.customer.toString(),
            true
          )
          
          break
        default:
          throw new Error('Unhandled event.')
      }
    } catch (err) {
      return res.json({ error: 'Webhook handler failed.' })
    }


    res.status(200).send('ok')
  } else {
    res.setHeader("Allow", "POST")
    res.status(405).end("Method not allowed")
  }


}

export default webhooks