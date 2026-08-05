import type { ResumeData, ExportFormat } from "./types";

/**
 * Export resume in various formats
 */

// Export as PDF using html2canvas and jspdf
export async function exportAsPDF(
  element: HTMLElement,
  filename: string = 'resume.pdf'
): Promise<void> {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const jspdf = (await import('jspdf')).default;
    
    // Wait a moment for the element to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export as JSON
export function exportAsJSON(resume: ResumeData, filename: string = 'resume.json'): void {
  const dataStr = JSON.stringify(resume, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Export as Markdown
export function exportAsMarkdown(resume: ResumeData, filename: string = 'resume.md'): void {
  let markdown = `# ${resume.profile.fullName}\n\n`;
  markdown += `${resume.profile.title}\n\n`;
  markdown += `## Contact\n\n`;
  markdown += `- Email: ${resume.profile.contact.email}\n`;
  markdown += `- Phone: ${resume.profile.contact.phone}\n`;
  markdown += `- Location: ${resume.profile.contact.location}\n\n`;
  
  if (resume.profile.summary) {
    markdown += `## Summary\n\n${resume.profile.summary}\n\n`;
  }
  
  if (resume.experience.length > 0) {
    markdown += `## Experience\n\n`;
    resume.experience.forEach(exp => {
      markdown += `### ${exp.position} at ${exp.company}\n`;
      markdown += `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}\n\n`;
      exp.description.forEach(desc => {
        markdown += `- ${desc}\n`;
      });
      markdown += '\n';
    });
  }
  
  if (resume.skills.length > 0) {
    markdown += `## Skills\n\n`;
    resume.skills.forEach(skill => {
      markdown += `- ${skill.name} (${skill.level})\n`;
    });
    markdown += '\n';
  }
  
  if (resume.projects.length > 0) {
    markdown += `## Projects\n\n`;
    resume.projects.forEach(proj => {
      markdown += `### ${proj.name}\n`;
      markdown += `${proj.description}\n`;
      markdown += `Technologies: ${proj.technologies.join(', ')}\n\n`;
    });
  }
  
  const dataBlob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Export as plain text
export function exportAsText(resume: ResumeData, filename: string = 'resume.txt'): void {
  let text = `${resume.profile.fullName}\n`;
  text += `${resume.profile.title}\n\n`;
  text += `Contact: ${resume.profile.contact.email} | ${resume.profile.contact.phone} | ${resume.profile.contact.location}\n\n`;
  
  if (resume.profile.summary) {
    text += `Summary:\n${resume.profile.summary}\n\n`;
  }
  
  if (resume.experience.length > 0) {
    text += `Experience:\n`;
    resume.experience.forEach(exp => {
      text += `- ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})\n`;
      exp.description.forEach(desc => {
        text += `  ${desc}\n`;
      });
    });
    text += '\n';
  }
  
  if (resume.skills.length > 0) {
    text += `Skills:\n`;
    resume.skills.forEach(skill => {
      text += `- ${skill.name}\n`;
    });
    text += '\n';
  }
  
  const dataBlob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Export as HTML
export function exportAsHTML(element: HTMLElement, filename: string = 'resume.html'): void {
  const html = element.outerHTML;
  const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 210mm; margin: 0 auto; padding: 20mm; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
  
  const dataBlob = new Blob([fullHTML], { type: 'text/html' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Main export function
export async function exportResume(
  format: ExportFormat,
  element: HTMLElement | null,
  resume: ResumeData,
  filename?: string
): Promise<void> {
  const defaultFilename = `${resume.profile.fullName.replace(/\s+/g, '_').toLowerCase()}_resume`;
  
  switch (format) {
    case 'pdf':
      if (!element) throw new Error('Element required for PDF export');
      await exportAsPDF(element, filename || `${defaultFilename}.pdf`);
      break;
    case 'json':
      exportAsJSON(resume, filename || `${defaultFilename}.json`);
      break;
    case 'markdown':
      exportAsMarkdown(resume, filename || `${defaultFilename}.md`);
      break;
    case 'txt':
      exportAsText(resume, filename || `${defaultFilename}.txt`);
      break;
    case 'html':
      if (!element) throw new Error('Element required for HTML export');
      exportAsHTML(element, filename || `${defaultFilename}.html`);
      break;
    case 'docx':
      // DOCX export would require a library like docx
      throw new Error('DOCX export not yet implemented');
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
