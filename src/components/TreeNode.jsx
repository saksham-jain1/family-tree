// components/TreeNode.jsx
import PersonCard from "./PersonCard";

const TreeNode = (props) => {
  const { node, isRoot = false, ...rest } = props;
  if (!node) return null;
  const hasChildren =
    node.children && Array.isArray(node.children) && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <PersonCard node={node} isRoot={isRoot} {...rest} />
      {hasChildren && (
        <>
          <div className="w-0.5 h-8 bg-gray-400 dark:bg-gray-600" />
          <div className="flex justify-center">
            {node.children.map((child, index) =>
              child ? (
                <div key={child.id} className="relative px-2">
                  <div className="absolute top-0 left-1/2 w-0.5 h-8 bg-gray-400 dark:bg-gray-600 -translate-x-1/2" />
                  <div
                    className={`absolute top-0 h-0.5 bg-gray-400 dark:bg-gray-600
                    ${index === 0 ? "left-1/2" : "left-0"}
                    ${
                      index === node.children.length - 1
                        ? "right-1/2"
                        : "right-0"
                    }
                  `}
                  />
                  <TreeNode node={child} {...rest} />
                </div>
              ) : null
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TreeNode;
