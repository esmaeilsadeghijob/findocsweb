import { Table, Button, Tooltip } from "antd";
import { EyeOutlined, UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { getAttachments } from "../../api/api";
import UploadModal from "./UploadModal";

function AttachmentRow({ data }) {
    const [attachments, setAttachments] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const fetchAttachments = async () => {
        try {
            const res = await getAttachments(data.id);
            setAttachments(res.data || []);
        } catch {
            setAttachments([]);
        }
    };

    useEffect(() => {
        fetchAttachments();
    }, [data.id]);

    const columns = [
        { title: "نام فایل", dataIndex: "fileName", key: "name" },
        { title: "فرمت", dataIndex: "extension", key: "ext", align: "center" },
        {
            title: "پیش‌نمایش",
            key: "preview",
            align: "center",
            render: (_, record) => (
                <Tooltip title="مشاهده فایل">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        href={`/api/attachments/${data.id}/preview/${record.id}`}
                        target="_blank"
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <div style={{ padding: "12px 24px" }}>
            <Table
                size="small"
                rowKey="id"
                dataSource={attachments}
                columns={columns}
                pagination={false}
            />

            <div style={{ marginTop: 12 }}>
                <Button
                    type="dashed"
                    icon={<UploadOutlined />}
                    onClick={() => setShowUploadModal(true)}
                >
                    بارگذاری فایل جدید
                </Button>
            </div>

            {showUploadModal && (
                <UploadModal
                    documentId={data.id}
                    visible
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        fetchAttachments(); // 🔁 ریفرش لیست فایل‌ها پس از آپلود موفق
                    }}
                />
            )}
        </div>
    );
}

export default AttachmentRow;
