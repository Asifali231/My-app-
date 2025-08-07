import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Users, Gift } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Link } from "wouter";

export default function Home() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-crypto-light">Here's your earnings overview</p>
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
                      You have <span className="font-semibold">{stats.daysLeft} days</span> left in your trial period
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${stats.trialBalance}</div>
                  <p className="text-sm text-white/80">Trial Bonus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="crypto-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-crypto-light">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-crypto-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats?.totalBalance || "0.00"}</div>
              <p className="text-xs text-crypto-green">Available for withdrawal</p>
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
                {user?.isInvestor ? "Investor status" : "Investment required"}
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
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/tasks">
                <Button className="w-full justify-start bg-crypto-accent/20 hover:bg-crypto-accent/30 text-crypto-accent border-crypto-accent/20">
                  🎯 Complete Daily Tasks
                </Button>
              </Link>
              <Link href="/invest">
                <Button className="w-full justify-start bg-crypto-green/20 hover:bg-crypto-green/30 text-crypto-green border-crypto-green/20">
                  💰 Make Investment
                </Button>
              </Link>
              <Link href="/withdraw">
                <Button 
                  className="w-full justify-start bg-crypto-gold/20 hover:bg-crypto-gold/30 text-crypto-gold border-crypto-gold/20"
                  disabled={!user?.isInvestor || (parseFloat(stats?.totalBalance || "0") < 100)}
                >
                  💸 Request Withdrawal
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-white">Your Referral Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-crypto-dark rounded-lg p-4 border border-crypto-light/20 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-crypto-gold font-mono text-lg">{user?.referralCode}</code>
                  <Button 
                    onClick={() => navigator.clipboard.writeText(user?.referralCode || "")}
                    size="sm"
                    className="bg-crypto-gold/20 hover:bg-crypto-gold/30 text-crypto-gold"
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <p className="text-crypto-light text-sm">Share your code and earn $5 for each successful referral!</p>
              <Link href="/referrals">
                <Button variant="outline" className="w-full mt-3 border-crypto-light/20">
                  View Referral Stats
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard">
            <Card className="crypto-card hover:border-crypto-gold/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-crypto-gold mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Dashboard</h3>
                <p className="text-crypto-light text-sm">View detailed stats and analytics</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tasks">
            <Card className="crypto-card hover:border-crypto-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Gift className="w-12 h-12 text-crypto-accent mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Daily Tasks</h3>
                <p className="text-crypto-light text-sm">Complete tasks and earn rewards</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/referrals">
            <Card className="crypto-card hover:border-crypto-green/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-crypto-green mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Referrals</h3>
                <p className="text-crypto-light text-sm">Invite friends and earn rewards</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
