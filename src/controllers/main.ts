import { Controller, Ctx } from '../types/controller';

export const main: Controller = (router) => {
  router.get('/api/main', async (ctx: Ctx) => {
    ctx.body = 'ok';
  });
};
