import { chatgptApi } from '../libs/chatgptApi';
import { Controller, Ctx } from '../types/controller';

export const test: Controller = (router) => {
  router.get('/api/test', async (ctx: Ctx) => {
    console.log('开始对话');
    let chat = await chatgptApi.sendMessage(
      '你好，说一说近一个月发生了哪些有趣的事情',
      {
        onProgress: (msg) => {
          console.log(msg);
        },
      }
    );
    ctx.body = 'ok';
  });
};
