import {Button, Form, message, Modal, Select, Space,} from "antd";
import {useEffect, useState} from "react";
import {createClient, getIdentifiers, getServices, getUnits, updateClient,} from "../api/api";

function ClientCreateModal({ onClose, onSuccess, initialData = null }) {
    const [form] = Form.useForm();
    const [services, setServices] = useState([]);
    const [units, setUnits] = useState([]);
    const [identifiers, setIdentifiers] = useState([]);

    useEffect(() => {
        getServices().then((res) => setServices(res.data));
        getUnits().then((res) => setUnits(res.data));
        getIdentifiers().then((res) => setIdentifiers(res.data));
    }, []);

    useEffect(() => {
        if (initialData && units.length && services.length) {
            const matchedUnit = units.find(
                (u) => u.id === initialData.unitId || u.name === initialData.unitName
            );
            const matchedService = services.find(
                (s) => s.id === initialData.serviceId || s.name === initialData.serviceName
            );

            form.setFieldsValue({
                identifierCode: initialData.identifierCode,
                unitId: matchedUnit?.id,
                serviceId: matchedService?.id,
            });
        } else {
            form.resetFields();
        }
    }, [initialData, units, services, form]);

    const handleSubmit = async (values) => {
        try {
            if (initialData) {
                await updateClient(initialData.id, values);
                message.success("مشتری با موفقیت ویرایش شد");
            } else {
                await createClient(values);
                message.success("مشتری با موفقیت ثبت شد");
            }
            onSuccess?.();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "خطا در ذخیره مشتری";
            message.error(msg);
        }
    };

    return (
        <Modal
            open
            title={initialData ? "ویرایش مشتری" : "افزودن مشتری جدید"}
            onCancel={onClose}
            footer={null}
            centered
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ marginTop: 12 }}
            >
                <Form.Item
                    name="identifierCode"
                    label="شناسه مشتری"
                    rules={[{ required: true, message: "انتخاب شناسه الزامی است" }]}
                >
                    <Select
                        showSearch
                        placeholder="انتخاب شناسه مشتری"
                        options={identifiers.map((i) => ({
                            value: i.code,
                            label: i.code,
                        }))}
                        allowClear
                    />
                </Form.Item>

                <Form.Item
                    name="serviceId"
                    label="سرویس"
                    rules={[{ required: true, message: "انتخاب سرویس الزامی است" }]}
                >
                    <Select
                        showSearch
                        placeholder="انتخاب سرویس"
                        options={services.map((s) => ({
                            value: s.id,
                            label: s.name,
                        }))}
                        allowClear
                    />
                </Form.Item>

                <Form.Item
                    name="unitId"
                    label="واحد"
                    rules={[{ required: true, message: "انتخاب واحد الزامی است" }]}
                >
                    <Select
                        showSearch
                        placeholder="انتخاب واحد"
                        options={units.map((u) => ({
                            value: u.id,
                            label: u.name,
                        }))}
                        allowClear
                    />
                </Form.Item>

                <Space style={{ display: "flex", justifyContent: "end" }}>
                    <Button onClick={onClose}>انصراف</Button>
                    <Button type="primary" htmlType="submit">
                        ذخیره
                    </Button>
                </Space>
            </Form>
        </Modal>
    );
}

export default ClientCreateModal;
