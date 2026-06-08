// Simple header-based auth — replace with your real auth system when available.
// Frontend sends x-user-id and x-user-plan with every request.
export function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'] || req.body?.userId;
  const userPlan = req.headers['x-user-plan'] || req.body?.userPlan || 'free';
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' });
  req.userId = userId;
  req.userPlan = userPlan;
  next();
}
