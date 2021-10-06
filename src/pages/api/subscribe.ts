import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { query as q } from 'faunadb';

import { stripe } from "../../services/stripe";
import { fauna } from './../../services/fauna';

type FaunaUser = {
  ref: {
    id: string
  }
  data: {
    stripe_custumer_id: undefined | string
  }
}

const createStripeCheckoutSession = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {

    const session = await getSession({ req })

    const user = await fauna.query<FaunaUser>(
      q.Get(q.Match(
        q.Index('user_by_email'), 
        q.Casefold(session.user.email)
      ))
    )

    let customerId = user.data.stripe_custumer_id

    if (!customerId) {
      const strípeCustomer = await stripe.customers.create({
        email: session.user.email
        // metadata
      })

      await fauna.query(
        q.Update(q.Ref(q.Collection('users'), user.ref.id), {
          data: {
            stripe_custumer_id: strípeCustomer.id
          }
        })
      )
  
      customerId = strípeCustomer.id
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {price: 'price_1Jf0QvE7PJSyWQMSi97Ac1WQ', quantity: 1},
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_API_SUCESSS_URL,
      cancel_url: process.env.STRIPE_API_CANCEL_URL
    })

    return res.status(200).json({
      sessionId: stripeCheckoutSession.id
    })
  } else {
    res.setHeader('Allow', 'POST');

    res.status(405).end('Method not allowed')
  }
}

export default createStripeCheckoutSession