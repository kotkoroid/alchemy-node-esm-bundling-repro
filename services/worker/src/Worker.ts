import * as Cloudflare from 'alchemy/Cloudflare';
import * as Effect from 'effect/Effect';
import { MESSAGE, config } from '@repro/shared';

export default class Worker extends Cloudflare.Worker<Worker>()(
  'repro-worker',
  { main: import.meta.path },
  Effect.gen(function* () {
    return {
      fetch: Effect.gen(function* () {
        return new Response(`${MESSAGE} — ${config.greeting}`);
      }),
    };
  }),
) {}
