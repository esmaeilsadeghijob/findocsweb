import { Modal, Form, Input, Select, Button, Space, message } from "antd";
import { createDocument, getUnits, getServices, getPeriods } from "../api/api";
import { useEffect, useState } from "react";

function AddDocumentModal({ clientId, onSuccess, onCancel }) {
    const [form] = Form.useForm();
    const [units, setUnits] = useState([]);
    const [services, setServices] = useState([]);
    const [periods, setPeriods] = useState([]);

    useEffect(() => {
        getUnits().then((res) => setUnits(res.data));
        getServices().then((res) => setServices(res.data));
        getPeriods().then((res) => setPeriods(res.data));
    }, []);

    const handleSubmit = async (values) => {
        try {
            await createDocument({ ...values, clientId });
            message.success("سند ایجاد شد");
            onSuccess?.();
        } catch {
            message.error("خطا در ساخت سند");
        }
    };

    return (
        <Modal
            open
            title="افزودن سند"
            onCancel={onCancel}
            onOk={() => form.submit()}
            okText="ذخیره"
            cancelText="انصراف"
            centered
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    name="documentNumber"
                    label="شماره سند"
                    rules={[{ required: true, message: "ضروری" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="periodId"
                    label="سال مالی"
                    rules={[{ required: true }]}
                >
                    <Select
                        placeholder="انتخاب سال مالی"
                        options={periods.map((p) => ({
                            value: p.id,
                            label: p.fiscalYear,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="unitId"
                    label="واحد"
                    rules={[{ required: true }]}
                >
                    <Select
                        placeholder="انتخاب واحد"
                        options={units.map((u) => ({
                            value: u.id,
                            label: u.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="serviceId"
                    label="سرویس"
                    rules={[{ required: true }]}
                >
                    <Select
                        placeholder="انتخاب سرویس"
                        options={services.map((s) => ({
                            value: s.id,
                            label: s.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item name="description" label="شرح">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AddDocumentModal;
