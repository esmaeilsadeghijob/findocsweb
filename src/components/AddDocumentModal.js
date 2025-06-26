import {
    Modal,
    Form,
    Input,
    Select,
    Button,
    message
} from "antd";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useEffect, useState } from "react";
import {
    createDocument,
    getClients,
    getProjects,
    getUnits
} from "../api/api";

function AddDocumentModal({ onSuccess, onCancel }) {
    const [form] = Form.useForm();
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [units, setUnits] = useState([]);

    useEffect(() => {
        getClients()
            .then((res) => setClients(res.data))
            .catch(() => setClients([]));

        getProjects()
            .then((res) => setProjects(res.data))
            .catch(() => setProjects([]));

        getUnits()
            .then((res) => setUnits(res.data))
            .catch(() => setUnits([]));
    }, []);

    const onFinish = async (values) => {
        try {
            const date = values.documentDate?.toDate?.();
            const doc = {
                ...values,
                documentDate: date?.toISOString().split("T")[0] || null
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
                        options={clients.map((c) => ({
                            label: c.name,
                            value: c.id
                        }))}
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
                        options={units.map((u) => ({
                            label: u.name,
                            value: u.id
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="projectId"
                    label="پروژه"
                    rules={[{ required: true, message: "انتخاب پروژه الزامی است" }]}
                >
                    <Select
                        size="large"
                        placeholder="انتخاب پروژه"
                        options={projects.map((p) => ({
                            label: p.name,
                            value: p.id
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="documentNumber"
                    label="شماره سند"
                    rules={[{ required: true, message: "شماره سند الزامی است" }]}
                >
                    <Input
                        size="large"
                        style={{
                            textAlign: "left",
                            height: 48,
                            fontSize: "1rem"
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="fiscalYear"
                    label="سال مالی"
                    rules={[{ required: true, message: "سال مالی الزامی است" }]}
                >
                    <Input
                        size="large"
                        style={{
                            textAlign: "left",
                            height: 48,
                            fontSize: "1rem"
                        }}
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
                            textAlign: "center"
                        }}
                    />
                </Form.Item>

                <Form.Item name="description" label="شرح سند">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        style={{ height: 48, fontSize: "1rem" }}
                    >
                        ثبت سند
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AddDocumentModal;
