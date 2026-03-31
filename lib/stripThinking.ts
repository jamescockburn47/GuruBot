// lib/stripThinking.ts
export function stripThinking(text: string | null | undefined): string {
  if (!text) return ''
  // This completely hides <think> blocks and any unclosed <think> blocks during streaming seamlessly.
  return text.replace(/<think>[\s\S]*?(?:<\/think>\n?|$)/g, '').replace(/^\s+/, '')
}
