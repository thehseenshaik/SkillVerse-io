import type { ResumeData, Theme } from "@/lib/resume/types";

interface InternshipProps {
  resume: ResumeData;
  theme: Theme;
}

export function Internship({ resume, theme }: InternshipProps) {
  const { profile, experience, education, skills, projects } = resume;

  return (
    <div 
      className="bg-white text-gray-900"
      style={{
        fontFamily: theme.typography.fontFamily,
        color: theme.colors.text,
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 mb-4 border-b-2" style={{ borderColor: theme.colors.primary }}>
        <h1 
          className="text-xl font-bold"
          style={{ color: theme.colors.primary }}
        >
          {profile.fullName || "Your Name"}
        </h1>
        <p className="text-sm text-gray-600 mt-1">{profile.title || "Student"}</p>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
          <span>{profile.contact.email || "email@example.com"}</span>
          <span>{profile.contact.phone || "+1 234 567 890"}</span>
          <span>{profile.contact.location || "City, Country"}</span>
        </div>
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="px-6 mb-4">
          <h2 className="text-sm font-bold mb-2">Objective</h2>
          <p className="text-xs text-gray-700">{profile.summary}</p>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="px-6 mb-4">
          <h2 
            className="text-sm font-bold mb-2"
            style={{ color: theme.colors.primary }}
          >
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-gray-900 text-xs">{edu.degree}</h3>
                <span className="text-xs text-gray-500">
                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                </span>
              </div>
              <p className="text-xs text-gray-700">{edu.institution}</p>
              <p className="text-xs text-gray-600">{edu.field}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="px-6 mb-4">
          <h2 
            className="text-sm font-bold mb-2"
            style={{ color: theme.colors.primary }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-2 py-1 text-xs font-medium rounded"
                style={{
                  backgroundColor: `${theme.colors.primary}15`,
                  color: theme.colors.primary,
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="px-6 mb-4">
          <h2 
            className="text-sm font-bold mb-2"
            style={{ color: theme.colors.primary }}
          >
            Academic Projects
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-2">
              <h3 className="font-semibold text-gray-900 text-xs">{project.name}</h3>
              <p className="text-xs text-gray-700">{project.description}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {project.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="px-6 mb-4">
          <h2 
            className="text-sm font-bold mb-2"
            style={{ color: theme.colors.primary }}
          >
            Internships
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-gray-900 text-xs">{exp.position}</h3>
                <span className="text-xs text-gray-500">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <p className="text-xs text-gray-700">{exp.company}</p>
              <ul className="text-xs text-gray-600 list-disc list-inside">
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
