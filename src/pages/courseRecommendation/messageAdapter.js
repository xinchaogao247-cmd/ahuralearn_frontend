const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const createUserMessage = (content) => ({
  messageId: createId('user'),
  role: 'user',
  content,
  status: 'done',
});

const createAssistantMessage = (blocks = [], status = 'done') => ({
  messageId: createId('assistant'),
  role: 'assistant',
  blocks,
  status,
});

const createTextBlock = (content = '', status = 'done') => ({
  blockId: createId('text'),
  type: 'text',
  content,
  status,
});

const createCourseCardBlock = (payload) => ({
  blockId: createId('course'),
  type: 'course_card',
  payload,
  status: 'done',
});

const createErrorBlock = (content) => ({
  blockId: createId('error'),
  type: 'text',
  content,
  status: 'error',
});

const isNonEmptyText = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidCourseCardPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const { id, name, coverUrl, difficultyLevel } = payload;
  return Boolean(id || name || coverUrl || difficultyLevel);
};

const appendHistoryBlock = (assistantMessage, block) => {
  if (!assistantMessage || !block) {
    return;
  }

  if (block.type === 'text' && !isNonEmptyText(block.content)) {
    return;
  }

  if (block.type === 'course_card' && !isValidCourseCardPayload(block.payload)) {
    return;
  }

  assistantMessage.blocks.push(block);
};

export const normalizeHistoryMessages = (vos) => {
  if (!Array.isArray(vos) || vos.length === 0) {
    return [];
  }

  const messages = [];
  let currentAssistant = null;

  const pushAssistant = () => {
    if (currentAssistant && currentAssistant.blocks.length > 0) {
      messages.push(currentAssistant);
    }
    currentAssistant = null;
  };

  for (const vo of vos) {
    const role = vo.role || 'assistant';

    if (role === 'user') {
      pushAssistant();
      messages.push(createUserMessage(vo.content || ''));
      continue;
    }

    if (!currentAssistant) {
      currentAssistant = createAssistantMessage([], 'done');
    }

    if (vo.messageType === 'course_card') {
      appendHistoryBlock(currentAssistant, createCourseCardBlock(vo.payload || null));
      continue;
    }

    const textContent = typeof vo.content === 'string' ? vo.content : '';
    appendHistoryBlock(currentAssistant, createTextBlock(textContent, 'done'));
  }

  pushAssistant();
  return messages;
};

export const createUserTextMessage = (text) => createUserMessage(text);

export const createAssistantRoundMessage = () =>
  createAssistantMessage([createTextBlock('', 'streaming')], 'streaming');

export const appendTextToAssistantMessage = (message, chunk) => {
  const blocks = message.blocks ? [...message.blocks] : [];
  const lastBlock = blocks[blocks.length - 1];

  if (lastBlock && lastBlock.type === 'text' && lastBlock.status === 'streaming') {
    blocks[blocks.length - 1] = {
      ...lastBlock,
      content: (lastBlock.content || '') + chunk,
    };
  } else {
    blocks.push(createTextBlock(chunk, 'streaming'));
  }

  return {
    ...message,
    blocks,
    status: 'streaming',
  };
};

export const appendCourseCardToAssistantMessage = (message, payload) => {
  const blocks = message.blocks ? [...message.blocks] : [];
  const lastBlock = blocks[blocks.length - 1];

  if (lastBlock && lastBlock.type === 'text' && lastBlock.status === 'streaming') {
    blocks[blocks.length - 1] = {
      ...lastBlock,
      status: 'done',
    };
  }

  if (isValidCourseCardPayload(payload)) {
    blocks.push(createCourseCardBlock(payload));
  }

  return {
    ...message,
    blocks,
    status: 'streaming',
  };
};

export const finishAssistantMessage = (message) => {
  const blocks = message.blocks ? [...message.blocks] : [];
  const lastBlock = blocks[blocks.length - 1];

  if (lastBlock && lastBlock.type === 'text' && lastBlock.status === 'streaming') {
    blocks[blocks.length - 1] = {
      ...lastBlock,
      status: 'done',
    };
  }

  return {
    ...message,
    blocks,
    status: 'done',
  };
};

export const failAssistantMessage = (message, errorMessage) => {
  const blocks = message.blocks ? [...message.blocks] : [];
  const lastBlock = blocks[blocks.length - 1];

  if (lastBlock && lastBlock.type === 'text' && lastBlock.status === 'streaming') {
    if ((lastBlock.content || '').trim()) {
      blocks[blocks.length - 1] = {
        ...lastBlock,
        status: 'done',
      };
    } else {
      blocks.pop();
    }
  }

  blocks.push(createErrorBlock(errorMessage || "Sorry, I'm having trouble processing your request right now."));

  return {
    ...message,
    blocks,
    status: 'error',
  };
};
