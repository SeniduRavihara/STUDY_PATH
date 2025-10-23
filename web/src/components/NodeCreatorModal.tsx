import React from "react";

interface NodeCreatorModalProps {
  showNodeCreator: boolean;
  setShowNodeCreator: (show: boolean) => void;
  addNode: (type: string) => void;
  nodeTypes: any[];
}

const NodeCreatorModal: React.FC<NodeCreatorModalProps> = ({
  showNodeCreator,
  setShowNodeCreator,
  addNode,
  nodeTypes,
}) => {
  if (!showNodeCreator) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Add New Node</h3>
          <button
            onClick={() => setShowNodeCreator(false)}
            className="text-dark-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <button
                key={nodeType.type}
                onClick={() => addNode(nodeType.type)}
                className="p-4 bg-dark-800 rounded-xl hover:bg-dark-700 transition-colors text-left"
              >
                <div
                  className={`w-12 h-12 ${nodeType.color} rounded-xl flex items-center justify-center mb-3`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-medium">{nodeType.name}</h4>
                <p className="text-dark-400 text-sm mt-1">
                  {nodeType.type === "start" && "Starting point of the flow"}
                  {nodeType.type === "study" && "Learning content and lessons"}
                  {nodeType.type === "quiz" &&
                    "Interactive questions and assessments"}
                  {nodeType.type === "video" && "Video content and tutorials"}
                  {nodeType.type === "assignment" &&
                    "Practical exercises and projects"}
                  {nodeType.type === "assessment" &&
                    "Formal evaluations and tests"}
                  {nodeType.type === "end" && "Ending point of the flow"}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NodeCreatorModal;
