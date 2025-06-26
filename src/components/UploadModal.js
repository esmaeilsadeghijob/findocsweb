import { Modal, Upload, Button, Input, message } from "antd";
import { useState } from "react";
import { uploadFile } from "../api";

function UploadModal({ documentId, onClose }) {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");

    const handleUpload = async () => {
        const form = new FormData();
        form.append("file", file);
        form.append("description", description);

        try {
            await uploadFile(documentId, form);
            message.success("فایل با موفقیت بارگذاری شد");
            onClose();
        } catch {
            message.error("خطا در بارگذاری فایل");
        }
    };

    return (
        <Modal open onCancel={onClose} onOk={handleUpload} title="بارگذاری فایل">
            <Upload beforeUpload={(f) => (setFile(f), false)} maxCount={1}>
                <Button>انتخاب فایل</Button>
            </Upload>
            <Input.TextArea
                rows={2}
                placeholder="توضیحات"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
        </Modal>
    );
}

export default UploadModal;
