import type { ResumeData, Theme } from "@/lib/resume/types";

interface DesignerProps {
  resume: ResumeData;
  theme: Theme;
}

export function Designer({ resume, theme }: DesignerProps) {
  const { profile, experience, education, skills, projects } = resume;

  return (
    <div 
      className="bg-white text-gray-900"
      style={{
        fontFamily: theme.typography.fontFamily,
        color: theme.colors.text,
      }}
    >
      {/* Header with creative accent */}
      <div className="px-8 py-8 mb-6 relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full h-1"
          style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
        />
        <h1 
          className="text-4xl font-light mb-2"
          style={{ color: theme.colors.primary }}
        >
          {profile.fullName || "Your Name"}
        </h1>
        <p className="text-xl text-gray-600">{profile.title || "Creative Designer"}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          <span>{profile.contact.email || "email@example.com"}</span>
          <span>{profile.contact.phone || "+1 234 567 890"}</span>
          <span>{profile.contact.location || "City, Country"}</span>
          {profile.contact.portfolio && <span>{profile.contact.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="px-8 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed italic max-w-4xl">
            {profile.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="px-8 mb-8">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: theme.colors.primary }}
          >
            Design Skills
          </h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-4 py-2 text-sm font-medium rounded-full"
                style={{
                  backgroundColor: `${theme.colors.accent}20`,
                  color: theme.colors.accent,
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
        <div className="px-8 mb-8">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: theme.colors.primary }}
          >
            Experience
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-bold text-xl text-gray-900">{exp.position}</h3>
                <span className="text-sm text-gray-500">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <p className="text-base text-gray-700 mb-2">{exp.company}</p>
              <ul className="text-base text-gray-600 space-y-2 list-disc list-inside">
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
        <div className="px-8 mb-8">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: theme.colors.primary }}
          >
            Creative Projects
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-6">
              <h3 className="font-bold text-xl text-gray-900 mb-2">{project.name}</h3>
              <p className="text-base text-gray-700 mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {project.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm rounded-full"
                    style={{
                      backgroundColor: `${theme.colors.primary}20`,
                      color: theme.colors.primary,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {(project.link || project.github) && (
                <div className="text-sm">
                  {project.link && (
                    <a href={project.link} className="text-blue-600 hover:underline mr-3">
                      View Project
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
        <div className="px-8 mb-8">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: theme.colors.primary }}
          >
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-lg text-gray-900">{edu.degree}</h3>
                <span className="text-sm text-gray-500">
                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                </span>
              </div>
              <p className="text-base text-gray-700">{edu.institution}</p>
              <p className="text-sm text-gray-600">{edu.field}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
