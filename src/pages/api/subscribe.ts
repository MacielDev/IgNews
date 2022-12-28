import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { fauna } from '../../services/fauna'
import { stripe } from '../../services/stripe'
import { query } from 'faunadb'

type User = {
  ref: {
    id: string
  }
  data: {
    stripe_customer_id: string
  }
}

export default async (req: NextApiRequest, resp: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getSession({ req })

    const user = await fauna.query<User>(
      query.Get(
        query.Match(
          query.Index('user_by_email'),
          query.Casefold(session.user.email),
        ),
      ),
    )

    //Verificando se o usuário salvo no Fauna já possui "struipe_customer_id registrado"
    let customerId = user.data.stripe_customer_id
    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        //metadata
      })
      await fauna.query(
        query.Update(query.Ref(query.Collection('users'), user.ref.id), {
          data: {
            stripe_custumer_id: stripeCustomer.id,
          },
        }),
      )
      customerId = stripeCustomer.id
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: 'price_1MHEkECHc51teRNbfCIaOfQT',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    })

    return resp.status(200).json({ sessionId: stripeCheckoutSession.id })
  } else {
    resp.setHeader('Alow', 'POST')
    resp.status(405).end('Method not allowed')
  }
}
