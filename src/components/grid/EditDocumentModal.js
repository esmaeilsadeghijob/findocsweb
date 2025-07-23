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
import { updateDocument, getPeriods } from "../../api/api";
import DatePicker from "react-datepicker2";
import { FileAddOutlined } from "@ant-design/icons";

moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });

const { Option } = Select;

const EditDocumentModal = ({
                               visible,
                               onCancel,
                               onSuccess,
                               editData
                           }) => {
    const [form] = Form.useForm();
    const [periods, setPeriods] = useState([]);
    const [archiveDate, setArchiveDate] = useState(moment());

    useEffect(() => {
        getPeriods()
            .then((res) => setPeriods(res.data || []))
            .catch(() => setPeriods([]));
    }, []);

    useEffect(() => {
        if (editData) {
            const docDate = moment(Number(editData.documentTimestamp));
            form.setFieldsValue({
                documentNumber: editData.documentNumber ?? "",
                documentDate: docDate.isValid() ? docDate : null,
                description: editData.description ?? "",
                periodId: editData.periodId ?? null
            });
            setArchiveDate(editData.archiveDate ? moment(Number(editData.archiveDate)) : moment());
        }
    }, [editData]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                archiveDate: archiveDate?.valueOf(),
                documentTimestamp: values.documentDate?.valueOf()
            };

            await updateDocument(editData.id, payload);
            message.success("✅ تغییرات سند با موفقیت ثبت شد");
            onSuccess?.();
        } catch (err) {
            message.error("❌ خطا در ثبت تغییرات سند");
        }
    };

    return (
        <Modal
            title="ویرایش سند"
            open={visible}
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
                <Button
                    key="submit"
                    type="primary"
                    icon={<FileAddOutlined />}
                    onClick={handleSubmit}
                >
                    ثبت تغییرات
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
                style={{ maxWidth: 700 }}
            >
                <Form.Item label="سرویس">
                    <Input value={editData.serviceName ?? "—"} disabled />
                </Form.Item>

                <Form.Item label="واحد">
                    <Input value={editData.unitName ?? "—"} disabled />
                </Form.Item>

                <Form.Item label="شماره بایگانی">
                    <Input value={editData.archiveNumber ?? "—"} disabled />
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
                    name="periodId"
                    label="سال مالی"
                    rules={[{ required: true, message: "انتخاب سال مالی الزامی است" }]}
                >
                    <Select placeholder="انتخاب سال مالی">
                        {periods.map((p) => (
                            <Option key={p.id} value={p.id}>
                                {p.fiscalYear}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="documentNumber"
                    label="شماره سند"
                    rules={[{ required: true, message: "شماره سند الزامی است" }]}
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

                <Form.Item
                    name="description"
                    label="شرح سند"
                    rules={[{ required: true, message: "شرح سند الزامی است" }]}
                >
                    <Input.TextArea rows={3} placeholder="توضیحات اختیاری..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditDocumentModal;
