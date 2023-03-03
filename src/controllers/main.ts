import {
  getChatTaskById,
  newChatTask,
  NewChatTaskParams,
} from '../libs/chatgptApi';
import { Controller, Ctx } from '../types/controller';

export const main: Controller = (router) => {
  router.post('/api/main/new-chat-task', async (ctx: Ctx) => {
    const taskId = await newChatTask(ctx.request.body as NewChatTaskParams);
    ctx.body = { taskId };
  });

  router.post('/api/main/get-chat-task', async (ctx: Ctx) => {
    const { taskId, snapId } = ctx.request.body as {
      taskId: string;
      snapId?: string;
    };
    const chatTask = getChatTaskById(taskId);
    if (chatTask) {
      if (chatTask.snapId === snapId) {
        // 命中缓存，不需要返回完整的实体
        ctx.body = { code: 2, msg: 'cached' };
      } else {
        // 未命中缓存，返回完整的实体
        ctx.body = { code: 1, msg: 'updated', data: chatTask };
      }
    } else {
      // 未找到
      ctx.body = { code: 0, msg: 'not found' };
    }
  });
};
