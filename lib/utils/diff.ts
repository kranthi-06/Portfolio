import { diffWords, Change } from 'diff';

export function computeWordDiff(oldText: string, newText: string): Change[] {
  if (!oldText) return [{ value: newText, added: true }];
  if (!newText) return [{ value: oldText, removed: true }];
  return diffWords(oldText, newText);
}
