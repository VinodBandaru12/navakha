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
//  free     : simple(≤12w) → mini  |  rest → haiku  |  never sonnet
//  own_key  : simple(≤5w)  → mini  |  rest → haiku  |  super-complex → sonnet
//  pro      : simple(≤8w)  → mini  |  medium → haiku |  complex → sonnet

export function routeModel(lastMessage, plan) {
  const lower      = lastMessage.trim().toLowerCase()
  const wordCount  = lower.split(/\s+/).filter(Boolean).length
  const isGreeting = GREETING_RE.test(lower)
  const isComplex  = wordCount > 100 || COMPLEX_RE.test(lastMessage)

  if (plan === 'free') {
    const isSimple = wordCount <= 12 || isGreeting
    return isSimple
      ? { provider: 'openai',     model: 'gpt-4o-mini' }
      : { provider: 'anthropic',  model: 'claude-haiku-4-5-20251001' }
  }

  if (plan === 'pro') {
    const isSimple = wordCount <= 8 || isGreeting
    if (isSimple)   return { provider: 'openai',    model: 'gpt-4o-mini' }
    if (isComplex)  return { provider: 'anthropic', model: 'claude-sonnet-4-6' }
                    return { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' }
  }

  if (plan === 'own_key') {
    const isSimple = wordCount <= 5 || isGreeting
    if (isSimple)   return { provider: 'openai',    model: 'gpt-4o-mini' }
    if (isComplex)  return { provider: 'anthropic', model: 'claude-sonnet-4-6' }
                    return { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' }
  }

  // unknown plan — safe default
  return { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' }
}

// ── Detect if a message is unrelated to prior context ────────────────────────
// Returns true if the new message should be answered without any history.

export function isOffTopic(newMessage, priorMessages) {
  if (!priorMessages || priorMessages.length === 0) return false

  // Explicit topic-shift phrases the user typed
  if (/\b(different (question|topic)|by the way|unrelated to|new question|forget (that|it)|on another note|switching topics|change of subject|random question|completely different|nothing to do with)\b/i.test(newMessage)) {
    return true
  }

  const contextText = priorMessages.slice(-6).map(m => m.content).join(' ')

  const meaningful = str =>
    (str.toLowerCase().match(/\b[a-z]{4,}\b/g) || []).filter(w => !STOP_WORDS.has(w))

  const newWords  = new Set(meaningful(newMessage))
  const ctxWords  = new Set(meaningful(contextText))

  if (newWords.size === 0 || ctxWords.size === 0) return false

  const overlap = [...newWords].filter(w => ctxWords.has(w)).length
  return (overlap / newWords.size) < 0.1
}
