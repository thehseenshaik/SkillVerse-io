import type { ResumeData, Theme } from "@/lib/resume/types";

interface AcademicProps {
  resume: ResumeData;
  theme: Theme;
}

export function Academic({ resume, theme }: AcademicProps) {
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
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 
          className="text-2xl font-bold"
          style={{ color: theme.colors.primary }}
        >
          {profile.fullName || "Your Name"}
        </h1>
        <p className="text-base text-gray-700 mt-1">{profile.title || "Researcher"}</p>
        <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
          <span>{profile.contact.email || "email@example.com"}</span>
          <span>{profile.contact.phone || "+1 234 567 890"}</span>
          <span>{profile.contact.location || "City, Country"}</span>
        </div>
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="mb-6">
          <h2 
            className="text-sm font-bold uppercase tracking-wide mb-2 text-center"
            style={{ color: theme.colors.primary }}
          >
            Research Interests
          </h2>
          <p className="text-sm text-gray-700 text-center max-w-3xl mx-auto">{profile.summary}</p>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-sm font-bold uppercase tracking-wide mb-3 text-center"
            style={{ color: theme.colors.primary }}
          >
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                <span className="text-xs text-gray-600">
                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700">{edu.institution}</p>
              <p className="text-xs text-gray-600">{edu.field}</p>
              {edu.gpa && (
                <p className="text-xs text-gray-600">GPA: {edu.gpa}</p>
              )}
              {edu.honors && edu.honors.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  Honors: {edu.honors.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Publications */}
      {resume.publications.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-sm font-bold uppercase tracking-wide mb-3 text-center"
            style={{ color: theme.colors.primary }}
          >
            Publications
          </h2>
          {resume.publications.map((pub) => (
            <div key={pub.id} className="mb-3">
              <h3 className="font-semibold text-gray-900 text-xs">{pub.title}</h3>
              <p className="text-xs text-gray-700">{pub.authors.join(", ")}</p>
              <p className="text-xs text-gray-600">{pub.publisher} - {pub.date}</p>
              {pub.link && (
                <a href={pub.link} className="text-xs text-blue-600 hover:underline">
                  View Paper
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Research Experience */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-sm font-bold uppercase tracking-wide mb-3 text-center"
            style={{ color: theme.colors.primary }}
          >
            Research Experience
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-900 text-sm">{exp.position}</h3>
                <span className="text-xs text-gray-600">
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

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-sm font-bold uppercase tracking-wide mb-3 text-center"
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
            className="text-sm font-bold uppercase tracking-wide mb-3 text-center"
            style={{ color: theme.colors.primary }}
          >
            Projects
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-3">
              <h3 className="font-semibold text-gray-900 text-xs text-center">{project.name}</h3>
              <p className="text-sm text-gray-700 text-center">{project.description}</p>
              <div className="flex justify-center gap-1 mt-1">
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

      {/* Awards */}
      {resume.achievements.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-sm font-bold uppercase tracking-wide mb-3 text-center"
            style={{ color: theme.colors.primary }}
          >
            Awards & Honors
          </h2>
          {resume.achievements.map((achievement) => (
            <div key={achievement.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-gray-900 text-xs">{achievement.title}</h3>
                <span className="text-xs text-gray-600">{achievement.date}</span>
              </div>
              <p className="text-xs text-gray-700">{achievement.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
