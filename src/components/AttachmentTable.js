import { useEffect, useState } from "react";
import { Table, Button, Space, Popconfirm, message, Tag } from "antd";
import {
    getAttachments,
    deleteAttachment,
} from "../api/api";

function AttachmentTable({ documentId }) {
    const [attachments, setAttachments] = useState([]);

    const fetchData = () => {
        getAttachments(documentId)
            .then((res) => setAttachments(res.data))
            .catch(() => setAttachments([]));
    };

    useEffect(() => {
        fetchData();
    }, [documentId]);

    const handleDelete = async (fileId) => {
        try {
            await deleteAttachment(documentId, fileId);
            message.success("ضمیمه حذف شد");
            fetchData();
        } catch {
            message.error("حذف ناموفق بود");
        }
    };

    const columns = [
        { title: "نام فایل", dataIndex: "fileName" },
        { title: "شرح", dataIndex: "description" },
        {
            title: "نوع فایل",
            render: (_, file) => (
                <Tag color="blue">
                    {file.extension?.toUpperCase() || "نامشخص"}
                </Tag>
            ),
        },
        {
            title: "آپلودکننده",
            dataIndex: "uploadedBy",
            render: (uploader) => uploader || "نامشخص",
        },
        {
            title: "پیش‌نمایش",
            render: (_, file) => (
                <a
                    href={`http://localhost:8080/api/attachments/${documentId}/preview/${file.id}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    مشاهده
                </a>
            ),
        },
        {
            title: "عملیات",
            render: (_, file) => (
                <Space>
                    <Popconfirm
                        title="آیا مطمئن هستید؟"
                        onConfirm={() => handleDelete(file.id)}
                    >
                        <Button danger size="small">حذف</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Table
            size="small"
            rowKey={(item) => item.id || item.fileName}
            dataSource={attachments}
            columns={columns}
            pagination={false}
        />
    );
}

export default AttachmentTable;
