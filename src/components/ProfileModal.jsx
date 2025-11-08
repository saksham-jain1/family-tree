// components/ProfileModal.jsx
import { UserRoundIcon } from "lucide-react";

const ProfileModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null; // Add safety check for user
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Profile
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <UserRoundIcon />
              </span>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </div>
                <div className="text-md text-gray-900 dark:text-white">
                  {user.displayName || "No Name"}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                @
              </span>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </div>
                <div className="text-md text-gray-900 dark:text-white">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="mt-6 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
