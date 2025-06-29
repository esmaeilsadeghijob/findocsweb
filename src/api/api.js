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
// export const uploadFile = (documentId, form) =>
//     API.post(`/api/attachments/${documentId}`, form);
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

export const getClients = () => API.get("/api/clients");
export const getProjects = () => API.get("/api/projects");
export const createClient = (data) => API.post("/api/clients", data);
export const updateClient = (id, data) => API.put(`/api/clients/${id}`, data);
export const deleteClient = (id) => API.delete(`/api/clients/${id}`);
export const getUnits = () => API.get("/api/units");
export const createUnit = (data) => API.post("/api/units", data);
export const updateUnit = (id, data) => API.put(`/api/units/${id}`, data);
export const deleteUnit = (id) => API.delete(`/api/units/${id}`);

export const getServices = () => API.get("/api/services");
export const createService = (data) => API.post("/api/services", data);
export const updateService = (id, data) => API.put(`/api/services/${id}`, data);
export const deleteService = (id) => API.delete(`/api/services/${id}`);
export const getPeriods = () => API.get("/api/periods");
export const createPeriod = (data) => API.post("/api/periods", data);
export const updatePeriod = (id, data) => API.put(`/api/periods/${id}`, data);
export const deletePeriod = (id) => API.delete(`/api/periods/${id}`);

export const uploadFile = (documentId, form) =>
    API.post(`/api/attachments/${documentId}/attachments`, form);

export const previewAttachment = (documentId, fileId) =>
    API.get(`/api/attachments/${documentId}/preview/${fileId}`);

export const deleteDocument = (id) => API.delete(`/api/documents/${id}`);

export const getIdentifiers = () => API.get("/api/identifiers");
export const createIdentifier = (data) => API.post("/api/identifiers", data);
export const deleteIdentifier = (id) => API.delete(`/api/identifiers/${id}`);
