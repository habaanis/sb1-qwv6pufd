import { logger } from '../logging/distributedLogger';

interface PDFExportOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  includeImages?: boolean;
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

interface ExportData {
  type: 'business' | 'event' | 'job';
  data: any;
}

class PDFExportManager {
  async exportToPDF(
    data: ExportData[],
    options: PDFExportOptions = {}
  ): Promise<Blob> {
    try {
      const html = this.generateHTML(data, options);

      const blob = await this.htmlToPDF(html, options);

      logger.info('PDF exported successfully', {
        itemCount: data.length,
        size: blob.size
      });

      return blob;
    } catch (error) {
      logger.error('PDF export failed', error as Error);
      throw error;
    }
  }

  private generateHTML(data: ExportData[], options: PDFExportOptions): string {
    const title = options.title || 'Dalil Tounes Export';
    const date = new Date().toLocaleDateString('fr-TN');

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: ${options.pageSize || 'A4'} ${options.orientation || 'portrait'};
      margin: 2cm;
    }

    body {
      font-family: Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
    }

    .header h1 {
      color: #2563eb;
      margin: 0 0 10px 0;
    }

    .header .subtitle {
      color: #666;
      font-size: 10pt;
    }

    .item {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      page-break-inside: avoid;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    .item-title {
      font-size: 14pt;
      font-weight: bold;
      color: #1f2937;
    }

    .item-type {
      display: inline-block;
      padding: 4px 12px;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: bold;
      text-transform: uppercase;
    }

    .item-content {
      margin-bottom: 15px;
    }

    .field {
      margin-bottom: 8px;
    }

    .field-label {
      font-weight: bold;
      color: #4b5563;
      display: inline-block;
      width: 120px;
    }

    .field-value {
      color: #1f2937;
    }

    .description {
      margin-top: 15px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 4px;
      font-size: 11pt;
      line-height: 1.8;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 9pt;
      color: #6b7280;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="subtitle">
      Généré le ${date} par Dalil Tounes
      <br>
      ${data.length} résultat${data.length > 1 ? 's' : ''}
    </div>
  </div>
`;

    data.forEach((item, index) => {
      if (index > 0 && index % 3 === 0) {
        html += '<div class="page-break"></div>';
      }

      html += this.renderItem(item);
    });

    html += `
  <div class="footer">
    Document généré par Dalil Tounes - Guide Complet de la Tunisie
    <br>
    © ${new Date().getFullYear()} Dalil Tounes. Tous droits réservés.
  </div>
</body>
</html>
`;

    return html;
  }

  private renderItem(item: ExportData): string {
    const typeLabels = {
      business: 'Entreprise',
      event: 'Événement',
      job: 'Offre d\'emploi'
    };

    let html = `
  <div class="item">
    <div class="item-header">
      <div class="item-title">${this.escapeHTML(item.data.nom || item.data.name || item.data.title)}</div>
      <div class="item-type">${typeLabels[item.type]}</div>
    </div>
    <div class="item-content">
`;

    if (item.type === 'business') {
      html += `
      <div class="field">
        <span class="field-label">Catégorie:</span>
        <span class="field-value">${this.escapeHTML(item.data.categorie || item.data.category)}</span>
      </div>
      <div class="field">
        <span class="field-label">Ville:</span>
        <span class="field-value">${this.escapeHTML(item.data.ville || item.data.city)}</span>
      </div>
      ${item.data.address ? `
      <div class="field">
        <span class="field-label">Adresse:</span>
        <span class="field-value">${this.escapeHTML(item.data.address)}</span>
      </div>` : ''}
      ${item.data.phone ? `
      <div class="field">
        <span class="field-label">Téléphone:</span>
        <span class="field-value">${this.escapeHTML(item.data.phone)}</span>
      </div>` : ''}
      ${item.data.email ? `
      <div class="field">
        <span class="field-label">Email:</span>
        <span class="field-value">${this.escapeHTML(item.data.email)}</span>
      </div>` : ''}
      ${item.data.website ? `
      <div class="field">
        <span class="field-label">Site web:</span>
        <span class="field-value">${this.escapeHTML(item.data.website)}</span>
      </div>` : ''}
`;
    } else if (item.type === 'event') {
      html += `
      <div class="field">
        <span class="field-label">Type:</span>
        <span class="field-value">${this.escapeHTML(item.data.type)}</span>
      </div>
      <div class="field">
        <span class="field-label">Date:</span>
        <span class="field-value">${item.data.date_event || item.data.date}</span>
      </div>
      <div class="field">
        <span class="field-label">Lieu:</span>
        <span class="field-value">${this.escapeHTML(item.data.ville || item.data.city)}</span>
      </div>
      ${item.data.organizer ? `
      <div class="field">
        <span class="field-label">Organisateur:</span>
        <span class="field-value">${this.escapeHTML(item.data.organizer)}</span>
      </div>` : ''}
`;
    } else if (item.type === 'job') {
      html += `
      <div class="field">
        <span class="field-label">Entreprise:</span>
        <span class="field-value">${this.escapeHTML(item.data.company)}</span>
      </div>
      <div class="field">
        <span class="field-label">Type:</span>
        <span class="field-value">${this.escapeHTML(item.data.job_type || item.data.type)}</span>
      </div>
      <div class="field">
        <span class="field-label">Ville:</span>
        <span class="field-value">${this.escapeHTML(item.data.ville || item.data.city)}</span>
      </div>
      ${item.data.salary_range ? `
      <div class="field">
        <span class="field-label">Salaire:</span>
        <span class="field-value">${this.escapeHTML(item.data.salary_range)}</span>
      </div>` : ''}
`;
    }

    if (item.data.description) {
      html += `
      <div class="description">
        ${this.escapeHTML(item.data.description)}
      </div>
`;
    }

    html += `
    </div>
  </div>
`;

    return html;
  }

  private async htmlToPDF(html: string, options: PDFExportOptions): Promise<Blob> {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    printWindow.document.write(html);
    printWindow.document.close();

    await new Promise(resolve => setTimeout(resolve, 500));

    printWindow.print();

    const blob = new Blob([html], { type: 'text/html' });

    return blob;
  }

  async downloadPDF(
    data: ExportData[],
    filename: string = 'dalil-tounes-export.pdf',
    options: PDFExportOptions = {}
  ): Promise<void> {
    try {
      const blob = await this.exportToPDF(data, options);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logger.info('PDF downloaded', { filename, size: blob.size });
    } catch (error) {
      logger.error('PDF download failed', error as Error);
      throw error;
    }
  }

  private escapeHTML(text: string): string {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export const pdfExportManager = new PDFExportManager();

export async function exportToPDF(
  data: ExportData[],
  options?: PDFExportOptions
): Promise<Blob> {
  return pdfExportManager.exportToPDF(data, options);
}

export async function downloadPDF(
  data: ExportData[],
  filename?: string,
  options?: PDFExportOptions
): Promise<void> {
  return pdfExportManager.downloadPDF(data, filename, options);
}

if (typeof window !== 'undefined') {
  (window as any).pdfExport = pdfExportManager;
}
