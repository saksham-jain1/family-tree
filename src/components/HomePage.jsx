import { AddCircleOutline } from "@mui/icons-material";

const HomePage = ({ onCreateTree }) => {
  return (
    <div className="flex-grow flex flex-col justify-center items-center text-center p-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Welcome to Your Family Tree
      </h1>
      <button
        onClick={onCreateTree}
        className="flex flex-col justify-center items-center h-64 m-7 px-6 py-3 transparent border-blue-500 border-2 border-dashed text-white rounded-lg shadow-md hover:bg-blue-700 text-lg font-medium"
      >
        <div className="w-24 h-24 mr-2 align-middle flex items-center justify-center">
          <AddCircleOutline style={{ fontSize: "84px", color: "#ffffffa2" }} />
        </div>
        <div>Create New Tree</div>
      </button>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 mb-8 max-w-md">
        You don't have a tree active. Create a new one to get started.
      </p>
    </div>
  );
};

export default HomePage;
