import fs from 'fs-extra';
import path from 'path';
import { markdownToHtml } from '@yuri2/markdown-parser';
import {
  getChatTaskById,
  newChatTask,
  NewChatTaskParams,
} from '../libs/chatgptApi';
import { Controller, Ctx } from '../types/controller';

export const main: Controller = (router) => {
  router.get('/', async (ctx: Ctx) => {
    const readme = await fs.readFile(
      path.resolve(__dirname, '../../README.md'),
      'utf-8'
    );
    const md = await markdownToHtml(readme);
    ctx.body = md;
  });

  router.post('/api/main/new-chat-task', async (ctx: Ctx) => {
    console.log(ctx.request.body.prompt);
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
      if (snapId) {
        if (chatTask.snapId === snapId) {
          // 命中缓存，不需要返回完整的实体
          ctx.body = { code: 3, msg: 'cached' };
        } else {
          // 未命中缓存，返回完整的实体
          ctx.body = { code: 2, msg: 'updated', data: chatTask };
        }
      } else {
        // 未声明缓存，返回完整的实体
        ctx.body = { code: 1, msg: 'found', data: chatTask };
      }
    } else {
      // 未找到
      ctx.body = { code: 0, msg: 'not found' };
    }
  });
};
