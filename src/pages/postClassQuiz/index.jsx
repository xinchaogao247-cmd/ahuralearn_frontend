import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getQuizDetails, submitQuiz } from '../../api/course/quiz';
import styles from './postClassQuiz.module.css';
import { showToast } from '../../components/common/toast';
import quizErrorImg from '../../assets/images/emptyStates/quiz_error.png';

import QuestionCard from '../../components/postClassQuiz/QuestionCard';
import ProgressPanel from '../../components/postClassQuiz/ProgressPanel';
import NavigationButtons from '../../components/postClassQuiz/NavigationButtons';
import SubmitConfirmModal from '../../components/postClassQuiz/SubmitConfirmModal';

export default function PostClassQuiz() {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorState, setShowErrorState] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      setShowErrorState(false);
      const data = await getQuizDetails(sectionId);

      setQuestions(data);

      // Determine if Review Mode (if the first question has a userAnswer !== null)
      const isReview = data[0].userAnswer !== null;
      setIsReviewMode(isReview);

      if (!isReview) {
        // Active mode: initialize answers array
        const initAnswers = data.map(q => ({
          questionId: q.questionId,
          selectedOption: null,
          isFlagged: false
        }));
        setAnswers(initAnswers);
      } else {
        // Review mode: align answers with backend responses for navigation tracking
        const pastAnswers = data.map(q => ({
          questionId: q.questionId,
          selectedOption: q.userAnswer,
          isFlagged: false
        }));
        setAnswers(pastAnswers);
      }

    } catch (err) {
      showToast(err.message || "Failed to load quiz", "error");
      showErrorState(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sectionId) {
      fetchDetails();
    }
  }, [sectionId]);

  const handleOptionSelect = (qId, optionValue) => {
    if (isReviewMode) return;
    setAnswers(prev => prev.map(ans =>
      ans.questionId === qId ? (ans.selectedOption === optionValue ? { ...ans, selectedOption: null } : { ...ans, selectedOption: optionValue }) : ans
    ));
  };

  const handleToggleFlag = (qId) => {
    setAnswers(prev => prev.map(ans =>
      ans.questionId === qId ? { ...ans, isFlagged: !ans.isFlagged } : ans
    ));
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handleOpenSubmitModal = async () => {
    if (isReviewMode) return;

    const answeredCount = answers.filter(a => a.selectedOption).length;
    if (answeredCount < questions.length) {
      showToast(`You have ${questions.length - answeredCount} unanswered questions. Please answer them all before submitting!`, 'warning');
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);

      const payload = answers.map(a => ({
        questionId: a.questionId,
        userAnswer: a.selectedOption
      }));

      await submitQuiz(sectionId, payload);

      setIsModalOpen(false);
      // Navigate back to videoLearning
      showToast("Submission successful! Review your results.", "success");
      navigate(-1);
    } catch (err) {
      showToast(err.message || "Failed to submit quiz. Please try again.", "error");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <div className={styles.quizPage}><div className={styles.loadingWrapper}>Loading quiz details...</div></div>;
  }

  // empty state
  if (showErrorState || !questions || questions.length === 0) {
    return (
      <div className={styles.quizPage}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={handleGoBack}>
            <ArrowLeft size={20} />
            Back to lesson
          </button>
        </header>
        <div className={styles.emptyStateContainer}>
          <img src={quizErrorImg} alt="Quiz error" className={styles.emptyStateImage} />
          <p className={styles.emptyStateText}>Oops! We encountered an issue loading the quiz.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.questionId);
  const flaggedCount = answers.filter(a => a.isFlagged).length;

  return (
    <div className={styles.quizPage}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleGoBack}>
          <ArrowLeft size={20} />
          Back to lesson
        </button>
      </header>

      <main className={styles.mainContainer}>
        <div className={styles.leftCol}>
          <QuestionCard
            question={currentQuestion}
            currentIndex={currentIndex}
            currentAnswer={currentAnswer}
            isReviewMode={isReviewMode}
            onOptionSelect={handleOptionSelect}
            onToggleFlag={handleToggleFlag}
          >
            <NavigationButtons
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              onPrev={handlePrev}
              onNext={handleNext}
              onFinish={handleOpenSubmitModal}
              isReviewMode={isReviewMode}
              isRefetching={isSubmitting}
            />
          </QuestionCard>
        </div>

        <ProgressPanel
          questions={questions}
          answers={answers}
          currentIndex={currentIndex}
          isReviewMode={isReviewMode}
          onSelectQuestion={(idx) => setCurrentIndex(idx)}
          onSubmitQuiz={handleOpenSubmitModal}
        />
      </main>

      <SubmitConfirmModal
        isOpen={isModalOpen}
        flaggedCount={flaggedCount}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}
