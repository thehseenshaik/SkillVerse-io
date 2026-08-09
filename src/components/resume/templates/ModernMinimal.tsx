import type { ResumeData, Theme } from "@/lib/resume/types";

interface ModernMinimalProps {
  resume: ResumeData;
  theme: Theme;
}

export function ModernMinimal({ resume, theme }: ModernMinimalProps) {
  const { profile, experience, education, skills, projects, certifications, achievements, languages } = resume;

  return (
    <div 
      className="bg-white text-black leading-relaxed"
      style={{
        fontFamily: theme.typography.fontFamily || "Inter, sans-serif",
        color: "#000000",
      }}
    >
      {/* HEADER - Left Aligned */}
      <div className="mb-5 pb-3 border-b-2 border-gray-900">
        <h1 className="text-3xl font-bold tracking-tight uppercase text-black mb-1">
          {profile.fullName || "Your Name"}
        </h1>
        {profile.title && (
          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            {profile.title}
          </p>
        )}
        <div className="text-xs text-gray-700 font-medium flex flex-wrap items-center gap-x-2.5 gap-y-1">
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
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-0.5 border-b border-gray-300">
            Summary
          </h2>
          <p className="text-[12px] leading-relaxed text-gray-900">
            {profile.summary}
          </p>
        </div>
      )}

      {/* EDUCATION */}
      {education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-0.5 border-b border-gray-300">
            Education
          </h2>
          <div className="space-y-2.5">
            {education.map((edu) => {
              const dateRange = [edu.startDate, edu.current ? "Present" : edu.endDate].filter(Boolean).join(" – ");
              const degreeField = [edu.degree, edu.field].filter(Boolean).join(" — ");
              const instLoc = [edu.institution, edu.location].filter(Boolean).join(", ");
              const scoreHonors = [
                edu.gpa ? `CGPA/Score: ${edu.gpa}` : null,
                edu.honors && edu.honors.length > 0 ? `Honors: ${edu.honors.join(", ")}` : null,
              ].filter(Boolean).join(" • ");

              return (
                <div key={edu.id} className="text-[12px]">
                  <div className="flex justify-between items-baseline font-bold text-black text-[13px]">
                    <span>{degreeField || "Degree"}</span>
                    {dateRange && <span className="font-medium text-gray-700 text-xs shrink-0 ml-2">{dateRange}</span>}
                  </div>
                  <div className="flex justify-between items-baseline text-gray-800 mt-0.5 text-xs">
                    <span>{instLoc}</span>
                    {scoreHonors && <span className="font-semibold text-gray-700 text-xs shrink-0 ml-2">{scoreHonors}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TECHNICAL SKILLS */}
      {skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-0.5 border-b border-gray-300">
            Technical Skills
          </h2>
          <div className="text-[12px] text-gray-900 leading-relaxed">
            <span className="font-bold text-black">Technical Stack: </span>
            <span>{skills.map((s) => s.name).join(", ")}</span>
          </div>
        </div>
      )}

      {/* EXPERIENCE */}
      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-0.5 border-b border-gray-300">
            Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp) => {
              const dateRange = [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" – ");
              return (
                <div key={exp.id} className="text-[12px]">
                  <div className="flex justify-between items-baseline text-[13px]">
                    <span className="font-bold text-black">
                      {exp.position} — <span className="font-semibold text-gray-800">{exp.company}</span>
                    </span>
                    {dateRange && <span className="font-medium text-gray-700 text-xs shrink-0 ml-2">{dateRange}</span>}
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="mt-1 space-y-1 pl-4 list-disc text-gray-900 text-[12px]">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="leading-relaxed">{desc}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-0.5 border-b border-gray-300">
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="text-[12px]">
                <div className="flex justify-between items-baseline text-[13px]">
                  <span className="font-bold text-black">
                    {project.name}
                    {project.technologies && project.technologies.length > 0 && (
                      <span className="font-normal text-gray-800"> | {project.technologies.join(", ")}</span>
                    )}
                  </span>
                  {(project.link || project.github) && (
                    <span className="text-xs text-gray-600 font-medium shrink-0 ml-2">
                      {[project.link ? "Live Demo" : null, project.github ? "GitHub" : null].filter(Boolean).join(" • ")}
                    </span>
                  )}
                </div>
                {project.description && (
                  <ul className="mt-1 space-y-1 pl-4 list-disc text-gray-900 text-[12px]">
                    <li className="leading-relaxed">{project.description}</li>
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CERTIFICATIONS */}
      {certifications && certifications.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-0.5 border-b border-gray-300">
            Certifications
          </h2>
          <div className="space-y-1.5 text-[12px]">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-baseline">
                <span>
                  <strong className="text-black">{cert.name}</strong> — {cert.issuer}
                </span>
                {cert.date && <span className="text-xs text-gray-700 font-medium">{cert.date}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS */}
      {achievements && achievements.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-0.5 border-b border-gray-300">
            Achievements
          </h2>
          <ul className="mt-1 space-y-1 pl-4 list-disc text-[12px] text-gray-900">
            {achievements.map((ach) => (
              <li key={ach.id} className="leading-relaxed">
                <strong className="text-black">{ach.title}: </strong>{ach.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
