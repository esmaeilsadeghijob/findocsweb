import { useState } from "react";
import { Form, Input, Button, message, Divider } from "antd";
import { createCompany } from "../api/api";
import "../pages/AuthPage.css";

function AddCompanyForm({ onSuccess = () => {} }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleFinish = async (values) => {
        try {
            setLoading(true);
            await createCompany(values);
            message.success("شرکت / شخص با موفقیت ثبت شد");
            form.resetFields();
            onSuccess();
        } catch {
            message.error("خطا در ثبت اطلاعات");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 500 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                افزودن شرکت / شخص جدید
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                autoComplete="off"
                className="auth-form"
            >
                <Form.Item
                    name="name"
                    label="نام"
                    rules={[{ required: true, message: "نام الزامی است" }]}
                >
                    <Input
                        className="auth-input small-input"
                        placeholder="مثلاً: شرکت توسعه فن‌آوران"
                        style={{ textAlign: "right" }}
                    />
                </Form.Item>

                <Form.Item name="nationalId" label="شناسه ملی / شماره ملی">
                    <Input
                        className="auth-input small-input"
                        placeholder="مثلاً: ۱۰۳۲۲۲۳۰۰۹۰"
                        style={{ textAlign: "right" }}
                    />
                </Form.Item>

                <Form.Item name="phone" label="تلفن">
                    <Input
                        className="auth-input small-input"
                        placeholder="مثلاً: ۰۲۱-۸۸۳۰۰۰۰۰"
                        style={{ textAlign: "right" }}
                    />
                </Form.Item>

                <Form.Item name="address" label="آدرس">
                    <Input.TextArea
                        rows={2}
                        className="auth-input"
                        placeholder="مثلاً: تهران، خیابان آزادی، پلاک ۱۲۳"
                        style={{ textAlign: "right" }}
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        htmlType="submit"
                        loading={loading}
                        style={{
                            width: "100%",
                            height: "48px",               // ← افزایش ارتفاع دکمه
                            fontSize: "1rem",             // ← سایز فونت کمی بزرگ‌تر
                            border: "1px dashed #666",    // ← خط‌چین دودی
                            color: "#333",
                            background: "#f8f8f8",
                        }}
                    >
                        ثبت اطلاعات
                    </Button>
                </Form.Item>
            </Form>

            <Divider style={{ margin: "16px 0", borderColor: "#eee" }} />
        </div>
    );
}

export default AddCompanyForm;
