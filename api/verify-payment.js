import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Limits TBD — will update when plans are finalised
const PLAN_LIMITS = {
  basic: { messages_limit: 999999, docs_limit: 999999 },
  pro:   { messages_limit: 999999, docs_limit: 999999 },
  power: { messages_limit: 999999, docs_limit: 999999 },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
    return res.status(400).json({ error: 'Missing payment fields' })
  }

  if (!PLAN_LIMITS[plan]) {
    return res.status(400).json({ error: `Invalid plan: ${plan}` })
  }

  // Verify HMAC — Razorpay signs "order_id|payment_id" with key_secret
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSig !== razorpay_signature) {
    console.warn(`[verify-payment] Signature mismatch user=${user.id.slice(0,8)}`)
    return res.status(400).json({ error: 'Payment verification failed' })
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ plan, ...PLAN_LIMITS[plan] })
    .eq('id', user.id)

  if (updateError) {
    console.error('[verify-payment] Profile update failed:', updateError)
    return res.status(500).json({ error: 'Profile update failed' })
  }

  await supabase.from('usage_events').insert({
    user_id: user.id,
    event_type: 'plan_upgrade',
    metadata: { plan, order_id: razorpay_order_id, payment_id: razorpay_payment_id },
  })

  console.log(`[verify-payment] user=${user.id.slice(0,8)} upgraded to ${plan} payment=${razorpay_payment_id}`)

  res.json({ success: true, plan })
}
