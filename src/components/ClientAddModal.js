import React from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { createClient } from "../api/api"; // تابع API برای ثبت مشتری

function ClientAddModal({ visible, onCancel, onSuccess }) {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await createClient(values);
            message.success("مشتری با موفقیت ثبت شد");
            form.resetFields();
            onSuccess();
        } catch (err) {
            message.error("خطا در ثبت مشتری");
        }
    };

    return (
        <Modal
            open={visible}
            title="افزودن مشتری جدید"
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="ثبت"
            cancelText="انصراف"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="unitName"
                    label="نام واحد"
                    rules={[{ required: true, message: "لطفاً نام واحد را وارد کنید" }]}
                >
                    <Input />
                </Form.Item>
                {/* می‌تونی فیلدهای بیشتر مثل serviceId یا periodId هم اضافه کنی */}
            </Form>
        </Modal>
    );
}

export default ClientAddModal;
