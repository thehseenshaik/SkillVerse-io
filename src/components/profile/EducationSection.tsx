import { useState, useMemo } from "react";
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  MapPin,
  Calendar,
  Check,
  X,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { type Education, useProfile } from "@/lib/profile-context";
import { searchInstitutions, type Institution } from "@/lib/data/institutions";
import { cn } from "@/lib/utils";

const EDUCATION_LEVELS = [
  "B.Tech / B.E.",
  "M.Tech / M.E.",
  "MBA",
  "MCA",
  "BCA",
  "B.Sc",
  "M.Sc",
  "B.Com",
  "M.Com",
  "BA",
  "MA",
  "MBBS",
  "BDS",
  "Nursing",
  "Pharmacy",
  "Polytechnic / Diploma",
  "Intermediate / 11th–12th",
  "School / 1st–10th",
  "PhD / Doctorate",
  "Other"
] as const;

const BTECH_BRANCHES = [
  "Computer Science and Engineering",
  "Information Technology",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence and Machine Learning",
  "Artificial Intelligence and Data Science",
  "Data Science",
  "Cyber Security",
  "Internet of Things",
  "Robotics and Automation",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Biotechnology",
  "Biomedical Engineering",
  "Mechatronics",
  "Other"
];

const INTERMEDIATE_STREAMS = [
  "MPC",
  "BiPC",
  "MEC",
  "CEC",
  "HEC",
  "Science",
  "Commerce",
  "Arts",
  "Vocational",
  "Other"
];

const SCHOOL_CLASSES = [
  "10th (SSLC / Matriculation)",
  "9th",
  "8th",
  "7th",
  "6th",
  "5th",
  "Completed / Graduated"
];

const MBA_SPECIALIZATIONS = [
  "Finance",
  "Marketing",
  "Human Resources",
  "Business Analytics",
  "Operations Management",
  "Information Technology",
  "International Business",
  "Healthcare Management",
  "Digital Marketing",
  "Other"
];

const MEDICAL_SPECIALIZATIONS = [
  "General Medicine",
  "General Surgery",
  "Pediatrics",
  "Orthopedics",
  "Cardiology",
  "Dermatology",
  "Radiology",
  "Anesthesiology",
  "Gynecology",
  "Other"
];

const DIPLOMA_BRANCHES = [
  "Diploma in Computer Engineering",
  "Diploma in Mechanical Engineering",
  "Diploma in Civil Engineering",
  "Diploma in ECE",
  "Diploma in EEE",
  "Diploma in Automobile Engineering",
  "Other"
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 75 }, (_, i) => (CURRENT_YEAR + 5 - i).toString());

export function EducationSection() {
  const { profile, setEducation } = useProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form States
  const [level, setLevel] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [customSpecialization, setCustomSpecialization] = useState<string>("");
  
  // Institution Autocomplete State
  const [instQuery, setInstQuery] = useState<string>("");
  const [selectedInstName, setSelectedInstName] = useState<string>("");
  const [isManualInst, setIsManualInst] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualInstType, setManualInstType] = useState("College");

  // Dates & Currently Studying
  const [startMonth, setStartMonth] = useState<string>("August");
  const [startYear, setStartYear] = useState<string>(CURRENT_YEAR.toString());
  const [endMonth, setEndMonth] = useState<string>("May");
  const [endYear, setEndYear] = useState<string>((CURRENT_YEAR + 4).toString());
  const [currentlyStudying, setCurrentlyStudying] = useState<boolean>(false);
  const [grade, setGrade] = useState<string>("");

  // PhD Optional Fields
  const [department, setDepartment] = useState<string>("");
  const [thesisTitle, setThesisTitle] = useState<string>("");

  // Institution Search Suggestions
  const instSuggestions = useMemo(() => {
    if (isManualInst) return [];
    return searchInstitutions(instQuery);
  }, [instQuery, isManualInst]);

  const openAddModal = () => {
    setEditingId(null);
    setLevel("");
    setSpecialization("");
    setCustomSpecialization("");
    setInstQuery("");
    setSelectedInstName("");
    setIsManualInst(false);
    setManualCity("");
    setManualState("");
    setManualInstType("College");
    setStartMonth("August");
    setStartYear(CURRENT_YEAR.toString());
    setEndMonth("May");
    setEndYear((CURRENT_YEAR + 4).toString());
    setCurrentlyStudying(false);
    setGrade("");
    setDepartment("");
    setThesisTitle("");
    setModalOpen(true);
  };

  const openEditModal = (item: Education) => {
    setEditingId(item.id);
    setLevel(item.degree || "B.Tech / B.E.");
    
    // Parse specialization
    const fieldVal = item.field || "";
    setSpecialization(fieldVal);
    setCustomSpecialization(fieldVal);

    // Parse Institution
    setSelectedInstName(item.school || "");
    setInstQuery(item.school || "");
    setIsManualInst(false);

    // Parse Dates
    setCurrentlyStudying(item.end === "Present" || item.end?.includes("Present"));
    
    if (item.start) {
      const parts = item.start.split(" ");
      if (parts.length === 2) {
        setStartMonth(parts[0]);
        setStartYear(parts[1]);
      } else {
        setStartYear(item.start);
      }
    }

    if (item.end && item.end !== "Present") {
      const parts = item.end.split(" ");
      if (parts.length === 2) {
        setEndMonth(parts[0]);
        setEndYear(parts[1]);
      } else {
        setEndYear(item.end);
      }
    }

    setGrade(item.grade || "");
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!level) {
      toast.error("Please select your education level");
      return;
    }

    const instName = isManualInst ? selectedInstName : (selectedInstName || instQuery);
    if (!instName.trim()) {
      toast.error("Please select or enter your institution name");
      return;
    }

    let finalField = specialization;
    if (specialization === "Other" || !specialization) {
      finalField = customSpecialization;
    }

    const startDateStr = `${startMonth} ${startYear}`;
    const endDateStr = currentlyStudying ? "Present" : `${endMonth} ${endYear}`;

    // Date Validation
    if (!currentlyStudying && parseInt(endYear) < parseInt(startYear)) {
      toast.error("End year cannot be earlier than start year");
      return;
    }

    const newEntry: Education = {
      id: editingId || crypto.randomUUID(),
      school: instName.trim(),
      degree: level,
      field: finalField.trim(),
      start: startDateStr,
      end: endDateStr,
      grade: grade.trim() || undefined,
    };

    const currentList = profile.education || [];
    let updatedList: Education[];

    if (editingId) {
      updatedList = currentList.map((e) => (e.id === editingId ? newEntry : e));
      toast.success("Education entry updated");
    } else {
      updatedList = [newEntry, ...currentList];
      toast.success("Education entry added");
    }

    setEducation(updatedList);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = (profile.education || []).filter((e) => e.id !== id);
    setEducation(updated);
    setDeleteConfirmId(null);
    toast.success("Education entry removed");
  };

  return (
    <div id="education" className="scroll-mt-24 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-brand shrink-0" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">Education</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add your academic background to build a stronger professional profile.
          </p>
        </div>

        <Button
          onClick={openAddModal}
          size="sm"
          className="bg-brand text-brand-foreground hover:opacity-90 font-medium rounded-xl text-xs flex items-center gap-1.5 shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add Education
        </Button>
      </div>

      {/* Empty State */}
      {(!profile.education || profile.education.length === 0) && (
        <Card className="border border-border/60 bg-card/60 p-8 text-center rounded-2xl space-y-3">
          <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">No education added yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Share your degree, university, or school to showcase your academic achievements.
            </p>
          </div>
          <Button
            onClick={openAddModal}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-1.5 mt-2"
          >
            <Plus className="h-3.5 w-3.5" /> Add Education
          </Button>
        </Card>
      )}

      {/* Existing Education Cards */}
      {profile.education && profile.education.length > 0 && (
        <div className="grid gap-4">
          {profile.education.map((item) => {
            // Helper for circular badge initials / level badge
            const getLevelAbbr = (deg: string) => {
              if (!deg) return "ED";
              if (deg.includes("B.Tech") || deg.includes("B.E.")) return "B.Tech";
              if (deg.includes("M.Tech") || deg.includes("M.E.")) return "M.Tech";
              if (deg.includes("MBA")) return "MBA";
              if (deg.includes("MCA")) return "MCA";
              if (deg.includes("Intermediate")) return "12th";
              if (deg.includes("School")) return "10th";
              if (deg.includes("PhD")) return "PhD";
              return deg.split(" ")[0] || "ED";
            };

            return (
              <Card
                key={item.id}
                className="border border-border bg-card p-5 rounded-2xl shadow-sm hover:border-brand/40 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  {/* Circular Round Box Visual Anchor */}
                  <div className="h-12 w-12 rounded-full border-2 border-brand/30 bg-brand/10 text-brand flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:border-brand group-hover:bg-brand group-hover:text-brand-foreground">
                    <GraduationCap className="h-5 w-5" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-foreground">
                        {item.degree}
                      </span>
                      {item.field && (
                        <Badge variant="secondary" className="text-[11px] font-medium bg-secondary/80 text-foreground">
                          {item.field}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Building2 className="h-3.5 w-3.5 text-brand shrink-0" />
                      <span>{item.school}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                        {item.start} — {item.end}
                      </span>

                      {item.grade && (
                        <span className="font-semibold text-foreground bg-secondary/50 px-2 py-0.5 rounded-md text-[11px]">
                          {item.grade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                  <Button
                    onClick={() => openEditModal(item)}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-xl hover:text-brand"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    onClick={() => setDeleteConfirmId(item.id)}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-xl hover:text-destructive hover:border-destructive/30"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Delete Education Entry?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This will remove this education record from your profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl text-xs"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Education Dialog Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {editingId ? "Edit Education" : "Add Education"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter your academic background details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 1. Education Level */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Education Level *</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-full bg-background border-border rounded-xl text-xs font-medium">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {EDUCATION_LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl} className="text-xs">
                      {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Dynamic Specialization / Branch / Stream */}
            {level === "B.Tech / B.E." && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Branch / Specialization</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger className="w-full bg-background border-border rounded-xl text-xs font-medium">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-60">
                    {BTECH_BRANCHES.map((b) => (
                      <SelectItem key={b} value={b} className="text-xs">
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {level === "Intermediate / 11th–12th" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Stream</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger className="w-full bg-background border-border rounded-xl text-xs font-medium">
                    <SelectValue placeholder="Select stream" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {INTERMEDIATE_STREAMS.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {level === "School / 1st–10th" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Class / Level</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger className="w-full bg-background border-border rounded-xl text-xs font-medium">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {SCHOOL_CLASSES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {level === "MBA" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Specialization</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger className="w-full bg-background border-border rounded-xl text-xs font-medium">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-60">
                    {MBA_SPECIALIZATIONS.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(level === "MBBS" || level === "BDS" || level === "Nursing" || level === "Pharmacy") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Specialization / Program</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger className="w-full bg-background border-border rounded-xl text-xs font-medium">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-60">
                    {MEDICAL_SPECIALIZATIONS.map((med) => (
                      <SelectItem key={med} value={med} className="text-xs">
                        {med}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {level === "Polytechnic / Diploma" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Diploma Branch</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger className="w-full bg-background border-border rounded-xl text-xs font-medium">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-60">
                    {DIPLOMA_BRANCHES.map((d) => (
                      <SelectItem key={d} value={d} className="text-xs">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Specialization Input if "Other" is selected */}
            {(specialization === "Other" || (!BTECH_BRANCHES.includes(specialization) && !INTERMEDIATE_STREAMS.includes(specialization) && !SCHOOL_CLASSES.includes(specialization) && !MBA_SPECIALIZATIONS.includes(specialization) && specialization !== "")) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Custom Branch / Specialization</Label>
                <Input
                  value={customSpecialization}
                  onChange={(e) => setCustomSpecialization(e.target.value)}
                  placeholder="e.g. Computer Engineering"
                  className="bg-background border-border rounded-xl text-xs"
                />
              </div>
            )}

            {/* 3. Institution Autocomplete Search */}
            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">Institution / University / School *</Label>
                {!isManualInst ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualInst(true);
                      setSelectedInstName("");
                    }}
                    className="text-[11px] text-brand hover:underline font-semibold"
                  >
                    + Enter manually
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualInst(false);
                    }}
                    className="text-[11px] text-brand hover:underline font-semibold"
                  >
                    Search database
                  </button>
                )}
              </div>

              {!isManualInst ? (
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={selectedInstName || instQuery}
                      onChange={(e) => {
                        setSelectedInstName("");
                        setInstQuery(e.target.value);
                      }}
                      placeholder="Search university, college, junior college, school..."
                      className="bg-background border-border rounded-xl text-xs pl-9"
                    />
                  </div>

                  {/* Autocomplete Dropdown List */}
                  {instQuery.trim().length > 0 && !selectedInstName && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto p-1 space-y-1">
                      {instSuggestions.length > 0 ? (
                        instSuggestions.map((inst) => (
                          <button
                            key={inst.id}
                            type="button"
                            onClick={() => {
                              setSelectedInstName(inst.officialName);
                              setInstQuery(inst.officialName);
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-secondary/80 transition-colors flex flex-col gap-0.5"
                          >
                            <span className="text-xs font-semibold text-foreground">
                              {inst.officialName}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-2">
                              <span>{inst.city}, {inst.state}</span>
                              <Badge variant="outline" className="text-[9px] py-0 px-1 font-medium">
                                {inst.type}
                              </Badge>
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                          No matching institution found.
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualInst(true);
                              setSelectedInstName(instQuery);
                            }}
                            className="block mx-auto mt-1 font-semibold text-brand hover:underline text-xs"
                          >
                            + Enter "{instQuery}" manually
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 p-3 rounded-xl border border-border bg-background/50">
                  <Input
                    value={selectedInstName}
                    onChange={(e) => setSelectedInstName(e.target.value)}
                    placeholder="Enter institution name"
                    className="bg-background border-border rounded-xl text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      placeholder="City (e.g. Kakinada)"
                      className="bg-background border-border rounded-xl text-xs"
                    />
                    <Input
                      value={manualState}
                      onChange={(e) => setManualState(e.target.value)}
                      placeholder="State (e.g. Andhra Pradesh)"
                      className="bg-background border-border rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Dates Selection */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Start Date *</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  <Select value={startMonth} onValueChange={setStartMonth}>
                    <SelectTrigger className="bg-background border-border rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-48">
                      {MONTHS.map((m) => (
                        <SelectItem key={m} value={m} className="text-xs">
                          {m.substring(0, 3)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={startYear} onValueChange={setStartYear}>
                    <SelectTrigger className="bg-background border-border rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-48">
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y} className="text-xs">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">End Date</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  <Select value={endMonth} onValueChange={setEndMonth} disabled={currentlyStudying}>
                    <SelectTrigger className="bg-background border-border rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-48">
                      {MONTHS.map((m) => (
                        <SelectItem key={m} value={m} className="text-xs">
                          {m.substring(0, 3)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={endYear} onValueChange={setEndYear} disabled={currentlyStudying}>
                    <SelectTrigger className="bg-background border-border rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-48">
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y} className="text-xs">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Currently Studying Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="currently-studying"
                checked={currentlyStudying}
                onCheckedChange={(c) => setCurrentlyStudying(!!c)}
              />
              <label htmlFor="currently-studying" className="text-xs font-medium text-foreground cursor-pointer">
                I am currently studying here
              </label>
            </div>

            {/* Grade / CGPA Optional Field */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-foreground">Grade / CGPA (Optional)</Label>
              <Input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. 8.5 CGPA or 85%"
                className="bg-background border-border rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-brand text-brand-foreground hover:opacity-90 rounded-xl text-xs font-semibold"
              onClick={handleSave}
            >
              {editingId ? "Save Changes" : "Save Education"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
