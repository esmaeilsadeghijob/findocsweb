import { Modal, Upload, Button, message, Space } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import {getAttachments, uploadFile} from "../api/api";

function UploadModal({ documentId, onClose, onSuccess }) {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!fileList.length)
            return message.warning("فایلی انتخاب نشده است");

        const formData = new FormData();
        fileList.forEach((file) => {
            formData.append("files", file);
        });

        setUploading(true);
        try {
            await uploadFile(documentId, formData);
            message.success("فایل‌ها با موفقیت بارگذاری شدند");
            setFileList([]);

            getAttachments(documentId);

            onSuccess?.(); // 👈 رفرش لیست ضمیمه‌ها از طریق والد

            onClose?.();   // 👈 بستن مودال بعد از موفقیت
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
        },
        fileList,
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
