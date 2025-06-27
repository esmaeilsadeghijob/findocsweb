import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import AttachmentViewer from "./components/AttachmentViewer";

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
            </Routes>
        </BrowserRouter>
    );
}

export default App;
