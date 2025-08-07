import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Shield
} from "lucide-react";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: adminStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: pendingInvestments } = useQuery({
    queryKey: ["/api/admin/investments"],
    enabled: !!user?.isAdmin,
  });

  const { data: pendingWithdrawals } = useQuery({
    queryKey: ["/api/admin/withdrawals"],
    enabled: !!user?.isAdmin,
  });

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const updateInvestmentMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      return await apiRequest("POST", `/api/admin/investments/${id}/${action}`);
    },
    onSuccess: (_, { action }) => {
      toast({
        title: "Investment Updated",
        description: `Investment ${action}d successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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
        description: "Failed to update investment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      return await apiRequest("POST", `/api/admin/withdrawals/${id}/${action}`);
    },
    onSuccess: (_, { action }) => {
      toast({
        title: "Withdrawal Updated",
        description: `Withdrawal ${action}d successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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
        description: "Failed to update withdrawal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInvestmentAction = (id: string, action: 'approve' | 'reject') => {
    updateInvestmentMutation.mutate({ id, action });
  };

  const handleWithdrawalAction = (id: string, action: 'approve' | 'reject') => {
    updateWithdrawalMutation.mutate({ id, action });
  };

  const handleViewScreenshot = (screenshotUrl: string) => {
    if (screenshotUrl) {
      window.open(screenshotUrl, '_blank');
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <Card className="crypto-card max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-16 h-16 text-crypto-red mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-crypto-light">Admin privileges required to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-crypto-gold" />
            Admin Panel
          </h1>
          <p className="text-crypto-light">Manage investments, withdrawals, and monitor platform statistics</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="crypto-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {adminStats?.totalUsers || 0}
                  </div>
                  <div className="text-crypto-light text-sm">Total Users</div>
                </div>
                <Users className="w-8 h-8 text-crypto-light" />
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-crypto-gold">
                    {adminStats?.pendingInvestments || 0}
                  </div>
                  <div className="text-crypto-light text-sm">Pending Investments</div>
                </div>
                <TrendingUp className="w-8 h-8 text-crypto-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-crypto-red">
                    {adminStats?.pendingWithdrawals || 0}
                  </div>
                  <div className="text-crypto-light text-sm">Pending Withdrawals</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-crypto-red" />
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-crypto-green">
                    ${adminStats?.totalInvested || "0.00"}
                  </div>
                  <div className="text-crypto-light text-sm">Total Invested</div>
                </div>
                <DollarSign className="w-8 h-8 text-crypto-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Investments */}
        <Card className="crypto-card mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-crypto-gold" />
              Pending Investment Requests ({pendingInvestments?.filter((inv: any) => inv.status === 'pending').length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingInvestments && pendingInvestments.filter((inv: any) => inv.status === 'pending').length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-crypto-light/20">
                      <TableHead className="text-crypto-light">User</TableHead>
                      <TableHead className="text-crypto-light">Amount</TableHead>
                      <TableHead className="text-crypto-light">JazzCash</TableHead>
                      <TableHead className="text-crypto-light">Method</TableHead>
                      <TableHead className="text-crypto-light">Screenshot</TableHead>
                      <TableHead className="text-crypto-light">Date</TableHead>
                      <TableHead className="text-crypto-light">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvestments
                      .filter((investment: any) => investment.status === 'pending')
                      .map((investment: any) => (
                        <TableRow key={investment.id} className="border-crypto-light/20">
                          <TableCell className="text-white font-medium">
                            {investment.fullName}
                          </TableCell>
                          <TableCell className="text-crypto-gold font-semibold">
                            ${investment.amount}
                          </TableCell>
                          <TableCell className="text-crypto-light">
                            {investment.jazzCashNumber}
                          </TableCell>
                          <TableCell className="text-crypto-light">
                            {investment.paymentMethod.replace('_', ' ')}
                          </TableCell>
                          <TableCell>
                            {investment.screenshotUrl ? (
                              <Button
                                size="sm"
                                onClick={() => handleViewScreenshot(investment.screenshotUrl)}
                                className="bg-crypto-accent/20 hover:bg-crypto-accent/30 text-crypto-accent"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            ) : (
                              <span className="text-crypto-red text-sm">No screenshot</span>
                            )}
                          </TableCell>
                          <TableCell className="text-crypto-light">
                            {new Date(investment.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleInvestmentAction(investment.id, 'approve')}
                                disabled={updateInvestmentMutation.isPending}
                                className="bg-crypto-green/20 hover:bg-crypto-green/30 text-crypto-green"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleInvestmentAction(investment.id, 'reject')}
                                disabled={updateInvestmentMutation.isPending}
                                className="bg-crypto-red/20 hover:bg-crypto-red/30 text-crypto-red"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-16 h-16 text-crypto-light mx-auto mb-4 opacity-50" />
                <p className="text-crypto-light">No pending investment requests</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="crypto-card mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-crypto-red" />
              Pending Withdrawal Requests ({pendingWithdrawals?.filter((wd: any) => wd.status === 'pending').length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingWithdrawals && pendingWithdrawals.filter((wd: any) => wd.status === 'pending').length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-crypto-light/20">
                      <TableHead className="text-crypto-light">User</TableHead>
                      <TableHead className="text-crypto-light">Amount</TableHead>
                      <TableHead className="text-crypto-light">JazzCash</TableHead>
                      <TableHead className="text-crypto-light">Date</TableHead>
                      <TableHead className="text-crypto-light">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingWithdrawals
                      .filter((withdrawal: any) => withdrawal.status === 'pending')
                      .map((withdrawal: any) => (
                        <TableRow key={withdrawal.id} className="border-crypto-light/20">
                          <TableCell className="text-white font-medium">
                            {withdrawal.fullName}
                          </TableCell>
                          <TableCell className="text-crypto-red font-semibold">
                            ${withdrawal.amount}
                          </TableCell>
                          <TableCell className="text-crypto-light">
                            {withdrawal.jazzCashNumber}
                          </TableCell>
                          <TableCell className="text-crypto-light">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                                disabled={updateWithdrawalMutation.isPending}
                                className="bg-crypto-green/20 hover:bg-crypto-green/30 text-crypto-green"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleWithdrawalAction(withdrawal.id, 'reject')}
                                disabled={updateWithdrawalMutation.isPending}
                                className="bg-crypto-red/20 hover:bg-crypto-red/30 text-crypto-red"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-16 h-16 text-crypto-light mx-auto mb-4 opacity-50" />
                <p className="text-crypto-light">No pending withdrawal requests</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-crypto-gold font-semibold mb-3">Recent Investments</h4>
                {pendingInvestments && pendingInvestments.slice(0, 5).map((investment: any) => (
                  <div key={investment.id} className="flex items-center justify-between py-2 border-b border-crypto-light/10">
                    <div>
                      <div className="text-white text-sm">{investment.fullName}</div>
                      <div className="text-crypto-light text-xs">
                        {new Date(investment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-crypto-gold font-medium">${investment.amount}</span>
                      {getStatusBadge(investment.status)}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-crypto-red font-semibold mb-3">Recent Withdrawals</h4>
                {pendingWithdrawals && pendingWithdrawals.slice(0, 5).map((withdrawal: any) => (
                  <div key={withdrawal.id} className="flex items-center justify-between py-2 border-b border-crypto-light/10">
                    <div>
                      <div className="text-white text-sm">{withdrawal.fullName}</div>
                      <div className="text-crypto-light text-xs">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-crypto-red font-medium">${withdrawal.amount}</span>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
