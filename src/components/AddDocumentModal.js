import { Modal, Form, Input, DatePicker, Button, Select, message } from "antd";
import { useState } from "react";
import { createDocument } from "../api/api";
import dayjs from "dayjs";

function AddDocumentModal({ onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const payload = {
                documentNumber: values.documentNumber,
                fiscalYear: values.fiscalYear,
                documentDate: values.documentDate.format("YYYY-MM-DD"),
                description: values.description,
                nature: values.nature,
                clientId: values.clientId,
                projectId: values.projectId,
            };

            setLoading(true);
            await createDocument(payload);
            message.success("سند با موفقیت ثبت شد");
            onSuccess();
        } catch (err) {
            message.error("ورودی‌ها را بررسی کنید");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            title="افزودن سند جدید"
        >
            <Form layout="vertical" form={form}>
                <Form.Item
                    name="documentNumber"
                    label="شماره سند"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="fiscalYear"
                    label="سال مالی"
                    rules={[{ required: true }]}
                >
                    <Input placeholder="مثلاً: 1403" />
                </Form.Item>

                <Form.Item
                    name="documentDate"
                    label="تاریخ سند"
                    rules={[{ required: true }]}
                >
                    <DatePicker
                        style={{ width: "100%" }}
                        format="YYYY-MM-DD"
                        defaultValue={dayjs()}
                    />
                </Form.Item>

                <Form.Item name="description" label="شرح سند">
                    <Input.TextArea rows={2} />
                </Form.Item>

                <Form.Item
                    name="nature"
                    label="ماهیت سند"
                    rules={[{ required: true }]}
                >
                    <Select
                        placeholder="انتخاب ماهیت"
                        options={[
                            { label: "دریافت", value: "RECEIVE" },
                            { label: "پرداخت", value: "PAYMENT" },
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    name="clientId"
                    label="مشتری"
                    rules={[{ required: true }]}
                >
                    <Input placeholder="client UUID" />
                </Form.Item>

                <Form.Item
                    name="projectId"
                    label="پروژه"
                    rules={[{ required: true }]}
                >
                    <Input placeholder="project UUID" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AddDocumentModal;
