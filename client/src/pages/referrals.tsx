import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Users, Share2, Copy, Gift, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function Referrals() {
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: referralStats } = useQuery({
    queryKey: ["/api/referrals/stats"],
  });

  const handleCopyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast({
        title: "Referral Code Copied!",
        description: "Share your code with friends to start earning rewards.",
      });
    }
  };

  const handleShareWhatsApp = () => {
    const message = `🚀 Join CryptoPay and start earning daily! 💰\n\nGet $100 FREE trial bonus + earn from daily tasks!\n\nUse my referral code: ${user?.referralCode}\n\n🎯 Daily tasks: Watch ads, spin wheel, take quizzes\n💸 Minimum $30 investment unlocks withdrawals\n🔥 3-level referral rewards: $5 + $2 + $1\n\nStart earning today! 💪`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareLink = () => {
    const referralLink = `${window.location.origin}?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral Link Copied!",
      description: "Share this link to invite friends and earn rewards.",
    });
  };

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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Referral Program</h1>
          <p className="text-crypto-light">Invite friends and earn rewards on multiple levels</p>
        </div>

        {/* Main Referral Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Referral Code Card */}
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Gift className="w-5 h-5 mr-2 text-crypto-gold" />
                Your Referral Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-crypto-dark rounded-lg p-4 border border-crypto-light/20">
                <div className="flex items-center justify-between">
                  <code className="text-crypto-gold font-mono text-2xl font-bold">
                    {user?.referralCode || "Loading..."}
                  </code>
                  <Button
                    onClick={handleCopyReferralCode}
                    className="bg-crypto-gold/20 hover:bg-crypto-gold/30 text-crypto-gold border-crypto-gold/20"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={handleShareWhatsApp}
                  className="w-full bg-crypto-green/20 hover:bg-crypto-green/30 text-crypto-green border-crypto-green/20"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share via WhatsApp
                </Button>
                <Button
                  onClick={handleShareLink}
                  className="w-full bg-crypto-accent/20 hover:bg-crypto-accent/30 text-crypto-accent border-crypto-accent/20"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Copy Referral Link
                </Button>
              </div>

              <div className="bg-crypto-blue/30 rounded-lg p-4 border border-crypto-blue/20">
                <h4 className="text-white font-semibold mb-2">💡 How it works:</h4>
                <ul className="text-crypto-light text-sm space-y-1">
                  <li>• Share your referral code with friends</li>
                  <li>• They sign up and make their first investment</li>
                  <li>• You earn rewards when they invest!</li>
                  <li>• Earn from 3 levels of referrals</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Reward Structure */}
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-crypto-green" />
                Reward Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg border border-crypto-light/20">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-crypto-gold/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-crypto-gold font-semibold text-sm">L1</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Direct Referrals</div>
                    <div className="text-crypto-light text-sm">People you invite directly</div>
                  </div>
                </div>
                <Badge className="bg-crypto-gold/20 text-crypto-gold font-bold">$5.00</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg border border-crypto-light/20">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-crypto-accent/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-crypto-accent font-semibold text-sm">L2</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Level 2 Referrals</div>
                    <div className="text-crypto-light text-sm">People invited by your referrals</div>
                  </div>
                </div>
                <Badge className="bg-crypto-accent/20 text-crypto-accent font-bold">$2.00</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg border border-crypto-light/20">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-crypto-green/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-crypto-green font-semibold text-sm">L3</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Level 3 Referrals</div>
                    <div className="text-crypto-light text-sm">Third level referrals</div>
                  </div>
                </div>
                <Badge className="bg-crypto-green/20 text-crypto-green font-bold">$1.00</Badge>
              </div>

              <div className="bg-crypto-red/10 border border-crypto-red/20 rounded-lg p-3 mt-4">
                <p className="text-crypto-red text-sm">
                  <strong>Note:</strong> Rewards are paid only after your referrals make their first successful investment of $30 or more.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-crypto-gold mb-2">
                {referralStats?.level1Count || 0}
              </div>
              <div className="text-crypto-light">Level 1 Referrals</div>
              <div className="text-crypto-gold text-sm font-medium mt-1">
                ${((referralStats?.level1Count || 0) * 5).toFixed(2)} earned
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-crypto-accent mb-2">
                {referralStats?.level2Count || 0}
              </div>
              <div className="text-crypto-light">Level 2 Referrals</div>
              <div className="text-crypto-accent text-sm font-medium mt-1">
                ${((referralStats?.level2Count || 0) * 2).toFixed(2)} earned
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-crypto-green mb-2">
                {referralStats?.level3Count || 0}
              </div>
              <div className="text-crypto-light">Level 3 Referrals</div>
              <div className="text-crypto-green text-sm font-medium mt-1">
                ${((referralStats?.level3Count || 0) * 1).toFixed(2)} earned
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-white mb-2">
                ${referralStats?.totalEarnings || "0.00"}
              </div>
              <div className="text-crypto-light">Total Earned</div>
              <div className="text-crypto-green text-sm font-medium mt-1">
                All time earnings
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Tips */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-white">💡 Tips to Maximize Your Referral Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-crypto-gold font-semibold mb-3">Best Practices</h4>
                <ul className="text-crypto-light space-y-2">
                  <li className="flex items-start">
                    <span className="text-crypto-green mr-2">✓</span>
                    Share your personal experience with CryptoPay
                  </li>
                  <li className="flex items-start">
                    <span className="text-crypto-green mr-2">✓</span>
                    Explain the free $100 trial bonus advantage
                  </li>
                  <li className="flex items-start">
                    <span className="text-crypto-green mr-2">✓</span>
                    Mention the simple daily task system
                  </li>
                  <li className="flex items-start">
                    <span className="text-crypto-green mr-2">✓</span>
                    Highlight the low $30 minimum investment
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-crypto-accent font-semibold mb-3">Where to Share</h4>
                <ul className="text-crypto-light space-y-2">
                  <li className="flex items-start">
                    <span className="text-crypto-green mr-2">•</span>
                    WhatsApp groups and contacts
                  </li>
                  <li className="flex items-start">
                    <span className="text-crypto-green mr-2">•</span>
                    Social media platforms
                  </li>
                  <li className="flex items-start">
                    <span className="text-crypto-green mr-2">•</span>
                    Friends and family members
                  </li>
                  <li className="flex items-start">
                    <span className="text-crypto-green mr-2">•</span>
                    Professional networks
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
