import React, {useContext} from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import {AuthContext} from "./context/AuthContext";
import AttachmentViewer from "./components/AttachmentViewer";
import AdminAccessPanel from "./components/AdminAccessPanel";

function App() {
    const { token } = useContext(AuthContext);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/*"
                    element={token ? <Dashboard /> : <Navigate to="/login" />}
                />
                <Route
                    path="/attachments/view/:documentId/:fileId"
                    element={<AttachmentViewer />}
                />
                <Route path="/admin/access" element={<AdminAccessPanel />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
