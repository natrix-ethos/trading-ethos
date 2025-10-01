"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft, Calculator, Save, Plus } from "lucide-react";
import Link from "next/link";

const tradeSchema = z.object({
  asset: z.string().min(1, "Asset symbol is required"),
  entryPrice: z.number().min(0, "Entry price must be positive"),
  exitPrice: z.number().min(0, "Exit price must be positive"),
  positionSize: z.number().min(0, "Position size must be positive"),
  identityState: z.string().min(1, "Please select an identity state"),
  embodimentRating: z.number().min(1).max(10),
  beliefsInfluence: z.string().min(10, "Please provide more detail about your beliefs"),
  nervousSystemState: z.enum(["fight_flight", "calm_confidence"], {
    required_error: "Please select your pre-trade state",
  }),
});

type TradeFormData = z.infer<typeof tradeSchema>;

const identityOptions = [
  { value: "fearful_beginner", label: "Fearful Beginner" },
  { value: "confident_professional", label: "Confident Professional" },
  { value: "impatient_gambler", label: "Impatient Gambler" },
  { value: "disciplined_trader", label: "Disciplined Trader" },
  { value: "revenge_trader", label: "Revenge Trader" },
];

export default function TradeEntry() {
  const [pnl, setPnl] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const form = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      asset: "",
      entryPrice: 0,
      exitPrice: 0,
      positionSize: 0,
      identityState: "",
      embodimentRating: 5,
      beliefsInfluence: "",
      nervousSystemState: undefined,
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  // Auto-calculate P&L
  useEffect(() => {
    const { entryPrice, exitPrice, positionSize } = watchedValues;
    if (entryPrice > 0 && exitPrice > 0 && positionSize > 0) {
      const calculatedPnl = (exitPrice - entryPrice) * positionSize;
      setPnl(calculatedPnl);
    } else {
      setPnl(0);
    }
  }, [watchedValues.entryPrice, watchedValues.exitPrice, watchedValues.positionSize]);

  // Update timestamp every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: TradeFormData) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to save trades");
        return;
      }

      const tradeData = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        time: currentTime.toTimeString().split(' ')[0],
        asset: data.asset.toUpperCase(),
        entry: data.entryPrice,
        exit: data.exitPrice,
        pnl: pnl,
        identity_state: data.identityState,
        embodiment_rating: data.embodimentRating,
        beliefs_influence: data.beliefsInfluence,
        nervous_system_state: data.nervousSystemState,
      };

      const { error } = await supabase
        .from('trades')
        .insert([tradeData]);

      if (error) {
        throw error;
      }

      toast.success("Trade saved successfully!", {
        description: `${data.asset} trade recorded with P&L of $${pnl.toFixed(2)}`,
      });

      // Reset form
      form.reset();
      setPnl(0);
      
    } catch (error) {
      console.error('Error saving trade:', error);
      toast.error("Failed to save trade", {
        description: "Please try again or contact support if the issue persists.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndAddAnother = async (data: TradeFormData) => {
    await onSubmit(data);
    // Form will be reset after successful submission
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-yellow-400">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">Trade Entry</h1>
              <p className="text-slate-300">Record your trade with psychological insights</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Trade Details Section */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Trade Details
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Basic trade information and calculations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="asset" className="text-slate-300">Asset Symbol</Label>
                    <Input
                      id="asset"
                      placeholder="e.g., BTC, ETH, AAPL"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      {...form.register("asset", { 
                        setValueAs: (value) => value.toUpperCase() 
                      })}
                    />
                    {form.formState.errors.asset && (
                      <p className="text-red-400 text-sm">{form.formState.errors.asset.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timestamp" className="text-slate-300">Timestamp</Label>
                    <Input
                      id="timestamp"
                      value={currentTime.toLocaleString()}
                      disabled
                      className="bg-slate-600 border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entryPrice" className="text-slate-300">Entry Price</Label>
                    <Input
                      id="entryPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      {...form.register("entryPrice", { 
                        valueAsNumber: true 
                      })}
                    />
                    {form.formState.errors.entryPrice && (
                      <p className="text-red-400 text-sm">{form.formState.errors.entryPrice.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exitPrice" className="text-slate-300">Exit Price</Label>
                    <Input
                      id="exitPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      {...form.register("exitPrice", { 
                        valueAsNumber: true 
                      })}
                    />
                    {form.formState.errors.exitPrice && (
                      <p className="text-red-400 text-sm">{form.formState.errors.exitPrice.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="positionSize" className="text-slate-300">Position Size</Label>
                    <Input
                      id="positionSize"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      {...form.register("positionSize", { 
                        valueAsNumber: true 
                      })}
                    />
                    {form.formState.errors.positionSize && (
                      <p className="text-red-400 text-sm">{form.formState.errors.positionSize.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pnl" className="text-slate-300">P&L (Auto-calculated)</Label>
                    <Input
                      id="pnl"
                      value={`$${pnl.toFixed(2)}`}
                      disabled
                      className={`bg-slate-600 border-slate-600 text-slate-300 ${
                        pnl > 0 ? 'text-green-400' : pnl < 0 ? 'text-red-400' : ''
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identity Questions Section */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Identity & Psychology</CardTitle>
                <CardDescription className="text-slate-300">
                  Reflect on your mental state and trading identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">What identity was I embodying?</Label>
                  <Select
                    value={form.watch("identityState")}
                    onValueChange={(value) => form.setValue("identityState", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select your trading identity" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {identityOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className="text-white hover:bg-slate-600"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.identityState && (
                    <p className="text-red-400 text-sm">{form.formState.errors.identityState.message}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-slate-300">
                    Did I trade like my future profitable self? ({form.watch("embodimentRating")}/10)
                  </Label>
                  <Slider
                    value={[form.watch("embodimentRating")]}
                    onValueChange={(value) => form.setValue("embodimentRating", value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Not at all</span>
                    <span>Completely</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beliefsInfluence" className="text-slate-300">
                    How did my beliefs influence this outcome?
                  </Label>
                  <Textarea
                    id="beliefsInfluence"
                    placeholder="Describe how your beliefs, fears, or expectations influenced this trade decision..."
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                    {...form.register("beliefsInfluence")}
                  />
                  {form.formState.errors.beliefsInfluence && (
                    <p className="text-red-400 text-sm">{form.formState.errors.beliefsInfluence.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-300">Pre-trade state:</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="fight_flight"
                        value="fight_flight"
                        {...form.register("nervousSystemState")}
                        className="text-yellow-400"
                      />
                      <Label htmlFor="fight_flight" className="text-slate-300 cursor-pointer">
                        Fight/Flight (Anxious, rushed, reactive)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="calm_confidence"
                        value="calm_confidence"
                        {...form.register("nervousSystemState")}
                        className="text-yellow-400"
                      />
                      <Label htmlFor="calm_confidence" className="text-slate-300 cursor-pointer">
                        Calm Confidence (Centered, deliberate, strategic)
                      </Label>
                    </div>
                  </div>
                  {form.formState.errors.nervousSystemState && (
                    <p className="text-red-400 text-sm">{form.formState.errors.nervousSystemState.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-yellow-400"
                onClick={form.handleSubmit(handleSaveAndAddAnother)}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-2" />
                Save & Add Another
              </Button>
              <Button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold"
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Trade"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
