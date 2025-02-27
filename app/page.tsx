import Image from "next/image";
import styles from "./page.module.css";

export default function Home(props) {
  console.log('props', props);

  return (

      <div className={styles.page}>
        <main className={styles.main}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />

          <div className={styles.ctas}>
            main page. wow...
          </div>
        </main>
        <footer className={styles.footer}>

        </footer>
      </div>

  );
}
