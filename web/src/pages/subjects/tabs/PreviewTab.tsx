import React from "react";
import { Eye } from "lucide-react";

const PreviewTab: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Eye className="w-16 h-16 text-dark-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        Student Preview
      </h3>
      <p className="text-dark-400">
        Preview how students will experience this subject.
      </p>
    </div>
  );
};

export default PreviewTab;
