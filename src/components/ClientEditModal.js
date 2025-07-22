import React, { useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { updateClient } from "../api/api"; // تابع API برای ویرایش مشتری

function ClientEditModal({ visible, client, onCancel, onSuccess }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (client) {
            form.setFieldsValue(client);
        }
    }, [client]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await updateClient(client.id, values);
            message.success("اطلاعات مشتری ویرایش شد");
            form.resetFields();
            onSuccess();
        } catch {
            message.error("❌ خطا در ویرایش مشتری");
        }
    };

    return (
        <Modal
            open={visible}
            title={`ویرایش مشتری: ${client?.unitName}`}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="ذخیره"
            cancelText="انصراف"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="unitName"
                    label="نام واحد"
                    rules={[{ required: true, message: "نام واحد را وارد کنید" }]}
                >
                    <Input />
                </Form.Item>
                {/* فیلدهای دیگر در صورت نیاز */}
            </Form>
        </Modal>
    );
}

export default ClientEditModal;
