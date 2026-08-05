import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText,
  Download,
  Copy,
  Loader2,
  RefreshCw,
  Sparkles,
  Building2,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { aiCareerIntelligence } from "@/lib/services/ai-career-intelligence";
import { aiDataLayer } from "@/lib/services/ai-data-layer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/ai-cover-letter")({
  head: () => ({
    meta: [
      { title: "AI Cover Letter Generator — SkillVerse" },
      {
        name: "description",
        content: "Generate personalized cover letters using AI.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <CoverLetterPage />
    </AuthGate>
  ),
});

function CoverLetterPage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [company, setCompany] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateCoverLetter = async () => {
    if (!user?.id || !company || !role) {
      toast.error("Please fill in company and role");
      return;
    }
    setLoading(true);
    try {
      const result = await aiCareerIntelligence.generateCoverLetter(user.id, company, role);
      setCoverLetter(result);
      toast.success("Cover letter generated successfully");
    } catch (error) {
      toast.error("Failed to generate cover letter");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Cover letter copied to clipboard");
  };

  const downloadCoverLetter = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${company.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded");
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI Cover Letter Generator</h1>
          <p className="mt-2 text-muted-foreground">
            Generate personalized cover letters using AI and your Identity Hub data
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="company">Target Company</Label>
              <Input
                id="company"
                placeholder="e.g., Google, Microsoft, Amazon"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Target Role</Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer, Data Scientist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={generateCoverLetter} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </div>
        </Card>

        {!coverLetter && !loading && (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Cover Letter Generated Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Enter the target company and role, then click "Generate Cover Letter"
            </p>
          </Card>
        )}

        {coverLetter && (
          <div className="space-y-4">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Cover Letter for {company}</h3>
                  <p className="text-sm text-muted-foreground">Position: {role}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button onClick={downloadCoverLetter} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button onClick={generateCoverLetter} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
              </div>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[600px] font-mono text-sm"
                placeholder="Your generated cover letter will appear here..."
              />
            </Card>
          </div>
        )}
      </div>
    </PageShell>
  );
}
