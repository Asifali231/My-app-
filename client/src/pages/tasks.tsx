import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { CheckCircle, Play, RotateCcw, Brain } from "lucide-react";

export default function Tasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/daily-tasks"],
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest("POST", `/api/daily-tasks/${taskId}/complete`);
    },
    onSuccess: () => {
      toast({
        title: "Task Completed!",
        description: "Reward has been added to your balance.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCompleteTask = (taskId: string, taskType: string) => {
    if (taskType === 'watch_ad') {
      // Simulate watching ad
      toast({
        title: "Watching Ad...",
        description: "Please wait while the advertisement loads.",
      });
      setTimeout(() => {
        completeTaskMutation.mutate(taskId);
      }, 2000);
    } else if (taskType === 'spin_wheel') {
      // Simulate spinning wheel
      toast({
        title: "Spinning Wheel...",
        description: "Good luck!",
      });
      setTimeout(() => {
        completeTaskMutation.mutate(taskId);
      }, 1500);
    } else if (taskType === 'quiz') {
      // Simulate quiz completion
      toast({
        title: "Starting Quiz...",
        description: "Answer the questions to earn your reward.",
      });
      setTimeout(() => {
        completeTaskMutation.mutate(taskId);
      }, 3000);
    }
  };

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'watch_ad':
        return <Play className="w-8 h-8 text-crypto-red" />;
      case 'spin_wheel':
        return <RotateCcw className="w-8 h-8 text-crypto-gold" />;
      case 'quiz':
        return <Brain className="w-8 h-8 text-crypto-accent" />;
      default:
        return <Play className="w-8 h-8 text-crypto-light" />;
    }
  };

  const getTaskTitle = (taskType: string) => {
    switch (taskType) {
      case 'watch_ad':
        return "Watch Advertisement";
      case 'spin_wheel':
        return "Lucky Spin";
      case 'quiz':
        return "Daily Quiz";
      default:
        return "Daily Task";
    }
  };

  const getTaskDescription = (taskType: string) => {
    switch (taskType) {
      case 'watch_ad':
        return "Watch a 30-second video ad to earn rewards";
      case 'spin_wheel':
        return "Spin the wheel for a chance to win rewards";
      case 'quiz':
        return "Answer 5 questions correctly to earn rewards";
      default:
        return "Complete this task to earn rewards";
    }
  };

  const getTaskButtonText = (taskType: string, completed: boolean) => {
    if (completed) return "Completed Today";
    
    switch (taskType) {
      case 'watch_ad':
        return "Watch Ad";
      case 'spin_wheel':
        return "Spin Now";
      case 'quiz':
        return "Take Quiz";
      default:
        return "Complete Task";
    }
  };

  const getTaskButtonColor = (taskType: string) => {
    switch (taskType) {
      case 'watch_ad':
        return "bg-crypto-red hover:bg-crypto-red/80 text-white";
      case 'spin_wheel':
        return "bg-crypto-gold hover:bg-crypto-gold/80 text-white";
      case 'quiz':
        return "bg-crypto-accent hover:bg-crypto-accent/80 text-white";
      default:
        return "bg-crypto-light hover:bg-crypto-light/80 text-white";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading tasks...</div>
      </div>
    );
  }

  const completedTasks = tasks?.filter((task: any) => task.completed) || [];
  const totalTasks = tasks?.length || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const todayEarnings = completedTasks.reduce((sum: number, task: any) => sum + parseFloat(task.reward), 0);

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Daily Tasks</h1>
          <p className="text-crypto-light">Complete tasks to earn rewards and increase your balance</p>
        </div>

        {/* Task Summary */}
        <Card className="crypto-card mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Today's Progress</h3>
                <p className="text-crypto-light">
                  You've earned <span className="text-crypto-green font-semibold">${todayEarnings.toFixed(2)}</span> from tasks today
                </p>
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-crypto-light mb-1">
                    <span>Tasks completed</span>
                    <span>{completedTasks.length}/{totalTasks}</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{completionRate}%</div>
                <p className="text-sm text-crypto-light">Completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tasks?.map((task: any) => (
            <Card key={task.id} className="crypto-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-crypto-dark/50 rounded-lg flex items-center justify-center">
                    {getTaskIcon(task.taskType)}
                  </div>
                  <Badge 
                    variant={task.completed ? "secondary" : "outline"}
                    className={task.completed ? "bg-crypto-green/20 text-crypto-green" : "bg-crypto-gold/20 text-crypto-gold"}
                  >
                    {task.completed ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </>
                    ) : (
                      `+$${task.reward}`
                    )}
                  </Badge>
                </div>
                <CardTitle className="text-white">{getTaskTitle(task.taskType)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-crypto-light text-sm mb-4">{getTaskDescription(task.taskType)}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-crypto-light mb-1">
                    <span>Progress</span>
                    <span>{task.completed ? "1/1" : "0/1"}</span>
                  </div>
                  <Progress value={task.completed ? 100 : 0} className="h-2" />
                </div>

                <Button
                  onClick={() => handleCompleteTask(task.id, task.taskType)}
                  disabled={task.completed || completeTaskMutation.isPending}
                  className={`w-full ${task.completed 
                    ? "bg-crypto-light/20 text-crypto-light cursor-not-allowed" 
                    : getTaskButtonColor(task.taskType)
                  }`}
                >
                  {completeTaskMutation.isPending ? "Processing..." : getTaskButtonText(task.taskType, task.completed)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Reset Info */}
        <Card className="crypto-card mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-center text-center">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">📅 Daily Reset</h3>
                <p className="text-crypto-light">
                  Tasks reset every day at midnight UTC. Come back tomorrow for new opportunities to earn!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
