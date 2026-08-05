import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Edit,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  X,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/edit-profile")({
  head: () => ({
    meta: [
      { title: "Edit Profile — SkillVerse" },
      {
        name: "description",
        content: "Manually edit your skills, projects, and achievements.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <EditProfilePage />
    </AuthGate>
  ),
});

function EditProfilePage() {
  const {
    profile,
    addSkill,
    updateSkill,
    removeSkill,
    addProject,
    updateProject,
    removeProject,
    hideProject,
    pinProject,
    addAchievement,
    removeAchievement,
    hideAchievement,
  } = useIdentityHub();
  const [activeTab, setActiveTab] = useState("skills");

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Manually edit your skills, projects, and achievements
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="mt-6">
            <SkillsEditor
              profile={profile}
              addSkill={addSkill}
              updateSkill={updateSkill}
              removeSkill={removeSkill}
            />
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <ProjectsEditor
              profile={profile}
              addProject={addProject}
              updateProject={updateProject}
              removeProject={removeProject}
              hideProject={hideProject}
              pinProject={pinProject}
            />
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <AchievementsEditor
              profile={profile}
              addAchievement={addAchievement}
              removeAchievement={removeAchievement}
              hideAchievement={hideAchievement}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}

function SkillsEditor({
  profile,
  addSkill,
  updateSkill,
  removeSkill,
}: {
  profile: any;
  addSkill: (skill: any) => void;
  updateSkill: (id: string, updates: any) => void;
  removeSkill: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "programming_language",
    proficiency: 50,
  });

  const skills = profile?.skills.filter((s: any) => !s.isHidden) || [];

  const handleAdd = () => {
    if (newSkill.name) {
      addSkill(newSkill);
      setNewSkill({
        name: "",
        category: "programming_language",
        proficiency: 50,
      });
      setIsAdding(false);
      toast.success("Skill added successfully");
    }
  };

  const handleUpdate = (skillId: string, updates: any) => {
    updateSkill(skillId, updates);
    setEditingSkill(null);
    toast.success("Skill updated successfully");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Skills ({skills.length})</h2>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="skill-name">Skill Name</Label>
                <Input
                  id="skill-name"
                  value={newSkill.name}
                  onChange={(e) =>
                    setNewSkill({ ...newSkill, name: e.target.value })
                  }
                  placeholder="e.g., JavaScript"
                />
              </div>
              <div>
                <Label htmlFor="skill-category">Category</Label>
                <Select
                  value={newSkill.category}
                  onValueChange={(value) =>
                    setNewSkill({ ...newSkill, category: value })
                  }
                >
                  <SelectTrigger id="skill-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programming_language">
                      Programming Language
                    </SelectItem>
                    <SelectItem value="framework">Framework</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="cloud">Cloud</SelectItem>
                    <SelectItem value="ai_ml">AI/ML</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="soft_skills">Soft Skills</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="skill-proficiency">
                  Proficiency: {newSkill.proficiency}%
                </Label>
                <Slider
                  id="skill-proficiency"
                  value={[newSkill.proficiency]}
                  onValueChange={(value) =>
                    setNewSkill({ ...newSkill, proficiency: value[0] })
                  }
                  max={100}
                  step={5}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Add Skill
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {skills.map((skill: any) => (
          <Card key={skill.id} className="p-4">
            {editingSkill === skill.id ? (
              <SkillEditForm
                skill={skill}
                onSave={(updates) => handleUpdate(skill.id, updates)}
                onCancel={() => setEditingSkill(null)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                    <span className="font-semibold text-brand">
                      {skill.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{skill.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="capitalize">
                        {skill.category}
                      </Badge>
                      <span>Proficiency: {skill.proficiency}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSkill(skill.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(skill.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function SkillEditForm({
  skill,
  onSave,
  onCancel,
}: {
  skill: any;
  onSave: (updates: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(skill.name);
  const [category, setCategory] = useState(skill.category);
  const [proficiency, setProficiency] = useState(skill.proficiency);

  return (
    <div className="space-y-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Skill name"
      />
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="programming_language">
            Programming Language
          </SelectItem>
          <SelectItem value="framework">Framework</SelectItem>
          <SelectItem value="database">Database</SelectItem>
          <SelectItem value="cloud">Cloud</SelectItem>
          <SelectItem value="ai_ml">AI/ML</SelectItem>
          <SelectItem value="tools">Tools</SelectItem>
          <SelectItem value="soft_skills">Soft Skills</SelectItem>
        </SelectContent>
      </Select>
      <div>
        <Label>Proficiency: {proficiency}%</Label>
        <Slider
          value={[proficiency]}
          onValueChange={(value) => setProficiency(value[0])}
          max={100}
          step={5}
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onSave({ name, category, proficiency })}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button onClick={onCancel} variant="outline">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ProjectsEditor({
  profile,
  addProject,
  updateProject,
  removeProject,
  hideProject,
  pinProject,
}: {
  profile: any;
  addProject: (project: any) => void;
  updateProject: (id: string, updates: any) => void;
  removeProject: (id: string) => void;
  hideProject: (id: string) => void;
  pinProject: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    technologies: "",
    repository: "",
  });

  const projects = profile?.projects.filter((p: any) => !p.isHidden) || [];

  const handleAdd = () => {
    if (newProject.name) {
      addProject({
        ...newProject,
        technologies: newProject.technologies
          .split(",")
          .map((t: string) => t.trim()),
      });
      setNewProject({
        name: "",
        description: "",
        technologies: "",
        repository: "",
      });
      setIsAdding(false);
      toast.success("Project added successfully");
    }
  };

  const handleUpdate = (projectId: string, updates: any) => {
    updateProject(projectId, updates);
    setEditingProject(null);
    toast.success("Project updated successfully");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects ({projects.length})</h2>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="e.g., My Portfolio"
                />
              </div>
              <div>
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of the project"
                />
              </div>
              <div>
                <Label htmlFor="project-technologies">
                  Technologies (comma-separated)
                </Label>
                <Input
                  id="project-technologies"
                  value={newProject.technologies}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      technologies: e.target.value,
                    })
                  }
                  placeholder="e.g., React, TypeScript, Node.js"
                />
              </div>
              <div>
                <Label htmlFor="project-repository">Repository URL</Label>
                <Input
                  id="project-repository"
                  value={newProject.repository}
                  onChange={(e) =>
                    setNewProject({ ...newProject, repository: e.target.value })
                  }
                  placeholder="https://github.com/username/repo"
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Add Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {projects.map((project: any) => (
          <Card key={project.id} className="p-4">
            {editingProject === project.id ? (
              <ProjectEditForm
                project={project}
                onSave={(updates) => handleUpdate(project.id, updates)}
                onCancel={() => setEditingProject(null)}
              />
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{project.name}</h3>
                    {project.isPinned && (
                      <Badge variant="secondary">Pinned</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.technologies.map((tech: string) => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => pinProject(project.id)}
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => hideProject(project.id)}
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingProject(project.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProjectEditForm({
  project,
  onSave,
  onCancel,
}: {
  project: any;
  onSave: (updates: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [technologies, setTechnologies] = useState(
    project.technologies.join(", "),
  );
  const [repository, setRepository] = useState(project.repository || "");

  return (
    <div className="space-y-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <Input
        value={technologies}
        onChange={(e) => setTechnologies(e.target.value)}
        placeholder="Technologies (comma-separated)"
      />
      <Input
        value={repository}
        onChange={(e) => setRepository(e.target.value)}
        placeholder="Repository URL"
      />
      <div className="flex gap-2">
        <Button
          onClick={() =>
            onSave({
              name,
              description,
              technologies: technologies
                .split(",")
                .map((t: string) => t.trim()),
              repository,
            })
          }
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button onClick={onCancel} variant="outline">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function AchievementsEditor({
  profile,
  addAchievement,
  removeAchievement,
  hideAchievement,
}: {
  profile: any;
  addAchievement: (achievement: any) => void;
  removeAchievement: (id: string) => void;
  hideAchievement: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
    type: "badge",
    date: new Date().toISOString().split("T")[0],
  });

  const achievements =
    profile?.achievements.filter((a: any) => !a.isHidden) || [];

  const handleAdd = () => {
    if (newAchievement.title) {
      addAchievement({
        ...newAchievement,
        date: new Date(newAchievement.date),
      });
      setNewAchievement({
        title: "",
        description: "",
        type: "badge",
        date: new Date().toISOString().split("T")[0],
      });
      setIsAdding(false);
      toast.success("Achievement added successfully");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Achievements ({achievements.length})
        </h2>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Achievement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="achievement-title">Title</Label>
                <Input
                  id="achievement-title"
                  value={newAchievement.title}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., First Place in Hackathon"
                />
              </div>
              <div>
                <Label htmlFor="achievement-description">Description</Label>
                <Textarea
                  id="achievement-description"
                  value={newAchievement.description}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      description: e.target.value,
                    })
                  }
                  placeholder="Details about the achievement"
                />
              </div>
              <div>
                <Label htmlFor="achievement-type">Type</Label>
                <Select
                  value={newAchievement.type}
                  onValueChange={(value) =>
                    setNewAchievement({ ...newAchievement, type: value })
                  }
                >
                  <SelectTrigger id="achievement-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="badge">Badge</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="medal">Medal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="achievement-date">Date</Label>
                <Input
                  id="achievement-date"
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Add Achievement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {achievements.map((achievement: any) => (
          <Card key={achievement.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <Badge variant="secondary" className="capitalize">
                    {achievement.type}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {achievement.source.charAt(0).toUpperCase() +
                    achievement.source.slice(1)}{" "}
                  • {new Date(achievement.date).toLocaleDateString()}
                </p>
              </div>
              <div className="ml-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => hideAchievement(achievement.id)}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAchievement(achievement.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
