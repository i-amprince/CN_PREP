// Flashcards and quiz questions for all 21 chapters.
// Card: [front, back]. Quiz: { q, o: [4 options], a: index of the correct option, e: one-line explanation }.
import * as u02 from './u0-u2.js';
import * as u3 from './u3.js';
import * as u4 from './u4.js';
import * as u56 from './u5-u6.js';
import { CHAPTERS } from '../chapters.js';

const all = { ...u02, ...u3, ...u4, ...u56 };
export const QA = Object.fromEntries(CHAPTERS.map((c) => [c.id, all[c.id] || { cards: [], quiz: [] }]));
