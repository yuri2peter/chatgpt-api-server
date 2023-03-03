import 'isomorphic-fetch';
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI, ChatMessage } from 'chatgpt';
import { ACCESS_TOKEN, API_KEY } from '../configs';
import { nanoid } from 'nanoid';

// ENV
const debug = false;
// const debug = true;

// const useUnofficial = false;
const useUnofficial = true;

// types
// 聊天任务
export interface ChatTask {
  id: string; // 任务ID
  snapId: string; // 快照ID，对于每一次onProgress返回的msg，赋予一个新的snapId。主要用于客户端查询最新的msg时比对是否可以使用缓存的msg
  status: 'pending' | 'rejected' | 'resolved'; // 任务状态
  msg?: ChatMessage;
}

// 创建聊天任务的参数
export interface NewChatTaskParams {
  prompt: string;
  conversationId?: string;
  parentMessageId?: string;
}

// 任务集合，内存暂存，用于查询
const tasks: {
  [taskId: string]: ChatTask;
} = {};

// 原始API
const chatgptApi = useUnofficial
  ? new ChatGPTUnofficialProxyAPI({
      accessToken: ACCESS_TOKEN,
      debug,
    })
  : new ChatGPTAPI({
      apiKey: API_KEY,
      debug,
    });

// 新聊天任务
export async function newChatTask({
  prompt,
  conversationId,
  parentMessageId,
}: NewChatTaskParams) {
  const taskId = nanoid();
  tasks[taskId] = {
    id: taskId,
    snapId: nanoid(),
    status: 'rejected',
  };
  chatgptApi
    .sendMessage(prompt, {
      ...(conversationId ? { conversationId } : {}),
      ...(parentMessageId ? { parentMessageId } : {}),
      timeoutMs: 60 * 1000, // 60s超时
      onProgress: (msg) => {
        tasks[taskId] = {
          id: taskId,
          snapId: nanoid(),
          status: 'pending',
          msg,
        };
      },
    })
    .then(() => {
      tasks[taskId] &&
        Object.assign(tasks[taskId], {
          status: 'rejected',
          snapId: nanoid(),
        });
    })
    .catch(() => {
      tasks[taskId] &&
        Object.assign(tasks[taskId], {
          status: 'error',
          snapId: nanoid(),
        });
    })
    .finally(() => {
      // 任务的自动清理
      setTimeout(() => {
        delete tasks[taskId];
      }, 3600 * 1000); // 3600s 删除记录
    });
  return taskId;
}

// 查询聊天任务
export function getChatTaskById(taskId: string): ChatTask | undefined {
  return tasks[taskId];
}
