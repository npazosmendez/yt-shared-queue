import { Request } from 'express';
import { Queue } from '../model/queue';

// Credits : https://boltsource.io/blog/Request-Context-with-TypeScript-and-express/

export default class Context {
  private static _bindings = new WeakMap<Request, Context>();

  constructor (public queue : Queue) {}

  static bind (req: Request, q: Queue) : Context {
    const ctx = new Context(q);
    Context._bindings.set(req, ctx);
    return ctx;
  }

  static get (req: Request) : Context {
    const res = Context._bindings.get(req);
    if (res === undefined) throw new Error("No context for request.");
    return res;
  }
}