import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/DashboardCard";
import { StreakCounter } from "@/components/StreakCounter";
import { EmbodimentScore } from "@/components/EmbodimentScore";
import { Sun, TrendingUp, Moon } from "lucide-react";

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Mock data - replace with actual data from Supabase
  const streakCount = 7;
  const embodimentScore = 8;
  const microWinsCount = 12;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">Trading Ethos</h1>
              <p className="text-slate-300">Welcome back! Ready to embody your trading edge?</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">{currentDate}</p>
                <p className="text-lg font-semibold text-yellow-400">{currentTime}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-slate-800/30 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <StreakCounter streakCount={streakCount} />
              <EmbodimentScore score={embodimentScore} size="sm" />
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-slate-300">Micro Wins:</span>
                <span className="font-bold text-yellow-400">{microWinsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            icon={Sun}
            title="Pre-Market"
            description="Set your intention and prepare your mindset"
            buttonText="Start Ritual"
            onButtonClick={() => console.log('Pre-market ritual started')}
          />
          
          <DashboardCard
            icon={TrendingUp}
            title="During Trading"
            description="Track trades and maintain embodiment"
            buttonText="Log Trade"
            onButtonClick={() => console.log('Trade logging started')}
          />
          
          <DashboardCard
            icon={Moon}
            title="Post-Market"
            description="Reflect and capture micro-evidence"
            buttonText="Review Day"
            onButtonClick={() => console.log('Post-market review started')}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-yellow-400">Quick Actions</CardTitle>
              <CardDescription className="text-slate-300">
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-yellow-400">
                  Add Micro Win
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-yellow-400">
                  Weekly Review
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-yellow-400">
                  Monthly Review
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-yellow-400">
                  View Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
