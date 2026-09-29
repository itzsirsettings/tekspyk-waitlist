export function LessonContent({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\s*\n/).filter(Boolean);
  return <div className="lesson-copy">{blocks.map((block, index) => {
    const lines = block.split("\n");
    if (lines.every((line) => /^\s*-\s+/.test(line))) return <ul className="lesson-content-list" key={index}>{lines.map((line, item) => <li key={item}>{line.replace(/^\s*-\s+/, "")}</li>)}</ul>;
    if (/^#{2,3}\s+/.test(lines[0])) return <section className="lesson-content-section" key={index}><h2>{lines[0].replace(/^#{2,3}\s+/, "")}</h2>{lines.slice(1).length > 0 && <p>{lines.slice(1).join(" ")}</p>}</section>;
    return <p key={index}>{block}</p>;
  })}</div>;
}
