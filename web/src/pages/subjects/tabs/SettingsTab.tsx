import React from "react";
import { Settings } from "lucide-react";

const SettingsTab: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Settings className="w-16 h-16 text-dark-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        Advanced Settings
      </h3>
      <p className="text-dark-400">
        Configure advanced subject settings, prerequisites, and analytics.
      </p>
    </div>
  );
};

export default SettingsTab;
