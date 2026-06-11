// ── Model routing & context relevance for /api/chat ──────────────────────────

const STOP_WORDS = new Set([
  'this','that','with','have','will','what','when','where','which','your',
  'from','they','been','more','also','into','just','some','than','then',
  'them','these','those','were','does','about','their','there','here',
  'very','would','could','should','cant','dont','isnt','wasnt','the',
  'and','for','are','but','not','you','all','can','her','was','one',
  'our','out','had','has','its','him','his','how','who','did','get',
])

const GREETING_RE = /^(hi+|hello|hey|thanks|thank you|ok|okay|yes|no|sure|bye|goodbye|cool|nice|great|got it|makes sense|sounds good|perfect|awesome|interesting|i see|okay cool)[\s!?.]*$/i

const COMPLEX_RE = /\b(derive|prove mathematically|implement from scratch|system design|architecture of|comprehensive analysis|research on|step by step implementation|deep dive|walk me through the entire|thoroughly explain the internals)\b/i

// ── Route by plan ─────────────────────────────────────────────────────────────
//
//  free     : always haiku
//  pro      : haiku  |  complex → sonnet
//  own_key  : haiku  |  complex → sonnet
//  summary  : always gpt-4o-mini (handled in chat.js via isSummary flag)

export function routeModel(lastMessage, plan) {
  const isComplex = lastMessage.length > 500 || COMPLEX_RE.test(lastMessage)

  if (plan === 'pro' || plan === 'own_key') {
    if (isComplex) return { provider: 'anthropic', model: 'claude-sonnet-4-6' }
  }

  return { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' }
}

// ── Detect if a message is unrelated to prior context ────────────────────────
// Returns true if the new message should be answered without any history.

export function isOffTopic(newMessage, priorMessages) {
  if (!priorMessages || priorMessages.length === 0) return false

  // Only strip history when the user explicitly signals a topic change.
  // Keyword-overlap heuristics are unreliable: follow-up instructions like
  // "build svg visuals" or "show me a design" share no words with their topic.
  return /\b(different (question|topic)|unrelated to|new question|forget (that|it)|on another note|switching topics|change of subject|random question|completely different|nothing to do with)\b/i.test(newMessage)
}
