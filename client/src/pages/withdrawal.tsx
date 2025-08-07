import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Smartphone, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

const withdrawalSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  jazzCashNumber: z.string().regex(/^03\d{9}$/, "Please enter a valid JazzCash number (03XXXXXXXXX)"),
  amount: z.number().min(100, "Minimum withdrawal amount is $100"),
});

type WithdrawalForm = z.infer<typeof withdrawalSchema>;

export default function Withdrawal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: withdrawals } = useQuery({
    queryKey: ["/api/withdrawals"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WithdrawalForm>({
    resolver: zodResolver(withdrawalSchema),
  });

  const withdrawalMutation = useMutation({
    mutationFn: async (data: WithdrawalForm) => {
      return await apiRequest("POST", "/api/jazzcash/withdraw", data);
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted. Manual approval within 10 working days.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: error.message || "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WithdrawalForm) => {
    withdrawalMutation.mutate(data);
  };

  const currentBalance = parseFloat(user?.totalBalance || "0");
  const canWithdraw = user?.isInvestor && currentBalance >= 100;

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
            <XCircle className="w-3 h-3 mr-1" />
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
          <h1 className="text-3xl font-bold text-white mb-2">Withdrawal Request</h1>
          <p className="text-crypto-light">Withdraw your earnings when balance reaches $100 or more</p>
        </div>

        {/* Withdrawal Form */}
        <Card className="crypto-card mb-8">
          <CardHeader>
            <CardTitle className="text-white">Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Eligibility Status */}
            <div className="mb-6">
              {canWithdraw ? (
                <Alert className="bg-crypto-green/10 border-crypto-green/20">
                  <CheckCircle className="h-4 w-4 text-crypto-green" />
                  <AlertDescription className="text-crypto-green">
                    <strong>Eligible for withdrawal!</strong> Your current balance of ${user?.totalBalance} meets the minimum requirement.
                  </AlertDescription>
                </Alert>
              ) : !user?.isInvestor ? (
                <Alert className="bg-crypto-red/10 border-crypto-red/20">
                  <AlertTriangle className="h-4 w-4 text-crypto-red" />
                  <AlertDescription className="text-crypto-red">
                    <strong>Investment required!</strong> You must make a minimum $30 investment before withdrawing funds.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-crypto-gold/10 border-crypto-gold/20">
                  <AlertTriangle className="h-4 w-4 text-crypto-gold" />
                  <AlertDescription className="text-crypto-gold">
                    <strong>Minimum balance not met!</strong> You need at least $100 to withdraw. Current balance: ${user?.totalBalance}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName" className="text-crypto-light">Full Name</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    disabled={!canWithdraw}
                    className="bg-crypto-dark border-crypto-light/20 text-white disabled:opacity-50"
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
                    disabled={!canWithdraw}
                    className="bg-crypto-dark border-crypto-light/20 text-white disabled:opacity-50"
                    placeholder="03XXXXXXXXX"
                  />
                  {errors.jazzCashNumber && (
                    <p className="text-crypto-red text-sm mt-1">{errors.jazzCashNumber.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="amount" className="text-crypto-light">Withdrawal Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-crypto-light">$</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    min="100"
                    max={currentBalance}
                    step="0.01"
                    {...register("amount", { valueAsNumber: true })}
                    disabled={!canWithdraw}
                    className="bg-crypto-dark border-crypto-light/20 text-white pl-8 disabled:opacity-50"
                    placeholder="100.00"
                  />
                </div>
                <div className="flex justify-between text-sm text-crypto-light mt-1">
                  <span>Minimum: $100</span>
                  <span>Available: ${user?.totalBalance || "0.00"}</span>
                </div>
                {errors.amount && (
                  <p className="text-crypto-red text-sm mt-1">{errors.amount.message}</p>
                )}
              </div>

              <Alert className="bg-crypto-red/10 border-crypto-red/20">
                <AlertTriangle className="h-4 w-4 text-crypto-red" />
                <AlertDescription className="text-crypto-red">
                  <strong>Important Notice:</strong> Withdrawals are manually approved within 10 working days. 
                  Please ensure your JazzCash account details are correct.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                disabled={!canWithdraw || withdrawalMutation.isPending}
                className={`w-full text-lg py-4 h-auto ${
                  canWithdraw 
                    ? "bg-gradient-to-r from-crypto-green to-crypto-accent hover:opacity-90 text-white" 
                    : "bg-crypto-light/20 text-crypto-light cursor-not-allowed"
                }`}
              >
                {withdrawalMutation.isPending ? "Submitting..." : "Request Withdrawal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-white">Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals && withdrawals.length > 0 ? (
              <div className="space-y-4">
                {withdrawals.map((withdrawal: any) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-crypto-dark rounded-lg border border-crypto-light/20">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-crypto-red/20 rounded-lg flex items-center justify-center mr-4">
                        <Smartphone className="w-5 h-5 text-crypto-red" />
                      </div>
                      <div>
                        <div className="text-white font-medium">${withdrawal.amount}</div>
                        <div className="text-crypto-light text-sm">
                          {new Date(withdrawal.createdAt).toLocaleDateString()} • {withdrawal.jazzCashNumber}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(withdrawal.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-crypto-light">No withdrawal requests yet. Make your first withdrawal when you reach $100!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
