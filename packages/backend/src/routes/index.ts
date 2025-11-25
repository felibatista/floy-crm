import { Router } from 'express';
import { Request, Response } from 'express';
import portalAuthRouter from './portal/auth'; // Added import

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', isPortal: req.isPortal, client: req.clientPortal?.name });
});

import clientsRouter from './admin/clients';

// Admin Routes (Only accessible if NOT a portal)
router.use('/admin', (req, res, next) => {
  if (req.isPortal) {
    return res.status(404).json({ error: 'Not found' });
  }
  next();
});

router.use('/admin/clients', clientsRouter);


// Portal Routes (Only accessible if IS a portal)
router.use('/portal', (req, res, next) => {
  if (!req.isPortal) {
    return res.status(404).json({ error: 'Not found' });
  }
  next();
});

router.use('/portal/auth', portalAuthRouter);

export default router;
