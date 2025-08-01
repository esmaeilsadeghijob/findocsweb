// بررسی اجازه مشاهده اسناد
export function canRead(role, accessLevel) {
    return role === "ROLE_ADMIN" || [
        "READ",
        "EDIT",
        "DOWNLOAD",
        "REVERT",
        "OWNER"
    ].includes(accessLevel);
}

// بررسی اجازه ساخت سند یا مشتری
export function canCreate(role, accessLevel) {
    return role === "ROLE_ADMIN" || [
        // "CREATE",
        "ADMIN",
        "OWNER"
    ].includes(accessLevel);
}

// بررسی اجازه ویرایش یا حذف
export function canEdit(role, accessLevel) {
    return role === "ROLE_ADMIN" || [
        "EDIT",
        "OWNER"
    ].includes(accessLevel);
}

// بررسی اجازه مدیریت مشتری‌ها
export function canManageClients(role, accessLevel) {
    return role === "ROLE_ADMIN" || [
        "ADMIN",
        "OWNER"
    ].includes(accessLevel);
}

// بررسی اجازه بارگذاری یا حذف ضمیمه
export function canManageAttachments(role, accessLevel) {
    return role === "ROLE_ADMIN" || [
        "EDIT",
        "OWNER"
    ].includes(accessLevel);
}

// بررسی اجازه بازگردانی وضعیت سند
export function canRevert(role, accessLevel) {
    return role === "ROLE_ADMIN" || [
        "REVERT",
        "OWNER"
    ].includes(accessLevel);
}
