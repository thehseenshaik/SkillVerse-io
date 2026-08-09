import type { ResumeData, ExportFormat } from "./types";

/**
 * Clean & Format Safe Filename
 */
export function generateDefaultFilename(resume: ResumeData, extension: string): string {
  const name = resume.profile.fullName?.trim() || resume.name?.trim() || "Resume";
  const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  return `${cleanName}_Resume${ext}`;
}

/**
 * Export as High-Quality PDF using html2canvas & jsPDF
 */
export async function exportAsPDF(
  element: HTMLElement,
  filename?: string
): Promise<void> {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const jspdf = (await import("jspdf")).default;

    // Small delay to ensure all styles and fonts are applied
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jspdf({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;

    // Multi-page handling if content extends past single A4
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;
    }

    pdf.save(filename || "Resume.pdf");
  } catch (error) {
    console.error("PDF export failed:", error);
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Native Browser Print of the Resume Document Only
 */
export function printNativePDF(): void {
  window.print();
}

/**
 * Export as Microsoft Word (.doc / .docx compatible)
 */
export function exportAsWord(resume: ResumeData, filename?: string): void {
  const finalFilename = filename || generateDefaultFilename(resume, "doc");

  const name = (resume.profile.fullName || "Your Name").toUpperCase();
  const title = resume.profile.title || "";
  const contacts = [
    resume.profile.contact.phone,
    resume.profile.contact.email,
    resume.profile.contact.location,
    resume.profile.contact.linkedin ? `LinkedIn: ${resume.profile.contact.linkedin}` : null,
    resume.profile.contact.github ? `GitHub: ${resume.profile.contact.github}` : null,
  ].filter(Boolean).join("  |  ");

  let bodyContent = `
    <h1>${name}</h1>
    ${title ? `<p class="title">${title}</p>` : ""}
    ${contacts ? `<p class="contact">${contacts}</p>` : ""}
  `;

  if (resume.profile.summary) {
    bodyContent += `
      <h2>Professional Summary</h2>
      <p>${resume.profile.summary}</p>
    `;
  }

  if (resume.education.length > 0) {
    bodyContent += `<h2>Education</h2>`;
    resume.education.forEach((edu) => {
      const dates = [edu.startDate, edu.current ? "Present" : edu.endDate].filter(Boolean).join(" – ");
      const degree = [edu.degree, edu.field].filter(Boolean).join(" — ");
      const score = edu.gpa ? `CGPA/Score: ${edu.gpa}` : "";
      bodyContent += `
        <table>
          <tr>
            <td><strong>${degree}</strong></td>
            <td class="right">${dates}</td>
          </tr>
          <tr>
            <td>${edu.institution}${edu.location ? `, ${edu.location}` : ""}</td>
            <td class="right">${score}</td>
          </tr>
        </table>
      `;
    });
  }

  if (resume.skills.length > 0) {
    bodyContent += `
      <h2>Technical Skills</h2>
      <p><strong>Technical Stack:</strong> ${resume.skills.map((s) => s.name).join(", ")}</p>
    `;
  }

  if (resume.experience.length > 0) {
    bodyContent += `<h2>Experience</h2>`;
    resume.experience.forEach((exp) => {
      const dates = [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" – ");
      bodyContent += `
        <table>
          <tr>
            <td><strong>${exp.position}</strong> — ${exp.company}</td>
            <td class="right">${dates}</td>
          </tr>
        </table>
        <ul>
          ${exp.description.map((d) => `<li>${d}</li>`).join("")}
        </ul>
      `;
    });
  }

  if (resume.projects.length > 0) {
    bodyContent += `<h2>Projects</h2>`;
    resume.projects.forEach((proj) => {
      const tech = proj.technologies.length > 0 ? ` | ${proj.technologies.join(", ")}` : "";
      bodyContent += `
        <table>
          <tr>
            <td><strong>${proj.name}</strong>${tech}</td>
            <td class="right">${[proj.link ? "Live Demo" : null, proj.github ? "GitHub" : null].filter(Boolean).join(" • ")}</td>
          </tr>
        </table>
        ${proj.description ? `<ul><li>${proj.description}</li></ul>` : ""}
      `;
    });
  }

  if (resume.certifications && resume.certifications.length > 0) {
    bodyContent += `<h2>Certifications</h2>`;
    resume.certifications.forEach((c) => {
      bodyContent += `
        <table>
          <tr>
            <td><strong>${c.name}</strong> — ${c.issuer}</td>
            <td class="right">${c.date || ""}</td>
          </tr>
        </table>
      `;
    });
  }

  if (resume.achievements && resume.achievements.length > 0) {
    bodyContent += `<h2>Achievements & Recognition</h2><ul>`;
    resume.achievements.forEach((a) => {
      bodyContent += `<li><strong>${a.title}:</strong> ${a.description}</li>`;
    });
    bodyContent += `</ul>`;
  }

  const wordHTML = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${name} - Resume</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page WordSection1 {
          size: 210mm 297mm;
          margin: 18mm 18mm 18mm 18mm;
          mso-header-margin: 0mm;
          mso-footer-margin: 0mm;
          mso-paper-source: 0;
        }
        div.WordSection1 { page: WordSection1; }
        body {
          font-family: Arial, Calibri, sans-serif;
          font-size: 10.5pt;
          line-height: 1.35;
          color: #000000;
          margin: 0;
        }
        h1 { font-size: 19pt; font-weight: bold; text-transform: uppercase; margin: 0 0 2pt 0; text-align: center; color: #000000; }
        .title { font-size: 10.5pt; font-weight: bold; text-transform: uppercase; color: #333333; text-align: center; margin: 0 0 4pt 0; }
        .contact { font-size: 9.5pt; color: #444444; text-align: center; margin: 0 0 10pt 0; }
        h2 {
          font-size: 10.5pt;
          font-weight: bold;
          text-transform: uppercase;
          color: #000000;
          border-bottom: 1.5pt solid #444444;
          padding-bottom: 2pt;
          margin-top: 10pt;
          margin-bottom: 4pt;
        }
        p { margin: 0 0 4pt 0; font-size: 10pt; color: #111111; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 2pt; }
        td { padding: 0; font-size: 10pt; vertical-align: top; }
        .right { text-align: right; color: #444444; font-size: 9.5pt; }
        ul { margin: 2pt 0 4pt 14pt; padding: 0; }
        li { font-size: 10pt; margin-bottom: 2pt; color: #111111; }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        ${bodyContent}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff" + wordHTML], {
    type: "application/msword;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = finalFilename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export as Standard JSON Schema
 */
export function exportAsJSON(resume: ResumeData, filename: string = "resume.json"): void {
  const dataStr = JSON.stringify(resume, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export as Developer Markdown (.md)
 */
export function exportAsMarkdown(resume: ResumeData, filename: string = "resume.md"): void {
  let md = `# ${resume.profile.fullName || "Resume"}\n\n`;
  if (resume.profile.title) {
    md += `**${resume.profile.title}**\n\n`;
  }

  const contacts = [
    resume.profile.contact.phone,
    resume.profile.contact.email,
    resume.profile.contact.location,
    resume.profile.contact.linkedin ? `LinkedIn: ${resume.profile.contact.linkedin}` : null,
    resume.profile.contact.github ? `GitHub: ${resume.profile.contact.github}` : null,
  ].filter(Boolean);

  if (contacts.length > 0) {
    md += `${contacts.join(" | ")}\n\n---\n\n`;
  }

  if (resume.profile.summary) {
    md += `## Professional Summary\n\n${resume.profile.summary}\n\n`;
  }

  if (resume.education.length > 0) {
    md += `## Education\n\n`;
    resume.education.forEach((edu) => {
      const dates = [edu.startDate, edu.current ? "Present" : edu.endDate].filter(Boolean).join(" – ");
      md += `### ${edu.degree || "Degree"} ${edu.field ? `— ${edu.field}` : ""} (${dates})\n`;
      md += `**${edu.institution}** ${edu.location ? `| ${edu.location}` : ""}\n`;
      if (edu.gpa) md += `- CGPA/Score: ${edu.gpa}\n`;
      md += "\n";
    });
  }

  if (resume.skills.length > 0) {
    md += `## Technical Skills\n\n`;
    md += `**Skills Stack:** ${resume.skills.map((s) => s.name).join(", ")}\n\n`;
  }

  if (resume.experience.length > 0) {
    md += `## Experience\n\n`;
    resume.experience.forEach((exp) => {
      const dates = [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" – ");
      md += `### ${exp.position} — ${exp.company} (${dates})\n`;
      if (exp.location) md += `*${exp.location}*\n\n`;
      exp.description.forEach((desc) => {
        md += `- ${desc}\n`;
      });
      md += "\n";
    });
  }

  if (resume.projects.length > 0) {
    md += `## Projects\n\n`;
    resume.projects.forEach((proj) => {
      md += `### ${proj.name} ${proj.technologies.length > 0 ? `| ${proj.technologies.join(", ")}` : ""}\n`;
      if (proj.description) md += `- ${proj.description}\n`;
      if (proj.link) md += `- Live Demo: ${proj.link}\n`;
      if (proj.github) md += `- GitHub: ${proj.github}\n`;
      md += "\n";
    });
  }

  if (resume.certifications && resume.certifications.length > 0) {
    md += `## Certifications\n\n`;
    resume.certifications.forEach((c) => {
      md += `- **${c.name}** — ${c.issuer} (${c.date})\n`;
    });
    md += "\n";
  }

  if (resume.achievements && resume.achievements.length > 0) {
    md += `## Achievements & Recognition\n\n`;
    resume.achievements.forEach((a) => {
      md += `- **${a.title}**: ${a.description}\n`;
    });
    md += "\n";
  }

  const dataBlob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export as Plain Text (.txt) - ATS Job Portal Ready
 */
export function exportAsText(resume: ResumeData, filename: string = "resume.txt"): void {
  const text = generatePlainTextResume(resume);
  const dataBlob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate formatted plain text content from resume
 */
export function generatePlainTextResume(resume: ResumeData): string {
  let text = `${(resume.profile.fullName || "YOUR NAME").toUpperCase()}\n`;
  if (resume.profile.title) {
    text += `${resume.profile.title.toUpperCase()}\n`;
  }

  const contacts = [
    resume.profile.contact.phone,
    resume.profile.contact.email,
    resume.profile.contact.location,
    resume.profile.contact.linkedin ? `LinkedIn: ${resume.profile.contact.linkedin}` : null,
    resume.profile.contact.github ? `GitHub: ${resume.profile.contact.github}` : null,
  ].filter(Boolean);

  if (contacts.length > 0) {
    text += `${contacts.join(" | ")}\n`;
  }
  text += `${"=".repeat(60)}\n\n`;

  if (resume.profile.summary) {
    text += `PROFESSIONAL SUMMARY\n${"-".repeat(30)}\n`;
    text += `${resume.profile.summary}\n\n`;
  }

  if (resume.education.length > 0) {
    text += `EDUCATION\n${"-".repeat(30)}\n`;
    resume.education.forEach((edu) => {
      const dates = [edu.startDate, edu.current ? "Present" : edu.endDate].filter(Boolean).join(" – ");
      const degree = [edu.degree, edu.field].filter(Boolean).join(" — ");
      text += `${degree}\n`;
      text += `${edu.institution}${edu.location ? `, ${edu.location}` : ""}    ${dates}\n`;
      if (edu.gpa) text += `CGPA/Score: ${edu.gpa}\n`;
      text += "\n";
    });
  }

  if (resume.skills.length > 0) {
    text += `TECHNICAL SKILLS\n${"-".repeat(30)}\n`;
    text += `Stack: ${resume.skills.map((s) => s.name).join(", ")}\n\n`;
  }

  if (resume.experience.length > 0) {
    text += `EXPERIENCE\n${"-".repeat(30)}\n`;
    resume.experience.forEach((exp) => {
      const dates = [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" – ");
      text += `${exp.position} — ${exp.company}    ${dates}\n`;
      exp.description.forEach((d) => {
        text += `• ${d}\n`;
      });
      text += "\n";
    });
  }

  if (resume.projects.length > 0) {
    text += `PROJECTS\n${"-".repeat(30)}\n`;
    resume.projects.forEach((proj) => {
      text += `${proj.name}${proj.technologies.length > 0 ? ` | ${proj.technologies.join(", ")}` : ""}\n`;
      if (proj.description) text += `• ${proj.description}\n`;
      if (proj.link) text += `• Live Demo: ${proj.link}\n`;
      if (proj.github) text += `• GitHub: ${proj.github}\n`;
      text += "\n";
    });
  }

  if (resume.certifications && resume.certifications.length > 0) {
    text += `CERTIFICATIONS\n${"-".repeat(30)}\n`;
    resume.certifications.forEach((c) => {
      text += `• ${c.name} — ${c.issuer} (${c.date})\n`;
    });
    text += "\n";
  }

  if (resume.achievements && resume.achievements.length > 0) {
    text += `ACHIEVEMENTS\n${"-".repeat(30)}\n`;
    resume.achievements.forEach((a) => {
      text += `• ${a.title}: ${a.description}\n`;
    });
    text += "\n";
  }

  return text;
}

/**
 * Copy formatted resume text directly to clipboard
 */
export async function copyResumeAsText(resume: ResumeData): Promise<boolean> {
  try {
    const text = generatePlainTextResume(resume);
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
}

/**
 * Export as Standalone HTML Document
 */
export function exportAsHTML(element: HTMLElement, filename: string = "resume.html"): void {
  const content = element.outerHTML;
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume</title>
  <style>
    @page { size: A4; margin: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f3f4f6;
      display: flex;
      justify-content: center;
      padding: 20px;
      margin: 0;
    }
    .resume-container {
      width: 210mm;
      min-height: 297mm;
      background: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      box-sizing: border-box;
      padding: 16mm 18mm;
    }
    @media print {
      body { background: white; padding: 0; }
      .resume-container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    ${content}
  </div>
</body>
</html>`;

  const dataBlob = new Blob([fullHTML], { type: "text/html" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Master Export Function
 */
export async function exportResume(
  format: ExportFormat | "txt" | "print" | "docx" | "doc",
  element: HTMLElement | null,
  resume: ResumeData,
  customFilename?: string
): Promise<void> {
  const filename = customFilename || generateDefaultFilename(resume, format === "markdown" ? "md" : format === "docx" ? "doc" : format);

  switch (format) {
    case "pdf":
      if (!element) throw new Error("Element required for PDF export");
      await exportAsPDF(element, filename);
      break;
    case "docx":
    case "doc":
      exportAsWord(resume, filename);
      break;
    case "print":
      printNativePDF();
      break;
    case "json":
      exportAsJSON(resume, filename);
      break;
    case "markdown":
      exportAsMarkdown(resume, filename);
      break;
    case "txt":
      exportAsText(resume, filename);
      break;
    case "html":
      if (!element) throw new Error("Element required for HTML export");
      exportAsHTML(element, filename);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
