import * as Alchemy from 'alchemy';
import * as Cloudflare from 'alchemy/Cloudflare';
import * as Effect from 'effect/Effect';
import Worker from './services/worker/src/Worker.ts';

export default Alchemy.Stack(
  'repro',
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const frontend = yield* Cloudflare.Vite('Frontend', {
      rootDir: './apps/frontend',
    });
    const worker = yield* Worker;
    return { url: frontend.url, workerUrl: worker.url };
  }),
);
