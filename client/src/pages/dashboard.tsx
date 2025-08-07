import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, Gift, Clock, CheckCircle } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function Dashboard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: referralStats } = useQuery({
    queryKey: ["/api/referrals/stats"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-crypto-light">Track your earnings and manage your investments</p>
        </div>

        {/* Trial Status Card */}
        {stats?.isTrialActive && (
          <Card className="crypto-gradient border border-crypto-gold/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Gift className="w-8 h-8 text-white mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">🎁 Free Trial Active</h3>
                    <p className="text-white/80">
                      You have <span className="font-semibold text-white">{stats.daysLeft} days</span> left in your trial period
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${stats.trialBalance}</div>
                  <p className="text-sm text-white/80">Trial Bonus</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-white/80 mb-1">
                  <span>Trial Progress</span>
                  <span>{3 - stats.daysLeft}/3 days</span>
                </div>
                <Progress value={((3 - stats.daysLeft) / 3) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="crypto-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-crypto-light">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-crypto-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats?.totalBalance || "0.00"}</div>
              <p className="text-xs text-crypto-green">
                {parseFloat(stats?.totalBalance || "0") >= 100 ? "Ready for withdrawal" : "Build your balance"}
              </p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-crypto-light">Investment</CardTitle>
              <TrendingUp className="h-4 w-4 text-crypto-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats?.investmentAmount || "0.00"}</div>
              <p className="text-xs text-crypto-light">
                {user?.isInvestor ? (
                  <Badge variant="secondary" className="bg-crypto-green/20 text-crypto-green">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Investor
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-crypto-red/20 text-crypto-red">
                    <Clock className="w-3 h-3 mr-1" />
                    Investment Required
                  </Badge>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-crypto-light">Referrals</CardTitle>
              <Users className="h-4 w-4 text-crypto-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.referralCount || 0}</div>
              <p className="text-xs text-crypto-light">Active referrals</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-crypto-light">Referral Earnings</CardTitle>
              <Gift className="h-4 w-4 text-crypto-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${referralStats?.totalEarnings || "0.00"}</div>
              <p className="text-xs text-crypto-light">From referrals</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-crypto-gold">Level 1 Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">{referralStats?.level1Count || 0}</div>
              <p className="text-crypto-light text-sm">Direct referrals • $5.00 each</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-crypto-accent">Level 2 Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">{referralStats?.level2Count || 0}</div>
              <p className="text-crypto-light text-sm">Second level • $2.00 each</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-crypto-green">Level 3 Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">{referralStats?.level3Count || 0}</div>
              <p className="text-crypto-light text-sm">Third level • $1.00 each</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg border border-crypto-light/20">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        transaction.type === 'investment' ? 'bg-crypto-green' :
                        transaction.type === 'withdrawal' ? 'bg-crypto-red' :
                        transaction.type === 'task_reward' ? 'bg-crypto-accent' :
                        'bg-crypto-gold'
                      }`}></div>
                      <div>
                        <div className="text-white font-medium">{transaction.description}</div>
                        <div className="text-crypto-light text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      parseFloat(transaction.amount) > 0 ? 'text-crypto-green' : 'text-crypto-red'
                    }`}>
                      {parseFloat(transaction.amount) > 0 ? '+' : ''}${transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-crypto-light">No transactions yet. Complete your first task or make an investment to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
