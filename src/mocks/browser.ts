import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { socketLink } from './socket';

export const worker = setupWorker(...handlers, socketLink as any);
