import type { UnifiedProfile } from "@/types/identity-hub";
import type { ResumeData } from "@/lib/resume/types";
import { getImportSummary, importFromIdentityHub } from "@/lib/resume/identity-hub-import";
import { useResumeStore } from "@/lib/resume/store";
import { useState } from "react";

interface IdentityHubImportModalProps {
  identityProfile: UnifiedProfile;
  currentResume: ResumeData;
  onClose: () => void;
}

export function IdentityHubImportModal({ identityProfile, currentResume, onClose }: IdentityHubImportModalProps) {
  const { setResume } = useResumeStore();
  const [selectedOptions, setSelectedOptions] = useState({
    skills: true,
    projects: true,
    achievements: true,
    experience: true,
    education: true,
    certifications: true,
    overwrite: false,
  });
  const [isImporting, setIsImporting] = useState(false);

  const summary = getImportSummary(identityProfile, currentResume);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const updates = importFromIdentityHub(identityProfile, currentResume, selectedOptions);
      setResume({ ...currentResume, ...updates });
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const connectedPlatforms = identityProfile.connections.filter(c => c.status === 'connected');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold">Import from Identity Hub</h2>
          <p className="text-sm text-gray-600 mt-1">
            Import your skills, projects, and achievements from connected platforms
          </p>
        </div>

        {/* Connected Platforms */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold mb-3">Connected Platforms</h3>
          <div className="flex flex-wrap gap-2">
            {connectedPlatforms.length > 0 ? (
              connectedPlatforms.map((connection) => (
                <span
                  key={connection.platform}
                  className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-full"
                >
                  {connection.platform}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No platforms connected. Go to Identity Hub to connect your accounts.</p>
            )}
          </div>
        </div>

        {/* Import Options */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold mb-3">Import Options</h3>
          <div className="space-y-3">
            {[
              { key: 'skills', label: 'Skills', count: summary.skills },
              { key: 'projects', label: 'Projects', count: summary.projects },
              { key: 'achievements', label: 'Achievements', count: summary.achievements },
              { key: 'experience', label: 'Experience', count: summary.experience },
              { key: 'education', label: 'Education', count: summary.education },
              { key: 'certifications', label: 'Certifications', count: summary.certifications },
            ].map((option) => (
              <label key={option.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOptions[option.key as keyof typeof selectedOptions]}
                    onChange={(e) =>
                      setSelectedOptions({
                        ...selectedOptions,
                        [option.key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
                <span className="text-xs text-gray-500">{option.count} items</span>
              </label>
            ))}
          </div>
        </div>

        {/* Overwrite Option */}
        <div className="p-6 border-b border-gray-200">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedOptions.overwrite}
              onChange={(e) =>
                setSelectedOptions({
                  ...selectedOptions,
                  overwrite: e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-gray-300"
            />
            <div>
              <span className="text-sm font-medium">Overwrite existing data</span>
              <p className="text-xs text-gray-500">
                If unchecked, new data will be merged with existing data
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isImporting}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || connectedPlatforms.length === 0}
            className="px-4 py-2 text-sm bg-brand text-white rounded-md hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? 'Importing...' : 'Import Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
