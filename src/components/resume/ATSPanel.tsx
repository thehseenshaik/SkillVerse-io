import type { ATSAnalysis, ResumeHealthScore } from "@/lib/resume/types";

interface ATSPanelProps {
  atsAnalysis: ATSAnalysis;
  healthScore: ResumeHealthScore;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
}

export function ATSPanel({ atsAnalysis, healthScore, jobDescription, onJobDescriptionChange }: ATSPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-bold">ATS Analysis</h2>
        <p className="text-xs text-muted-foreground">Real-time resume scoring</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Overall Score */}
        <div className={`p-4 rounded-lg ${getScoreBg(healthScore.overall)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Overall Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(healthScore.overall)}`}>
              {healthScore.overall}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${healthScore.overall}%`,
                backgroundColor: healthScore.overall >= 80 ? '#16a34a' : healthScore.overall >= 60 ? '#ca8a04' : '#dc2626',
              }}
            />
          </div>
        </div>

        {/* Component Scores */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Component Scores</h3>
          {[
            { label: 'ATS Score', value: healthScore.atsScore },
            { label: 'Readability', value: healthScore.readability },
            { label: 'Professionalism', value: healthScore.professionalism },
            { label: 'Keyword Match', value: healthScore.keywordMatch },
            { label: 'Project Quality', value: healthScore.projectQuality },
            { label: 'Experience Quality', value: healthScore.experienceQuality },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{item.label}</span>
              <span className={`text-xs font-semibold ${getScoreColor(item.value)}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Job Description Input */}
        <div>
          <label className="block text-sm font-semibold mb-2">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            placeholder="Paste job description here for keyword matching..."
            className="w-full px-3 py-2 text-xs border border-border rounded-md bg-background resize-none"
            rows={4}
          />
        </div>

        {/* Missing Keywords */}
        {atsAnalysis.missingKeywords.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Missing Keywords</h3>
            <div className="flex flex-wrap gap-1">
              {atsAnalysis.missingKeywords.slice(0, 10).map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                >
                  {keyword}
                </span>
              ))}
              {atsAnalysis.missingKeywords.length > 10 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  +{atsAnalysis.missingKeywords.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Weak Sections */}
        {atsAnalysis.weakSections.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Weak Sections</h3>
            <ul className="space-y-1">
              {atsAnalysis.weakSections.map((section, index) => (
                <li key={index} className="text-xs text-yellow-700 flex items-start">
                  <span className="mr-1">⚠️</span>
                  {section}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Formatting Problems */}
        {atsAnalysis.formattingProblems.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Formatting Issues</h3>
            <ul className="space-y-1">
              {atsAnalysis.formattingProblems.map((problem, index) => (
                <li key={index} className="text-xs text-red-700 flex items-start">
                  <span className="mr-1">❌</span>
                  {problem}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {atsAnalysis.suggestions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Suggestions</h3>
            <ul className="space-y-2">
              {atsAnalysis.suggestions.map((suggestion, index) => (
                <li key={index} className="text-xs text-gray-700 flex items-start">
                  <span className="mr-1 text-green-600">💡</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Readability */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Readability</h3>
          <div className="p-3 bg-gray-50 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Level</span>
              <span className="text-xs font-semibold">{atsAnalysis.readability.level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Avg Sentence Length</span>
              <span className="text-xs font-semibold">{atsAnalysis.readability.avgSentenceLength} words</span>
            </div>
          </div>
        </div>

        {/* Keyword Density */}
        {Object.keys(atsAnalysis.keywordDensity).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Keyword Density</h3>
            <div className="space-y-1">
              {Object.entries(atsAnalysis.keywordDensity)
                .filter(([_, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([keyword, count]) => (
                  <div key={keyword} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 capitalize">{keyword}</span>
                    <span className="text-xs font-semibold text-green-600">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
