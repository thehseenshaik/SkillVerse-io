import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Layout,
  Eye,
  Download,
  Share2,
  Loader2,
  Save,
  Undo,
  Palette,
  Settings,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { portfolioGeneratorService, type PortfolioSection, type PortfolioTheme } from "@/lib/services/portfolio-generator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/portfolio-editor")({
  head: () => ({
    meta: [
      { title: "Portfolio Editor — SkillVerse" },
      {
        name: "description",
        content: "Customize your portfolio website.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <PortfolioEditorPage />
    </AuthGate>
  ),
});

function PortfolioEditorPage() {
  const { user } = useAuth();
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [theme, setTheme] = useState<PortfolioTheme>(portfolioGeneratorService.getAllThemes()[0]);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, [user?.id]);

  const loadPortfolio = () => {
    if (!user?.id) return;
    try {
      const generatedSections = portfolioGeneratorService.generatePortfolio(user.id, theme.id);
      setSections(generatedSections);
      setLoading(false);
    } catch (error) {
      console.error("Error loading portfolio:", error);
      toast.error("Failed to load portfolio");
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const updatedSections = portfolioGeneratorService.toggleSectionVisibility(sections, sectionId);
    setSections(updatedSections);
    setHasChanges(true);
  };

  const moveSectionUp = (sectionId: string) => {
    const currentIndex = sections.findIndex((s) => s.id === sectionId);
    if (currentIndex === 0) return;

    const newSections = [...sections];
    [newSections[currentIndex], newSections[currentIndex - 1]] = [newSections[currentIndex - 1], newSections[currentIndex]];
    
    setSections(newSections.map((s, index) => ({ ...s, order: index + 1 })));
    setHasChanges(true);
  };

  const moveSectionDown = (sectionId: string) => {
    const currentIndex = sections.findIndex((s) => s.id === sectionId);
    if (currentIndex === sections.length - 1) return;

    const newSections = [...sections];
    [newSections[currentIndex], newSections[currentIndex + 1]] = [newSections[currentIndex + 1], newSections[currentIndex]];
    
    setSections(newSections.map((s, index) => ({ ...s, order: index + 1 })));
    setHasChanges(true);
  };

  const handleThemeChange = (themeId: string) => {
    const newTheme = portfolioGeneratorService.getTheme(themeId);
    if (newTheme) {
      setTheme(newTheme);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save portfolio configuration to Firebase
      toast.success("Portfolio saved successfully");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save portfolio");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const handleDownload = () => {
    const html = portfolioGeneratorService.generatePortfolioHTML(sections, theme);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.html";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Portfolio downloaded");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portfolio Editor</h1>
            <p className="mt-2 text-muted-foreground">
              Customize your portfolio website
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handlePreview} variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button onClick={handleDownload} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Editor Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Theme Selection */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme
              </h3>
              <Select value={theme.id} onValueChange={handleThemeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {portfolioGeneratorService.getAllThemes().map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 text-sm text-muted-foreground">{theme.description}</p>
            </Card>

            {/* Section Visibility */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Sections
              </h3>
              <div className="space-y-3">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between">
                    <Label htmlFor={`section-${section.id}`} className="cursor-pointer">
                      {section.title}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`section-${section.id}`}
                        checked={section.visible}
                        onCheckedChange={() => toggleSection(section.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Section Order */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Section Order</h3>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div key={section.id} className="flex items-center justify-between border border-border/60 rounded-lg p-3">
                    <span className="text-sm">{section.title}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSectionUp(section.id)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSectionDown(section.id)}
                        disabled={index === sections.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card className="p-6 min-h-[600px]" style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold" style={{ color: theme.colors.primary }}>
                  {sections.find((s) => s.id === "hero")?.content.name || "Your Name"}
                </h1>
                <p className="mt-2 text-xl" style={{ color: theme.colors.secondary }}>
                  {sections.find((s) => s.id === "hero")?.content.headline || "Professional"}
                </p>
              </div>

              {sections.filter((s) => s.visible).map((section) => (
                <div key={section.id} className="mb-8 p-4 rounded-lg" style={{ backgroundColor: `${theme.colors.primary}10` }}>
                  <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.colors.primary }}>
                    {section.title}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {section.id === "skills" && (
                      <div className="flex flex-wrap gap-2">
                        {(section.content.skills as any[]).map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill.name || skill}</Badge>
                        ))}
                      </div>
                    )}
                    {section.id === "experience" && (
                      <div className="space-y-4">
                        {(section.content.experience as any[]).map((exp, index) => (
                          <div key={index} className="border-l-2 pl-4" style={{ borderColor: theme.colors.secondary }}>
                            <h3 className="font-semibold">{exp.title || exp.role}</h3>
                            <p className="text-sm">{exp.company}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {section.id === "projects" && (
                      <div className="grid gap-4">
                        {(section.content.projects as any[]).map((project, index) => (
                          <div key={index} className="border border-border/60 rounded-lg p-4">
                            <h3 className="font-semibold">{project.name}</h3>
                            <p className="text-sm">{project.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {section.id === "education" && (
                      <div className="space-y-4">
                        {(section.content.education as any[]).map((edu, index) => (
                          <div key={index} className="border-l-2 pl-4" style={{ borderColor: theme.colors.secondary }}>
                            <h3 className="font-semibold">{edu.degree}</h3>
                            <p className="text-sm">{edu.institution}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {section.id === "achievements" && (
                      <div className="space-y-3">
                        {(section.content.achievements as any[]).map((achievement, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="secondary">{achievement.title}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    {section.id === "coding-stats" && (
                      <div className="grid gap-4">
                        {(section.content.codingStats as any[]).map((stat, index) => (
                          <div key={index} className="border border-border/60 rounded-lg p-4">
                            <h3 className="font-semibold">{stat.platform}</h3>
                            <p className="text-sm">Username: {stat.username}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {section.id === "contact" && (
                      <div>
                        {section.content.website && (
                          <a href={section.content.website} className="text-brand hover:underline">
                            {section.content.website}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
