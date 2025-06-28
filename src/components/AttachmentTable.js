import {
    Table,
    Popconfirm,
    message,
    Button,
    Tooltip,
} from "antd";
import { EyeOutlined, CloseOutlined } from "@ant-design/icons";
import React, {
    useEffect,
    useState,
    forwardRef,
    useImperativeHandle,
} from "react";
import {
    getAttachments,
    deleteAttachment,
} from "../api/api";

const AttachmentTable = forwardRef(({ documentId, onPreview }, ref) => {
    const [attachments, setAttachments] = useState([]);

    const fetch = () =>
        getAttachments(documentId)
            .then((res) => setAttachments(res.data))
            .catch(() => setAttachments([]));

    useEffect(() => {
        fetch();
    }, [documentId]);

    useImperativeHandle(ref, () => ({
        reload: fetch,
    }));

    const handleDelete = async (fileId) => {
        try {
            await deleteAttachment(documentId, fileId);
            message.success("فایل حذف شد");
            fetch();
        } catch {
            message.error("خطا در حذف فایل");
        }
    };

    const columns = [
        {
            title: "نام فایل",
            dataIndex: "fileName",
            render: (name) => <b style={{ color: "#333" }}>{name}</b>,
        },
        {
            title: "فرمت",
            dataIndex: "extension",
            align: "center",
        },
        {
            title: "تاریخ بارگذاری",
            dataIndex: "uploadedAt",
            align: "center",
            render: (value) =>
                new Date(value).toLocaleString("fa-IR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                }),
        },
        {
            title: "آپلودکننده",
            dataIndex: "uploadedBy",
            align: "center",
        },
        {
            title: "پیش‌نمایش",
            align: "center",
            render: (_, record) => (
                <Tooltip title="پیش‌نمایش فایل">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() =>
                            onPreview({
                                id: record.id,
                                fileName: record.fileName,
                                extension: record.extension?.toLowerCase(),
                            })
                        }
                    />
                </Tooltip>
            ),
        },
        {
            title: "عملیات",
            align: "center",
            render: (_, record) => (
                <Popconfirm
                    title="آیا مطمئنید که می‌خواهید حذف کنید؟"
                    onConfirm={() => handleDelete(record.id)}
                    okText="بله"
                    cancelText="خیر"
                >
                    <CloseOutlined
                        style={{ color: "red", fontSize: 18, cursor: "pointer" }}
                    />
                </Popconfirm>
            ),
        },
    ];

    return (
        <Table
            size="small"
            columns={columns}
            dataSource={attachments}
            rowKey="id"
            pagination={false}
        />
    );
});

export default AttachmentTable;
