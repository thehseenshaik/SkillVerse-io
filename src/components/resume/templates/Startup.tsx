import type { ResumeData, Theme } from "@/lib/resume/types";

interface StartupProps {
  resume: ResumeData;
  theme: Theme;
}

export function Startup({ resume, theme }: StartupProps) {
  const { profile, experience, education, skills, projects } = resume;

  return (
    <div 
      className="bg-white text-gray-900"
      style={{
        fontFamily: theme.typography.fontFamily,
        color: theme.colors.text,
      }}
    >
      {/* Header with gradient */}
      <div 
        className="px-8 py-6 mb-6 rounded-lg"
        style={{ 
          background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}20)` 
        }}
      >
        <h1 
          className="text-3xl font-bold"
          style={{ color: theme.colors.primary }}
        >
          {profile.fullName || "Your Name"}
        </h1>
        <p className="text-lg text-gray-700 mt-1">{profile.title || "Your Title"}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
          <span>{profile.contact.email || "email@example.com"}</span>
          <span>{profile.contact.phone || "+1 234 567 890"}</span>
          <span>{profile.contact.location || "City, Country"}</span>
          {profile.contact.github && <span>{profile.contact.github}</span>}
          {profile.contact.linkedin && <span>{profile.contact.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="px-8 mb-6">
          <h2 className="text-lg font-bold mb-2">About Me</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{profile.summary}</p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="px-8 mb-6">
          <h2 
            className="text-lg font-bold mb-3"
            style={{ color: theme.colors.primary }}
          >
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1.5 text-sm font-medium rounded-lg"
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

      {/* Experience */}
      {experience.length > 0 && (
        <div className="px-8 mb-6">
          <h2 
            className="text-lg font-bold mb-3"
            style={{ color: theme.colors.primary }}
          >
            Experience
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-4 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-bold text-gray-900">{exp.position}</h3>
                <span className="text-xs text-gray-500">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{exp.company}</p>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="px-8 mb-6">
          <h2 
            className="text-lg font-bold mb-3"
            style={{ color: theme.colors.primary }}
          >
            Side Projects
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-4 p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1">{project.name}</h3>
              <p className="text-sm text-gray-700 mb-2">{project.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {project.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {(project.link || project.github) && (
                <div className="text-xs">
                  {project.link && (
                    <a href={project.link} className="text-blue-600 hover:underline mr-2">
                      Live Demo
                    </a>
                  )}
                  {project.github && (
                    <a href={project.github} className="text-blue-600 hover:underline">
                      GitHub
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="px-8 mb-6">
          <h2 
            className="text-lg font-bold mb-3"
            style={{ color: theme.colors.primary }}
          >
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                <span className="text-xs text-gray-500">
                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700">{edu.institution}</p>
              <p className="text-xs text-gray-600">{edu.field}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
