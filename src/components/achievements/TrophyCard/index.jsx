import { Trophy } from "lucide-react";

import styles from "./TrophyCard.module.css";

export default function TrophyCard({ certificationName }) {
  return (
    <div className={styles.trophyCard} aria-label={certificationName}>
      <Trophy size={76} strokeWidth={3.2} />
    </div>
  );
}
