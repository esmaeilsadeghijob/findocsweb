import axios from "axios";

const API = axios.create({
    baseURL: window._env_?.API_BASE || "http://localhost:8080",
    // baseURL: process.env.REACT_APP_API_BASE,
    // baseURL: "http://192.168.0.35:8080",
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

export const updateDefaultAccess = (userId, accessLevel) =>
    API.put(`/api/users/${userId}/access`, { accessLevel });

export const updateUser = (id, data) =>
    API.put(`/api/users/${id}`, data);

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

// export const uploadFile = (documentId, form) =>
//     API.post(`/api/attachments/${documentId}/attachments`, form);

export const uploadFile = (documentId, formData, onProgress) =>
    API.post(`/api/attachments/${documentId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
            if (onProgress) onProgress(event);
        },
    });


export const previewAttachment = (documentId, fileId) =>
    API.get(`/api/attachments/${documentId}/preview/${fileId}`);

export const deleteDocument = (id) => API.delete(`/api/documents/${id}`);

export const getIdentifiers = () => API.get("/api/identifiers");
export const createIdentifier = (data) => API.post("/api/identifiers", data);
export const deleteIdentifier = (id) => API.delete(`/api/identifiers/${id}`);
export const updateIdentifier = (id, data) => API.put(`/api/identifiers/${id}`, data);

export const advanceDocumentStatus = (id) =>
    API.put(`/api/documents/${id}/status`);

export const getCompanies = () => API.get("/api/companies");
export const createCompany = (data) => API.post("/api/companies", data);
export const deleteCompany = (id) => API.delete(`/api/companies/${id}`);

export const updateCompany = (id, data) =>
    API.put(`/api/companies/${id}`, data);

export const getPermissions = () => API.get("/api/permissions");
export const grantPermission = (data) => API.post("/api/permissions", data);
export const revokePermission = (data) => API.delete("/api/permissions", { data });

export const getDocumentsByClientId = (clientId) =>
    API.get(`/api/documents/client/${clientId}`);

export const updateDocument = (id, data) =>
    API.put(`/api/documents/${id}`, data);

export const revertDocumentStatus = (id) =>
    API.patch(`/api/documents/${id}/revert`);

export const getDocumentsByUnit = (unitId) =>
    API.get(`/api/documents/unit/${unitId}`);

export const getDocumentsByFilter = (clientId, unitId, serviceId) =>
    API.get("/api/documents/filter", {
        params: { clientId, unitId, serviceId }
    });

export const getCategories = () => API.get("/api/categories");

export const createCategory = (data) => API.post("/api/categories", data);

export const updateCategory = (id, data) => API.put(`/api/categories/${id}`, data);

export const deleteCategory = (id) => API.delete(`/api/categories/${id}`);

export const verifyPassword = (password) =>
    API.post("/api/auth/verify-password", { password });

export const getUser = (userId) => {
    return API.get(`/api/users/${userId}`);
};

export const getClientsView = () => axios.get("/api/clients/view");

export const getClientsByUnit = (unitId) =>
    API.get(`/api/clients/by-unit/${unitId}`);

export const getArchivePreview = (unitId) =>
    API.get(`/api/units/${unitId}/archive-preview`);

export const updateAttachment = (documentId, fileId, data) =>
    API.put(`/api/attachments/${documentId}/${fileId}`, null, {
        params: {
            categoryName: data.categoryName,
            description: data.description,
            companyName: data.companyName,
        },
    });

// بک‌آپ‌گیری دستی
export const createBackup = (type, path) =>
    API.post("/api/backup/create", { type, path });

// بازگردانی بک‌آپ
export const restoreBackup = (type, file) =>
    API.post("/api/backup/restore", { type, file });

// حذف بک‌آپ
export const deleteBackup = (file) =>
    API.delete("/api/backup/delete", { params: { file } });

// دریافت لیست بک‌آپ‌ها
export const getBackups = (path = "/opt/backups") =>
    API.get("/api/backup/list", { params: { path } });

// زمان‌بندی بک‌آپ خودکار
export const scheduleBackup = (type, cron, path) =>
    API.post("/api/backup/schedule", { type, cron, path });

export const cancelSchedule = (type, path) =>
    API.post("/api/backup/cancel", { type, path });

export const getFrequentDescriptions = () => API.get("/api/attachments/frequent-descriptions");

export const checkDocumentExists = ({ unitId, periodId, documentNumber }) =>
    API.get("/api/documents/check-duplicate", {
        params: { unitId, periodId, documentNumber }
    });

export const getFrequentDocumentsDescriptions = () =>
    API.get("/api/documents/frequent-descriptions");
