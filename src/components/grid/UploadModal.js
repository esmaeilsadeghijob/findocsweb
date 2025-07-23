import React, {useEffect, useState} from "react";
import {
    Modal,
    Form,
    Upload,
    Input,
    Select,
    message,
    Divider,
    Button,
    Progress,
} from "antd";
import {InboxOutlined, DeleteOutlined} from "@ant-design/icons";
import {uploadFile, getCompanies} from "../../api/api";
import PreviewBox from "./PreviewBox"; // مسیر واقعی رو تنظیم کن

const {Dragger} = Upload;
const {Option} = Select;

const UploadModal = ({documentId, visible, onClose, onSuccess}) => {
    const [form] = Form.useForm();
    const [files, setFiles] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

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

        setUploading(true);
        setProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                const formData = new FormData();
                formData.append("files", f.file);
                formData.append("descriptions", f.description || "");
                formData.append("companyId", f.companyId || "");

                const company = companies.find((c) => c.id === f.companyId);
                formData.append("companyNames", company?.name || "");

                await uploadFile(documentId, formData);

                const percent = Math.round(((i + 1) / files.length) * 100);
                setProgress(percent);
            }

            await new Promise((resolve) => setTimeout(resolve, 600));
            message.success("فایل‌ها با موفقیت بارگذاری شدند");
            setFiles([]);
            form.resetFields();
            onSuccess();
            onClose();
        } catch {
            message.error("❌ خطا در بارگذاری فایل‌ها");
        } finally {
            setUploading(false);
            setProgress(0);
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
            okButtonProps={{disabled: uploading}}
        >
            <Form layout="vertical" form={form}>
                <Form.Item label="انتخاب فایل‌ها">
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined/>
                        </p>
                        <p>فایل‌ها را اینجا بکشید یا کلیک کنید برای انتخاب</p>
                        <p style={{fontSize: "12px", color: "#999"}}>
                            فرمت‌های مجاز: jpg، png، pdf، docx، xlsx، zip، rar
                        </p>
                    </Dragger>
                </Form.Item>

                {uploading && (
                    <div style={{marginBottom: 16}}>
                        <Progress
                            percent={progress}
                            status={progress === 100 ? "success" : "active"}
                        />
                    </div>
                )}

                {files.map((f, i) => (
                    <div
                        key={i}
                        style={{
                            border: "1px solid #eee",
                            padding: "10px",
                            marginBottom: "12px",
                            borderRadius: "8px",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        {/* 🔹 محتوای دوتایی بالا: پیش‌نمایش + اطلاعات فایل */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row-reverse",
                                gap: "16px",
                                alignItems: "flex-start",
                            }}
                        >
                            <PreviewBox file={f.file}/>

                            <div style={{flex: 1, display: "flex", flexDirection: "column", gap: 8}}>
                                <div style={{fontWeight: "bold"}}>
                                    {f.file.name}
                                    <a
                                        href={URL.createObjectURL(f.file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{marginRight: 12}}
                                    >
                                        مشاهده فایل
                                    </a>
                                </div>

                                <Form.Item label="شرح فایل" style={{marginBottom: 4}}>
                                    <Input.TextArea
                                        rows={2}
                                        placeholder="توضیح اختیاری..."
                                        value={f.description}
                                        onChange={(e) => handleFieldChange(i, "description", e.target.value)}
                                    />
                                </Form.Item>

                                <Form.Item label="شرکت / شخص" style={{marginBottom: 4}}>
                                    <Select
                                        showSearch
                                        placeholder="انتخاب شرکت"
                                        value={f.companyId}
                                        onChange={(value) => handleFieldChange(i, "companyId", value)}
                                        style={{width: "100%"}}
                                        optionFilterProp="children"
                                    >
                                        {companies.map((c) => (
                                            <Option key={c.id} value={c.id}>
                                                {c.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </div>
                        </div>

                        {/* 🔻 دکمه حذف مستقل و تمام‌عرض زیر دوتا بخش بالا */}
                        <Button
                            block
                            type="text"
                            icon={<DeleteOutlined/>}
                            onClick={() => handleRemove(i)}
                            danger
                        >
                            حذف فایل
                        </Button>
                    </div>
                ))}
            </Form>
        </Modal>
    );
};

export default UploadModal;
