import {
  appendCourseCardToAssistantMessage,
  appendTextToAssistantMessage,
  createAssistantRoundMessage,
  createUserTextMessage,
  failAssistantMessage,
  finishAssistantMessage,
} from './messageAdapter';

export const startRound = (messages, userText) => {
  const userMsg = createUserTextMessage(userText);
  const assistantMsg = createAssistantRoundMessage();
  return [...messages, userMsg, assistantMsg];
};

export const applyTextChunk = (messages, chunk) => {
  if (messages.length === 0) {
    return messages;
  }

  const lastMsg = messages[messages.length - 1];
  if (lastMsg.role !== 'assistant') {
    return messages;
  }

  const updatedMsg = appendTextToAssistantMessage(lastMsg, chunk);
  return [...messages.slice(0, -1), updatedMsg];
};

export const applyCourseCard = (messages, payload) => {
  if (messages.length === 0) {
    return messages;
  }

  const lastMsg = messages[messages.length - 1];
  if (lastMsg.role !== 'assistant') {
    return messages;
  }

  const updatedMsg = appendCourseCardToAssistantMessage(lastMsg, payload);
  return [...messages.slice(0, -1), updatedMsg];
};

export const finishRound = (messages) => {
  if (messages.length === 0) {
    return messages;
  }

  const lastMsg = messages[messages.length - 1];
  if (lastMsg.role !== 'assistant') {
    return messages;
  }

  const updatedMsg = finishAssistantMessage(lastMsg);
  return [...messages.slice(0, -1), updatedMsg];
};

export const failRound = (messages, errorMessage) => {
  if (messages.length === 0) {
    return messages;
  }

  const lastMsg = messages[messages.length - 1];
  if (lastMsg.role !== 'assistant') {
    return messages;
  }

  const updatedMsg = failAssistantMessage(lastMsg, errorMessage);
  return [...messages.slice(0, -1), updatedMsg];
};
