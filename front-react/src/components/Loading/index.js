import styles from './Loading.module.css';

export default function Loading({ message = "Carregando..." }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
