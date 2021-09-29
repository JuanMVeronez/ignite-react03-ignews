import styles from './styles.module.scss'

type SubscribeButtonProps = {
  productId: string;
}

export function SubscribeButton({productId}: SubscribeButtonProps) {
  return (
    <button 
      type="button"
      className={styles.subscribeButton}
    >
      Subscribe now
    </button>
  )
}