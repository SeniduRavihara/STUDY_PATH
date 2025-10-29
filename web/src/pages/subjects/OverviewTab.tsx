import React from "react";
import { Save, CheckCircle } from "lucide-react";
import type { Subject } from "../../types/database";

interface OverviewTabProps {
  subject: Subject | null;
  onSubjectChange: (subject: Subject | null) => void;
  onSave: () => void;
  isSaving: boolean;
  onPublish: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  subject,
  onSubjectChange,
  onSave,
  isSaving,
  onPublish,
}) => {
  return (
    <div className="space-y-6">
      {/* Subject Information */}
      <div className="bg-dark-800 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">
          Subject Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-medium mb-2">
              Subject Name *
            </label>
            <input
              type="text"
              value={subject?.name || ""}
              onChange={(e) =>
                subject && onSubjectChange({ ...subject, name: e.target.value })
              }
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter subject name"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-white font-medium mb-2">
            Description
          </label>
          <textarea
            value={subject?.description || ""}
            onChange={(e) =>
              subject &&
              onSubjectChange({ ...subject, description: e.target.value })
            }
            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-32 resize-none"
            placeholder="Describe what students will learn in this subject"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-white font-medium mb-2">
              Subject Icon
            </label>
            <div className="flex space-x-2">
              {[
                "📚",
                "💻",
                "🧮",
                "🔬",
                "🌍",
                "🎨",
                "📊",
                "🚀",
              ].map((icon) => (
                <button
                  key={icon}
                  onClick={() =>
                    subject && onSubjectChange({ ...subject, icon })
                  }
                  className={`w-12 h-12 text-2xl rounded-lg border-2 ${
                    subject?.icon === icon
                      ? "border-primary-500 bg-primary-500/20"
                      : "border-dark-600 hover:border-dark-500"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* Visual Branding */}
      <div className="bg-dark-800 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">
          Visual Branding
        </h3>

        <div>
          <label className="block text-white font-medium mb-4">
            Subject Color Theme *
          </label>
          <div className="grid grid-cols-5 gap-3">
            {[
              "#667eea",
              "#f093fb",
              "#4ecdc4",
              "#ff6b6b",
              "#45b7d1",
              "#f7df1e",
              "#61dafb",
              "#339933",
              "#ff6b35",
              "#764ba2",
            ].map((color, index) => (
              <button
                key={index}
                onClick={() =>
                  subject && onSubjectChange({ ...subject, color })
                }
                className={`w-16 h-16 rounded-xl border-2 ${
                  subject?.color === color
                    ? "border-white scale-110"
                    : "border-dark-600 hover:border-dark-500"
                } transition-all duration-200`}
                style={{
                  background: color,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-dark-800 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Preview</h3>

        <div className="max-w-md">
          <div
            className="p-6 rounded-2xl text-white"
            style={{
              background: subject?.color || "#667eea",
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">{subject?.icon || "📚"}</span>
              <div>
                <h4 className="text-lg font-semibold">
                  {subject?.name || "Subject Name"}
                </h4>
              </div>
            </div>
            <p className="text-white/90 text-sm mb-3">
              {subject?.description || "Subject description"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
