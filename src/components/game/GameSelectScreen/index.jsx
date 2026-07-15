import { useEffect, useState } from "react";
import { getGames } from "../../../api/game/game";

import styles from "./GameSelectScreen.module.css";

export default function GameSelectScreen({
  courseId,
  onSelectGame,
  onBack,
}) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      if (!courseId || Number.isNaN(Number(courseId))) {
        setGames([]);
        setLoading(false);
        setErrorMessage("Course ID is missing.");
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getGames(courseId);

        console.log("getGames response =", response);

        /*
         * 兼容以下返回结构：
         *
         * 1. 直接返回数组
         *    [...]
         *
         * 2. request 拦截器返回业务对象
         *    {
         *      code: 200,
         *      msg: "success",
         *      data: [...]
         *    }
         *
         * 3. 返回完整 Axios response
         *    {
         *      data: {
         *        code: 200,
         *        msg: "success",
         *        data: [...]
         *      }
         *    }
         */
        let gameList = [];

        if (Array.isArray(response)) {
          gameList = response;
        } else if (Array.isArray(response?.data)) {
          gameList = response.data;
        } else if (Array.isArray(response?.data?.data)) {
          gameList = response.data.data;
        }

        console.log("parsed gameList =", gameList);

        if (!cancelled) {
          setGames(gameList);
        }
      } catch (error) {
        console.error("Failed to load games:", error);

        const message =
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.data?.msg ||
          error?.data?.message ||
          error?.message ||
          "Failed to load games.";

        if (!cancelled) {
          setGames([]);
          setErrorMessage(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  return (
    <div className={styles.gameSelectScreen}>
      <button
        type="button"
        className={styles.backSelectScreenBtn}
        onClick={onBack}
      >
        ← Back
      </button>

      <div className={styles.selectHeader}>
        <p>AI TRAINING ARCADE</p>

        <h1>Choose Your Challenge</h1>

        <span>
          Select a mini game to train reaction,
          memory, logic, and decision-making.
        </span>
      </div>

      {loading && (
        <div className={styles.loadingState}>
          Loading games...
        </div>
      )}

      {!loading && errorMessage && (
        <div className={styles.errorState}>
          {errorMessage}
        </div>
      )}

      {!loading &&
        !errorMessage &&
        games.length === 0 && (
          <div className={styles.emptyState}>
            No games are currently available.
          </div>
        )}

      {!loading &&
        !errorMessage &&
        games.length > 0 && (
          <div className={styles.gameCardGrid}>
            {games.map((game) => (
              <button
                type="button"
                className={styles.gameCard}
                key={game.id ?? game.gameCode}
                onClick={() => onSelectGame(game)}
              >
                <div>
                  <div className={styles.gameIcon}>
                    {game.icon}
                  </div>

                  <div className={styles.gameInfo}>
                    <h2>{game.title}</h2>

                    <p>{game.description}</p>
                  </div>
                </div>

                <div className={styles.gameFooter}>
                  <strong>Start →</strong>
                </div>
              </button>
            ))}
          </div>
        )}
    </div>
  );
}