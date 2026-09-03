import { Router } from 'express';
import multer from 'multer';
import {
  authController,
  dashboardController,
  searchController,
  transactionController,
  reconciliationController,
  importController,
  aiController,
  forecastController,
  alertController,
  providerController,
  demoController,
} from '../controllers/api.controller';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Dashboard
router.get('/dashboard/summary', dashboardController.getSummary);
router.get('/dashboard/trends', dashboardController.getTrends);

// Global Search
router.get('/search', searchController.search);

// Transactions
router.get('/transactions', transactionController.getTransactions);
router.get('/transactions/:id', transactionController.getTransactionById);

// Reconciliation & Exceptions
router.get('/reconciliation', reconciliationController.getReconciliations);
router.get('/exceptions', reconciliationController.getExceptions);
router.get('/exceptions/:id', reconciliationController.getExceptionById);
router.post('/reconciliation/:id/review', reconciliationController.reviewException);

// Providers & CSV Import
router.get('/providers', providerController.getProviders);
router.get('/providers/:code', providerController.getProviderByCode);
router.post('/import/:provider', upload.single('file'), importController.importCSV);

// AI Finance Controller & Investigation
router.post('/ai/chat', aiController.chat);
router.post('/ai/investigate/:exceptionId', aiController.investigate);

// Forecast & Alerts
router.get('/forecast', forecastController.getForecast);
router.get('/alerts', alertController.getAlerts);

// Demo Mode Controls
router.post('/demo/reset', demoController.resetDemoData);

// Health check
router.get('/health', (req, res) => res.json({ status: 'HEALTHY', timestamp: new Date().toISOString() }));

export default router;
