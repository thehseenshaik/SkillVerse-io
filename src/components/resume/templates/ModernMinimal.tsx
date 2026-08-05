import type { ResumeData, Theme } from "@/lib/resume/types";

interface ModernMinimalProps {
  resume: ResumeData;
  theme: Theme;
}

export function ModernMinimal({ resume, theme }: ModernMinimalProps) {
  const { profile, experience, education, skills, projects } = resume;

  return (
    <div 
      className="bg-gradient-to-br from-white to-gray-50 text-gray-900 rounded-2xl p-6"
      style={{
        fontFamily: theme.typography.fontFamily,
        color: theme.colors.text,
      }}
    >
      {/* Header */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
        <h1 
          className="text-2xl font-semibold tracking-tight"
          style={{ color: theme.colors.primary }}
        >
          {profile.fullName || "Your Name"}
        </h1>
        <p className="text-sm text-gray-600 mt-1">{profile.title || "Your Title"}</p>
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
          <span className="px-2 py-1 rounded-md bg-white/60">{profile.contact.email || "email@example.com"}</span>
          <span className="px-2 py-1 rounded-md bg-white/60">{profile.contact.phone || "+1 234 567 890"}</span>
          <span className="px-2 py-1 rounded-md bg-white/60">{profile.contact.location || "City, Country"}</span>
        </div>
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="mb-5 p-4 rounded-xl bg-white border border-gray-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            {profile.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-5">
          <h2 
            className="text-base font-semibold mb-3 px-2"
            style={{ color: theme.colors.primary }}
          >
            Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id} className="p-4 rounded-xl bg-white border border-gray-100">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{exp.position}</h3>
                  <span className="text-xs text-gray-500 px-2 py-1 rounded-md bg-gray-50">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{exp.company}</p>
                <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                  {exp.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-5">
          <h2 
            className="text-base font-semibold mb-3 px-2"
            style={{ color: theme.colors.primary }}
          >
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="p-4 rounded-xl bg-white border border-gray-100">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{edu.degree}</h3>
                  <span className="text-xs text-gray-500 px-2 py-1 rounded-md bg-gray-50">
                    {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{edu.institution}</p>
                <p className="text-xs text-gray-500">{edu.field}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-5">
          <h2 
            className="text-base font-semibold mb-3 px-2"
            style={{ color: theme.colors.primary }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-white border border-gray-100">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1.5 text-xs font-medium rounded-lg"
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
        <div className="mb-5">
          <h2 
            className="text-base font-semibold mb-3 px-2"
            style={{ color: theme.colors.primary }}
          >
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="p-4 rounded-xl bg-white border border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{project.name}</h3>
                <p className="text-xs text-gray-700 mb-2">{project.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-md bg-gray-50 text-gray-600"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <div className="mb-5">
          <h2 
            className="text-base font-semibold mb-3 px-2"
            style={{ color: theme.colors.primary }}
          >
            Certifications
          </h2>
          <div className="space-y-2">
            {resume.certifications.map((cert) => (
              <div key={cert.id} className="p-3 rounded-lg bg-white border border-gray-100">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-900 text-xs">{cert.name}</h3>
                  <span className="text-xs text-gray-500">{cert.date}</span>
                </div>
                <p className="text-xs text-gray-600">{cert.issuer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {resume.achievements.length > 0 && (
        <div className="mb-5">
          <h2 
            className="text-base font-semibold mb-3 px-2"
            style={{ color: theme.colors.primary }}
          >
            Achievements
          </h2>
          <div className="space-y-2">
            {resume.achievements.map((achievement) => (
              <div key={achievement.id} className="p-3 rounded-lg bg-white border border-gray-100">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-900 text-xs">{achievement.title}</h3>
                  <span className="text-xs text-gray-500">{achievement.date}</span>
                </div>
                <p className="text-xs text-gray-700">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {resume.languages.length > 0 && (
        <div className="mb-5">
          <h2 
            className="text-base font-semibold mb-3 px-2"
            style={{ color: theme.colors.primary }}
          >
            Languages
          </h2>
          <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-white border border-gray-100">
            {resume.languages.map((lang) => (
              <span
                key={lang.id}
                className="px-3 py-1.5 text-xs font-medium rounded-lg"
                style={{
                  backgroundColor: `${theme.colors.accent}15`,
                  color: theme.colors.accent,
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
