import {
  users,
  investments,
  withdrawals,
  dailyTasks,
  referrals,
  transactions,
  jazzCashPayments,
  type User,
  type UpsertUser,
  type Investment,
  type InsertInvestment,
  type Withdrawal,
  type InsertWithdrawal,
  type DailyTask,
  type InsertDailyTask,
  type Referral,
  type InsertReferral,
  type Transaction,
  type InsertTransaction,
  type JazzCashPayment,
  type InsertJazzCashPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { randomUUID } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Business operations
  getUserStats(userId: string): Promise<{
    totalBalance: string;
    trialBalance: string;
    investmentAmount: string;
    referralCount: number;
    isTrialActive: boolean;
    daysLeft: number;
  }>;
  
  // Investment operations
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  getInvestments(userId?: string): Promise<Investment[]>;
  updateInvestmentStatus(id: string, status: 'approved' | 'rejected'): Promise<void>;
  
  // Withdrawal operations
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawals(userId?: string): Promise<Withdrawal[]>;
  updateWithdrawalStatus(id: string, status: 'approved' | 'rejected'): Promise<void>;
  
  // Daily tasks operations
  getDailyTasks(userId: string, date: Date): Promise<DailyTask[]>;
  createDailyTask(task: InsertDailyTask): Promise<DailyTask>;
  completeDailyTask(id: string): Promise<void>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralStats(userId: string): Promise<{
    level1Count: number;
    level2Count: number;
    level3Count: number;
    totalEarnings: string;
  }>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(userId: string): Promise<Transaction[]>;
  
  // Admin operations
  getAdminStats(): Promise<{
    totalUsers: number;
    pendingInvestments: number;
    pendingWithdrawals: number;
    totalInvested: string;
  }>;
  
  // JazzCash payment operations
  createJazzCashPayment(payment: InsertJazzCashPayment): Promise<JazzCashPayment>;
  updateJazzCashPaymentStatus(merchantTransactionId: string, status: 'success' | 'failed' | 'cancelled', jazzCashResponse?: any): Promise<void>;
  getJazzCashPayment(merchantTransactionId: string): Promise<JazzCashPayment | undefined>;
  
  // Update user balance
  updateUserBalance(userId: string, amount: string, isInvestment?: boolean): Promise<void>;
  
  // Generate referral code
  generateReferralCode(): string;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const referralCode = this.generateReferralCode();
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        referralCode,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  generateReferralCode(): string {
    const prefix = 'CRP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  async getUserStats(userId: string): Promise<{
    totalBalance: string;
    trialBalance: string;
    investmentAmount: string;
    referralCount: number;
    isTrialActive: boolean;
    daysLeft: number;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error('User not found');

    const referralCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    const now = new Date();
    const trialEnd = new Date(user.trialEndDate!);
    const isTrialActive = now < trialEnd;
    const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      totalBalance: user.balance || "0.00",
      trialBalance: user.trialBalance || "0.00",
      investmentAmount: user.investmentAmount || "0.00",
      referralCount: referralCount[0]?.count || 0,
      isTrialActive,
      daysLeft,
    };
  }

  // Investment operations
  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const [newInvestment] = await db
      .insert(investments)
      .values(investment)
      .returning();
    return newInvestment;
  }

  async getInvestments(userId?: string): Promise<Investment[]> {
    if (userId) {
      return await db.select().from(investments).where(eq(investments.userId, userId)).orderBy(desc(investments.createdAt));
    }
    return await db.select().from(investments).orderBy(desc(investments.createdAt));
  }

  async updateInvestmentStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const [investment] = await db
      .update(investments)
      .set({ status, updatedAt: new Date() })
      .where(eq(investments.id, id))
      .returning();

    if (status === 'approved' && investment) {
      // Update user to investor status and add balance
      await db
        .update(users)
        .set({
          isInvestor: true,
          investmentAmount: sql`${users.investmentAmount} + ${investment.amount}`,
          balance: sql`${users.balance} + ${investment.amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, investment.userId));

      // Create transaction record
      await this.createTransaction({
        userId: investment.userId,
        type: 'investment',
        amount: investment.amount,
        description: `Investment approved - ${investment.paymentMethod}`,
      });

      // Process referral rewards
      await this.processReferralRewards(investment.userId, parseFloat(investment.amount));
    }
  }

  private async processReferralRewards(userId: string, investmentAmount: number): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user?.referredBy) return;

    const rewards = [
      { level: 1, amount: 5.00 },
      { level: 2, amount: 2.00 },
      { level: 3, amount: 1.00 },
    ];

    let currentReferrerId = user.referredBy;

    for (const { level, amount } of rewards) {
      if (!currentReferrerId) break;

      // Create referral record
      await this.createReferral({
        referrerId: currentReferrerId,
        referredId: userId,
        level,
        reward: amount.toString(),
        rewardPaid: true,
      });

      // Add reward to referrer's balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, currentReferrerId));

      // Create transaction record
      await this.createTransaction({
        userId: currentReferrerId,
        type: 'referral_reward',
        amount: amount.toString(),
        description: `Level ${level} referral reward`,
      });

      // Get next level referrer
      const [referrer] = await db.select().from(users).where(eq(users.id, currentReferrerId));
      currentReferrerId = referrer?.referredBy || null;
    }
  }

  // Withdrawal operations
  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [newWithdrawal] = await db
      .insert(withdrawals)
      .values(withdrawal)
      .returning();
    return newWithdrawal;
  }

  async getWithdrawals(userId?: string): Promise<Withdrawal[]> {
    if (userId) {
      return await db.select().from(withdrawals).where(eq(withdrawals.userId, userId)).orderBy(desc(withdrawals.createdAt));
    }
    return await db.select().from(withdrawals).orderBy(desc(withdrawals.createdAt));
  }

  async updateWithdrawalStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const [withdrawal] = await db
      .update(withdrawals)
      .set({ status, updatedAt: new Date() })
      .where(eq(withdrawals.id, id))
      .returning();

    if (status === 'approved' && withdrawal) {
      // Deduct from user balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} - ${withdrawal.amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, withdrawal.userId));

      // Create transaction record
      await this.createTransaction({
        userId: withdrawal.userId,
        type: 'withdrawal',
        amount: `-${withdrawal.amount}`,
        description: `Withdrawal approved - JazzCash: ${withdrawal.jazzCashNumber}`,
      });
    }
  }

  // Daily tasks operations
  async getDailyTasks(userId: string, date: Date): Promise<DailyTask[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(dailyTasks)
      .where(
        and(
          eq(dailyTasks.userId, userId),
          gte(dailyTasks.taskDate, startOfDay),
          gte(endOfDay, dailyTasks.taskDate)
        )
      );
  }

  async createDailyTask(task: InsertDailyTask): Promise<DailyTask> {
    const [newTask] = await db
      .insert(dailyTasks)
      .values(task)
      .returning();
    return newTask;
  }

  async completeDailyTask(id: string): Promise<void> {
    const [task] = await db
      .update(dailyTasks)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(dailyTasks.id, id))
      .returning();

    if (task) {
      // Add reward to user balance
      await this.updateUserBalance(task.userId, task.reward);

      // Create transaction record
      await this.createTransaction({
        userId: task.userId,
        type: 'task_reward',
        amount: task.reward,
        description: `Daily task completed - ${task.taskType}`,
      });
    }
  }

  // Referral operations
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [newReferral] = await db
      .insert(referrals)
      .values(referral)
      .returning();
    return newReferral;
  }

  async getReferralStats(userId: string): Promise<{
    level1Count: number;
    level2Count: number;
    level3Count: number;
    totalEarnings: string;
  }> {
    const level1 = await db
      .select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(and(eq(referrals.referrerId, userId), eq(referrals.level, 1)));

    const level2 = await db
      .select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(and(eq(referrals.referrerId, userId), eq(referrals.level, 2)));

    const level3 = await db
      .select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(and(eq(referrals.referrerId, userId), eq(referrals.level, 3)));

    const totalEarnings = await db
      .select({ total: sql<string>`COALESCE(SUM(${referrals.reward}), 0)` })
      .from(referrals)
      .where(and(eq(referrals.referrerId, userId), eq(referrals.rewardPaid, true)));

    return {
      level1Count: level1[0]?.count || 0,
      level2Count: level2[0]?.count || 0,
      level3Count: level3[0]?.count || 0,
      totalEarnings: totalEarnings[0]?.total || "0",
    };
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  // Admin operations
  async getAdminStats(): Promise<{
    totalUsers: number;
    pendingInvestments: number;
    pendingWithdrawals: number;
    totalInvested: string;
  }> {
    const totalUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const pendingInvestments = await db
      .select({ count: sql<number>`count(*)` })
      .from(investments)
      .where(eq(investments.status, 'pending'));

    const pendingWithdrawals = await db
      .select({ count: sql<number>`count(*)` })
      .from(withdrawals)
      .where(eq(withdrawals.status, 'pending'));

    const totalInvested = await db
      .select({ total: sql<string>`COALESCE(SUM(${investments.amount}), 0)` })
      .from(investments)
      .where(eq(investments.status, 'approved'));

    return {
      totalUsers: totalUsers[0]?.count || 0,
      pendingInvestments: pendingInvestments[0]?.count || 0,
      pendingWithdrawals: pendingWithdrawals[0]?.count || 0,
      totalInvested: totalInvested[0]?.total || "0",
    };
  }

  async updateUserBalance(userId: string, amount: string, isInvestment?: boolean): Promise<void> {
    if (isInvestment) {
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${amount}`,
          investmentAmount: sql`${users.investmentAmount} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } else {
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  }

  // JazzCash payment operations
  async createJazzCashPayment(payment: InsertJazzCashPayment): Promise<JazzCashPayment> {
    const [newPayment] = await db
      .insert(jazzCashPayments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async updateJazzCashPaymentStatus(
    merchantTransactionId: string, 
    status: 'success' | 'failed' | 'cancelled', 
    jazzCashResponse?: any
  ): Promise<void> {
    await db
      .update(jazzCashPayments)
      .set({
        status,
        jazzCashResponse,
        updatedAt: new Date(),
      })
      .where(eq(jazzCashPayments.merchantTransactionId, merchantTransactionId));
  }

  async getJazzCashPayment(merchantTransactionId: string): Promise<JazzCashPayment | undefined> {
    const [payment] = await db
      .select()
      .from(jazzCashPayments)
      .where(eq(jazzCashPayments.merchantTransactionId, merchantTransactionId));
    return payment;
  }
}

export const storage = new DatabaseStorage();
