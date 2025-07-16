import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Upload,
    Input,
    Select,
    message,
    Divider,
    Space,
    Button,
} from "antd";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import { uploadFile, getCompanies } from "../../api/api";

const { Dragger } = Upload;
const { Option } = Select;

const UploadModal = ({ documentId, visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [files, setFiles] = useState([]);
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        getCompanies()
            .then((res) => setCompanies(res.data || []))
            .catch(() => setCompanies([]));
    }, []);

    const props = {
        multiple: true,
        beforeUpload: (file) => {
            setFiles((prev) => [
                ...prev,
                {
                    file,
                    description: "",
                    companyId: null,
                },
            ]);
            return false;
        },
        showUploadList: false,
        accept: ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xlsx,.zip,.rar",
    };

    const handleFieldChange = (index, field, value) => {
        const updated = [...files];
        updated[index][field] = value;
        setFiles(updated);
    };

    const handleRemove = (index) => {
        const updated = [...files];
        updated.splice(index, 1);
        setFiles(updated);
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            message.warning("لطفاً حداقل یک فایل انتخاب کنید");
            return;
        }

        try {
            for (let f of files) {
                const formData = new FormData();
                formData.append("files", f.file);
                formData.append("description", f.description || "");
                formData.append("companyId", f.companyId || "");

                await uploadFile(documentId, formData);
            }

            message.success("✅ فایل‌ها با موفقیت بارگذاری شدند");
            setFiles([]);
            form.resetFields();
            onSuccess();
            onClose();
        } catch {
            message.error("❌ خطا در بارگذاری فایل‌ها");
        }
    };

    return (
        <Modal
            open={visible}
            title="بارگذاری فایل‌های جدید"
            onCancel={onClose}
            onOk={handleSubmit}
            okText="بارگذاری"
            cancelText="انصراف"
            width={700}
        >
            <Form layout="vertical" form={form}>
                <Form.Item label="انتخاب فایل‌ها">
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p>فایل‌ها را اینجا بکشید یا کلیک کنید برای انتخاب</p>
                        <p style={{ fontSize: "12px", color: "#999" }}>
                            فرمت‌های مجاز: jpg، png، pdf، docx، xlsx، zip
                        </p>
                    </Dragger>
                </Form.Item>

                {files.length > 0 && (
                    <>
                        <Divider>مشخصات فایل‌ها</Divider>
                        {files.map((f, i) => (
                            <Space
                                key={i}
                                direction="vertical"
                                style={{
                                    border: "1px solid #eee",
                                    padding: "10px",
                                    marginBottom: "12px",
                                    borderRadius: "8px",
                                    width: "100%",
                                }}
                            >
                                <div style={{ fontWeight: "bold", marginBottom: 8 }}>{f.file.name}</div>
                                <Form.Item label="شرح فایل" style={{ marginBottom: 4 }}>
                                    <Input.TextArea
                                        rows={2}
                                        placeholder="توضیح اختیاری..."
                                        value={f.description}
                                        onChange={(e) =>
                                            handleFieldChange(i, "description", e.target.value)
                                        }
                                    />
                                </Form.Item>
                                <Form.Item label="شرکت / شخص" style={{ marginBottom: 4 }}>
                                    <Select
                                        showSearch
                                        placeholder="انتخاب کنید"
                                        value={f.companyId}
                                        onChange={(value) =>
                                            handleFieldChange(i, "companyId", value)
                                        }
                                        style={{ width: "100%" }}
                                        optionFilterProp="children"
                                    >
                                        {companies.map((c) => (
                                            <Option key={c.id} value={c.id}>
                                                {c.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Button
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemove(i)}
                                    danger
                                >
                                    حذف فایل
                                </Button>
                            </Space>
                        ))}
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default UploadModal;
