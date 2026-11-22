import { parseInline, parseMarkdown } from "../../utils/markdown";

/** Renders AI text safely: parsed into data, React escapes all content (no innerHTML). */
const Inline = ({ text }) => (
  <>
    {parseInline(text).map((part, i) => {
      if (part.type === "bold") return <strong key={i}>{part.value}</strong>;
      if (part.type === "italic") return <em key={i}>{part.value}</em>;
      if (part.type === "code") return <code key={i}>{part.value}</code>;
      return <span key={i}>{part.value}</span>;
    })}
  </>
);

const Markdown = ({ text }) => (
  <div className="small">
    {parseMarkdown(text).map((block, i) => {
      if (block.type === "table") {
        return (
          <div className="table-responsive mb-2" key={i}>
            <table className="table table-sm table-bordered mb-0">
              <thead className="table-light">
                <tr>{block.header.map((h, j) => <th key={j}><Inline text={h} /></th>)}</tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>{row.map((c, j) => <td key={j}><Inline text={c} /></td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      if (block.type === "ul") {
        return <ul className="mb-2 ps-3" key={i}>{block.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ul>;
      }
      return <p className="mb-2" key={i}><Inline text={block.text} /></p>;
    })}
  </div>
);

export default Markdown;
