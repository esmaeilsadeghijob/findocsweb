const AccessMatrix = {
    NONE: ["READ"], // فقط مشاهده اسناد؛ هیچ‌گونه عملیات دیگری مجاز نیست

    READ: ["READ"], // مشاهده اسناد؛ عملیات مثل ثبت، حذف، ویرایش غیرمجاز

    CREATE: ["READ", "CREATE"], // اجازه ثبت سند؛ مشاهده مجاز ولی حذف/ویرایش ممنوع

    EDIT: ["READ", "CREATE", "EDIT"], // اجازه ویرایش و حذف؛ مشاهده و ثبت هم مجاز

    DOWNLOAD: ["READ", "CREATE", "EDIT", "DOWNLOAD"], // همه عملیات مجاز به‌جز تغییر وضعیت یا مدیریت

    REVERT: ["READ", "CREATE", "REVERT"], // اجازه بازگردانی وضعیت + ثبت + مشاهده؛ حذف و ویرایش ممنوع

    ADMIN: ["READ", "CREATE", "EDIT", "DOWNLOAD", "REVERT", "ADMIN"], // سطح مدیریتی کامل

    OWNER: [
        "READ",
        "CREATE",
        "EDIT",
        "DOWNLOAD",
        "REVERT",
        "ADMIN",
        "OWNER"
    ] // سطح مدیریتی اصلی؛ دسترسی کامل مثل ROLE_ADMIN
};

export default AccessMatrix;
