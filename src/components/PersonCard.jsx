// components/PersonCard.jsx
import { SquarePen, Trash, UserPlusIcon, UserRoundIcon } from "lucide-react";

const PersonCard = ({
  node,
  onAddClick,
  onEditClick,
  onDeleteClick,
  isRoot,
  draggedNodeId,
  setDraggedNodeId,
  dropTargetId,
  setDropTargetId,
  handleReparent,
}) => {
  if (!node) return null;

  const getGenderColors = () => {
    if (node.isDeceased)
      return "bg-gray-300 text-gray-600 ring-gray-400 dark:bg-gray-600 dark:text-gray-400 dark:ring-gray-500";
    switch (node.gender) {
      case "Female":
        return "bg-pink-100 text-pink-600 ring-pink-200 dark:bg-pink-900 dark:text-pink-300 dark:ring-pink-700";
      case "Other":
        return "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600";
      case "Male":
      default:
        return "bg-blue-100 text-blue-600 ring-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:ring-blue-700";
    }
  };
  const colors = getGenderColors();
  const isBeingDragged = draggedNodeId === node.id;
  const isDropTarget = dropTargetId === node.id;

  const handleDragStart = (e) => {
    if (isRoot) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", node.id.toString());
    setDraggedNodeId(node.id);
    e.stopPropagation();
  };
  const handleDragEnd = (e) => {
    setDraggedNodeId(null);
    setDropTargetId(null);
    e.stopPropagation();
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.id !== draggedNodeId) setDropTargetId(node.id);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetId(null);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedNodeId || draggedNodeId === node.id) return;
    handleReparent(draggedNodeId, node.id);
    setDraggedNodeId(null);
    setDropTargetId(null);
  };

  return (
    <div
      className={`person-card mt-9 w-40 h-60 p-4 z-10 flex flex-col items-center justify-between rounded-lg shadow-lg border transition-all duration-150
        ${
          node.isDeceased
            ? "bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
            : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        }
        ${isBeingDragged ? "opacity-50 scale-95" : "opacity-100"}
        ${isDropTarget ? "ring-2 ring-blue-500" : ""}
        ${!isRoot ? "cursor-grab" : "cursor-default"}
      `}
      draggable={!isRoot}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ring-2 ${colors}`}
        >
          <span className="w-8 h-8">
            <UserRoundIcon />
          </span>
        </div>
        <div className="mt-3 w-full">
          {" "}
          {/* Added w-full to contain text */}
          <p
            className={`font-bold truncate ${
              /* Use truncate */
              node.isDeceased
                ? "text-gray-700 dark:text-gray-300"
                : "text-gray-800 dark:text-gray-100"
            }`}
            title={node.name} /* Add title for hover tooltip */
          >
            {node.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-full">
            {" "}
            {/* Also truncate date */}
            {node.dob}
          </p>
        </div>
      </div>
      <div
        className={`flex w-full justify-around pt-3 border-t ${
          node.isDeceased
            ? "border-gray-400 dark:border-gray-500"
            : "border-gray-100 dark:border-gray-700"
        }`}
      >
        <button
          onClick={() => onAddClick(node)}
          className="text-gray-500 hover:text-blue-500"
          title="Add Child"
        >
          <UserPlusIcon />
        </button>
        <button
          onClick={() => onEditClick(node)}
          className="text-gray-500 hover:text-green-500"
          title="Edit"
        >
          <SquarePen />
        </button>
        <button
          onClick={() => onDeleteClick(node.id, node.name)}
          className="text-gray-500 hover:text-red-500 disabled:opacity-30"
          disabled={isRoot}
          title="Delete"
        >
          <Trash />
        </button>
      </div>
    </div>
  );
};

export default PersonCard;
