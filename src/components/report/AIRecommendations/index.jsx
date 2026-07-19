import { useNavigate } from "react-router-dom";

import styles from "./AIRecommendations.module.css";

export default function AIRecommendations({ data }) {
  const navigate = useNavigate();

  const handleCheckDetails = () => {
    navigate("/analysis");
  };

  return (
    <div className={styles.aiCard}>
      <div className={styles.aiHeader}>
        <div className={styles.aiIcon}>
          ✨
        </div>

        <h3>
          {data.title}
        </h3>
      </div>

      <p className={styles.aiText}>
        Based on your

        <span>
          {" "}
          “{data.keyword}”
        </span>

        in

        <strong>
          {" "}
          {data.topic}
        </strong>

        , we recommend:{" "}

        {data.text}
      </p>

      <button
        className={styles.aiBtn}
        onClick={handleCheckDetails}
      >
        {data.buttonText}
      </button>
    </div>
  );
}