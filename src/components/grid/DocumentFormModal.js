import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Select, message } from "antd";
import moment from "moment-jalaali";
import { getPeriods, createDocument } from "../../api/api";

moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });

const DocumentFormModal = ({
                               visible,
                               clientId,
                               unitId,
                               unitName,
                               serviceId,
                               serviceName,
                               periodId,
                               defaultPeriodLabel,
                               onCancel,
                               onSuccess,
                           }) => {
    const [form] = Form.useForm();
    const [periods, setPeriods] = useState([]);

    useEffect(() => {
        getPeriods()
            .then((res) => setPeriods(res.data))
            .catch(() => setPeriods([]));
    }, []);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const selectedPeriod = periods.find(p => p.fiscalYear === values.fiscalYear);
            if (!selectedPeriod) {
                message.error("❗ سال مالی انتخاب‌شده معتبر نیست");
                return;
            }

            const payload = {
                clientId,
                unitId,
                serviceId,
                periodId: selectedPeriod.id,
                unitName,
                serviceName,
                fiscalYear: selectedPeriod.fiscalYear,
                documentNumber: values.documentNumber,
                documentDate: values.documentDate.format("YYYY-MM-DD"),
                description: values.description || "",
            };

            await createDocument(payload);
            message.success("✅ سند با موفقیت ثبت شد");
            form.resetFields();
            onSuccess();
        } catch {
            message.error("⚠️ خطا در ثبت سند");
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
                    <Input value={serviceName || "—"} disabled />
                </Form.Item>

                <Form.Item label="واحد">
                    <Input value={unitName || "—"} disabled />
                </Form.Item>

                <Form.Item
                    name="fiscalYear"
                    label="سال مالی"
                    rules={[{ required: true, message: "انتخاب سال مالی الزامی است" }]}
                >
                    <Select placeholder="انتخاب سال مالی">
                        {periods.map(p => (
                            <Select.Option key={p.id} value={p.fiscalYear}>
                                {p.fiscalYear}
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
                    <DatePicker
                        format="jYYYY/jMM/jDD"
                        style={{ width: "100%" }}
                        placeholder="مثلاً: 1403/05/22"
                    />
                </Form.Item>

                <Form.Item name="description" label="شرح">
                    <Input.TextArea rows={3} placeholder="توضیحات اختیاری..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DocumentFormModal;
