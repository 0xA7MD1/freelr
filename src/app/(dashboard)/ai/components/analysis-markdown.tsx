import { Fragment } from "react";

interface Props {
  text: string;
}

function renderInline(line: string, keyPrefix: string) {
  return line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>;
  });
}

export function AnalysisMarkdown({ text }: Props) {
  const lines = text.split("\n");
  return (
    <div
      className="prose prose-sm md:prose-base dark:prose-invert max-w-none
        prose-headings:text-foreground prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg
        prose-p:leading-relaxed prose-p:text-muted-foreground
        prose-li:marker:text-[#0052FC] prose-ul:my-6 prose-li:my-2
        prose-strong:text-foreground prose-strong:font-bold"
    >
      {lines.map((line, i) => {
        if (line.startsWith("#")) {
          const level = Math.min(line.match(/^#+/)?.[0].length ?? 1, 5);
          const text = line.replace(/^#+\s*/, "");
          const Tag = `h${level + 1}` as keyof React.JSX.IntrinsicElements;
          return (
            <Tag key={i} className="mt-8 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0052FC] inline-block shrink-0" />
              {text}
            </Tag>
          );
        }
        if (line.startsWith("* ") || line.startsWith("- ")) {
          return (
            <li key={i} className="ml-4 pl-2 leading-relaxed text-muted-foreground">
              {renderInline(line.substring(2), `li-${i}`)}
            </li>
          );
        }
        if (line.match(/^\d+\.\s/)) {
          const text = line.replace(/^\d+\.\s/, "");
          const num = line.match(/^\d+/)?.[0];
          return (
            <div
              key={i}
              className="font-semibold text-foreground mt-6 mb-2 flex items-start gap-3 bg-secondary/30 p-4 rounded-xl border border-border/50"
            >
              <span className="bg-background shadow-sm text-foreground w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                {num}
              </span>
              <div className="pt-0.5">{renderInline(text, `n-${i}`)}</div>
            </div>
          );
        }
        if (!line.trim()) return null;
        return (
          <p key={i} className="my-3 text-base leading-relaxed text-muted-foreground">
            {renderInline(line, `p-${i}`)}
          </p>
        );
      })}
    </div>
  );
}



