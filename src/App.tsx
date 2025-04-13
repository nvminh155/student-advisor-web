import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import ManageFilePage from "./pages/dashboard/manage-file/year";
import DashBoardLayout from "./components/dashboard/layout";
import ManageFile from "./pages/dashboard/manage-file";
import { ChatContainer } from "./components/dashboard/chat-container";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import AdminUsersPage from "./pages/admin/users";
import AdminLayout from "./pages/admin/admin-layout";
import MasterUserLayout from "./pages/masteruser/masteruser-layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashBoardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="chat" element={<ChatContainer />} />
        <Route path="manage-file" element={<ManageFile />} />
        <Route path="manage-file/:year" element={<ManageFilePage />} />
      </Route>
     

      <Route path="/admin1" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="chat" element={<ChatContainer />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="manage-file/:year" element={<ManageFilePage />} />
      </Route>

      <Route path="/master-user" element={<MasterUserLayout />}>
        <Route index path="ban-hanh" element={<ManageFilePage />} />
      </Route>



      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
