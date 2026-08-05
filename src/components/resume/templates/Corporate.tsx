import type { ResumeData, Theme } from "@/lib/resume/types";

interface CorporateProps {
  resume: ResumeData;
  theme: Theme;
}

export function Corporate({ resume, theme }: CorporateProps) {
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
      <div className="border-b-4 border-gray-800 pb-4 mb-6">
        <h1 
          className="text-2xl font-bold uppercase tracking-wider"
          style={{ color: theme.colors.primary }}
        >
          {profile.fullName || "Your Name"}
        </h1>
        <p className="text-base font-semibold text-gray-700 mt-1">{profile.title || "Your Title"}</p>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
          <span>{profile.contact.email || "email@example.com"}</span>
          <span>{profile.contact.phone || "+1 234 567 890"}</span>
          <span>{profile.contact.location || "City, Country"}</span>
          {profile.contact.linkedin && <span>{profile.contact.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="mb-6">
          <h2 
            className="text-sm font-bold uppercase tracking-wide mb-2 border-b border-gray-300 pb-1"
            style={{ color: theme.colors.primary }}
          >
            Professional Summary
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{profile.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-sm font-bold uppercase tracking-wide mb-3 border-b border-gray-300 pb-1"
            style={{ color: theme.colors.primary }}
          >
            Work Experience
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-900 text-sm">{exp.position}</h3>
                <span className="text-xs text-gray-600">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-700">{exp.company}</p>
              {exp.location && (
                <p className="text-xs text-gray-600 mb-1">{exp.location}</p>
              )}
              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-sm font-bold uppercase tracking-wide mb-3 border-b border-gray-300 pb-1"
            style={{ color: theme.colors.primary }}
          >
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-900 text-xs">{edu.degree}</h3>
                <span className="text-xs text-gray-600">
                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700">{edu.institution}</p>
              <p className="text-xs text-gray-600">{edu.field}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-sm font-bold uppercase tracking-wide mb-3 border-b border-gray-300 pb-1"
            style={{ color: theme.colors.primary }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 text-xs font-medium border border-gray-300 rounded"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-sm font-bold uppercase tracking-wide mb-3 border-b border-gray-300 pb-1"
            style={{ color: theme.colors.primary }}
          >
            Projects
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-3">
              <h3 className="font-bold text-gray-900 text-xs">{project.name}</h3>
              <p className="text-sm text-gray-700">{project.description}</p>
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

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-sm font-bold uppercase tracking-wide mb-3 border-b border-gray-300 pb-1"
            style={{ color: theme.colors.primary }}
          >
            Certifications
          </h2>
          {resume.certifications.map((cert) => (
            <div key={cert.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900 text-xs">{cert.name}</h3>
                <span className="text-xs text-gray-600">{cert.date}</span>
              </div>
              <p className="text-xs text-gray-700">{cert.issuer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
