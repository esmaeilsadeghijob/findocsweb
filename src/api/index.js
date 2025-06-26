import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080",
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

export const login = (data) => API.post("/api/auth/login", data);
export const register = (data) => API.post("/api/auth/register", data);
export const getDocuments = () => API.get("/api/documents");
export const uploadFile = (id, form) => API.post(`/api/attachments/${id}`, form);
export const getPendingUsers = () => API.get("/api/admin/users/pending");
export const approveUser = (id) => API.post(`/api/admin/users/${id}/approve`);
