import Router from 'koa-router';
import { test } from './test';
import { main as mainCtrl } from './main';

export function main(router: Router<any, {}>) {
  test(router);
  mainCtrl(router);
}
