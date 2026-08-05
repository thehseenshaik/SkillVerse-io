import type { ResumeData, Theme } from "@/lib/resume/types";

interface SoftwareEngineerProps {
  resume: ResumeData;
  theme: Theme;
}

export function SoftwareEngineer({ resume, theme }: SoftwareEngineerProps) {
  const { profile, experience, education, skills, projects } = resume;

  return (
    <div 
      className="bg-gray-50 text-gray-900"
      style={{
        fontFamily: theme.typography.fontFamily,
        color: theme.colors.text,
      }}
    >
      {/* Header */}
      <div 
        className="bg-gray-900 text-white px-8 py-6 mb-6"
        style={{ backgroundColor: theme.colors.primary }}
      >
        <h1 className="text-2xl font-bold">{profile.fullName || "Your Name"}</h1>
        <p className="text-lg text-gray-300 mt-1">{profile.title || "Software Engineer"}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
          <span>{profile.contact.email || "email@example.com"}</span>
          <span>{profile.contact.phone || "+1 234 567 890"}</span>
          <span>{profile.contact.location || "City, Country"}</span>
          {profile.contact.github && <span>{profile.contact.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="px-8 mb-6">
          <h2 className="text-lg font-bold mb-2">Summary</h2>
          <p className="text-sm text-gray-700">{profile.summary}</p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="px-8 mb-6">
          <h2 className="text-lg font-bold mb-3">Technical Skills</h2>
          <div className="grid grid-cols-2 gap-3">
            {skills.map((skill) => (
              <div key={skill.id} className="bg-white p-3 rounded border border-gray-200">
                <p className="font-semibold text-sm">{skill.name}</p>
                <p className="text-xs text-gray-500">{skill.level}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="px-8 mb-6">
          <h2 className="text-lg font-bold mb-3">Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="bg-white p-4 rounded border border-gray-200 mb-3">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-bold">{exp.position}</h3>
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
          <h2 className="text-lg font-bold mb-3">Projects</h2>
          {projects.map((project) => (
            <div key={project.id} className="bg-white p-4 rounded border border-gray-200 mb-3">
              <h3 className="font-bold mb-1">{project.name}</h3>
              <p className="text-sm text-gray-700 mb-2">{project.description}</p>
              <div className="flex flex-wrap gap-1">
                {project.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="px-8 mb-6">
          <h2 className="text-lg font-bold mb-3">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="bg-white p-4 rounded border border-gray-200 mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-sm">{edu.degree}</h3>
                <span className="text-xs text-gray-500">
                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700">{edu.institution}</p>
              <p className="text-xs text-gray-500">{edu.field}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
