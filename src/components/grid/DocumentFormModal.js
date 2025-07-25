import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    message,
    Button
} from "antd";
import moment from "moment-jalaali";
import {
    getPeriods,
    createDocument,
    getArchivePreview,
    checkDocumentExists
} from "../../api/api";
import { FileAddOutlined } from "@ant-design/icons";
import DatePicker from "react-datepicker2";

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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getPeriods()
            .then((res) => setPeriods(res.data))
            .catch(() => setPeriods([]));
    }, []);

    useEffect(() => {
        if (visible && unitId) {
            getArchivePreview(unitId)
                .then((res) => setArchiveNumber(res.data))
                .catch(() => setArchiveNumber(null));
        }
    }, [visible, unitId]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const selectedPeriod = periods.find(p => p.fiscalYear === values.fiscalYear);

            if (!selectedPeriod) {
                message.error("❗ سال مالی انتخاب‌شده معتبر نیست");
                setLoading(false);
                return;
            }

            const checkRes = await checkDocumentExists({
                unitId,
                periodId: selectedPeriod.id
            });

            if (checkRes?.data?.documentNumber) {
                message.warning(`❗ سندی با شماره "${checkRes.data.documentNumber}" در سال مالی "${selectedPeriod.fiscalYear}" قبلاً ثبت شده است.`);
                setLoading(false);
                return;
            }

            // if (checkRes?.data?.exists) {
            //     message.warning("⚠️ در این سال مالی برای این واحد قبلاً سند ثبت شده است. لطفاً بررسی کنید.");
            //     setLoading(false);
            //     return;
            // }

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
            message.error("❌ خطا در ثبت سند");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={visible}
            title="ثبت سند جدید"
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    انصراف
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<FileAddOutlined />}
                    onClick={handleSubmit}
                    loading={loading}
                >
                    ثبت سند
                </Button>
            ]}
            style={{ direction: "rtl" }}
        >
            <Form
                form={form}
                layout="horizontal"
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
                        inputProps={{ readOnly: true, style: { width: "100%" } }}
                        placeholder="انتخاب تاریخ"
                    />
                </Form.Item>

                <Form.Item
                    name="fiscalYear"
                    label="سال مالی"
                    rules={[{ required: true, message: "انتخاب سال مالی الزامی است" }]}
                >
                    <Select placeholder="انتخاب سال مالی">
                        {periods.map((p) => (
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
                    <Input />
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
                        inputProps={{ readOnly: true, style: { width: "100%" } }}
                        placeholder="انتخاب تاریخ"
                    />
                </Form.Item>

                <Form.Item name="description" label="شرح">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DocumentFormModal;
