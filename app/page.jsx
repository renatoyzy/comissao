import TextArea from "@/components/TextArea";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <TextArea />
      <h3>DFM Comissão (feito pelo Renato)</h3>
    </div>
  );
}
