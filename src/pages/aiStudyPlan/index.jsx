import { useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

import GeneratedPlanPreview from "../../components/aiStudyPlan/GeneratedPlanPreview";
import PageShell from "../../components/profileLayout/PageShell";
import {
  generateAndSaveAIStudyPlan,
  sendAIStudyPlanMessageStream,
} from "../../api/ai/aiService";
import styles from "./AIStudyPlan.module.css";

const generatedAIStudyPlanKey = "ahuralearn:generatedAIStudyPlan";
const studyPlanFields = ["goal", "level", "availableTime", "weakness"];
const planQuestions = [
  "What is your learning goal?",
  "What is your current level?",
  "How much time can you study per week?",
  "What skill or topic do you want to improve?",
  "Great, I have enough information. Click Create My Study Plan to generate your plan.",
];


function formatAssistantMessageForDisplay(text = "") {
  const normalizedText = String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\u99C3\u657C|\u9241\u533D?|\u9241/g, "\n- ")
    .replace(/(?:\uD83D\uDD39|\u2705|\u2022)\s*/g, "\n- ")
    .replace(/\s+([?.!,;:])/g, "$1")
    .replace(/\*\*(.*?)\*\*\s*:/g, "\n\n**$1**\n")
    .replace(/\n{3,}/g, "\n\n");

  return normalizedText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !/^[-*]\s*$/.test(line))
    .join("\n")
    .trim();
}

function MessageText({ message }) {
  if (message.role === "user") {
    return message.text;
  }

  if (!message.text) {
    return "Thinking...";
  }

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p>{children}</p>,
        strong: ({ children }) => <strong>{children}</strong>,
        ul: ({ children }) => <ul>{children}</ul>,
        li: ({ children }) => <li>{children}</li>,
      }}
    >
      {formatAssistantMessageForDisplay(message.text)}
    </ReactMarkdown>
  );
}

function saveGeneratedAIStudyPlan(generatedPlan) {
  try {
    localStorage.setItem(generatedAIStudyPlanKey, JSON.stringify(generatedPlan));
  } catch (err) {
    console.warn("Failed to save generated AI study plan", err);
  }
}

function appendTextToMessage(messages, messageId, text) {
  return messages.map((message) =>
    message.id === messageId
      ? { ...message, text: `${message.text}${text}` }
      : message
  );
}

function replaceMessageText(messages, messageId, text) {
  return messages.map((message) =>
    message.id === messageId ? { ...message, text } : message
  );
}

export default function AIStudyPlan() {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [isPlanCollectionMode, setIsPlanCollectionMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [planForm, setPlanForm] = useState({
    goal: "",
    level: "",
    availableTime: "",
    weakness: "",
  });
  const [isResponding, setIsResponding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [previewHeight, setPreviewHeight] = useState(null);
  const messageIdRef = useRef(0);
  const previewCardRef = useRef(null);
  const chatListRef = useRef(null);

  useEffect(() => {
    const previewCard = previewCardRef.current;

    if (!previewCard) {
      return undefined;
    }

    const updatePreviewHeight = () => {
      setPreviewHeight(previewCard.getBoundingClientRect().height);
    };

    updatePreviewHeight();

    const resizeObserver = new ResizeObserver(updatePreviewHeight);
    resizeObserver.observe(previewCard);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const displayedMessages = messages;
  useEffect(() => {
    const chatList = chatListRef.current;

    if (!chatList) {
      return;
    }

    window.requestAnimationFrame(() => {
      chatList.scrollTo({
        top: chatList.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [displayedMessages, isResponding]);

  const addUserAnswer = async (answerText) => {
    const text = answerText.trim();

    if (!text || isResponding) {
      return;
    }

    const currentMessages = messages;
    messageIdRef.current += 1;
    const userMessageId = `user-${messageIdRef.current}`;
    messageIdRef.current += 1;
    const aiMessageId = `ai-${messageIdRef.current}`;
    const userMessage = {
      id: userMessageId,
      role: "user",
      text,
      meta: "You - Just now",
    };

    setMessages([...currentMessages, userMessage]);
    setAnswer("");

    if (isPlanCollectionMode && currentStep < studyPlanFields.length) {
      const field = studyPlanFields[currentStep];
      const nextStep = currentStep + 1;

      setPlanForm((current) => ({ ...current, [field]: text }));
      setCurrentStep(nextStep);
      setMessages((current) => [
        ...current,
        {
          id: aiMessageId,
          role: "ai",
          text: planQuestions[nextStep],
          meta: "AI Assistant - Just now",
        },
      ]);

      if (nextStep === studyPlanFields.length) {
        setIsPlanCollectionMode(false);
      }
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: aiMessageId,
        role: "ai",
        text: "",
        meta: "AI Assistant - Just now",
      },
    ]);
    setIsResponding(true);

    try {
      let receivedText = false;
      let streamError = "";

      await sendAIStudyPlanMessageStream(text, {
        onText: (chunk) => {
          receivedText = true;
          setMessages((current) => appendTextToMessage(current, aiMessageId, chunk));
        },
        onErrorEvent: (errorMessage) => {
          streamError =
            errorMessage ||
            "Sorry, the AI assistant is temporarily unavailable. Please try again later.";
          setMessages((current) =>
            replaceMessageText(current, aiMessageId, streamError)
          );
        },
      });

      if (!receivedText && !streamError) {
        setMessages((current) =>
          replaceMessageText(
            current,
            aiMessageId,
            "Sorry, I could not generate a response."
          )
        );
      }
    } catch (error) {
      console.error("AI chat request failed:", error);
      if (error.response) {
        console.error("AI chat response:", error.response.data);
      }
      setMessages((current) =>
        replaceMessageText(
          current,
          aiMessageId,
          "Sorry, the AI assistant is temporarily unavailable. Please try again later."
        )
      );
    } finally {
      setIsResponding(false);
    }
  };

  const handleSubmitAnswer = (event) => {
    event.preventDefault();
    addUserAnswer(answer);
  };

  const startPlanCollection = () => {
    messageIdRef.current += 1;
    setPlanForm({ goal: "", level: "", availableTime: "", weakness: "" });
    setCurrentStep(0);
    setIsPlanCollectionMode(true);
    setGenerationError("");
    setMessages((current) => [
      ...current,
      {
        id: `ai-${messageIdRef.current}`,
        role: "ai",
        text: planQuestions[0],
        meta: "AI Assistant - Just now",
      },
    ]);
  };

  const handleCreatePlan = async () => {
    try {
      setIsGenerating(true);
      setGenerationError("");
      setGeneratedPlan("");

      const response = await generateAndSaveAIStudyPlan(planForm);
      const createdPlan = response?.data?.data || response?.data || response;

      if (createdPlan) {
        saveGeneratedAIStudyPlan({
          createdAt: new Date().toISOString(),
          plan: createdPlan,
        });
        navigate("/learningPlan");
      } else {
        setGeneratedPlan("");
        setGenerationError("Failed to generate study plan.");
      }
    } catch (error) {
      console.error("Generate study plan failed:", error);
      if (error.response) {
        console.error("Generate response:", error.response.data);
      }
      setGeneratedPlan("");
      setGenerationError(
        "Failed to generate study plan. Please try again later."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const canSend = answer.trim().length > 0 && !isResponding;
  const canGenerate = studyPlanFields.every((field) => planForm[field].trim());

  return (
    <PageShell showSubNav={false}>
      <main className={styles.aiStudyPlanPage}>
        <section className={styles.pageHeader}>
          <h1>Build Your Study Plan</h1>
          <p>Let's tailor your learning journey with our AI architect.</p>
        </section>

        <section className={styles.builderLayout}>
          <div
            className={styles.chatCard}
            style={
              previewHeight
                ? { "--preview-card-height": `${previewHeight}px` }
                : undefined
            }
          >
            <div className={styles.chatList} ref={chatListRef}>
              {displayedMessages.map((message, index) => (
                <div
                  className={`${styles.messageRow} ${
                    message.role === "user" ? styles.userMessageRow : ""
                  }`}
                  key={`${message.role}-${index}`}
                >
                  {message.role === "ai" && (
                    <div className={styles.botIcon}>
                      <Bot size={18} strokeWidth={2.4} />
                    </div>
                  )}

                  <div>
                    <div
                      className={`${styles.messageBubble} ${
                        message.role === "user" ? styles.userBubble : ""
                      }`}
                    >
                      <MessageText message={message} />
                    </div>
                    <span className={styles.messageMeta}>{message.meta}</span>
                  </div>

                  {message.role === "user" && <div className={styles.userDot} />}
                </div>
              ))}

            </div>

            {!isPlanCollectionMode && !canGenerate && (
              <div className={styles.suggestionsBlock}>
                <span>Study Plan</span>
                <div className={styles.suggestionChips}>
                  <button type="button" onClick={startPlanCollection}>
                    Start Study Plan Setup
                  </button>
                </div>
              </div>
            )}

            <form className={styles.answerBar} onSubmit={handleSubmitAnswer}>
              <input
                disabled={isResponding}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Type your answer here..."
              />
              <button type="submit" aria-label="Send answer" disabled={!canSend}>
                <Send size={18} strokeWidth={2.6} />
              </button>
            </form>
          </div>

          <div ref={previewCardRef}>
            <GeneratedPlanPreview
              onCreatePlan={handleCreatePlan}
              plan={generatedPlan}
              isGenerating={isGenerating}
              generationError={generationError}
              canGenerate={canGenerate}
            />
          </div>
        </section>
      </main>
    </PageShell>
  );
}

