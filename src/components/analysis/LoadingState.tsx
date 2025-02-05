
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-6">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <h2 className="text-2xl font-semibold">Analyzing Your Project...</h2>
          <p className="text-gray-600">Please wait while our AI analyzes your project details.</p>
        </div>
      </Card>
    </div>
  );
};
