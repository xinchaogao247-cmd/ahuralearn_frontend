import { useEffect, useState } from "react";

import styles from "./InstructionScreen.module.css";

import { getGameInstruction } from "../../../api/game/game";

export default function InstructionScreen({
  courseId,
  selectedGame,
  selectedDifficulty,
  onStart,
  onBack,
}) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchInstruction = async () => {
      if (!courseId) {
        setLoading(false);
        setErrorMessage("Course ID is missing.");
        return;
      }

      if (!selectedGame?.gameCode) {
        setLoading(false);
        setErrorMessage("Game code is missing.");
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");
        setInfo(null);

        const response = await getGameInstruction(
          courseId,
          selectedGame.gameCode
        );

        console.log(
          "getGameInstruction response =",
          response
        );

        /*
         * 兼容以下返回结构：
         *
         * 1. request 拦截器直接返回 data：
         *    {
         *      controls: "...",
         *      goal: "...",
         *      tips: "..."
         *    }
         *
         * 2. 返回业务 Result：
         *    {
         *      code: 200,
         *      msg: "success",
         *      data: {
         *        controls: "...",
         *        goal: "...",
         *        tips: "..."
         *      }
         *    }
         *
         * 3. 返回完整 Axios response：
         *    {
         *      data: {
         *        code: 200,
         *        data: {
         *          controls: "...",
         *          goal: "...",
         *          tips: "..."
         *        }
         *      }
         *    }
         */
        const instructionData =
          response?.data?.data ??
          response?.data ??
          response;

        if (!instructionData) {
          throw new Error(
            "Game instruction data is empty."
          );
        }

        if (!cancelled) {
          setInfo(instructionData);
        }
      } catch (error) {
        console.error(
          "Failed to load game instruction:",
          error
        );

        const message =
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.data?.msg ||
          error?.data?.message ||
          error?.message ||
          "Failed to load game instruction.";

        if (!cancelled) {
          setInfo(null);
          setErrorMessage(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchInstruction();

    return () => {
      cancelled = true;
    };
  }, [courseId, selectedGame?.gameCode]);

  if (loading) {
    return (
      <div className={styles.instructionScreen}>
        <div className={styles.instructionCard}>
          <p className={styles.instructionLabel}>
            TRAINING BRIEF
          </p>

          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className={styles.instructionScreen}>
        <div className={styles.instructionCard}>
          <p className={styles.instructionLabel}>
            TRAINING BRIEF
          </p>

          <h1>Unable to Load</h1>

          <p>{errorMessage}</p>

          <button
            type="button"
            className={styles.backSelectBtn}
            onClick={onBack}
          >
            ← Back to Game Select
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.instructionScreen}>
      <div className={styles.instructionCard}>
        <p className={styles.instructionLabel}>
          TRAINING BRIEF
        </p>

        <h1>{selectedGame?.title}</h1>

        <div className={styles.instructionGrid}>
          <div className={styles.instructionItem}>
            <span>Controls</span>
            <strong>
              {info?.controls || "Not available"}
            </strong>
          </div>

          <div className={styles.instructionItem}>
            <span>Objective</span>
            <strong>
              {info?.goal || "Not available"}
            </strong>
          </div>

          <div className={styles.instructionItem}>
            <span>Tips</span>
            <strong>
              {info?.tips || "Not available"}
            </strong>
          </div>

          <div className={styles.instructionItem}>
            <span>Difficulty</span>
            <strong>
              {selectedDifficulty || "Easy"}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className={styles.launchBtn}
          onClick={onStart}
        >
          Launch Training →
        </button>

        <button
          type="button"
          className={styles.backSelectBtn}
          onClick={onBack}
        >
          ← Back to Game Select
        </button>
      </div>
    </div>
  );
}