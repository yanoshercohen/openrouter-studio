import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { Terminal, Copy, Code, ChevronDown, Bot, AlertCircle, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OpenRouterLogo } from "@/components/openrouter-logo";
import { MarkdownRenderer } from './markdown-renderer';

interface ResponsePanelProps {
  completionData: {
    content: string;
    tokensUsed: number;
    responseTime: number;
    model: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export default function ResponsePanel({ completionData, isLoading, error }: ResponsePanelProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 5000, // Refresh stats every 5 seconds
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Response has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getStatusIndicator = () => {
    if (isLoading) {
      return {
        color: "bg-blue-500 animate-pulse",
        text: "Generating...",
      };
    } else if (error) {
      return {
        color: "bg-red-500",
        text: "Error",
      };
    } else if (completionData) {
      return {
        color: "bg-green-500",
        text: "Success",
      };
    } else {
      return {
        color: "bg-slate-300",
        text: "Ready",
      };
    }
  };

  const status = getStatusIndicator();

  const generateCodeExample = () => {
    if (!completionData) return "";

    return `const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer sk-or-v1-...",
    "Content-Type": "application/json",
    "HTTP-Referer": "https://openrouter-studio.replit.app",
    "X-Title": "OpenRouter Studio",
  },
  body: JSON.stringify({
    model: "${completionData.model}",
    messages: [
      {
        role: "user",
        content: "Be precise and concise."
      },
      {
        role: "user",
        content: "Your prompt here..."
      }
    ],
    temperature: 0.2,
    stream: false,
    return_images: false,
    return_related_questions: false,
  }),
});

const data = await response.json();
console.log(data.choices[0].message.content);`;
  };

  return (
    <div className="space-y-6">
      {/* Response Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Response</h2>
            </div>
            <div className="flex items-center space-x-4">
              {completionData && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-raw" 
                    checked={showRaw} 
                    onCheckedChange={(checked) => setShowRaw(checked === true)}
                  />
                  <label htmlFor="show-raw" className="text-sm text-muted-foreground cursor-pointer">
                    View Raw
                  </label>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                <span className="text-sm text-muted-foreground">{status.text}</span>
              </div>
              {completionData && (
                <button
                  onClick={() => copyToClipboard(completionData.content)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="min-h-[300px] max-h-[600px]">
            {/* Empty State */}
            {!isLoading && !completionData && !error && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <OpenRouterLogo className="h-12 w-12 mb-3" />
                <p className="text-lg font-medium text-foreground">No response yet</p>
                <p className="text-sm">Send a prompt to see the AI response here</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="text-foreground">Generating response...</span>
                </div>
              </div>
            )}

            {/* Response Content */}
            {completionData && !error && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border max-h-[500px] overflow-y-auto dark-scrollbar">
                {showRaw ? (
                  <pre className="whitespace-pre-wrap text-foreground font-mono text-sm leading-relaxed">
                    {completionData.content}
                  </pre>
                ) : (
                  <MarkdownRenderer content={completionData.content} className="prose-sm" />
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 max-h-[200px] overflow-auto error-container">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-destructive">Request Failed</p>
                    <div className="text-sm text-destructive/80 mt-1 break-words overflow-wrap-anywhere">
                      {(() => {
                        try {
                          const parsed = JSON.parse(error);
                          return parsed.message || parsed.error || error;
                        } catch {
                          return error;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Request Details */}
      <Card>
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">Request Details</h3>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transform transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="border-t border-border p-6">
              <div className="space-y-4">
                {/* Request Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-muted-foreground mb-1">Status</label>
                    <span className="text-foreground font-mono">
                      {error ? "Error" : completionData ? "200 OK" : "-"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Response Time</label>
                    <span className="text-foreground font-mono">
                      {completionData ? `${completionData.responseTime}ms` : "-"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Tokens Used</label>
                    <span className="text-foreground font-mono">
                      {completionData ? completionData.tokensUsed : "-"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Model</label>
                    <span className="text-foreground font-mono">
                      {completionData ? completionData.model : "-"}
                    </span>
                  </div>
                </div>

                {/* Request Code */}
                {completionData && (
                  <div>
                    <label className="block text-muted-foreground mb-2">Generated Code</label>
                    <div className="bg-slate-950 rounded-lg p-4 text-sm font-mono text-white overflow-x-auto border border-border">
                      <pre className="text-green-400">{generateCodeExample()}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Session Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {(stats as any)?.requests || 0}
              </div>
              <div className="text-sm text-muted-foreground">Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {(stats as any)?.tokens || 0}
              </div>
              <div className="text-sm text-muted-foreground">Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {(stats as any)?.avgTime || 0}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
