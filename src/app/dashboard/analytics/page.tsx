"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ArrowLeft, TrendingUp, Brain, Heart, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmbodimentData {
  date: string;
  score: number;
  [key: string]: string | number;
}

interface TradePerformanceData {
  identity: string;
  avgPnl: number;
  tradeCount: number;
  [key: string]: string | number;
}

interface EmotionalStateData {
  state: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

interface NervousSystemData {
  state: string;
  winRate: number;
  totalTrades: number;
  [key: string]: string | number;
}

const dateRanges = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const identityLabels: Record<string, string> = {
  fearful_beginner: "Fearful Beginner",
  confident_professional: "Confident Professional",
  impatient_gambler: "Impatient Gambler",
  disciplined_trader: "Disciplined Trader",
  revenge_trader: "Revenge Trader",
};

const COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#78350f'];

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30");
  const [embodimentData, setEmbodimentData] = useState<EmbodimentData[]>([]);
  const [tradePerformanceData, setTradePerformanceData] = useState<TradePerformanceData[]>([]);
  const [emotionalStateData, setEmotionalStateData] = useState<EmotionalStateData[]>([]);
  const [nervousSystemData, setNervousSystemData] = useState<NervousSystemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Fetch embodiment data
      const { data: rituals } = await supabase
        .from('daily_rituals')
        .select('date, embodiment_score')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .not('embodiment_score', 'is', null)
        .order('date');

      setEmbodimentData(rituals?.map(r => ({
        date: new Date(r.date).toLocaleDateString(),
        score: r.embodiment_score
      })) || []);

      // Fetch trade performance data
      const { data: trades } = await supabase
        .from('trades')
        .select('identity_state, pnl')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .not('identity_state', 'is', null);

      const performanceMap = new Map<string, { totalPnl: number; count: number }>();
      trades?.forEach(trade => {
        const key = trade.identity_state;
        if (!performanceMap.has(key)) {
          performanceMap.set(key, { totalPnl: 0, count: 0 });
        }
        const current = performanceMap.get(key)!;
        performanceMap.set(key, {
          totalPnl: current.totalPnl + (trade.pnl || 0),
          count: current.count + 1
        });
      });

      const performanceData = Array.from(performanceMap.entries()).map(([identity, data]) => ({
        identity: identityLabels[identity] || identity,
        avgPnl: data.totalPnl / data.count,
        tradeCount: data.count
      }));

      setTradePerformanceData(performanceData);

      // Fetch emotional state data (using embodiment scores as proxy)
      const emotionalStates = [
        { state: "Low (1-3)", count: 0 },
        { state: "Medium (4-6)", count: 0 },
        { state: "High (7-10)", count: 0 }
      ];

      rituals?.forEach(ritual => {
        if (ritual.embodiment_score <= 3) emotionalStates[0].count++;
        else if (ritual.embodiment_score <= 6) emotionalStates[1].count++;
        else emotionalStates[2].count++;
      });

      const total = emotionalStates.reduce((sum, state) => sum + state.count, 0);
      const emotionalData = emotionalStates.map(state => ({
        ...state,
        percentage: total > 0 ? (state.count / total) * 100 : 0
      }));

      setEmotionalStateData(emotionalData);

      // Fetch nervous system data
      const { data: nervousTrades } = await supabase
        .from('trades')
        .select('nervous_system_state, pnl')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .not('nervous_system_state', 'is', null);

      const nervousMap = new Map<string, { wins: number; total: number }>();
      nervousTrades?.forEach(trade => {
        const key = trade.nervous_system_state;
        if (!nervousMap.has(key)) {
          nervousMap.set(key, { wins: 0, total: 0 });
        }
        const current = nervousMap.get(key)!;
        nervousMap.set(key, {
          wins: current.wins + (trade.pnl > 0 ? 1 : 0),
          total: current.total + 1
        });
      });

      const nervousData = Array.from(nervousMap.entries()).map(([state, data]) => ({
        state: state === 'calm_confidence' ? 'Calm Confidence' : 'Fight/Flight',
        winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
        totalTrades: data.total
      }));

      setNervousSystemData(nervousData);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
          <p className="text-slate-300">{label}</p>
          {payload.map((entry: { color: string; name: string; value: number }, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-yellow-400">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-yellow-400">Analytics</h1>
                <p className="text-slate-300">Track your trading psychology and performance</p>
              </div>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {dateRanges.map((range) => (
                  <SelectItem 
                    key={range.value} 
                    value={range.value}
                    className="text-white hover:bg-slate-600"
                  >
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="embodiment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="embodiment" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-slate-900">
              <Brain className="h-4 w-4 mr-2" />
              Embodiment
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-slate-900">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="emotional" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-slate-900">
              <Heart className="h-4 w-4 mr-2" />
              Emotional
            </TabsTrigger>
            <TabsTrigger value="nervous" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-slate-900">
              <Target className="h-4 w-4 mr-2" />
              Nervous System
            </TabsTrigger>
          </TabsList>

          {/* Embodiment Over Time */}
          <TabsContent value="embodiment">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Identity Embodiment Over Time</CardTitle>
                <CardDescription className="text-slate-300">
                  Track your daily embodiment scores to see patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-slate-400">Loading...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={embodimentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        domain={[0, 10]}
                        fontSize={12}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#fbbf24" 
                        strokeWidth={3}
                        dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#fbbf24', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trade Performance by Identity */}
          <TabsContent value="performance">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Trade Performance by Identity State</CardTitle>
                <CardDescription className="text-slate-300">
                  Average P&L for each trading identity you embodied
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-slate-400">Loading...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={tradePerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="identity" 
                        stroke="#9ca3af"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avgPnl" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emotional State Heatmap */}
          <TabsContent value="emotional">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Emotional State Distribution</CardTitle>
                <CardDescription className="text-slate-300">
                  Frequency of different embodiment levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-slate-400">Loading...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={emotionalStateData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ state, percentage }) => `${state}: ${percentage.toFixed(1)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {emotionalStateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nervous System vs Win Rate */}
          <TabsContent value="nervous">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Nervous System State vs Win Rate</CardTitle>
                <CardDescription className="text-slate-300">
                  Compare win rates between calm confidence and fight/flight states
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-slate-400">Loading...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={nervousSystemData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="state" 
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        domain={[0, 100]}
                        fontSize={12}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Win Rate']}
                      />
                      <Bar dataKey="winRate" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
