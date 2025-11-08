"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.js";
import FamilyTreeEditor from "./FamilyTreeEditor.jsx";
import HomePage from "./HomePage.jsx";
import EditAddModal from "./EditAddModal.jsx";
import ProfileModal from "./ProfileModal.jsx";
import AppHeader from "./AppHeader.jsx";
import useSWR, { mutate } from "swr";
import { fetcher } from "../lib/fetcher.js";

// --- App Controller (Main Export) ---
export default function AppController() {
  const { user, logout } = useAuth();
  const [isCreateRootModalOpen, setIsCreateRootModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const treeContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    data: familyData,
    error,
    isLoading,
  } = useSWR(user ? ["/api/tree", user] : null, fetcher);

  const handleCreateNewTree = () => setIsCreateRootModalOpen(true);
  const handleCreateRootSubmit = (data) => {
    const newRoot = { id: Date.now(), ...data, children: [] };
    saveTree(newRoot); // <-- Use the saveTree function here
    setIsCreateRootModalOpen(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          // TODO: add validation for the file structure
          saveTree(importedData);
        } catch (error) {
          console.error("Failed to parse JSON:", error);
        }
      };
      reader.readAsText(file);
    }
    event.target.value = null;
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(familyData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "family-tree.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // src/components/AppController.jsx

  const handleExportImage = async () => {
    setIsExporting(true);
    if (!treeContainerRef.current) {
      setIsExporting(false);
      return;
    }

    const domtoimage = (await import("dom-to-image-more")).default;
    const elementToCapture = treeContainerRef.current;

    const originalTransform = elementToCapture.style.transform;

    elementToCapture.style.transform = "scale(1)";

    try {
      const dataUrl = await domtoimage.toPng(elementToCapture, {
        bgcolor: "#ffffff",
        width: elementToCapture.scrollWidth,
        height: elementToCapture.scrollHeight,
        style: {
          transform: "scale(1)", // Ensure the capture logic uses 1:1 scale
          transformOrigin: "top center",
        },
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "family-tree.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to export image:", err);
    } finally {
      elementToCapture.style.transform = originalTransform;
      setIsExporting(false);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  // --- API Mutation Functions ---

  /**
   * Saves the entire tree data to the backend.
   * @param {object} newTreeData - The new tree data object.
   */
  const saveTree = async (newTreeData) => {
    if (!user) return;

    // Optimistic UI update: Update local SWR cache immediately
    mutate(["/api/tree", user], newTreeData, false);

    try {
      const token = await user.getIdToken();
      await fetch("/api/tree", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ treeData: newTreeData }),
      });

      // Trigger a revalidation from the server to ensure consistency
      mutate(["/api/tree", user]);
    } catch (error) {
      console.error("Failed to save tree:", error);
      // TODO: Handle error (e.g., revert optimistic update, show toast)
    }
  };

  /**
   * Deletes the user's tree from the backend.
   */
  const handleDeleteTree = async () => {
    if (!user) return;

    // Optimistic UI update
    mutate(["/api/tree", user], null, false);

    try {
      const token = await user.getIdToken();
      await fetch("/api/tree", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Revalidate (will confirm the null data)
      mutate(["/api/tree", user]);
    } catch (error) {
      console.error("Failed to delete tree:", error);
    }
  };

  const profileUser = user
    ? {
        name: user.displayName || "No Name",
        email: user.email,
        memberSince: user.metadata?.creationTime
          ? new Date(user.metadata.creationTime).toLocaleDateString()
          : "N/A",
      }
    : null;

  return (
    <div className="h-full w-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white antialiased">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/json"
        className="hidden"
      />

      <AppHeader
        onExport={handleExportJSON}
        onImport={handleImportClick}
        onExportImage={handleExportImage}
        isExporting={isExporting}
        onOpenProfile={() => setProfileModalOpen(true)}
        onDeleteTree={() => setConfirmDeleteTreeState(true)}
        onLogout={logout}
        profileModalOpen={profileModalOpen}
        setProfileModalOpen={setProfileModalOpen}
      />
      {familyData ? (
        <FamilyTreeEditor
          treeData={familyData}
          onDeleteTree={handleDeleteTree}
          onSetTreeData={saveTree}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          profileModalOpen={profileModalOpen}
          setProfileModalOpen={setProfileModalOpen}
          treeContainerRef={treeContainerRef}
        />
      ) : (
        <HomePage onCreateTree={handleCreateNewTree} />
      )}

      <EditAddModal
        isOpen={isCreateRootModalOpen}
        onClose={() => setIsCreateRootModalOpen(false)}
        onSubmit={handleCreateRootSubmit}
        mode="createRoot"
        node={null}
      />

      <ProfileModal isOpen={false} onClose={() => {}} user={profileUser} />
    </div>
  );
}
