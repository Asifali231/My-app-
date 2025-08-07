import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertInvestmentSchema, insertWithdrawalSchema, insertDailyTaskSchema, jazzCashPaymentFormSchema } from "@shared/schema";
import { createJazzCashPayment, verifyJazzCashCallback, generateMerchantTransactionId } from "./jazzCashService";
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if the file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

interface AuthenticatedRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
    };
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const stats = await storage.getUserStats(userId);
      res.json({ ...user, ...stats });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Investment routes
  app.post('/api/jazzcash/invest', isAuthenticated, upload.single('screenshot'), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const data = insertInvestmentSchema.parse({
        ...req.body,
        userId,
        screenshotUrl: req.file ? `/uploads/${req.file.filename}` : null,
      });
      
      const investment = await storage.createInvestment(data);
      res.json({ message: "Investment request submitted successfully", investment });
    } catch (error) {
      console.error("Error creating investment:", error);
      res.status(400).json({ message: "Failed to create investment request" });
    }
  });

  app.get('/api/investments', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const investments = await storage.getInvestments(userId);
      res.json(investments);
    } catch (error) {
      console.error("Error fetching investments:", error);
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  // Withdrawal routes
  app.post('/api/jazzcash/withdraw', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isInvestor) {
        return res.status(400).json({ message: "Investment required before withdrawal" });
      }

      const currentBalance = parseFloat(user.balance || "0");
      const withdrawAmount = parseFloat(req.body.amount);

      if (currentBalance < 100) {
        return res.status(400).json({ message: "Minimum balance of $100 required for withdrawal" });
      }

      if (withdrawAmount > currentBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const data = insertWithdrawalSchema.parse({
        ...req.body,
        userId,
      });
      
      const withdrawal = await storage.createWithdrawal(data);
      res.json({ message: "Withdrawal request submitted successfully. Manual approval within 10 working days.", withdrawal });
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      res.status(400).json({ message: "Failed to create withdrawal request" });
    }
  });

  app.get('/api/withdrawals', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const withdrawals = await storage.getWithdrawals(userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  // Daily tasks routes
  app.get('/api/daily-tasks', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const today = new Date();
      let tasks = await storage.getDailyTasks(userId, today);

      // If no tasks exist for today, create them
      if (tasks.length === 0) {
        const defaultTasks = [
          { taskType: 'watch_ad' as const, reward: '2.50' },
          { taskType: 'spin_wheel' as const, reward: '5.00' },
          { taskType: 'quiz' as const, reward: '3.00' },
        ];

        for (const task of defaultTasks) {
          await storage.createDailyTask({
            userId,
            ...task,
            taskDate: today,
          });
        }

        tasks = await storage.getDailyTasks(userId, today);
      }

      res.json(tasks);
    } catch (error) {
      console.error("Error fetching daily tasks:", error);
      res.status(500).json({ message: "Failed to fetch daily tasks" });
    }
  });

  app.post('/api/daily-tasks/:id/complete', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.completeDailyTask(req.params.id);
      res.json({ message: "Task completed successfully" });
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(400).json({ message: "Failed to complete task" });
    }
  });

  // Referral routes
  app.get('/api/referrals/stats', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const stats = await storage.getReferralStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  app.post('/api/referrals/join', async (req, res) => {
    try {
      const { referralCode, userId } = req.body;
      
      if (!referralCode || !userId) {
        return res.status(400).json({ message: "Referral code and user ID required" });
      }

      // Find referrer by code
      const referrer = await storage.getUser(referralCode);
      if (!referrer) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      // Update user with referrer
      const user = await storage.getUser(userId);
      if (user && !user.referredBy) {
        // Update user to have referrer
        // This would typically be handled during registration
        res.json({ message: "Referral link established" });
      } else {
        res.status(400).json({ message: "User already has a referrer or not found" });
      }
    } catch (error) {
      console.error("Error joining referral:", error);
      res.status(400).json({ message: "Failed to join referral" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/investments', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const investments = await storage.getInvestments();
      res.json(investments);
    } catch (error) {
      console.error("Error fetching admin investments:", error);
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  app.get('/api/admin/withdrawals', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const withdrawals = await storage.getWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching admin withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.post('/api/admin/investments/:id/:action', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id, action } = req.params;
      if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ message: "Invalid action" });
      }

      await storage.updateInvestmentStatus(id, action === 'approve' ? 'approved' : 'rejected');
      res.json({ message: `Investment ${action}d successfully` });
    } catch (error) {
      console.error("Error updating investment:", error);
      res.status(400).json({ message: "Failed to update investment" });
    }
  });

  app.post('/api/admin/withdrawals/:id/:action', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id, action } = req.params;
      if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ message: "Invalid action" });
      }

      await storage.updateWithdrawalStatus(id, action === 'approve' ? 'approved' : 'rejected');
      res.json({ message: `Withdrawal ${action}d successfully` });
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      res.status(400).json({ message: "Failed to update withdrawal" });
    }
  });

  // JazzCash Payment Routes
  app.post('/api/payment/jazzcash', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const validatedData = jazzCashPaymentFormSchema.parse(req.body);
      
      // Generate unique merchant transaction ID
      const merchantTransactionId = generateMerchantTransactionId();
      
      // Create payment record in database
      const payment = await storage.createJazzCashPayment({
        userId,
        merchantTransactionId,
        amount: validatedData.amount.toString(),
        phone: validatedData.phone,
        email: validatedData.email,
        fullName: validatedData.fullName,
        status: 'pending',
      });

      // Process payment with JazzCash
      const paymentResult = await createJazzCashPayment({
        merchantTransactionId,
        amount: validatedData.amount,
        phone: validatedData.phone,
        email: validatedData.email,
        fullName: validatedData.fullName,
      });

      if (paymentResult.success) {
        // Update payment status
        await storage.updateJazzCashPaymentStatus(
          merchantTransactionId,
          'success',
          paymentResult.data
        );

        // Create investment record
        await storage.createInvestment({
          userId,
          fullName: validatedData.fullName,
          jazzCashNumber: validatedData.phone,
          amount: validatedData.amount.toString(),
          paymentMethod: 'jazzcash',
          status: 'pending',
        });

        res.json({
          success: true,
          message: 'Payment processed successfully',
          transactionId: merchantTransactionId,
          data: paymentResult.data
        });
      } else {
        // Update payment status
        await storage.updateJazzCashPaymentStatus(
          merchantTransactionId,
          'failed',
          paymentResult.data
        );

        res.status(400).json({
          success: false,
          message: 'Payment processing failed',
          error: paymentResult.error
        });
      }
    } catch (error) {
      console.error('JazzCash payment error:', error);
      res.status(400).json({ 
        success: false, 
        message: 'Invalid payment data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // JazzCash callback handler (for redirect from JazzCash)
  app.post('/api/payment/callback', async (req, res) => {
    try {
      console.log('JazzCash callback received:', req.body);
      
      // Verify the callback data
      const isValid = verifyJazzCashCallback(req.body);
      
      if (!isValid) {
        console.error('Invalid JazzCash callback signature');
        return res.status(400).send('Invalid signature');
      }

      const merchantTransactionId = req.body.pp_TxnRefNo;
      const responseCode = req.body.pp_ResponseCode;
      
      // Update payment status based on response
      const status = responseCode === '000' ? 'success' : 'failed';
      await storage.updateJazzCashPaymentStatus(
        merchantTransactionId,
        status,
        req.body
      );

      // Redirect to frontend with result
      const redirectUrl = `/?payment=${status}&txn=${merchantTransactionId}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('JazzCash callback error:', error);
      res.status(500).send('Callback processing failed');
    }
  });

  // Get payment status
  app.get('/api/payment/:merchantTransactionId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { merchantTransactionId } = req.params;
      const payment = await storage.getJazzCashPayment(merchantTransactionId);
      
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Check if user owns this payment
      const userId = req.user!.claims.sub;
      if (payment.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(payment);
    } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({ message: 'Failed to fetch payment' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Add basic security for file serving
    res.header('Content-Type', 'image/*');
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
