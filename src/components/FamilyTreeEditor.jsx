import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext.js";
import TreeNode from "./TreeNode.jsx";
import EditAddModal from "./EditAddModal.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import ProfileModal from "./ProfileModal.jsx";
import { ZoomIn, ZoomOut } from "lucide-react";

const FamilyTreeEditor = ({
  treeData,
  onSetTreeData,
  onDeleteTree,
  zoomLevel,
  setZoomLevel,
  profileModalOpen,
  setProfileModalOpen,
  treeContainerRef,
}) => {
  const { user } = useAuth();

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add",
    node: null,
  });
  const [confirmDeleteNodeState, setConfirmDeleteNodeState] = useState({
    isOpen: false,
    nodeId: null,
    nodeName: "",
  });
  const [confirmDeleteTreeState, setConfirmDeleteTreeState] = useState(false);

  const mainRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
  });

  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);

  const pinchStartDist = useRef(0);
  const pinchStartZoom = useRef(1);

  // --- Recursive Tree Logic ---
  const findAndAddChild = (currentNode, parentId, newNode) => {
    if (currentNode.id === parentId)
      return { ...currentNode, children: [...currentNode.children, newNode] };
    if (currentNode.children?.length)
      return {
        ...currentNode,
        children: currentNode.children.map((child) =>
          findAndAddChild(child, parentId, newNode)
        ),
      };
    return currentNode;
  };
  const findAndEditNode = (currentNode, nodeId, updatedData) => {
    if (currentNode.id === nodeId) return { ...currentNode, ...updatedData };
    if (currentNode.children?.length)
      return {
        ...currentNode,
        children: currentNode.children.map((child) =>
          findAndEditNode(child, nodeId, updatedData)
        ),
      };
    return currentNode;
  };
  const findAndRemoveNode = (currentNode, nodeId) => {
    if (!currentNode) return null;
    if (currentNode.children?.length) {
      const updatedChildren = currentNode.children
        .map((child) => findAndRemoveNode(child, nodeId))
        .filter((child) => child && child.id !== nodeId);
      return { ...currentNode, children: updatedChildren };
    }
    return currentNode;
  };
  const findNodeById = (currentNode, id) => {
    if (!currentNode) return null;
    if (currentNode.id === id) return currentNode;
    if (currentNode.children) {
      for (const child of currentNode.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };
  const isDescendant = (node, idToFind) => {
    if (!node) return false;
    if (node.id === idToFind) return true;
    if (node.children) {
      for (const child of node.children) {
        if (isDescendant(child, idToFind)) return true;
      }
    }
    return false;
  };

  // --- Handlers ---

  const handleAddClick = (node) =>
    setModalState({ isOpen: true, mode: "add", node });
  const handleEditClick = (node) =>
    setModalState({ isOpen: true, mode: "edit", node });
  const handleModalClose = () =>
    setModalState({ isOpen: false, mode: "add", node: null });

  const handleModalSubmit = (data) => {
    let newTree;
    if (modalState.mode === "add") {
      const newNode = { id: Date.now(), ...data, children: [] };
      newTree = findAndAddChild(treeData, modalState.node.id, newNode);
    } else if (modalState.mode === "edit") {
      newTree = findAndEditNode(treeData, modalState.node.id, data);
    }
    onSetTreeData(newTree); // This prop is now mapped to the saveTree function
  };

  const handleDeleteClick = (nodeId, nodeName) =>
    setConfirmDeleteNodeState({ isOpen: true, nodeId, nodeName });

  const handleConfirmDeleteNode = () => {
    const newTree = findAndRemoveNode(treeData, confirmDeleteNodeState.nodeId);
    onSetTreeData(newTree); // This prop is now mapped to the saveTree function
    setConfirmDeleteNodeState({ isOpen: false, nodeId: null, nodeName: "" });
  };

  const handleReparent = (draggedId, droppedOnId) => {
    const nodeToMove = findNodeById(treeData, draggedId);
    if (!nodeToMove) return;
    if (isDescendant(nodeToMove, droppedOnId)) {
      return;
    }
    const treeWithoutNode = findAndRemoveNode(treeData, draggedId);
    const newTree = findAndAddChild(treeWithoutNode, droppedOnId, nodeToMove);
    onSetTreeData(newTree); // This prop is now mapped to the saveTree function
  };

  const handleMouseDown = (e) => {
    if (!mainRef.current || e.target.closest(".person-card")) return;
    e.preventDefault();
    setIsPanning(true);
    setPanStart({
      x: e.pageX - mainRef.current.offsetLeft,
      y: e.pageY - mainRef.current.offsetTop,
      scrollX: mainRef.current.scrollLeft,
      scrollY: mainRef.current.scrollTop,
    });
    mainRef.current.style.cursor = "grabbing";
  };
  const handleMouseMove = (e) => {
    if (!isPanning || !mainRef.current) return;
    e.preventDefault();
    const x = e.pageX - mainRef.current.offsetLeft;
    const y = e.pageY - mainRef.current.offsetTop;
    const walkX = x - panStart.x;
    const walkY = y - panStart.y;
    mainRef.current.scrollLeft = panStart.scrollX - walkX;
    mainRef.current.scrollTop = panStart.scrollY - walkY;
  };
  const handleMouseUpAndLeave = () => {
    setIsPanning(false);
    if (mainRef.current) mainRef.current.style.cursor = "grab";
  };

  const getPinchDist = (touches) =>
    Math.hypot(
      touches[0].pageX - touches[1].pageX,
      touches[0].pageY - touches[1].pageY
    );
  const handleTouchStart = (e) => {
    if (!mainRef.current || e.target.closest(".person-card")) return;
    e.preventDefault();
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].pageX - mainRef.current.offsetLeft,
        y: e.touches[0].pageY - mainRef.current.offsetTop,
        scrollX: mainRef.current.scrollLeft,
        scrollY: mainRef.current.scrollTop,
      });
      mainRef.current.style.cursor = "grabbing";
    } else if (e.touches.length === 2) {
      pinchStartDist.current = getPinchDist(e.touches);
      pinchStartZoom.current = zoomLevel;
    }
  };
  const handleTouchMove = (e) => {
    if (!mainRef.current || e.target.closest(".person-card")) return;
    e.preventDefault();
    if (e.touches.length === 1 && isPanning) {
      const x = e.touches[0].pageX - mainRef.current.offsetLeft;
      const y = e.touches[0].pageY - mainRef.current.offsetTop;
      const walkX = x - panStart.x;
      const walkY = y - panStart.y;
      mainRef.current.scrollLeft = panStart.scrollX - walkX;
      mainRef.current.scrollTop = panStart.scrollY - walkY;
    } else if (e.touches.length === 2) {
      if (pinchStartDist.current <= 0) return;
      const newDist = getPinchDist(e.touches);
      const ratio = newDist / pinchStartDist.current;
      const newZoom = pinchStartZoom.current * ratio;
      setZoomLevel(Math.max(0.5, Math.min(newZoom, 2.0)));
    }
  };
  const handleTouchEndAndCancel = (e) => {
    setIsPanning(false);
    pinchStartDist.current = 0;
    if (mainRef.current) mainRef.current.style.cursor = "grab";
  };

  const handleZoomIn = () =>
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 2.0));
  const handleZoomOut = () =>
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.5));

  if (!treeData) {
    return <p>Loading tree...</p>; // Safety fallback
  }

  return (
    <div className="flex flex-col h-full">
      <main
        ref={mainRef}
        className="flex-grow p-4 overflow-auto cursor-grab"
        style={{ touchAction: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpAndLeave}
        onMouseLeave={handleMouseUpAndLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEndAndCancel}
        onTouchCancel={handleTouchEndAndCancel}
      >
        <div
          ref={treeContainerRef}
          className="inline-block min-w-full text-center py-8 transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top center",
          }}
        >
          <TreeNode
            node={treeData}
            onAddClick={handleAddClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            isRoot={true}
            draggedNodeId={draggedNodeId}
            setDraggedNodeId={setDraggedNodeId}
            dropTargetId={dropTargetId}
            setDropTargetId={setDropTargetId}
            handleReparent={handleReparent}
          />
        </div>
      </main>

      <footer className="text-center py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"></footer>

      <EditAddModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        mode={modalState.mode}
        node={modalState.node}
      />
      <ConfirmModal
        isOpen={confirmDeleteNodeState.isOpen}
        onClose={() =>
          setConfirmDeleteNodeState({
            isOpen: false,
            nodeId: null,
            nodeName: "",
          })
        }
        onConfirm={handleConfirmDeleteNode}
        title="Delete Node"
        message={`Are you sure you want to delete ${confirmDeleteNodeState.nodeName}? This will also delete all their descendants.`}
      />
      <ConfirmModal
        isOpen={confirmDeleteTreeState}
        onClose={() => setConfirmDeleteTreeState(false)}
        onConfirm={() => {
          setConfirmDeleteTreeState(false);
          onDeleteTree();
        }}
        title="Delete Tree"
        message="Are you sure you want to delete this entire tree? This action cannot be undone."
      />
      {user && (
        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={user}
        />
      )}
      <div className="absolute bottom-6 right-6 z-20 flex items-center bg-white dark:bg-gray-800 shadow-lg rounded-md border dark:border-gray-700">
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= 0.5}
          className="p-3 text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >
          <ZoomOut />
        </button>
        <span className="px-3 text-sm text-gray-700 dark:text-gray-200 select-none">
          {(zoomLevel * 100).toFixed(0)}%
        </span>
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= 2.0}
          className="p-3 text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >
          <ZoomIn />
        </button>
      </div>
    </div>
  );
};

export default FamilyTreeEditor;
