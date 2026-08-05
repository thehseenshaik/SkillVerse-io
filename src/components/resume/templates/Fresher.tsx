import type { ResumeData, Theme } from "@/lib/resume/types";

interface FresherProps {
  resume: ResumeData;
  theme: Theme;
}

export function Fresher({ resume, theme }: FresherProps) {
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
      <div className="text-center mb-6">
        <h1 
          className="text-2xl font-bold"
          style={{ color: theme.colors.primary }}
        >
          {profile.fullName || "Your Name"}
        </h1>
        <p className="text-base text-gray-600 mt-1">{profile.title || "Fresher"}</p>
        <div className="flex justify-center gap-4 mt-3 text-sm text-gray-500">
          <span>{profile.contact.email || "email@example.com"}</span>
          <span>{profile.contact.phone || "+1 234 567 890"}</span>
          <span>{profile.contact.location || "City, Country"}</span>
        </div>
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="mb-6">
          <h2 className="text-base font-bold mb-2 text-center">Career Objective</h2>
          <p className="text-sm text-gray-700 text-center max-w-3xl mx-auto">{profile.summary}</p>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-base font-bold mb-3 text-center"
            style={{ color: theme.colors.primary }}
          >
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">{edu.degree}</h3>
                <span className="text-xs text-gray-500">
                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700">{edu.institution}</p>
              <p className="text-xs text-gray-600">{edu.field}</p>
              {edu.gpa && (
                <p className="text-xs text-gray-600">GPA: {edu.gpa}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-base font-bold mb-3 text-center"
            style={{ color: theme.colors.primary }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 text-xs font-medium rounded-full"
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
        <div className="mb-6">
          <h2 
            className="text-base font-bold mb-3 text-center"
            style={{ color: theme.colors.primary }}
          >
            Projects
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-3">
              <h3 className="font-semibold text-gray-900 text-sm text-center">{project.name}</h3>
              <p className="text-sm text-gray-700 text-center">{project.description}</p>
              <div className="flex justify-center gap-1 mt-2">
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
        <div className="mb-6">
          <h2 
            className="text-base font-bold mb-3 text-center"
            style={{ color: theme.colors.primary }}
          >
            Internships & Experience
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">{exp.position}</h3>
                <span className="text-xs text-gray-500">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700">{exp.company}</p>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-base font-bold mb-3 text-center"
            style={{ color: theme.colors.primary }}
          >
            Certifications
          </h2>
          {resume.certifications.map((cert) => (
            <div key={cert.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-gray-900 text-xs">{cert.name}</h3>
                <span className="text-xs text-gray-500">{cert.date}</span>
              </div>
              <p className="text-xs text-gray-700">{cert.issuer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {resume.achievements.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-base font-bold mb-3 text-center"
            style={{ color: theme.colors.primary }}
          >
            Achievements
          </h2>
          {resume.achievements.map((achievement) => (
            <div key={achievement.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-gray-900 text-xs">{achievement.title}</h3>
                <span className="text-xs text-gray-500">{achievement.date}</span>
              </div>
              <p className="text-xs text-gray-700">{achievement.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
