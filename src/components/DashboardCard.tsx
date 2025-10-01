import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
  className?: string;
}

export function DashboardCard({
  icon: Icon,
  title,
  description,
  buttonText,
  onButtonClick,
  className = ""
}: DashboardCardProps) {
  return (
    <Card className={`bg-slate-800/50 border-slate-700 hover:border-yellow-400/50 transition-colors ${className}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-yellow-400/10 rounded-full w-fit">
          <Icon className="h-8 w-8 text-yellow-400" />
        </div>
        <CardTitle className="text-yellow-400">{title}</CardTitle>
        <CardDescription className="text-slate-300">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button 
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold"
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
