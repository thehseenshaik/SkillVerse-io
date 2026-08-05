import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  History,
  FileText,
  Trash2,
  Eye,
  Calendar,
  Loader2,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { aiCareerIntelligence } from "@/lib/services/ai-career-intelligence";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/ai-history")({
  head: () => ({
    meta: [
      { title: "AI History — SkillVerse" },
      {
        name: "description",
        content: "View your AI analysis history.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <HistoryPage />
    </AuthGate>
  ),
});

function HistoryPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const history = aiCareerIntelligence.getHistory(filterType === "all" ? undefined : filterType);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      career_score: "Career Score",
      resume_analysis: "Resume Analysis",
      ats_report: "ATS Report",
      skill_gap_analysis: "Skill Gap Analysis",
      career_roadmap: "Career Roadmap",
      resume_generation: "Resume Generation",
      cover_letter_generation: "Cover Letter",
      interview_questions: "Interview Questions",
      company_match: "Company Match",
      project_review: "Project Review",
      portfolio_review: "Portfolio Review",
      learning_recommendations: "Learning Recommendations",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      career_score: "bg-blue-100 text-blue-800 border-blue-200",
      resume_analysis: "bg-green-100 text-green-800 border-green-200",
      ats_report: "bg-yellow-100 text-yellow-800 border-yellow-200",
      skill_gap_analysis: "bg-purple-100 text-purple-800 border-purple-200",
      career_roadmap: "bg-pink-100 text-pink-800 border-pink-200",
      resume_generation: "bg-indigo-100 text-indigo-800 border-indigo-200",
      cover_letter_generation: "bg-orange-100 text-orange-800 border-orange-200",
      interview_questions: "bg-red-100 text-red-800 border-red-200",
      company_match: "bg-teal-100 text-teal-800 border-teal-200",
      project_review: "bg-cyan-100 text-cyan-800 border-cyan-200",
      portfolio_review: "bg-lime-100 text-lime-800 border-lime-200",
      learning_recommendations: "bg-amber-100 text-amber-800 border-amber-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI History</h1>
            <p className="mt-2 text-muted-foreground">
              View and revisit your previous AI analyses
            </p>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="career_score">Career Score</SelectItem>
              <SelectItem value="resume_analysis">Resume Analysis</SelectItem>
              <SelectItem value="ats_report">ATS Report</SelectItem>
              <SelectItem value="skill_gap_analysis">Skill Gap Analysis</SelectItem>
              <SelectItem value="career_roadmap">Career Roadmap</SelectItem>
              <SelectItem value="interview_questions">Interview Questions</SelectItem>
              <SelectItem value="company_match">Company Match</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {history.length === 0 ? (
          <Card className="p-12 text-center">
            <History className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No History Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Your AI analysis history will appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                      <FileText className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{getTypeLabel(item.type)}</h3>
                        <Badge className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{getTypeLabel(item.type)}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <pre className="bg-secondary/20 p-4 rounded-lg overflow-x-auto text-sm">
                          {JSON.stringify(item.data, null, 2)}
                        </pre>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
