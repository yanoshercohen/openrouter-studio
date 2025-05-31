import { useState } from "react";
import RequestPanel from "@/components/request-panel";
import ResponsePanel from "@/components/response-panel";
import { Settings, Moon, Sun, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { OpenRouterLogo } from "@/components/openrouter-logo";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { ErrorToast } from "@/components/error-toast";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [completionData, setCompletionData] = useState<{
    content: string;
    tokensUsed: number;
    responseTime: number;
    model: string;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const handleCompletionResult = (data: {
    content: string;
    tokensUsed: number;
    responseTime: number;
    model: string;
  }) => {
    setCompletionData(data);
    setError(null);
    setShowErrorToast(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setCompletionData(null);
    setShowErrorToast(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center">
                <OpenRouterLogo className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">OpenRouter Studio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/arena">
                <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Trophy className="h-4 w-4 mr-2" />
                  Arena Mode
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">v1.0.0</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RequestPanel
            onResult={handleCompletionResult}
            onError={handleError}
            onLoadingChange={setIsLoading}
          />
          <ResponsePanel
            completionData={completionData}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>OpenRouter Studio</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                100% FREE
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span>Powered by OpenRouter</span>
              <span>•</span>
              <span>Made with ♥ by yan</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Error Toast */}
      {showErrorToast && error && (
        <ErrorToast 
          message={error} 
          onClose={() => setShowErrorToast(false)} 
        />
      )}
    </div>
  );
}
