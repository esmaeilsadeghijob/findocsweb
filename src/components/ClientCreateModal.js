import { Button, Form, message, Modal, Select, Space } from "antd";
import { useEffect, useState } from "react";
import {createClient, getClients, getIdentifiers, getServices, getUnits, updateClient} from "../api/api";

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
                message.success(" مشتری با موفقیت ویرایش شد");
            } else {
                const allClients = await getClients();

                const isDuplicate = allClients.data.some(
                    (c) =>
                        c.identifierCode === values.identifierCode &&
                        c.unit?.id === values.unitId &&
                        c.service?.id === values.serviceId &&
                        c.active !== false
                );

                if (isDuplicate) {
                    message.warning(
                        " امکان ثبت وجود ندارد: مشتری با این شناسه، سرویس و واحد قبلاً ثبت شده است."
                    );
                    return;
                }

                await createClient(values);
                message.success(" مشتری با موفقیت ثبت شد");
            }

            onSuccess?.();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.response?.data || "";

            if (typeof msg === "string" && msg.includes("مشتری با این اطلاعات وجود دارد")) {
                message.warning(" ثبت مشتری ناممکن است: ترکیب شناسه، سرویس و واحد از قبل ثبت شده");
            } else if (msg === "") {
                message.warning(" ثبت مشتری انجام نشد — احتمالاً ترکیب اطلاعات تکراری است.");
            } else {
                message.error(" خطا در ذخیره مشتری");
            }
        }
    };

    return (
        <Modal
            open
            title={
                <div style={{ fontFamily: "FarBaseet", fontSize: "1.6rem", textAlign: "center" }}>
                    {initialData ? "ویرایش مشتری" : "افزودن مشتری جدید"}
                </div>
            }
            onCancel={onClose}
            footer={null}
            centered
            style={{ fontFamily: "FarBaseet" }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ marginTop: 12, fontFamily: "FarBaseet" }}
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
                        style={{ width: "100%" }}
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
                        style={{ width: "100%" }}
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
                        style={{ width: "100%" }}
                    />
                </Form.Item>

                {/* ✅ دکمه‌ها وسط فرم */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem", gap: "1rem" }}>
                    <Button onClick={onClose}>انصراف</Button>
                    <Button type="primary" htmlType="submit">
                        ذخیره
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

export default ClientCreateModal;
