import styles from "./PlayScreen.module.css";

import CodeFirewall from "../CodeFirewall";
import KnowledgeDefense from "../KnowledgeDefense";
import MiniPacman from "../MiniPacman";
import MiniTetris from "../MiniTetris";

export default function PlayScreen({
  courseId,
  selectedGame,
  selectedDifficulty,
  onFinish,
  onBack,
}) {
  const gameCode = selectedGame?.gameCode;

  const renderGame = () => {
    if (gameCode === "code-firewall") {
      return (
        <CodeFirewall
          courseId={courseId}
          difficulty={selectedDifficulty}
          onFinish={onFinish}
        />
      );
    }

    if (gameCode === "concept-sorter") {
      return (
        <KnowledgeDefense
          courseId={courseId}
          difficulty={selectedDifficulty}
          onFinish={onFinish}
        />
      );
    }

    if (gameCode === "mini-pacman") {
      return (
        <MiniPacman
          courseId={courseId}
          difficulty={selectedDifficulty}
          onFinish={onFinish}
        />
      );
    }

    if (gameCode === "memory-matrix") {
      return (
        <MiniTetris
          courseId={courseId}
          difficulty={selectedDifficulty}
          onFinish={onFinish}
        />
      );
    }

    return (
      <div
        style={{
          color: "#ffffff",
          textAlign: "center",
          marginTop: "100px",
        }}
      >
        Game not found: {gameCode || "unknown"}
      </div>
    );
  };

  return (
    <div className={styles.playScreen}>
      <div className={styles.playHeader}>
        <button
          type="button"
          className={styles.backGameBtn}
          onClick={onBack}
        >
          ← Back to Select
        </button>

        <div>
          <p>SELECTED GAME</p>

          <h1>{selectedGame?.title}</h1>
        </div>
      </div>

      {renderGame()}
    </div>
  );
}