import { Modal, Upload, Button, message, Space, Input, List } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { uploadFile } from "../api/api";

function UploadModal({ documentId, onClose, onSuccess }) {
    const [fileList, setFileList] = useState([]);
    const [descriptions, setDescriptions] = useState({});
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!fileList.length)
            return message.warning("فایلی انتخاب نشده است");

        const formData = new FormData();
        fileList.forEach((file) => {
            formData.append("files", file);
            formData.append("descriptions", descriptions[file.uid] || "");
        });

        setUploading(true);
        try {
            await uploadFile(documentId, formData);
            message.success("فایل‌ها آپلود شدند");
            setFileList([]);
            setDescriptions({});
            onSuccess?.();
            onClose?.();
        } catch {
            message.error("خطا در آپلود فایل‌ها");
        } finally {
            setUploading(false);
        }
    };

    const uploadProps = {
        multiple: true,
        accept: ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx",
        beforeUpload: (file) => {
            setFileList((prev) => [...prev, file]);
            return false;
        },
        onRemove: (file) => {
            setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
            setDescriptions((prev) => {
                const copy = { ...prev };
                delete copy[file.uid];
                return copy;
            });
        },
        fileList,
        showUploadList: false,
    };

    return (
        <Modal
            open
            title="بارگذاری ضمیمه"
            onCancel={onClose}
            footer={null}
            centered
        >
            <Space direction="vertical" style={{ width: "100%" }}>
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>انتخاب فایل‌ها</Button>
                </Upload>

                <List
                    size="small"
                    dataSource={fileList}
                    bordered
                    renderItem={(file) => (
                        <List.Item>
                            <div style={{ width: "100%" }}>
                                <div style={{ fontWeight: "bold" }}>{file.name}</div>
                                <Input
                                    placeholder="شرح فایل"
                                    value={descriptions[file.uid] || ""}
                                    onChange={(e) =>
                                        setDescriptions((prev) => ({
                                            ...prev,
                                            [file.uid]: e.target.value,
                                        }))
                                    }
                                    style={{ marginTop: 4 }}
                                />
                            </div>
                        </List.Item>
                    )}
                />

                <Button
                    type="primary"
                    onClick={handleUpload}
                    block
                    loading={uploading}
                    disabled={!fileList.length}
                >
                    {uploading ? "در حال آپلود..." : "بارگذاری فایل‌ها"}
                </Button>
            </Space>
        </Modal>
    );
}

export default UploadModal;
