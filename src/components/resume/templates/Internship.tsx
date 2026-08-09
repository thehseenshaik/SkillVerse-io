import type { ResumeData, Theme } from "@/lib/resume/types";

interface InternshipProps {
  resume: ResumeData;
  theme: Theme;
}

export function Internship({ resume, theme }: InternshipProps) {
  const { profile, experience, education, skills, projects, certifications, achievements } = resume;

  return (
    <div 
      className="bg-white text-black leading-relaxed"
      style={{
        fontFamily: theme.typography.fontFamily || "Inter, sans-serif",
        color: "#000000",
      }}
    >
      {/* HEADER */}
      <div className="text-center mb-4 pb-3 border-b border-gray-400">
        <h1 className="text-2xl font-bold tracking-tight uppercase text-black mb-0.5">
          {profile.fullName || "Your Name"}
        </h1>
        {profile.title && (
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-800 mb-1.5">
            {profile.title}
          </p>
        )}
        <div className="text-[10px] text-gray-700 font-medium flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5">
          {profile.contact.phone && <span>{profile.contact.phone}</span>}
          {profile.contact.phone && profile.contact.email && <span className="text-gray-400">|</span>}
          {profile.contact.email && <span>{profile.contact.email}</span>}
          {profile.contact.location && <span className="text-gray-400">|</span>}
          {profile.contact.location && <span>{profile.contact.location}</span>}
          {profile.contact.linkedin && <span className="text-gray-400">|</span>}
          {profile.contact.linkedin && <span>LinkedIn: {profile.contact.linkedin}</span>}
          {profile.contact.github && <span className="text-gray-400">|</span>}
          {profile.contact.github && <span>GitHub: {profile.contact.github}</span>}
          {(profile.contact.portfolio || profile.contact.website) && <span className="text-gray-400">|</span>}
          {(profile.contact.portfolio || profile.contact.website) && <span>Portfolio: {profile.contact.portfolio || profile.contact.website}</span>}
        </div>
      </div>

      {/* SUMMARY */}
      {profile.summary && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b border-gray-400">
            Profile Summary
          </h2>
          <p className="text-[10.5px] leading-snug text-gray-900">
            {profile.summary}
          </p>
        </div>
      )}

      {/* EDUCATION */}
      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b border-gray-400">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu) => {
              const dateRange = [edu.startDate, edu.current ? "Present" : edu.endDate].filter(Boolean).join(" – ");
              const degreeField = [edu.degree, edu.field].filter(Boolean).join(" — ");
              const instLoc = [edu.institution, edu.location].filter(Boolean).join(", ");
              const scoreHonors = [
                edu.gpa ? `CGPA/Score: ${edu.gpa}` : null,
                edu.honors && edu.honors.length > 0 ? `Honors: ${edu.honors.join(", ")}` : null,
              ].filter(Boolean).join(" • ");

              return (
                <div key={edu.id} className="text-[10.5px]">
                  <div className="flex justify-between items-baseline font-bold text-black">
                    <span>{degreeField || "Degree"}</span>
                    {dateRange && <span className="font-medium text-gray-700 text-[10px] shrink-0 ml-2">{dateRange}</span>}
                  </div>
                  <div className="flex justify-between items-baseline text-gray-800 mt-0.5">
                    <span>{instLoc}</span>
                    {scoreHonors && <span className="font-semibold text-gray-700 text-[10px] shrink-0 ml-2">{scoreHonors}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TECHNICAL SKILLS */}
      {skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b border-gray-400">
            Skills
          </h2>
          <div className="text-[10.5px] text-gray-900 leading-snug">
            <span className="font-bold text-black">Technical Skills: </span>
            <span>{skills.map((s) => s.name).join(", ")}</span>
          </div>
        </div>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b border-gray-400">
            Projects
          </h2>
          <div className="space-y-2.5">
            {projects.map((project) => (
              <div key={project.id} className="text-[10.5px]">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-black">
                    {project.name}
                    {project.technologies && project.technologies.length > 0 && (
                      <span className="font-normal text-gray-800"> | {project.technologies.join(", ")}</span>
                    )}
                  </span>
                  {(project.link || project.github) && (
                    <span className="text-[10px] text-gray-600 font-medium shrink-0 ml-2">
                      {[project.link ? "Live Demo" : null, project.github ? "GitHub" : null].filter(Boolean).join(" • ")}
                    </span>
                  )}
                </div>
                {project.description && (
                  <ul className="mt-1 space-y-0.5 pl-4 list-disc text-gray-900">
                    <li className="leading-snug">{project.description}</li>
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPERIENCE */}
      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b border-gray-400">
            Work & Leadership Experience
          </h2>
          <div className="space-y-2.5">
            {experience.map((exp) => {
              const dateRange = [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" – ");
              return (
                <div key={exp.id} className="text-[10.5px]">
                  <div className="flex justify-between items-baseline font-bold text-black">
                    <span>
                      {exp.position} — <span className="font-semibold text-gray-800">{exp.company}</span>
                    </span>
                    {dateRange && <span className="font-medium text-gray-700 text-[10px] shrink-0 ml-2">{dateRange}</span>}
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="mt-1 space-y-0.5 pl-4 list-disc text-gray-900">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="leading-snug">{desc}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
