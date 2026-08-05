import type { ResumeData, Theme } from "@/lib/resume/types";

interface ExecutiveProps {
  resume: ResumeData;
  theme: Theme;
}

export function Executive({ resume, theme }: ExecutiveProps) {
  const { profile, experience, education, skills, projects } = resume;

  return (
    <div 
      className="bg-white text-gray-900"
      style={{
        fontFamily: theme.typography.fontFamily,
        color: theme.colors.text,
      }}
    >
      {/* Header with accent background */}
      <div 
        className="px-8 py-6 mb-6"
        style={{ backgroundColor: `${theme.colors.primary}10` }}
      >
        <h1 
          className="text-3xl font-bold tracking-wide"
          style={{ color: theme.colors.primary }}
        >
          {profile.fullName || "Your Name"}
        </h1>
        <p className="text-xl font-semibold text-gray-700 mt-1">{profile.title || "Your Title"}</p>
        <div className="flex flex-wrap gap-6 mt-3 text-sm text-gray-600">
          <span>{profile.contact.email || "email@example.com"}</span>
          <span>{profile.contact.phone || "+1 234 567 890"}</span>
          <span>{profile.contact.location || "City, Country"}</span>
        </div>
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="px-8 mb-6">
          <h2 
            className="text-lg font-bold mb-2 uppercase tracking-wide"
            style={{ color: theme.colors.primary }}
          >
            Executive Summary
          </h2>
          <p className="text-base text-gray-700 leading-relaxed max-w-4xl">{profile.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="px-8 mb-6">
          <h2 
            className="text-lg font-bold mb-4 uppercase tracking-wide"
            style={{ color: theme.colors.primary }}
          >
            Professional Experience
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-bold text-gray-900 text-lg">{exp.position}</h3>
                <span className="text-sm text-gray-600 font-medium">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <p className="text-base font-semibold text-gray-700 mb-2">{exp.company}</p>
              {exp.location && (
                <p className="text-sm text-gray-600 mb-2">{exp.location}</p>
              )}
              <ul className="text-base text-gray-700 space-y-2 list-disc list-inside">
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
              {exp.achievements && exp.achievements.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Key Achievements:</p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i} className="font-medium">{achievement}</li>
                    ))}
                  </ul>
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
            className="text-lg font-bold mb-4 uppercase tracking-wide"
            style={{ color: theme.colors.primary }}
          >
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-bold text-gray-900 text-base">{edu.degree}</h3>
                <span className="text-sm text-gray-600 font-medium">
                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                </span>
              </div>
              <p className="text-base font-semibold text-gray-700">{edu.institution}</p>
              <p className="text-sm text-gray-600">{edu.field}</p>
              {edu.gpa && (
                <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
              )}
              {edu.honors && edu.honors.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Honors: {edu.honors.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="px-8 mb-6">
          <h2 
            className="text-lg font-bold mb-4 uppercase tracking-wide"
            style={{ color: theme.colors.primary }}
          >
            Core Competencies
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="px-4 py-2 border border-gray-300 rounded"
                style={{ borderColor: theme.colors.primary }}
              >
                <p className="font-semibold text-gray-900 text-sm">{skill.name}</p>
                <p className="text-xs text-gray-600">{skill.level}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="px-8 mb-6">
          <h2 
            className="text-lg font-bold mb-4 uppercase tracking-wide"
            style={{ color: theme.colors.primary }}
          >
            Notable Projects
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-4">
              <h3 className="font-bold text-gray-900 mb-1">{project.name}</h3>
              <p className="text-base text-gray-700 mb-2">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {project.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-medium rounded"
                    style={{
                      backgroundColor: `${theme.colors.accent}15`,
                      color: theme.colors.accent,
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
                      GitHub Repository
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <div className="px-8 mb-6">
          <h2 
            className="text-lg font-bold mb-4 uppercase tracking-wide"
            style={{ color: theme.colors.primary }}
          >
            Certifications & Credentials
          </h2>
          {resume.certifications.map((cert) => (
            <div key={cert.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900 text-sm">{cert.name}</h3>
                <span className="text-xs text-gray-600">{cert.date}</span>
              </div>
              <p className="text-sm text-gray-700">{cert.issuer}</p>
              {cert.credentialId && (
                <p className="text-xs text-gray-600">Credential ID: {cert.credentialId}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {resume.achievements.length > 0 && (
        <div className="px-8 mb-6">
          <h2 
            className="text-lg font-bold mb-4 uppercase tracking-wide"
            style={{ color: theme.colors.primary }}
          >
            Awards & Recognition
          </h2>
          {resume.achievements.map((achievement) => (
            <div key={achievement.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900 text-sm">{achievement.title}</h3>
                <span className="text-xs text-gray-600">{achievement.date}</span>
              </div>
              <p className="text-sm text-gray-700">{achievement.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {resume.languages.length > 0 && (
        <div className="px-8 mb-6">
          <h2 
            className="text-lg font-bold mb-4 uppercase tracking-wide"
            style={{ color: theme.colors.primary }}
          >
            Languages
          </h2>
          <div className="flex flex-wrap gap-3">
            {resume.languages.map((lang) => (
              <span
                key={lang.id}
                className="px-4 py-2 text-sm font-medium rounded-full border"
                style={{
                  borderColor: theme.colors.primary,
                  color: theme.colors.primary,
                }}
              >
                {lang.name} ({lang.proficiency})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
