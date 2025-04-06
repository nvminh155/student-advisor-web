import { Link } from "react-router-dom";

export function DashboardSidebar() {
  return (
    <div className="w-max p-4 h-full border-r bg-white">
      <Link to="/" className="block p-4 text-gray-700 hover:bg-gray-100">
        Trang chủ
      </Link>
      <Link to="/chat" className="block p-4 text-gray-700 hover:bg-gray-100">
        Chat With Bot
      </Link>
      <Link
        to="/manage-file"
        className="block p-4 text-gray-700 hover:bg-gray-100"
      >
        Manage File
      </Link>
    </div>
  );
}
