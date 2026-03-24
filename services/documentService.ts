type DocumentSection = {
  title: string;
  content: string;
};

interface GenerateDocumentParams {
  title: string;
  projectName?: string;
  date?: string;
  sections: DocumentSection[];
}

export function generateDocumentHTML({ title, projectName, date, sections }: GenerateDocumentParams): string {
  const safeDate = date || new Date().toLocaleDateString('pt-BR');
  const headerProject = projectName || 'Projeto';

  const sectionsHtml = sections
    .map(
      (section) => `
        <section class="doc-section">
          <h2>${section.title}</h2>
          <div class="doc-content">${section.content}</div>
        </section>
      `
    )
    .join('\n');

  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <style>
      :root {
        --brand: #f26522;
        --text: #0f172a;
        --muted: #475569;
        --border: #e2e8f0;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: 'Inter', 'Roboto', Arial, sans-serif;
        background: #f8fafc;
        color: var(--text);
        padding: 32px;
      }
      .doc {
        max-width: 960px;
        margin: 0 auto;
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        overflow: hidden;
      }
      header {
        padding: 24px 28px;
        border-bottom: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(90deg, rgba(242,101,34,0.1), rgba(59,130,246,0.08));
      }
      .meta { color: var(--muted); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
      h1 {
        margin: 4px 0 0;
        font-size: 22px;
        letter-spacing: -0.02em;
      }
      .doc-body { padding: 24px 28px 32px; }
      .doc-section { margin-bottom: 24px; }
      .doc-section h2 {
        font-size: 16px;
        margin: 0 0 8px;
        letter-spacing: -0.01em;
        color: var(--text);
        border-left: 4px solid var(--brand);
        padding-left: 10px;
      }
      .doc-content { color: var(--muted); line-height: 1.6; font-size: 14px; }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
        font-size: 13px;
      }
      thead { background: rgba(242,101,34,0.08); }
      th, td {
        border: 1px solid var(--border);
        padding: 10px 12px;
        text-align: left;
      }
      tbody tr:nth-child(even) { background: #f8fafc; }
      tbody tr:nth-child(odd) { background: #fff; }
    </style>
  </head>
  <body>
    <div class="doc">
      <header>
        <div>
          <div class="meta">PM Commander OS · ${headerProject}</div>
          <h1>${title}</h1>
        </div>
        <div class="meta">${safeDate}</div>
      </header>
      <div class="doc-body">
        ${sectionsHtml}
      </div>
    </div>
  </body>
  </html>
  `;
}
