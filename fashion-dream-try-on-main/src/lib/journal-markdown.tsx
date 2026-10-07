import { Fragment, type ReactNode } from "react";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

function safeHref(value: string) {
  const href = value.trim();
  if (href.startsWith("/") || href.startsWith("#")) return href;
  if (/^https?:\\/\\//i.test(href)) return href;
  return "#";
}

function renderInline(value: string): ReactNode[] {
  const pattern = /(\\!\\[([^\\]]*)\\]\\(([^)]+)\\)|\\[([^\\]]+)\\]\\(([^)]+)\\)|\\*\\*([^*]+)\\*\\*|__([^_]+)__|\\*([^*]+)\\*|_([^_]+)_|\\`([^\\`]+)\\`)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > lastIndex) nodes.push(value.slice(lastIndex, match.index));

    if (match[1]) {
      const alt = match[2]?.trim() || "WEARO Journal";
      const src = safeHref(match[3] || "");
      nodes.push(<img key={match.index} src={src} alt={alt} loading="lazy" />);
    } else if (match[4]) {
      const href = safeHref(match[5] || "");
      nodes.push(
        <a key={match.index} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
          {match[4]}
        </a>,
      );
    } else if (match[6] || match[7]) {
      nodes.push(<strong key={match.index}>{match[6] || match[7]}</strong>);
    } else if (match[8] || match[9]) {
      nodes.push(<em key={match.index}>{match[8] || match[9]}</em>);
    } else if (match[10]) {
      nodes.push(<code key={match.index}>{match[10]}</code>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < value.length) nodes.push(value.slice(lastIndex));
  return nodes;
}

function renderBlocks(content: string): ReactNode[] {
  const lines = content.replace(/\\r\\n/g, "\\n").split("\\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const heading = /^(#{1,3})\\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const Heading = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      blocks.push(
        <Heading key={index}>
          {renderInline(heading[2])}
        </Heading>,
      );
      index += 1;
      continue;
    }

    if (/^>\\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\\s?/, ""));
        index += 1;
      }
      blocks.push(<blockquote key={index}>{quoteLines.map((item, itemIndex) => <Fragment key={itemIndex}>{itemIndex > 0 ? <br /> : null}{renderInline(item)}</Fragment>)}</blockquote>);
      continue;
    }

    if (/^[-*]\\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\\s+/, ""));
        index += 1;
      }
      blocks.push(<ul key={index}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</ul>);
      continue;
    }

    if (/^\\d+\\.\\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\\d+\\.\\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\\d+\\.\\s+/, ""));
        index += 1;
      }
      blocks.push(<ol key={index}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</ol>);
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (!next || /^(#{1,3})\\s+/.test(next) || /^>\\s?/.test(next) || /^[-*]\\s+/.test(next) || /^\\d+\\.\\s+/.test(next)) break;
      paragraphLines.push(next);
      index += 1;
    }

    blocks.push(<p key={index}>{paragraphLines.map((item, itemIndex) => <Fragment key={itemIndex}>{itemIndex > 0 ? <br /> : null}{renderInline(item)}</Fragment>)}</p>);
  }

  return blocks;
}

export function JournalMarkdown({ content, className = "" }: MarkdownContentProps) {
  return <div className={className}>{renderBlocks(content)}</div>;
}

export function analyzeJournalMarkdown(content: string) {
  const headings = Array.from(content.matchAll(/^(#{1,3})\\s+(.+)$/gm)).map((match) => ({
    level: match[1].length,
    text: match[2].trim(),
  }));
  const links = Array.from(content.matchAll(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g)).map((match) => ({
    text: match[1].trim(),
    href: match[2].trim(),
  }));
  const images = Array.from(content.matchAll(/!\\[([^\\]]*)\\]\\(([^)]+)\\)/g)).map((match) => ({
    alt: match[1].trim(),
    src: match[2].trim(),
  }));

  return { headings, links, images };
}
