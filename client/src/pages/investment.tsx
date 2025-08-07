import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Upload, CreditCard, Smartphone, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react";
import { Link } from "wouter";

const investmentSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  jazzCashNumber: z.string().regex(/^03\d{9}$/, "Please enter a valid JazzCash number (03XXXXXXXXX)"),
  amount: z.number().min(30, "Minimum investment amount is $30"),
  paymentMethod: z.enum(["jazzcash_wallet", "jazzcash_card"]),
});

type InvestmentForm = z.infer<typeof investmentSchema>;

export default function Investment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: investments } = useQuery({
    queryKey: ["/api/investments"],
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvestmentForm>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      paymentMethod: "jazzcash_wallet",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const investmentMutation = useMutation({
    mutationFn: async (data: InvestmentForm & { screenshot?: File }) => {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("jazzCashNumber", data.jazzCashNumber);
      formData.append("amount", data.amount.toString());
      formData.append("paymentMethod", data.paymentMethod);
      if (data.screenshot) {
        formData.append("screenshot", data.screenshot);
      }

      const response = await fetch("/api/jazzcash/invest", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Investment Request Submitted",
        description: "Your investment request has been submitted successfully. It will be reviewed within 24 hours.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setSelectedFile(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit investment request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InvestmentForm) => {
    if (!selectedFile) {
      toast({
        title: "Screenshot Required",
        description: "Please upload a screenshot of your payment confirmation.",
        variant: "destructive",
      });
      return;
    }

    investmentMutation.mutate({ ...data, screenshot: selectedFile });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-crypto-green/20 text-crypto-green">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-crypto-red/20 text-crypto-red">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-crypto-gold/20 text-crypto-gold">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Investment Options</h1>
          <p className="text-crypto-light">Invest a minimum of $30 via JazzCash to unlock full features</p>
        </div>

        {/* Quick JazzCash Payment */}
        <Card className="crypto-card mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-crypto-gold" />
              Real-Time JazzCash Payment
            </CardTitle>
            <p className="text-crypto-light">Fast, secure, and instant payment processing</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-crypto-dark p-4 rounded-lg">
                <Zap className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white font-medium">Instant Processing</p>
                <p className="text-crypto-light text-sm">Real-time payment verification</p>
              </div>
              <div className="bg-crypto-dark p-4 rounded-lg">
                <CreditCard className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-medium">Secure Gateway</p>
                <p className="text-crypto-light text-sm">Bank-level encryption</p>
              </div>
              <div className="bg-crypto-dark p-4 rounded-lg">
                <CheckCircle className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-medium">Auto Approval</p>
                <p className="text-crypto-light text-sm">No manual verification needed</p>
              </div>
            </div>
            <Link href="/payment">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold">
                <Zap className="h-5 w-5 mr-2" />
                Pay with JazzCash Now
              </Button>
            </Link>
            <p className="text-crypto-light text-sm mt-4">Minimum investment: $30 USD • Powered by JazzCash API</p>
          </CardContent>
        </Card>

        <div className="text-center mb-6">
          <p className="text-crypto-light font-medium">OR</p>
        </div>

        {/* Investment Form */}
        <Card className="crypto-card mb-8">
          <CardHeader>
            <CardTitle className="text-white">Manual Payment Verification</CardTitle>
            <p className="text-crypto-light text-sm mt-2">Upload payment screenshot for manual review (slower process)</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName" className="text-crypto-light">Full Name</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    className="bg-crypto-dark border-crypto-light/20 text-white"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="text-crypto-red text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="jazzCashNumber" className="text-crypto-light">JazzCash Number</Label>
                  <Input
                    id="jazzCashNumber"
                    {...register("jazzCashNumber")}
                    className="bg-crypto-dark border-crypto-light/20 text-white"
                    placeholder="03XXXXXXXXX"
                  />
                  {errors.jazzCashNumber && (
                    <p className="text-crypto-red text-sm mt-1">{errors.jazzCashNumber.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="amount" className="text-crypto-light">Investment Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-crypto-light">$</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    min="30"
                    step="0.01"
                    {...register("amount", { valueAsNumber: true })}
                    className="bg-crypto-dark border-crypto-light/20 text-white pl-8"
                    placeholder="30.00"
                  />
                </div>
                <p className="text-crypto-light text-sm mt-1">Minimum investment: $30</p>
                {errors.amount && (
                  <p className="text-crypto-red text-sm mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <Label className="text-crypto-light">Payment Method</Label>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(value) => setValue("paymentMethod", value as "jazzcash_wallet" | "jazzcash_card")}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-3 p-4 bg-crypto-dark rounded-lg border border-crypto-light/20 hover:border-crypto-gold/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="jazzcash_wallet" id="jazzcash_wallet" />
                    <label htmlFor="jazzcash_wallet" className="flex items-center cursor-pointer flex-1">
                      <Smartphone className="w-6 h-6 text-crypto-gold mr-3" />
                      <div>
                        <div className="text-white font-medium">JazzCash Wallet</div>
                        <div className="text-crypto-light text-sm">Pay from your JazzCash mobile wallet</div>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-crypto-dark rounded-lg border border-crypto-light/20 hover:border-crypto-gold/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="jazzcash_card" id="jazzcash_card" />
                    <label htmlFor="jazzcash_card" className="flex items-center cursor-pointer flex-1">
                      <CreditCard className="w-6 h-6 text-crypto-gold mr-3" />
                      <div>
                        <div className="text-white font-medium">JazzCash Debit/Credit Card</div>
                        <div className="text-crypto-light text-sm">Pay using your linked bank card</div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-crypto-light">Payment Screenshot</Label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-crypto-light/20 border-dashed rounded-lg hover:border-crypto-gold/50 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-crypto-light" />
                    <div className="flex text-sm text-crypto-light">
                      <label htmlFor="screenshot" className="relative cursor-pointer bg-crypto-dark rounded-md font-medium text-crypto-gold hover:text-crypto-gold/80 focus-within:outline-none">
                        <span>Upload screenshot</span>
                        <input
                          id="screenshot"
                          name="screenshot"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-crypto-light">PNG, JPG, GIF up to 10MB</p>
                    {selectedFile && (
                      <p className="text-crypto-green text-sm">Selected: {selectedFile.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <Alert className="bg-crypto-gold/10 border-crypto-gold/20">
                <AlertTriangle className="h-4 w-4 text-crypto-gold" />
                <AlertDescription className="text-crypto-gold">
                  <strong>Important:</strong> Please upload a clear screenshot of your JazzCash payment confirmation. 
                  Your investment will be manually reviewed and approved within 24 hours.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                disabled={investmentMutation.isPending}
                className="w-full crypto-button-primary text-lg py-4 h-auto"
              >
                {investmentMutation.isPending ? "Submitting..." : "Submit Investment Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Investment History */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-white">Investment History</CardTitle>
          </CardHeader>
          <CardContent>
            {investments && investments.length > 0 ? (
              <div className="space-y-4">
                {investments.map((investment: any) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 bg-crypto-dark rounded-lg border border-crypto-light/20">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-crypto-gold/20 rounded-lg flex items-center justify-center mr-4">
                        <CreditCard className="w-5 h-5 text-crypto-gold" />
                      </div>
                      <div>
                        <div className="text-white font-medium">${investment.amount}</div>
                        <div className="text-crypto-light text-sm">
                          {new Date(investment.createdAt).toLocaleDateString()} • {investment.paymentMethod}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(investment.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-crypto-light">No investments yet. Make your first investment to unlock full features!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
