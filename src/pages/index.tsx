import Head from 'next/head'
import { GetServerSideProps, GetStaticProps } from 'next'

import { SubscribeButton } from '../components/SubscribeButton'
import { stripe } from '../services/stripe'

import styles from './home.module.scss'

type HomeProps = {
  product: {
    id: string;
    amount: string;
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>  
          </p>

          <SubscribeButton productId={product.id}/>
        </section>

        <img src="/assets/avatar.svg" alt="Girl coding" />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  // esse ID eh pego dentro da pagina do produto no stripe
  const price = await stripe.prices.retrieve('price_1Jf0QvE7PJSyWQMSi97Ac1WQ', {
    expand: ['product'] // isso faz com que todas as infos do produto sejam repassadas dentro do objeto product
  })
  
  const product = {
    priceId: price.id,
    // o valor eh salvo em centavos, por isso o / 100
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100)
  }

  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24 // 1day // a pagina eh gerada novamente a cada 1 dia
  }
}