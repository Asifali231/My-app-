import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Shield, Zap } from "lucide-react";
import { jazzCashPaymentFormSchema, type JazzCashPaymentForm } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Payment() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<JazzCashPaymentForm>({
    resolver: zodResolver(jazzCashPaymentFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      amount: "",
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: JazzCashPaymentForm) => {
      return await apiRequest("/api/payment/jazzcash", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response) => {
      setIsProcessing(false);
      toast({
        title: "Payment Initiated",
        description: "Your payment is being processed. You will be redirected to JazzCash.",
        variant: "default",
      });
      
      // In a real implementation, you might redirect to JazzCash or show transaction details
      console.log("Payment response:", response);
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JazzCashPaymentForm) => {
    setIsProcessing(true);
    paymentMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Make Investment Payment</h1>
        <p className="text-gray-400">Secure payment processing with JazzCash</p>
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
          <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-gray-300">Bank-Level Security</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
          <Zap className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-gray-300">Instant Processing</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
          <CreditCard className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <p className="text-sm text-gray-300">JazzCash Integration</p>
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Fill in your details to complete the investment payment via JazzCash
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        className="bg-gray-800 border-gray-700 text-white"
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">JazzCash Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="03XXXXXXXXX"
                        {...field}
                        className="bg-gray-800 border-gray-700 text-white"
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                        className="bg-gray-800 border-gray-700 text-white"
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Investment Amount (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="30"
                        step="1"
                        placeholder="Minimum $30"
                        {...field}
                        className="bg-gray-800 border-gray-700 text-white"
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-400">Minimum investment: $30 USD</p>
                  </FormItem>
                )}
              />

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-400 font-semibold mb-2">Payment Process</h3>
                <ol className="text-sm text-blue-300 space-y-1">
                  <li>1. Click "Pay with JazzCash" to initiate payment</li>
                  <li>2. You will be redirected to JazzCash secure payment page</li>
                  <li>3. Complete payment using your JazzCash account</li>
                  <li>4. You will be redirected back with payment confirmation</li>
                  <li>5. Investment will be pending admin approval</li>
                </ol>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isProcessing || paymentMutation.isPending}
              >
                {isProcessing || paymentMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay with JazzCash
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-8 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <h3 className="text-yellow-400 font-semibold mb-2">Important Notes</h3>
        <ul className="text-sm text-yellow-300 space-y-1">
          <li>• Ensure your JazzCash account has sufficient balance</li>
          <li>• All transactions are secure and encrypted</li>
          <li>• Investment approval may take 24-48 hours</li>
          <li>• Contact support for any payment issues</li>
        </ul>
      </div>
    </div>
  );
}