import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./CodeFirewall.module.css";

import { getSyntaxShieldItems } from "../../../api/game/game";

const difficultyConfig = {
  Easy: {
    time: 45,
    fallSpeed: 3,
    spawnRate: 1100,
    baseScore: 100,
    penalty: 40,
    maxMistakes: 5,
  },
  Medium: {
    time: 35,
    fallSpeed: 5,
    spawnRate: 850,
    baseScore: 130,
    penalty: 70,
    maxMistakes: 4,
  },
  Hard: {
    time: 25,
    fallSpeed: 7,
    spawnRate: 650,
    baseScore: 180,
    penalty: 100,
    maxMistakes: 3,
  },
};

export default function CodeFirewall({
  courseId,
  onFinish,
  difficulty = "Easy",
}) {
  const config =
    difficultyConfig[difficulty] || difficultyConfig.Easy;

  const [items, setItems] = useState([]);
  const [fallingItems, setFallingItems] = useState([]);
  const [playerX, setPlayerX] = useState(50);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [time, setTime] = useState(config.time);
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const playerXRef = useRef(50);
  const scoreRef = useRef(0);
  const mistakesRef = useRef(0);

  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    mistakesRef.current = mistakes;
  }, [mistakes]);

  useEffect(() => {
    let cancelled = false;

    const fetchItems = async () => {
      if (!courseId) {
        setItems([]);
        setLoading(false);
        setErrorMessage("Course ID is missing.");
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getSyntaxShieldItems(courseId);

        console.log(
          "getSyntaxShieldItems response =",
          response
        );

        let itemList = [];

        if (Array.isArray(response)) {
          itemList = response;
        } else if (Array.isArray(response?.data)) {
          itemList = response.data;
        } else if (Array.isArray(response?.data?.data)) {
          itemList = response.data.data;
        }

        console.log("parsed syntax items =", itemList);

        if (!cancelled) {
          setItems(itemList);
        }
      } catch (error) {
        console.error(
          "Failed to load syntax shield items:",
          error
        );

        const message =
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.data?.msg ||
          error?.data?.message ||
          error?.message ||
          "Failed to load syntax shield data.";

        if (!cancelled) {
          setItems([]);
          setErrorMessage(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const safeItems = useMemo(() => {
    return items.filter(
      (item) => item?.type === "safe"
    );
  }, [items]);

  const bugItems = useMemo(() => {
    return items.filter(
      (item) => item?.type === "bug"
    );
  }, [items]);

  const finishGame = (
    finalScore = scoreRef.current,
    finalMistakes = mistakesRef.current
  ) => {
    onFinish({
      score: finalScore,
      accuracy: Math.max(
        0,
        100 - finalMistakes * 20
      ),
      rank:
        finalScore >= 1200
          ? "A+"
          : finalScore >= 800
            ? "A"
            : finalScore >= 400
              ? "B"
              : "C",
    });
  };

  const createFallingItem = () => {
    if (items.length === 0) {
      return null;
    }

    const isBug = Math.random() < 0.45;

    const sourceList =
      isBug && bugItems.length > 0
        ? bugItems
        : safeItems;

    const item =
      sourceList[
        Math.floor(Math.random() * sourceList.length)
      ] ||
      items[Math.floor(Math.random() * items.length)];

    if (!item) {
      return null;
    }

    return {
      id: Date.now() + Math.random(),
      text: item.text,
      type: item.type,
      x: Math.floor(Math.random() * 80) + 10,
      y: -10,
    };
  };

  const handleCorrectCatch = () => {
    const nextCombo = combo + 1;
    const gainedScore =
      config.baseScore * nextCombo;

    setCombo(nextCombo);
    setScore((prev) => prev + gainedScore);
    setFeedback(
      `Syntax Secured +${gainedScore}`
    );
  };

  const handleWrongCatch = () => {
    const nextMistakes =
      mistakesRef.current + 1;

    const nextScore = Math.max(
      0,
      scoreRef.current - config.penalty
    );

    setCombo(0);
    setMistakes(nextMistakes);
    setScore(nextScore);
    setFeedback(
      `Syntax Breach -${config.penalty}`
    );

    if (nextMistakes >= config.maxMistakes) {
      finishGame(nextScore, nextMistakes);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      return undefined;
    }

    const spawnTimer = setInterval(() => {
      const newItem = createFallingItem();

      if (!newItem) {
        return;
      }

      setFallingItems((prev) => [
        ...prev.slice(-8),
        newItem,
      ]);
    }, config.spawnRate);

    return () => clearInterval(spawnTimer);
  }, [
    items,
    safeItems,
    bugItems,
    config.spawnRate,
  ]);

  useEffect(() => {
    const moveTimer = setInterval(() => {
      setFallingItems((prev) => {
        const remainingItems = [];

        prev.forEach((item) => {
          const nextY =
            item.y + config.fallSpeed;

          const caught =
            nextY >= 82 &&
            Math.abs(
              item.x - playerXRef.current
            ) <= 10;

          const missed = nextY > 105;

          if (caught) {
            if (item.type === "safe") {
              handleCorrectCatch();
            } else {
              handleWrongCatch();
            }

            return;
          }

          if (missed) {
            if (item.type === "safe") {
              handleWrongCatch();
            }

            return;
          }

          remainingItems.push({
            ...item,
            y: nextY,
          });
        });

        return remainingItems;
      });
    }, 120);

    return () => clearInterval(moveTimer);
  }, [config.fallSpeed, combo]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a"
      ) {
        setPlayerX((prev) =>
          Math.max(8, prev - 7)
        );
      }

      if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
      ) {
        setPlayerX((prev) =>
          Math.min(92, prev + 7)
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const feedbackTimer = setTimeout(() => {
      setFeedback("");
    }, 700);

    return () => clearTimeout(feedbackTimer);
  }, [feedback]);

  if (loading) {
    return (
      <div className={styles.syntaxShield}>
        <div className={styles.shieldArena}>
          Loading syntax shield data...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className={styles.syntaxShield}>
        <div className={styles.shieldArena}>
          {errorMessage}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.syntaxShield}>
        <div className={styles.shieldArena}>
          No syntax shield items are available
          for this course.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.syntaxShield}>
      <div className={styles.shieldHeader}>
        <span>SYNTAX SHIELD</span>

        <div className={styles.shieldStats}>
          <strong>
            Difficulty: {difficulty}
          </strong>

          <strong>Score: {score}</strong>

          <strong>Combo: x{combo}</strong>

          <strong>
            Breaches: {mistakes}/
            {config.maxMistakes}
          </strong>

          <strong>Time: {time}s</strong>
        </div>
      </div>

      <div className={styles.shieldArena}>
        {fallingItems.map((item) => (
          <div
            key={item.id}
            className={
              item.type === "safe"
                ? styles.safeToken
                : styles.bugToken
            }
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
          >
            {item.text}
          </div>
        ))}

        <div
          className={styles.shieldPlayer}
          style={{
            left: `${playerX}%`,
          }}
        >
          SHIELD
        </div>

        {feedback && (
          <div
            className={
              feedback.startsWith(
                "Syntax Secured"
              )
                ? styles.correctFeedback
                : styles.wrongFeedback
            }
          >
            {feedback}
          </div>
        )}
      </div>

      <div className={styles.shieldLegend}>
        <span className={styles.safeText}>
          Catch valid syntax.
        </span>

        <span className={styles.bugText}>
          Avoid invalid syntax.
        </span>

        <span>
          Use ← → or A / D to move.
        </span>
      </div>
    </div>
  );
}