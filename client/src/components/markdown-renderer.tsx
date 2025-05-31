import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');
            const isInline = !match;
            
            return isInline ? (
              <code 
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" 
                {...props}
              >
                {children}
              </code>
            ) : (
              <CodeBlock language={match[1]} className={className}>
                {codeContent}
              </CodeBlock>
            );
          },
          pre({ children }) {
            return <div className="overflow-hidden rounded-lg">{children}</div>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}