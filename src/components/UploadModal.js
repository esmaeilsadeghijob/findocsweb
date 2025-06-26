import { Modal, Upload, Button, Input, message, List } from "antd";
import { useState, useEffect } from "react";
import { uploadFile, getAttachments } from "../api/api";

function UploadModal({ documentId, onClose }) {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);

    // دریافت لیست ضمائم
    const fetchAttachments = async () => {
        try {
            const res = await getAttachments(documentId);
            setAttachments(res.data);
        } catch {
            setAttachments([]);
        }
    };

    useEffect(() => {
        fetchAttachments();
    }, [documentId]);

    const handleUpload = async () => {
        if (!file) {
            message.warning("فایلی انتخاب نشده");
            return;
        }

        const form = new FormData();
        form.append("file", file);
        form.append("description", description);

        setLoading(true);
        try {
            await uploadFile(documentId, form);
            message.success("فایل با موفقیت بارگذاری شد");
            setFile(null);
            setDescription("");
            fetchAttachments(); // به‌روزرسانی لیست ضمائم
        } catch {
            message.error("خطا در بارگذاری فایل");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open
            onCancel={onClose}
            onOk={handleUpload}
            okButtonProps={{ loading }}
            okText="بارگذاری"
            cancelText="بستن"
            title="بارگذاری ضمیمه سند"
        >
            <Upload
                beforeUpload={(f) => {
                    setFile(f);
                    return false;
                }}
                maxCount={1}
                showUploadList={file ? [{ name: file.name }] : []}
            >
                <Button>انتخاب فایل</Button>
            </Upload>

            <Input.TextArea
                rows={2}
                placeholder="توضیحات ضمیمه (اختیاری)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ marginTop: "1rem" }}
            />

            {attachments.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <b>فایل‌های بارگذاری‌شده:</b>
                    <List
                        size="small"
                        bordered
                        dataSource={attachments}
                        renderItem={(item) => (
                            <List.Item>
                                📎 {item.filename} - {item.uploadDate || "بدون تاریخ"}
                            </List.Item>
                        )}
                    />
                </div>
            )}
        </Modal>
    );
}

export default UploadModal;
