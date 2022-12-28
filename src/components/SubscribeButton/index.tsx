import { signIn, useSession } from 'next-auth/react';
import { api } from '../../services/api';
import { getStripeJS } from '../../services/stripe-js';
import styles from './styles.module.scss';

interface SubscribeButtonProps{
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  
  //Primeiramente devemos checar se o usuário está logado
  const session = useSession()
  async function handleSubscribe() {
    if (!session) {
      signIn('github')
      return;
    }
    //Caso esteja logado, devemos criar a checkout session
    try {
      const response = await api.post('/subscribe')
      const { sessionId } = response.data;
      const stripe = await getStripeJS();
      await stripe.redirectToCheckout({sessionId})
      
    } catch (error) {
      alert(error.message)
    }

  }
  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}