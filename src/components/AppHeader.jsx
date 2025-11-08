// components/AppHeader.jsx
import React, { useState } from "react";
import {
  Download,
  ImageDown,
  Loader,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  Trash,
  Upload,
  UserRoundIcon,
  X,
} from "lucide-react";

const AppHeader = ({
  onExport,
  onImport,
  onExportImage,
  isExporting,
  onOpenProfile,
  onDeleteTree,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const MobileMenuItem = ({
    icon,
    label,
    onClick,
    disabled = false,
    isDanger = false,
  }) => (
    <button
      onClick={() => {
        onClick();
        setIsMenuOpen(false);
      }}
      disabled={disabled}
      className={`flex items-center w-full px-4 py-3 text-sm text-left
        ${
          isDanger
            ? "text-red-700 dark:text-red-400"
            : "text-gray-700 dark:text-gray-200"
        }
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }
      `}
    >
      <span className={`w-5 h-5 mr-3 ${disabled ? "animate-spin" : ""}`}>
        {icon}
      </span>
      {label}
    </button>
  );

  const DesktopButton = ({ icon, label, onClick, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
    >
      <span className={`w-5 h-5 mr-1.5 ${disabled ? "animate-spin" : ""}`}>
        {icon}
      </span>
      {label}
    </button>
  );

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Family Tree
          </span>

          <div className="hidden md:flex items-center space-x-2">
            <DesktopButton
              icon={isExporting ? <Loader /> : <ImageDown />}
              label={isExporting ? "Exporting..." : "Image"}
              onClick={onExportImage}
              disabled={isExporting}
            />
            <DesktopButton
              icon={<Download />}
              label="JSON"
              onClick={onExport}
            />
            <DesktopButton
              icon={<Upload />}
              label="Import"
              onClick={onImport}
            />
            <button
              onClick={onOpenProfile}
              className="p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <UserRoundIcon />
            </button>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOutIcon />
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? <X /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 right-4 left-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md border dark:border-gray-700 py-2">
          <MobileMenuItem
            icon={<UserRoundIcon />}
            label="Profile"
            onClick={onOpenProfile}
          />
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          <MobileMenuItem
            icon={isExporting ? <Loader /> : <ImageDown />}
            label={isExporting ? "Export Image" : "Export Image"}
            onClick={onExportImage}
            disabled={isExporting}
          />
          <MobileMenuItem
            icon={<Download />}
            label="Export JSON"
            onClick={onExport}
          />
          <MobileMenuItem
            icon={<Upload />}
            label="Import JSON"
            onClick={onImport}
          />
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          <MobileMenuItem
            icon={<Trash />}
            label="Delete Tree"
            onClick={onDeleteTree}
            isDanger={true}
          />
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          <MobileMenuItem
            icon={<LogOutIcon />}
            label="Logout"
            onClick={onLogout}
            isDanger={true}
          />
        </div>
      )}
    </nav>
  );
};

export default AppHeader;
