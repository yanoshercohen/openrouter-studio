import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key } from "lucide-react";

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  showApiKey: boolean;
  toggleShowApiKey: () => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function ApiKeyInput({
  apiKey,
  setApiKey,
  showApiKey,
  toggleShowApiKey,
  placeholder = "Enter your OpenRouter API key",
  label = "OpenRouter API Key",
  className
}: ApiKeyInputProps) {
  return (
    <div className={className}>
      <Label htmlFor="api-key" className="flex items-center space-x-2 text-sm font-medium">
        <Key className="h-3 w-3" />
        <span>{label}</span>
      </Label>
      <div className="relative mt-1.5">
        <Input
          id="api-key"
          type={showApiKey ? "text" : "password"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={toggleShowApiKey}
        >
          {showApiKey ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}