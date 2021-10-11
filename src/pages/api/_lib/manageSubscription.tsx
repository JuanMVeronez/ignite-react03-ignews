import { query as q } from 'faunadb'
import { stripe } from '../../../services/stripe';

import { fauna } from './../../../services/fauna';

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false,
) {
  const customerRef = await fauna.query(
    q.Select('ref', 
      q.Get(q.Match(
        q.Index('user_by_stripe_custumer_id'), customerId))
    ))

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const subscriptionData = {
      id: subscription.id,
      userId: customerRef,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
    }
    
    if (createAction) {
      // é definido dessa forma será feito insert de qualquer plataforma passando por qualquer um dos webhooks
      // assim não avendo duplicação de nenhuma forma
      await fauna.query(
        q.If(
          q.Not(q.Exists(q.Match(q.Index('subscription_by_id'), subscriptionId))),
          q.Create(q.Collection('subscriptions'), {
            data: subscriptionData
          }), 
          null
        )
      )
    } else {
      await fauna.query(
        q.Replace(
          q.Select('ref', q.Get(q.Match(q.Index('subscription_by_id'), subscriptionId))),
          { data: subscriptionData }  
        )
      )
    }
}