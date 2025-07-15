import {useEffect, useState} from "react";
import {Button, Form, Input, message, Modal, Progress, Select, Upload,} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {getCompanies, uploadFile} from "../api/api";

function UploadModal({ documentId, onClose, onSuccess }) {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        getCompanies()
            .then((res) => setCompanies(res.data || []))
            .catch(() => message.error("خطا در دریافت لیست شرکت‌ها"));
    }, []);

    const animateProgressBar = () => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                startUpload(); // سرویس آپلود بعد از رسیدن به 100٪ فراخوانی می‌شود
            }
            setUploadProgress(progress);
        }, 80); // سرعت پر شدن نوار (قابل تنظیم)
    };

    const startUpload = async () => {
        const values = await form.validateFields();

        const formData = new FormData();
        fileList.forEach((file, index) => {
            formData.append("files", file.originFileObj);
            formData.append("descriptions", values?.meta?.[index]?.description || "");
            formData.append("companyIds", values?.meta?.[index]?.companyId || "");
        });

        uploadFile(documentId, formData)
            .then(() => {
                message.success("فایل‌ها با موفقیت بارگذاری شدند");
                setTimeout(() => {
                    setShowProgress(false);
                    setUploadProgress(0);
                    setUploading(false);
                    onSuccess?.();
                }, 1000);
            })
            .catch(() => {
                message.error("خطا در بارگذاری فایل‌ها");
                setShowProgress(false);
                setUploadProgress(0);
                setUploading(false);
            });
    };

    const handleSubmit = async () => {
        if (fileList.length === 0) {
            message.warning("لطفاً حداقل یک فایل انتخاب کنید");
            return;
        }

        try {
            await form.validateFields();
            setShowProgress(true);
            setUploading(true);
            animateProgressBar();
        } catch {
            message.error("لطفاً تمام اطلاعات فایل‌ها را کامل کنید");
        }
    };

    const handleRemove = (file) => {
        setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        form.setFieldsValue({
            meta: form.getFieldValue("meta")?.filter((_, i) => fileList[i].uid !== file.uid),
        });
    };

    const handleChange = ({ fileList: newList }) => {
        setFileList(newList);
        const metas = form.getFieldValue("meta") || [];
        while (metas.length < newList.length)
            metas.push({ description: "", companyId: null });
        form.setFieldsValue({ meta: metas });
    };

    return (
        <Modal
            title="بارگذاری فایل"
            open={true}
            onCancel={onClose}
            onOk={handleSubmit}
            okText="ارسال"
        >
            {showProgress && (
                <div style={{ marginBottom: 16 }}>
                    <Progress percent={uploadProgress} status={uploading ? "active" : "normal"} />
                </div>
            )}

            <Upload
                multiple
                fileList={fileList}
                onRemove={handleRemove}
                beforeUpload={() => false}
                onChange={handleChange}
            >
                <Button icon={<PlusOutlined />}>انتخاب فایل‌ها</Button>
            </Upload>

            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                {fileList.map((file, index) => (
                    <div
                        key={file.uid}
                        style={{
                            borderBottom: "1px solid #eee",
                            padding: "8px 0",
                            marginBottom: 8,
                        }}
                    >
                        <div style={{ fontWeight: 500 }}>{file.name}</div>

                        <Form.Item
                            name={["meta", index, "description"]}
                            label="شرح فایل"
                            style={{ marginBottom: 8 }}
                        >
                            <Input placeholder="مثلاً: فاکتور شماره ۲۳ (اختیاری)" />
                        </Form.Item>

                        <Form.Item
                            name={["meta", index, "companyId"]}
                            label="شرکت / شخص"
                            style={{ marginBottom: 0 }}
                        >
                            <Select
                                options={companies.map((c) => ({
                                    label: c.name,
                                    value: c.id,
                                }))}
                                allowClear
                                placeholder="انتخاب شرکت (اختیاری)"
                            />
                        </Form.Item>
                    </div>
                ))}
            </Form>
        </Modal>
    );
}

export default UploadModal;
