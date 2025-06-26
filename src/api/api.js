import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080",
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

// احراز هویت
export const login = (data) => API.post("/api/auth/login", data);
export const register = (data) => API.post("/api/auth/register", data);

// اسناد
export const getDocuments = () => API.get("/api/documents");
export const createDocument = (data) => API.post("/api/documents", data);

// ضمایم
export const uploadFile = (id, form) =>
    API.post(`/api/attachments/${id}`, form);

// کاربران در انتظار تأیید
export const getPendingUsers = () => API.get("/api/admin/users/pending");
export const approveUser = (id) =>
    API.post(`/api/admin/users/${id}/approve`);

export const deleteAttachment = (documentId, fileId) =>
    API.delete(`/api/attachments/${documentId}/${fileId}`);

export const getAttachments = (documentId) =>
    API.get(`/api/attachments/${documentId}`);

