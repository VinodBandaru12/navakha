import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Disable Vercel body parser — we need raw bytes for HMAC verification
export const config = {
  api: { bodyParser: false },
}

async function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.setEncoding('utf8')
    req.on('data', chunk => { data += chunk })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await readRawBody(req)
  const signature = req.headers['x-razorpay-signature']

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')

  if (signature !== expectedSig) {
    console.warn('[webhook] Invalid Razorpay signature')
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const payload = JSON.parse(rawBody)
  const event = payload.event

  console.log(`[webhook] event=${event}`)

  if (event === 'payment.captured') {
    const payment = payload.payload?.payment?.entity
    const userId = payment?.notes?.user_id

    if (!userId) {
      console.warn('[webhook] payment.captured missing user_id in notes')
      return res.json({ received: true })
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single()

    const upgradedPlan = payment.notes?.plan || 'basic'
    const validPlans = ['basic', 'pro', 'power']
    const planName = validPlans.includes(upgradedPlan) ? upgradedPlan : 'basic'

    if (!validPlans.includes(profile?.plan)) {
      await supabase
        .from('profiles')
        .update({ plan: planName, messages_limit: 999999, docs_limit: 999999 })
        .eq('id', userId)

      console.log(`[webhook] user=${userId.slice(0,8)} upgraded to ${planName} via webhook`)
    }
  }

  res.json({ received: true })
}
