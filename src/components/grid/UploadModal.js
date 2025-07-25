// UploadModal.jsx
import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Upload,
    Input,
    Select,
    message,
    Button,
    Progress, AutoComplete,
} from "antd";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import {
    uploadFile,
    getCompanies,
    getCategories,
    getFrequentDescriptions
} from "../../api/api";
import PreviewBox from "./PreviewBox";

const { Dragger } = Upload;
const { Option } = Select;

const UploadModal = ({ documentId, visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [files, setFiles] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [frequentDescriptions, setFrequentDescriptions] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!visible) return;

        getCompanies()
            .then((res) => setCompanies(res.data || []))
            .catch(() => setCompanies([]));

        getCategories()
            .then((res) => setCategories(res.data || []))
            .catch(() => setCategories([]));

        getFrequentDescriptions()
            .then((res) => setFrequentDescriptions(res.data || []))
            .catch(() => setFrequentDescriptions([]));
    }, [visible]);

    const props = {
        multiple: true,
        beforeUpload: (file) => {
            setFiles((prev) => [
                ...prev,
                {
                    file,
                    description: "",
                    companyId: null,
                    companyName: "",
                    categoryId: null,
                    categoryName: "",
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
            const formData = new FormData();

            files.forEach((f) => {
                formData.append("files", f.file);
                formData.append("descriptions", f.description || "");
                formData.append("companyIds", f.companyId || "");
                formData.append("companyNames", f.companyName || "");
                formData.append("categoryIds", f.categoryId || "");
                formData.append("categoryNames", f.categoryName || "");
            });

            await uploadFile(documentId, formData, (event) => {
                const percent = Math.round((event.loaded * 100) / event.total);
                setProgress(percent);
            });

            await new Promise((resolve) => setTimeout(resolve, 600));
            message.success("فایل‌ها با موفقیت بارگذاری شدند");
            setFiles([]);
            form.resetFields();
            onSuccess();
            onClose();
        } catch {
            message.error("خطا در بارگذاری فایل‌ها");
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <Modal
            open={visible}
            title="بارگذاری فایل‌های جدید"
            onCancel={() => {
                console.log("Close pressed");
                onClose();
            }}
            onOk={handleSubmit}
            okText="بارگذاری"
            cancelText="انصراف"
            width={700}
            okButtonProps={{ disabled: uploading }}
            destroyOnClose
        >
            <Form layout="vertical" form={form}>
                <Form.Item label="انتخاب فایل‌ها">
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p>فایل‌ها را اینجا بکشید یا کلیک کنید برای انتخاب</p>
                        <p style={{ fontSize: "12px", color: "#999" }}>
                            فرمت‌های مجاز: jpg، png، pdf، docx، xlsx، zip، rar
                        </p>
                    </Dragger>
                </Form.Item>

                {uploading && (
                    <div style={{ marginBottom: 16 }}>
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
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row-reverse",
                                gap: "16px",
                                alignItems: "flex-start",
                            }}
                        >
                            <PreviewBox file={f.file} />

                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ fontWeight: "bold" }}>
                                    {f.file.name}
                                    <a
                                        href={URL.createObjectURL(f.file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ marginRight: 12 }}
                                    >
                                        مشاهده فایل
                                    </a>
                                </div>

                                {/*<Form.Item label="شرح فایل" style={{ marginBottom: 4 }}>*/}
                                {/*    <Input.TextArea*/}
                                {/*        rows={2}*/}
                                {/*        placeholder="توضیح اختیاری..."*/}
                                {/*        value={f.description}*/}
                                {/*        onChange={(e) => handleFieldChange(i, "description", e.target.value)}*/}
                                {/*        options={frequentDescriptions.map((desc) => ({*/}
                                {/*            label: desc,*/}
                                {/*            value: desc,*/}
                                {/*        }))}*/}
                                {/*    />*/}
                                {/*</Form.Item>*/}

                                <Form.Item label="شرح فایل" style={{ marginBottom: 4 }}>
                                    <AutoComplete
                                        options={frequentDescriptions.map(desc => ({ value: desc }))}
                                        filterOption={(inputValue, option) =>
                                            option?.value?.toLowerCase().includes(inputValue.toLowerCase())
                                        }
                                        value={f.description}
                                        onChange={(val) => handleFieldChange(i, "description", val)}
                                        placeholder="شرح فایل را وارد یا انتخاب کنید"
                                    >
                                        <Input.TextArea rows={2} />
                                    </AutoComplete>
                                </Form.Item>


                                {/*<Form.Item label="شرح‌های پرتکرار" style={{ marginBottom: 4 }}>*/}
                                {/*    <Select*/}
                                {/*        showSearch*/}
                                {/*        allowClear*/}
                                {/*        placeholder="انتخاب یک شرح پرتکرار"*/}
                                {/*        onChange={(val) => handleFieldChange(i, "description", val)}*/}
                                {/*        options={frequentDescriptions.map((desc) => ({*/}
                                {/*            label: desc,*/}
                                {/*            value: desc,*/}
                                {/*        }))}*/}
                                {/*    />*/}
                                {/*</Form.Item>*/}

                                <Form.Item label="شرکت / شخص" style={{ marginBottom: 4 }}>
                                    <Select
                                        showSearch
                                        placeholder="انتخاب شرکت"
                                        value={f.companyId}
                                        onChange={(value) => {
                                            const selected = companies.find((c) => c.id === value);
                                            handleFieldChange(i, "companyId", value);
                                            handleFieldChange(i, "companyName", selected?.name || "");
                                        }}
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

                                <Form.Item label="دسته‌بندی" style={{ marginBottom: 4 }}>
                                    <Select
                                        showSearch
                                        placeholder="انتخاب دسته‌بندی"
                                        value={f.categoryId}
                                        onChange={(value) => {
                                            const selected = categories.find((cat) => cat.id === value);
                                            handleFieldChange(i, "categoryId", value);
                                            handleFieldChange(i, "categoryName", selected?.name || "");
                                        }}
                                        style={{ width: "100%" }}
                                        optionFilterProp="children"
                                    >
                                        {categories.map((cat) => (
                                            <Option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </div>
                        </div>

                        <Button
                            block
                            type="text"
                            icon={<DeleteOutlined />}
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
