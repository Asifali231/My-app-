import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Shield, TrendingUp, Users } from "lucide-react";
import Footer from "@/components/footer";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-crypto-blue via-crypto-dark to-crypto-accent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-inter">
              Start Earning with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-crypto-gold to-crypto-red">
                CryptoPay
              </span>
            </h1>
            <p className="text-xl text-crypto-light mb-8 max-w-2xl mx-auto">
              Join thousands of users earning daily rewards through our professional investment platform. Get $100 free trial bonus!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLogin}
                className="crypto-button-primary text-lg py-4 px-8 h-auto"
              >
                Get Started - Free $100
              </Button>
              <Button 
                onClick={handleLogin}
                variant="outline"
                className="border-2 border-crypto-light/20 hover:border-crypto-gold text-white font-semibold py-4 px-8 rounded-xl transition-colors text-lg h-auto"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-crypto-dark/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose CryptoPay?</h2>
            <p className="text-crypto-light text-lg">Professional features for serious earners</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="crypto-card">
              <CardHeader className="text-center pb-3">
                <div className="w-16 h-16 bg-crypto-green/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-crypto-green" />
                </div>
                <CardTitle className="text-white">Free Trial Bonus</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-crypto-light">Get $100 free trial bonus instantly upon registration. No strings attached.</p>
              </CardContent>
            </Card>

            <Card className="crypto-card">
              <CardHeader className="text-center pb-3">
                <div className="w-16 h-16 bg-crypto-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-crypto-gold" />
                </div>
                <CardTitle className="text-white">Daily Tasks</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-crypto-light">Complete simple tasks daily and earn rewards. Watch ads, spin wheels, take quizzes.</p>
              </CardContent>
            </Card>

            <Card className="crypto-card">
              <CardHeader className="text-center pb-3">
                <div className="w-16 h-16 bg-crypto-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-crypto-accent" />
                </div>
                <CardTitle className="text-white">Referral Program</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-crypto-light">Earn up to $8 per referral across 3 levels. Build your network and increase earnings.</p>
              </CardContent>
            </Card>

            <Card className="crypto-card">
              <CardHeader className="text-center pb-3">
                <div className="w-16 h-16 bg-crypto-red/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-crypto-red" />
                </div>
                <CardTitle className="text-white">Secure Payments</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-crypto-light">Secure JazzCash integration for deposits and withdrawals. Your money is safe with us.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-crypto-blue/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-crypto-light text-lg">Simple steps to start earning</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-crypto-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-crypto-gold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sign Up & Get Bonus</h3>
              <p className="text-crypto-light">Register with your email and receive $100 trial bonus instantly. Start earning from day one.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-crypto-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-crypto-accent">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Complete Daily Tasks</h3>
              <p className="text-crypto-light">Earn rewards by watching ads, spinning wheels, and taking quizzes. Build your balance daily.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-crypto-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-crypto-green">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Invest & Withdraw</h3>
              <p className="text-crypto-light">Make a minimum $30 investment to unlock withdrawals. Cash out when you reach $100 or more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-crypto-gold/20 to-crypto-red/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
          <p className="text-crypto-light text-lg mb-8">
            Join thousands of users who are already earning daily rewards with CryptoPay. 
            Get your free $100 trial bonus today!
          </p>
          <Button 
            onClick={handleLogin}
            className="crypto-button-primary text-xl py-4 px-8 h-auto"
          >
            Start Earning Now - Free $100 Bonus
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
