import 'isomorphic-fetch';
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI, ChatMessage } from 'chatgpt';
import { ACCESS_TOKEN, API_KEY } from '../configs';
import { nanoid } from 'nanoid';

// ENV
const debug = false;
// const debug = true;
const useUnofficial = true;

// 原始API
export const chatgptApi = useUnofficial
  ? new ChatGPTUnofficialProxyAPI({
      accessToken: ACCESS_TOKEN,
      debug,
    })
  : new ChatGPTAPI({
      apiKey: API_KEY,
      debug,
    });

export interface ChatTask {
  taskId: string; // 任务ID
  snapId: string; // 快照ID，对于每一次onProgress返回的msg，赋予一个新的snapId。主要用于客户端查询最新的msg时比对是否可以使用缓存的msg
  status: 'pending' | 'rejected' | 'resolved'; // 任务状态
  msg?: ChatMessage;
}

// 任务集合，内存暂存，用于查询，自动垃圾清理
const tasks: {
  [taskId: string]: ChatTask;
} = {};

// 新聊天任务
export async function newChatTask(
  prompt: string,
  conversationId?: string,
  parentMessageId?: string
) {
  const taskId = nanoid();
  tasks[taskId] = {
    taskId,
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
          taskId,
          snapId: nanoid(),
          status: 'pending',
          msg,
        };
      },
    })
    .then(() => {
      Object.assign(tasks[taskId], {
        status: 'rejected',
        snapId: nanoid(),
      });
    })
    .catch(() => {
      Object.assign(tasks[taskId], {
        status: 'error',
        snapId: nanoid(),
      });
    })
    .finally(() => {
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
