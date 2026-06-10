import { createClient } from '@supabase/supabase-js'

const PLAN_AMOUNTS = {
  basic: 19900,  // ₹199
  pro:   39900,  // ₹399
  power: 79900,  // ₹799
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

  const { plan } = req.body
  const amount = PLAN_AMOUNTS[plan]
  if (!amount) return res.status(400).json({ error: `Invalid plan: ${plan}` })

  const credentials = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString('base64')

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt: `nav_${plan}_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: { user_id: user.id, plan, email: user.email },
    }),
  })

  const order = await response.json()
  if (!response.ok) {
    console.error('[create-order] Razorpay error:', order)
    return res.status(500).json({ error: order.error?.description || 'Failed to create order' })
  }

  console.log(`[create-order] user=${user.id.slice(0,8)} plan=${plan} order=${order.id}`)

  res.json({
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: process.env.RAZORPAY_KEY_ID,
    plan,
  })
}
