import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    DatePicker,
    Select,
    message,
} from "antd";
import moment from "moment-jalaali";
import { updateDocument, getPeriods } from "../../api/api";

const { Option } = Select;

const EditDocumentModal = ({
                               visible,
                               onCancel,
                               onSuccess,
                               editData,
                           }) => {
    const [form] = Form.useForm();
    const [periods, setPeriods] = useState([]);

    useEffect(() => {
        // واکشی سال‌های مالی از سرور
        getPeriods()
            .then((res) => setPeriods(res.data || []))
            .catch(() => setPeriods([]));
    }, []);

    useEffect(() => {
        if (editData) {
            form.setFieldsValue({
                documentNumber: editData.documentNumber ?? "",
                documentDate: editData.documentDate ? moment(editData.documentDate) : null,
                description: editData.description ?? "",
                nature: editData.nature ?? "",
                periodId: editData.periodId ?? null,
            });
        }
    }, [editData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                documentDate: values.documentDate?.format("YYYY-MM-DD"),
            };

            await updateDocument(editData.id, payload);
            message.success(" تغییرات سند با موفقیت ثبت شد");
            onSuccess?.();
        } catch (err) {
            console.error("❌ خطا در بروزرسانی سند:", err);
            message.error("خطا در ثبت تغییرات سند");
        }
    };

    return (
        <Modal
            title="ویرایش سند"
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="ثبت تغییرات"
            cancelText="انصراف"
        >
            <Form layout="vertical" form={form}>
                <div style={{ marginBottom: 16, fontSize: "0.9rem", color: "#555" }}>
                    <p><strong>سرویس:</strong> {editData.serviceName ?? "—"}</p>
                    <p><strong>واحد:</strong> {editData.unitName ?? "—"}</p>
                </div>

                <Form.Item
                    name="periodId"
                    label="سال مالی"
                    rules={[{ required: true, message: "انتخاب سال مالی الزامی است" }]}
                >
                    <Select
                        placeholder="انتخاب سال مالی"
                        showSearch
                        optionFilterProp="children"
                    >
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
                    <Input />
                </Form.Item>

                <Form.Item
                    name="documentDate"
                    label="تاریخ سند"
                    rules={[{ required: true, message: "تاریخ سند الزامی است" }]}
                >
                    <DatePicker format="jYYYY/jMM/jDD" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="شرح سند"
                    rules={[{ required: true, message: "شرح سند الزامی است" }]}
                >
                    <Input.TextArea rows={3} />
                </Form.Item>

                {/*<Form.Item name="nature" label="نوع سند">*/}
                {/*    <Select allowClear placeholder="انتخاب نوع سند">*/}
                {/*        <Option value="عمومی">عمومی</Option>*/}
                {/*        <Option value="محرمانه">محرمانه</Option>*/}
                {/*        <Option value="فوری">فوری</Option>*/}
                {/*    </Select>*/}
                {/*</Form.Item>*/}
            </Form>
        </Modal>
    );
};

export default EditDocumentModal;
