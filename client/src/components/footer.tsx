import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-crypto-blue border-t border-crypto-light/20 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-crypto-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h3 className="text-2xl font-bold text-crypto-gold">CryptoPay</h3>
          </div>
          
          <p className="text-crypto-light mb-6 max-w-2xl mx-auto">
            Professional earning platform with secure investments and daily rewards. 
            Start your earning journey today with our comprehensive investment system.
          </p>
          
          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
            <div>
              <h4 className="text-crypto-gold font-semibold mb-2">Platform</h4>
              <div className="space-y-1">
                <Link href="/dashboard">
                  <span className="text-crypto-light hover:text-white transition-colors cursor-pointer block">
                    Dashboard
                  </span>
                </Link>
                <Link href="/tasks">
                  <span className="text-crypto-light hover:text-white transition-colors cursor-pointer block">
                    Daily Tasks
                  </span>
                </Link>
                <Link href="/referrals">
                  <span className="text-crypto-light hover:text-white transition-colors cursor-pointer block">
                    Referrals
                  </span>
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-crypto-gold font-semibold mb-2">Services</h4>
              <div className="space-y-1">
                <Link href="/invest">
                  <span className="text-crypto-light hover:text-white transition-colors cursor-pointer block">
                    Investment
                  </span>
                </Link>
                <Link href="/withdraw">
                  <span className="text-crypto-light hover:text-white transition-colors cursor-pointer block">
                    Withdrawal
                  </span>
                </Link>
                <span className="text-crypto-light block">JazzCash Integration</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-crypto-gold font-semibold mb-2">Features</h4>
              <div className="space-y-1">
                <span className="text-crypto-light block">Free $100 Trial</span>
                <span className="text-crypto-light block">Daily Rewards</span>
                <span className="text-crypto-light block">Multi-Level Referrals</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-crypto-gold font-semibold mb-2">Support</h4>
              <div className="space-y-1">
                <span className="text-crypto-light hover:text-white transition-colors cursor-pointer block">
                  Help Center
                </span>
                <span className="text-crypto-light hover:text-white transition-colors cursor-pointer block">
                  Contact Us
                </span>
                <span className="text-crypto-light hover:text-white transition-colors cursor-pointer block">
                  FAQ
                </span>
              </div>
            </div>
          </div>
          
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center items-center space-x-6 text-crypto-light text-sm mb-6">
            <span className="hover:text-white transition-colors cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Risk Disclosure
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Support
            </span>
          </div>
          
          {/* Key Features */}
          <div className="bg-crypto-dark rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-crypto-green">✓</span>
                <span className="text-crypto-light">Secure JazzCash Integration</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-crypto-green">✓</span>
                <span className="text-crypto-light">24/7 Customer Support</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-crypto-green">✓</span>
                <span className="text-crypto-light">Instant Trial Bonus</span>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-crypto-light/20 pt-4">
            <p className="text-crypto-light text-sm">
              © 2024 CryptoPay. All rights reserved. | Powered by advanced blockchain technology
            </p>
            <p className="text-crypto-light text-xs mt-2">
              <strong>Disclaimer:</strong> Investment involves risk. Past performance is not indicative of future results. 
              Please read all terms and conditions before investing.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
