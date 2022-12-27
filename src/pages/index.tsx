import React from "react";

import Head from 'next/head'
import styles from './home.module.scss';
import { SubscribeButton } from "../components/SubscribeButton";
import { GetStaticProps } from "next";
import Stripe from "stripe";
import { stripe } from "../services/stripe";

interface HomeProps{
  product: {
    priceId: string,
    amount:number
  }
}

export default function Home({product}:HomeProps) {
  console.log(product)
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>Hey, wellcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get Access to all the publications<br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId}/>
        </section>
        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
   
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1MHEkECHc51teRNbfCIaOfQT', {
    expand:['product'] // Traz todos os dados do produto através da api do stripe
  })

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount/100),
  }
  return {
    props: {
      product
    },
    revalidate: 60 * 60 *24, // 24 hours
  }
}
