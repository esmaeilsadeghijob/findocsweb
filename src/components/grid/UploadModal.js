import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Upload,
    Input,
    Select,
    message,
    Button,
    Progress,
    AutoComplete
} from "antd";
import { InboxOutlined, DeleteOutlined, ScanOutlined } from "@ant-design/icons";
import {
    uploadFile,
    getCompanies,
    getCategories,
    getFrequentDescriptions
} from "../../api/api";
import PreviewBox from "./PreviewBox";
import scannerIcon from "../../assets/img/Scanner.512.png";
import ScannerWidget from "./ScannerWidget";

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
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        if (!visible) return;

        getCompanies().then((res) => setCompanies(res.data || []));
        getCategories().then((res) => setCategories(res.data || []));
        getFrequentDescriptions().then((res) => setFrequentDescriptions(res.data || []));
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

            await new Promise((r) => setTimeout(r, 600));
            message.success("فایل‌ها با موفقیت بارگذاری شدند");
            setFiles([]);
            form.resetFields();
            onSuccess();
            onClose();
            setShowScanner(false);
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
            title={showScanner ? "اسکن فایل جدید" : "بارگذاری فایل‌های جدید"}
            onCancel={() => {
                onClose();
                setShowScanner(false);
            }}
            onOk={!showScanner ? handleSubmit : undefined}
            okText={!showScanner ? "بارگذاری" : null}
            cancelText="بستن"
            width={700}
            destroyOnClose
            okButtonProps={{ disabled: uploading }}
        >
            {!showScanner ? (
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
                    {/*<Form.Item>*/}
                    <div style={{display: "flex", justifyContent: "flex-start"}}>
                        <Button
                            type="link"
                            onClick={() => setShowScanner(true)}
                            icon={
                                <img
                                    src={scannerIcon}
                                    alt="اسکنر"
                                    style={{width: 30, height: 30, marginBottom: 2}}
                                />
                            }
                            style={{padding: 0}}
                        />
                    </div>
                    {/*</Form.Item>*/}

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
                                        <AutoComplete
                                            options={frequentDescriptions.map((desc) => ({value: desc}))}
                                            filterOption={(inputValue, option) =>
                                                option?.value?.toLowerCase().includes(inputValue.toLowerCase()) ||
                                                option?.value?.toLowerCase().startsWith(inputValue.toLowerCase())
                                            }
                                            value={f.description}
                                            onChange={(val) => handleFieldChange(i, "description", val)}
                                            placeholder="شرح فایل را وارد یا انتخاب کنید"
                                            style={{width: "100%"}}
                                        >
                                            <Input.TextArea rows={2}/>
                                        </AutoComplete>
                                    </Form.Item>

                                    <Form.Item label="شرکت / شخص" style={{marginBottom: 4}}>
                                        <Select
                                            showSearch
                                            placeholder="انتخاب شرکت"
                                            value={f.companyId}
                                            onChange={(value) => {
                                                const selected = companies.find((c) => c.id === value);
                                                handleFieldChange(i, "companyId", value);
                                                handleFieldChange(i, "companyName", selected?.name || "");
                                            }}
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

                                    <Form.Item label="دسته‌بندی" style={{marginBottom: 4}}>
                                        <Select
                                            showSearch
                                            placeholder="انتخاب دسته‌بندی"
                                            value={f.categoryId}
                                            onChange={(value) => {
                                                const selected = categories.find((cat) => cat.id === value);
                                                handleFieldChange(i, "categoryId", value);
                                                handleFieldChange(i, "categoryName", selected?.name || "");
                                            }}
                                            style={{width: "100%"}}
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
                                icon={<DeleteOutlined/>}
                                onClick={() => handleRemove(i)}
                                danger
                            >
                                حذف فایل
                            </Button>
                        </div>
                    ))}
                </Form>
            ) : (
                <ScannerWidget onClose={() => setShowScanner(false)}/>
            )}
        </Modal>
    );
};

export default UploadModal;
