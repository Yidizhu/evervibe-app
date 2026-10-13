import eve from './source/eve-service.cjs';
import chat from './source/gemini-chat.cjs';
import planning from './source/eve-planner.cjs';
import proactive from './source/eve-proactive.cjs';
import trial from './source/try-service.cjs';
import api from './source/api-handler.cjs';

// All credentials arrive at request runtime through the host's bindings.
export function createEverVibeRuntime(options = {}) {
  const { env = {}, fetch = globalThis.fetch, now = Date.now, catalogStore, allowedOrigins } = options;
  const qloo = eve.createEveService({ env, fetch, now });
  const gemini = chat.createGeminiService({ env, fetch });
  const planner = planning.createPlanner({ qloo, gemini, now });
  const checkIns = proactive.createProactive({ gemini });
  const tryService = trial.createTryService({ env, fetch, gemini, now, catalogStore });
  return api.createApiHandler({
    qloo, gemini, planner, proactive: checkIns, tryService,
    validateChat: chat.buildContext, allowedOrigins, now,
  });
}
