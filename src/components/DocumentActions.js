import React from "react";
import {Button, Space} from "antd";

function DocumentActions({ doc }) {
    const access = doc.accessLevel;

    return (
        <Space>
            {["READ", "EDIT", "ADMIN", "OWNER"].includes(access) && (
                <Button onClick={() => viewDetails(doc.id)}>مشاهده</Button>
            )}

            {["EDIT", "OWNER"].includes(access) && (
                <Button danger onClick={() => deleteDoc(doc.id)}>حذف</Button>
            )}

            {["CREATE", "ADMIN", "OWNER"].includes(access) && (
                <Button onClick={() => addAttachment(doc.id)}>افزودن فایل</Button>
            )}

            {["EXPORT", "ADMIN", "OWNER"].includes(access) && (
                <Button onClick={() => exportToExcel(doc.id)}>ارسال به اکسل</Button>
            )}
        </Space>
    );
}

export default DocumentActions;
