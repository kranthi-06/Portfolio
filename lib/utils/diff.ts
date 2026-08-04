import { diffWords, Change } from 'diff';

export function computeWordDiff(oldText: string, newText: string): Change[] {
  if (!oldText) return [{ value: newText, added: true, removed: false, count: 1 }] as Change[];
  if (!newText) return [{ value: oldText, added: false, removed: true, count: 1 }] as Change[];
  return diffWords(oldText, newText);
}
