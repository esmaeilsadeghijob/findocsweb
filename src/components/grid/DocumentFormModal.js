import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    message,
    Button,
    DatePicker as AntDatePicker,
    Row,
    Col
} from "antd";
import moment from "moment-jalaali";
import { getPeriods, createDocument, getArchivePreview } from "../../api/api";
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
            const values = await form.validateFields();
            const selectedPeriod = periods.find((p) => p.fiscalYear === values.fiscalYear);
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
        }
    };

    return (
        <Modal
            open={visible}
            title="ثبت سند جدید"
            onCancel={onCancel}
            footer={[
                <Button
                    key="cancel"
                    onClick={onCancel}
                    style={{
                        borderRadius: 6,
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #d9d9d9"
                    }}
                >
                    انصراف
                </Button>,
                <Button key="submit" type="primary" icon={<FileAddOutlined />} onClick={handleSubmit}>
                    ثبت سند
                </Button>
            ]}
            style={{ direction: "rtl" }}
            bodyStyle={{ padding: "24px 32px", background: "#fafafa", borderRadius: 8 }}
        >
            <Form
                form={form}
                layout="horizontal"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                initialValues={{ documentDate: moment() }}
                style={{ maxWidth: 700 }}
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
                        inputProps={{
                            readOnly: true,
                            style: {
                                width: "100%",
                                padding: "8px",
                                borderRadius: 6,
                                border: "1px solid #d9d9d9"
                            }
                        }}
                        placeholder="انتخاب تاریخ بایگانی"
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
                        inputProps={{
                            readOnly: true,
                            style: {
                                width: "100%",
                                padding: "8px",
                                borderRadius: 6,
                                border: "1px solid #d9d9d9"
                            }
                        }}
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
