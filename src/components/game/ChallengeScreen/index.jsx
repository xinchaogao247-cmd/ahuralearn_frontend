import { useEffect, useState } from "react";

import { getChallengeQuestions } from "../../../api/game/game";

import styles from "./ChallengeScreen.module.css";

export default function ChallengeScreen({
  courseId,
  selectedGame,
  onFinish,
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchQuestions = async () => {
      if (!courseId || Number.isNaN(Number(courseId))) {
        setQuestions([]);
        setLoading(false);
        setErrorMessage("Course ID is missing.");
        return;
      }

      if (!selectedGame?.gameCode) {
        setQuestions([]);
        setLoading(false);
        setErrorMessage("Game code is missing.");
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getChallengeQuestions(
          courseId,
          selectedGame.gameCode
        );

        console.log(
          "getChallengeQuestions response =",
          response
        );

        let questionList = [];

        if (Array.isArray(response)) {
          questionList = response;
        } else if (Array.isArray(response?.data)) {
          questionList = response.data;
        } else if (Array.isArray(response?.data?.data)) {
          questionList = response.data.data;
        }

        console.log(
          "parsed challenge questions =",
          questionList
        );

        if (!cancelled) {
          setQuestions(questionList);
          setCurrentIndex(0);
          setSelectedAnswer("");
          setShowResult(false);
          setAnswers([]);
        }
      } catch (error) {
        console.error(
          "Failed to load challenge questions:",
          error
        );

        const message =
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.data?.msg ||
          error?.data?.message ||
          error?.message ||
          "Failed to load challenge questions.";

        if (!cancelled) {
          setQuestions([]);
          setErrorMessage(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchQuestions();

    return () => {
      cancelled = true;
    };
  }, [courseId, selectedGame?.gameCode]);

  const currentQuestion =
    questions[currentIndex] ?? null;

  const handleAnswer = (option) => {
    if (!currentQuestion || showResult) {
      return;
    }

    const isCorrect =
      option === currentQuestion.answer;

    setSelectedAnswer(option);
    setShowResult(true);

    setAnswers((prev) => [
      ...prev,
      {
        questionId:
          currentQuestion.id ??
          `${selectedGame?.gameCode}-${currentIndex}`,
        selectedAnswer: option,
        correct: isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    const isLastQuestion =
      currentIndex === questions.length - 1;

    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setShowResult(false);
      return;
    }

    const correctAnswers = answers.filter(
      (item) => item.correct
    ).length;

    const quizScore =
      questions.length > 0
        ? Math.round(
            (correctAnswers / questions.length) * 100
          )
        : 0;

    onFinish({
      quizScore,
      correctAnswers,
      totalQuestions: questions.length,
    });
  };

  if (loading) {
    return (
      <div className={styles.challengeScreen}>
        <div className={styles.challengeCard}>
          <h1>Loading Questions...</h1>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className={styles.challengeScreen}>
        <div className={styles.challengeCard}>
          <h1>Unable to Load Questions</h1>

          <p>{errorMessage}</p>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={() =>
              onFinish({
                quizScore: 0,
                correctAnswers: 0,
                totalQuestions: 0,
              })
            }
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={styles.challengeScreen}>
        <div className={styles.challengeCard}>
          <h1>No Questions Found</h1>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={() =>
              onFinish({
                quizScore: 0,
                correctAnswers: 0,
                totalQuestions: 0,
              })
            }
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const questionText =
    currentQuestion.prompt ??
    currentQuestion.question ??
    "Question unavailable";

  const options = Array.isArray(
    currentQuestion.options
  )
    ? currentQuestion.options
    : [];

  return (
    <div className={styles.challengeScreen}>
      <div className={styles.challengeCard}>
        <p className={styles.challengeLabel}>
          POST GAME CHALLENGE
        </p>

        <h1>{selectedGame?.title}</h1>

        <p className={styles.questionProgress}>
          Question {currentIndex + 1} /{" "}
          {questions.length}
        </p>

        <p className={styles.challengeQuestion}>
          {questionText}
        </p>

        <div className={styles.challengeOptions}>
          {options.map((option) => {
            const optionClass = showResult
              ? option === currentQuestion.answer
                ? styles.correct
                : option === selectedAnswer
                  ? styles.wrong
                  : ""
              : "";

            return (
              <button
                type="button"
                key={option}
                className={optionClass}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
              >
                {option}
              </button>
            );
          })}
        </div>

        {options.length === 0 && (
          <p>No answer options are available.</p>
        )}

        {showResult && (
          <div className={styles.explanationBox}>
            <strong>
              {selectedAnswer === currentQuestion.answer
                ? "Correct!"
                : "Incorrect"}
            </strong>

            {currentQuestion.explanation && (
              <p>{currentQuestion.explanation}</p>
            )}

            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleNext}
            >
              {currentIndex < questions.length - 1
                ? "Next Question →"
                : "View Result →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}