import {
    Modal,
    Form,
    Input,
    Select,
    Button,
    message,
} from "antd";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useEffect, useState } from "react";
import {
    createDocument,
    getClients,
    getUnits,
    getServices,
    getPeriods,
} from "../api/api";

function AddDocumentModal({ onSuccess, onCancel }) {
    const [form] = Form.useForm();
    const [clients, setClients] = useState([]);
    const [units, setUnits] = useState([]);
    const [services, setServices] = useState([]);
    const [periods, setPeriods] = useState([]);

    useEffect(() => {
        getClients()
            .then((res) => setClients(res.data))
            .catch(() => setClients([]));

        getUnits()
            .then((res) => setUnits(res.data))
            .catch(() => setUnits([]));

        getServices()
            .then((res) => setServices(res.data))
            .catch(() => setServices([]));

        getPeriods()
            .then((res) => setPeriods(res.data))
            .catch(() => setPeriods([]));
    }, []);

    const onFinish = async (values) => {
        try {
            const date = values.documentDate?.toDate?.();
            const doc = {
                ...values,
                documentDate: date?.toISOString().split("T")[0] || null,
            };
            await createDocument(doc);
            message.success("سند ثبت شد");
            onSuccess();
        } catch {
            message.error("ثبت سند با خطا مواجه شد");
        }
    };

    return (
        <Modal
            open
            title="افزودن سند جدید"
            onCancel={onCancel}
            footer={null}
            centered
        >
            <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
                style={{ marginTop: "1rem" }}
            >
                <Form.Item
                    name="clientId"
                    label="مشتری"
                    rules={[{ required: true, message: "انتخاب مشتری الزامی است" }]}
                >
                    <Select
                        size="large"
                        placeholder="انتخاب مشتری"
                        options={clients.map((c) => ({ label: c.name, value: c.id }))}
                    />
                </Form.Item>

                <Form.Item
                    name="unitId"
                    label="واحد مربوطه"
                    rules={[{ required: true, message: "انتخاب واحد الزامی است" }]}
                >
                    <Select
                        size="large"
                        placeholder="انتخاب واحد"
                        options={units.map((u) => ({ label: u.name, value: u.id }))}
                    />
                </Form.Item>

                <Form.Item
                    name="serviceId"
                    label="سرویس مربوطه"
                    rules={[{ required: true, message: "انتخاب سرویس الزامی است" }]}
                >
                    <Select
                        size="large"
                        placeholder="انتخاب سرویس"
                        options={services.map((s) => ({ label: s.name, value: s.id }))}
                    />
                </Form.Item>

                <Form.Item
                    name="documentNumber"
                    label="شماره سند"
                    rules={[{ required: true, message: "شماره سند الزامی است" }]}
                >
                    <Input
                        size="large"
                        style={{ textAlign: "left", height: 48, fontSize: "1rem" }}
                    />
                </Form.Item>

                <Form.Item
                    name="periodId"
                    label="سال مالی"
                    rules={[{ required: true, message: "انتخاب سال مالی الزامی است" }]}
                >
                    <Select
                        size="large"
                        placeholder="انتخاب سال مالی"
                        options={periods.map((p) => ({
                            label: p.fiscalYear,
                            value: p.id,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="documentDate"
                    label="تاریخ سند"
                    rules={[{ required: true, message: "تاریخ سند الزامی است" }]}
                >
                    <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        calendarPosition="bottom-center"
                        style={{
                            width: "100%",
                            height: "48px",
                            fontSize: "1rem",
                            textAlign: "center",
                        }}
                    />
                </Form.Item>

                <Form.Item name="description" label="شرح سند">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="dashed"
                        htmlType="submit"
                        block
                        size="large"
                        style={{
                            backgroundColor: "rgb(58,59,63)", // نوک‌مدادی روشن
                            color: "#ececed",              // رنگ نوشته واضح
                            border: "1px solid #bbb",   // حاشیه لطیف
                            height: 48,
                            fontSize: "1rem",
                            fontWeight: "bold",
                        }}
                    >
                        ثبت سند
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AddDocumentModal;
