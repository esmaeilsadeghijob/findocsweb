import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080",
});

// افزودن توکن به هدر درخواست‌ها
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
export const uploadFile = (documentId, form) =>
    API.post(`/api/attachments/${documentId}`, form);
export const getAttachments = (documentId) =>
    API.get(`/api/attachments/${documentId}`);
export const deleteAttachment = (documentId, fileId) =>
    API.delete(`/api/attachments/${documentId}/${fileId}`);

// کاربران
export const getUsers = () => API.get("/api/users");
export const getPendingUsers = () => API.get("/api/users/pending");
export const approveUser = (userId) =>
    API.put(`/api/users/${userId}/approve`);
export const deleteUser = (userId) =>
    API.delete(`/api/users/${userId}`);
