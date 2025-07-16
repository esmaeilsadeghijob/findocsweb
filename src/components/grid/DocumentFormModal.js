import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Select, message } from "antd";
import { getPeriods } from "../../api/api"; // فرض بر اینکه چنین API وجود داره

const DocumentFormModal = ({ visible, clientId, defaultService, defaultUnit, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [years, setYears] = useState([]);

    useEffect(() => {
        getPeriods()
            .then(res => setYears(res.data))
            .catch(() => setYears([]));
    }, []);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // ⚙️ ارسال اطلاعات به API ثبت سند
            // await createDocument({ ...values, clientId, serviceName: defaultService, unitName: defaultUnit });

            message.success("سند با موفقیت ثبت شد");
            form.resetFields();
            onSuccess();
        } catch {
            message.error("لطفاً فیلدها را به‌درستی وارد کنید");
        }
    };

    return (
        <Modal
            open={visible}
            title="ثبت سند جدید"
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="ثبت"
            cancelText="انصراف"
        >
            <Form form={form} layout="vertical">
                <Form.Item label="سرویس">
                    <Input value={defaultService} disabled />
                </Form.Item>

                <Form.Item label="واحد">
                    <Input value={defaultUnit} disabled />
                </Form.Item>

                <Form.Item
                    name="fiscalYear"
                    label="سال مالی"
                    rules={[{ required: true, message: "انتخاب سال مالی الزامی است" }]}
                >
                    <Select placeholder="انتخاب سال مالی">
                        {years.map((y) => (
                            <Select.Option key={y.id} value={y.fiscalYear}>
                                {y.fiscalYear}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="documentNumber"
                    label="شماره سند"
                    rules={[{ required: true, message: "شماره سند را وارد کنید" }]}
                >
                    <Input placeholder="مثلاً: 125" />
                </Form.Item>

                <Form.Item
                    name="documentDate"
                    label="تاریخ سند"
                    rules={[{ required: true, message: "تاریخ سند الزامی است" }]}
                >
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item name="description" label="شرح">
                    <Input.TextArea rows={3} placeholder="توضیحات اختیاری..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DocumentFormModal;
