import React, { useState } from "react";
import { Modal, Upload, Button, Progress, message, Tooltip } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { updateAttachmentFile } from "../../api/api";

const { Dragger } = Upload;

const ReplaceAttachmentModal = ({ documentId, fileId, visible, onClose, onSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadProps = {
        beforeUpload: (file) => {
            setSelectedFile(file);
            return false; // Prevent auto upload
        },
        showUploadList: false,
        accept: ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xlsx,.zip,.rar"
    };

    const handleReplace = async () => {
        if (!selectedFile) {
            message.warning("لطفاً یک فایل انتخاب کنید");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            setUploading(true);
            setProgress(0);

            await updateAttachmentFile(documentId, fileId, formData, (event) => {
                const percent = Math.round((event.loaded * 100) / event.total);
                setProgress(percent);
            });

            message.success("فایل با موفقیت جایگزین شد");
            onSuccess?.();
            onClose?.();
            setSelectedFile(null);
        } catch {
            message.error("خطا در جایگزینی فایل");
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <Modal
            open={visible}
            title="جایگزینی فایل ضمیمه"
            onCancel={() => {
                onClose();
                setSelectedFile(null);
            }}
            onOk={handleReplace}
            okText="جایگزین کن"
            okButtonProps={{ disabled: uploading || !selectedFile }}
            cancelText="بستن"
            destroyOnClose
        >
            <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p>فایل جدید را اینجا بکشید یا کلیک کنید برای انتخاب</p>
                <p style={{ fontSize: "12px", color: "#999" }}>
                    فرمت‌های مجاز: JPG، PNG، PDF، DOCX، XLSX، ZIP، RAR
                </p>
            </Dragger>

            {uploading && (
                <div style={{ marginTop: 16 }}>
                    <Progress percent={progress} status={progress === 100 ? "success" : "active"} />
                </div>
            )}
        </Modal>
    );
};

export default ReplaceAttachmentModal;
