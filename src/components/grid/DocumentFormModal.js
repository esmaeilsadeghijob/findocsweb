import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import DatePicker from "react-datepicker2";
import moment from "moment-jalaali";
import { getPeriods, createDocument, getArchivePreview } from "../../api/api";

moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });

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
                               onSuccess
                           }) => {
    const [form] = Form.useForm();
    const [periods, setPeriods] = useState([]);
    const [archiveNumber, setArchiveNumber] = useState(null);
    const [archiveDate, setArchiveDate] = useState(moment());

    useEffect(() => {
        getPeriods()
            .then((res) => setPeriods(res.data))
            .catch(() => setPeriods([]));
    }, []);

    useEffect(() => {
        if (visible && unitId) {
            console.log("📦 درخواست شماره بایگانی برای واحد:", unitId);
            getArchivePreview(unitId)
                .then((res) => {
                    console.log("📥 شماره دریافت‌شده:", res.data);
                    setArchiveNumber(res.data);
                })
                .catch((err) => {
                    console.warn("❌ خطا در دریافت شماره:", err);
                    setArchiveNumber(null);
                });
        }
    }, [visible, unitId]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const selectedPeriod = periods.find(p => p.fiscalYear === values.fiscalYear);
            if (!selectedPeriod) {
                message.error("❗ سال مالی انتخاب‌شده معتبر نیست");
                return;
            }

            console.log("📤 شماره بایگانی در payload:", archiveNumber);

            const payload = {
                clientId,
                unitId,
                serviceId,
                periodId: selectedPeriod.id,
                unitName,
                serviceName,
                fiscalYear: selectedPeriod.fiscalYear,
                documentNumber: values.documentNumber,
                documentTimestamp: values.documentDate?.valueOf(),
                archiveNumber,
                archiveDate: archiveDate?.valueOf(),
                description: values.description || "",
                status: "DRAFT"
            };

            await createDocument(payload);
            message.success("✅ سند با موفقیت ثبت شد");
            form.resetFields();
            onSuccess();
        } catch (err) {
            console.error("❌ خطا در ثبت سند", err);
            message.error("❌ خطا در ثبت سند");
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
            style={{ overflow: "visible" }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ documentDate: moment() }}
            >
                <Form.Item label="سرویس">
                    <Input value={serviceName || "—"} disabled />
                </Form.Item>

                <Form.Item label="واحد">
                    <Input value={unitName || "—"} disabled />
                </Form.Item>

                <Form.Item label="شماره بایگانی">
                    <Input value={archiveNumber ?? "در حال دریافت..."} disabled />
                </Form.Item>

                <Form.Item label="تاریخ بایگانی">
                    <DatePicker
                        isGregorian={false}
                        timePicker={false}
                        inputFormat="jYYYY/jMM/jDD"
                        value={archiveDate}
                        onChange={(value) => setArchiveDate(value)}
                        inputProps={{ readOnly: true }}
                        placeholder="انتخاب تاریخ بایگانی"
                    />
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
                    <Input placeholder="مثلاً: ۱۲۵" />
                </Form.Item>

                <Form.Item
                    name="documentDate"
                    label="تاریخ سند"
                    rules={[{ required: true, message: "تاریخ سند الزامی است" }]}
                >
                    <DatePicker
                        isGregorian={false}
                        timePicker={false}
                        inputFormat="jYYYY/jMM/jDD"
                        onChange={(value) => form.setFieldsValue({ documentDate: value })}
                        inputProps={{ readOnly: true }}
                        placeholder="انتخاب تاریخ سند"
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
