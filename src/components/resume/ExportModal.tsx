import { useState } from "react";
import type { ResumeData } from "@/lib/resume/types";
import {
  exportResume,
  generateDefaultFilename,
  copyResumeAsText,
  printNativePDF,
} from "@/lib/resume/export-formats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Printer,
  FileCode,
  FileJson,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  previewElement: HTMLElement | null;
}

type ExportType = "pdf" | "docx" | "print" | "txt" | "markdown" | "json" | "html";

interface FormatOption {
  id: ExportType;
  title: string;
  extension: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "pdf",
    title: "PDF Document",
    extension: ".pdf",
    description: "High-resolution A4 document ready for job applications & recruiters",
    icon: FileText,
    badge: "Recommended",
    badgeColor: "bg-brand text-brand-foreground",
  },
  {
    id: "docx",
    title: "Microsoft Word",
    extension: ".doc",
    description: "Fully editable Word document compatible with MS Word & Google Docs",
    icon: FileText,
    badge: "Editable .doc",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  },
  {
    id: "print",
    title: "Browser Print / Native PDF",
    extension: ".pdf",
    description: "Direct vector print of only the resume with 100% selectable text",
    icon: Printer,
    badge: "Vector Quality",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  },
  {
    id: "txt",
    title: "Plain Text",
    extension: ".txt",
    description: "Clean ASCII text formatted for Workday, Taleo & job portal forms",
    icon: FileSpreadsheet,
    badge: "ATS Job Boards",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  },
  {
    id: "markdown",
    title: "Markdown",
    extension: ".md",
    description: "GitHub-flavored markdown for developer portfolios & READMEs",
    icon: FileCode,
  },
  {
    id: "json",
    title: "JSON Resume",
    extension: ".json",
    description: "Standard portable data schema for backup & machine integration",
    icon: FileJson,
  },
  {
    id: "html",
    title: "Standalone HTML",
    extension: ".html",
    description: "Self-contained single-page resume with embedded CSS",
    icon: FileCode,
  },
];

export function ExportModal({
  isOpen,
  onClose,
  resume,
  previewElement,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportType>("pdf");
  const [customName, setCustomName] = useState(() => {
    const rawName = resume.profile.fullName?.trim() || resume.name?.trim() || "Resume";
    return `${rawName.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_")}_Resume`;
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const currentOption = FORMAT_OPTIONS.find((f) => f.id === selectedFormat) || FORMAT_OPTIONS[0];

  const handleExport = async () => {
    setIsExporting(true);
    const finalFilename = `${customName.trim() || "Resume"}${currentOption.extension}`;

    try {
      if (selectedFormat === "print") {
        printNativePDF();
        toast.success("Print dialog opened!");
        onClose();
        return;
      }

      await exportResume(selectedFormat as any, previewElement, resume, finalFilename);
      toast.success(`Exported as ${finalFilename}!`);
      onClose();
    } catch (err) {
      console.error("Export error:", err);
      toast.error(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = async () => {
    const success = await copyResumeAsText(resume);
    if (success) {
      setIsCopied(true);
      toast.success("Resume text copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      toast.error("Failed to copy text");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card border-border p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Download className="h-5 w-5 text-brand" /> Export Resume
            </DialogTitle>
            <Badge variant="outline" className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% ATS Ready
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Download your resume in multiple formats optimized for recruiters, job applications, and ATS scanners.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Filename Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              File Name
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Shaik_Thehseen_Resume"
                className="bg-background text-sm font-medium border-border rounded-xl h-10 focus-visible:ring-brand/30"
              />
              <span className="text-xs font-bold text-muted-foreground bg-secondary/80 px-3 py-2.5 rounded-xl border border-border shrink-0">
                {currentOption.extension}
              </span>
            </div>
          </div>

          {/* Format Selection Cards Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Choose Export Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Export format">
              {FORMAT_OPTIONS.map((option) => {
                const isSelected = selectedFormat === option.id;
                const Icon = option.icon;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedFormat(option.id)}
                    className={cn(
                      "p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer outline-none",
                      isSelected
                        ? "border-brand ring-2 ring-brand/30 bg-brand/5 shadow-sm"
                        : "border-border/70 bg-card hover:border-brand/40 hover:bg-secondary/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-8 w-8 rounded-lg grid place-items-center shrink-0",
                          isSelected ? "bg-brand text-brand-foreground" : "bg-secondary text-foreground"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{option.title}</h4>
                          <span className="text-[10px] font-mono text-muted-foreground">{option.extension}</span>
                        </div>
                      </div>

                      {option.badge && (
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0", option.badgeColor || "bg-secondary text-muted-foreground")}>
                          {option.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-snug mt-1">
                      {option.description}
                    </p>

                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-brand text-brand-foreground grid place-items-center">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Copy Plain Text Shortcut */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-secondary/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Copy Clean Text</p>
                <p className="text-[11px] text-muted-foreground">Directly paste your structured resume into job application forms.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyText}
              disabled={isCopied}
              className="h-8 text-xs font-semibold rounded-lg shrink-0 gap-1.5"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {isCopied ? "Copied!" : "Copy Text"}
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isExporting} className="rounded-xl">
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="bg-brand text-brand-foreground hover:opacity-90 font-semibold px-6 rounded-xl text-xs gap-1.5 shadow-sm"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Exporting...
              </>
            ) : selectedFormat === "print" ? (
              <>
                <Printer className="h-3.5 w-3.5" /> Print / Save PDF
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" /> Download {currentOption.title}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
