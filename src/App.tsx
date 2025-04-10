import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import ManageFilePage from "./pages/dashboard/manage-file/year";
import DashBoardLayout from "./components/dashboard/layout";
import ManageFile from "./pages/dashboard/manage-file";
import { ChatContainer } from "./components/dashboard/chat-container";
import LoginPage from "./pages/login";

function App() {

  return (
    <Routes>
      <Route path="/" element={<DashBoardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="chat" element={<ChatContainer />} />
        <Route path="manage-file" element={<ManageFile />} />
        <Route path="manage-file/:year" element={<ManageFilePage />} />

      </Route>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
