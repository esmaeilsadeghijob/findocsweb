import React, {useEffect, useState} from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    message,
    Button, AutoComplete
} from "antd";
import moment from "moment-jalaali";
import {
    getPeriods,
    createDocument,
    getArchivePreview,
    checkDocumentExists,
    getFrequentDocumentsDescriptions
} from "../../api/api";
import {FileAddOutlined} from "@ant-design/icons";
import DatePicker from "react-datepicker2";

moment.loadPersian({usePersianDigits: true, dialect: "persian-modern"});

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
    const [descriptions, setDescriptions] = useState([]);

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

    useEffect(() => {
        if (visible) {
            getFrequentDocumentsDescriptions()
                .then((res) => {
                    if (Array.isArray(res.data)) {
                        setDescriptions(res.data);
                    } else {
                        console.warn("پاسخ شرح پرتکرار معتبر نبود", res.data);
                        setDescriptions([]);
                    }
                })
                .catch((err) => {
                    console.error("خطا در دریافت شرح‌های پرتکرار:", err);
                    message.warning("❗ امکان دریافت شرح‌های پرتکرار وجود ندارد");
                    setDescriptions([]);
                });
        }
    }, [visible]);

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
                periodId: selectedPeriod.id,
                documentNumber: values.documentNumber
            });

            if (checkRes?.data?.documentNumber) {
                message.warning(`❗ سندی با شماره "${checkRes.data.documentNumber}" در سال مالی "${selectedPeriod.fiscalYear}" قبلاً ثبت شده است.`);
                setLoading(false);
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
                    icon={<FileAddOutlined/>}
                    onClick={handleSubmit}
                    loading={loading}
                >
                    ثبت سند
                </Button>
            ]}
            style={{direction: "rtl"}}
        >
            <Form
                form={form}
                layout="horizontal"
                initialValues={{documentDate: moment()}}
                labelCol={{span: 6}}
                wrapperCol={{span: 18}}
                style={{maxWidth: 700}}
            >
                <Form.Item label="سرویس">
                    <Input value={serviceName || "—"} disabled/>
                </Form.Item>

                <Form.Item label="واحد">
                    <Input value={unitName || "—"} disabled/>
                </Form.Item>

                <Form.Item label="شماره بایگانی">
                    <Input value={archiveNumber ?? "در حال دریافت..."} disabled/>
                </Form.Item>

                <Form.Item label="تاریخ بایگانی">
                    <div style={{ maxWidth: "160px", display: "inline-block" }}>
                        <DatePicker
                            isGregorian={false}
                            timePicker={false}
                            inputFormat="jYYYY/jMM/jDD"
                            value={archiveDate}
                            onChange={(value) => setArchiveDate(value)}
                            inputProps={{
                                readOnly: true,
                                style: {
                                    padding: "4px 8px",
                                    fontSize: "13px",
                                    borderRadius: 6,
                                    border: "1px solid #d9d9d9"
                                }
                            }}
                            placeholder="انتخاب تاریخ بایگانی"
                        />
                    </div>
                </Form.Item>

                <Form.Item
                    name="fiscalYear"
                    label="سال مالی"
                    rules={[{required: true, message: "انتخاب سال مالی الزامی است"}]}
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
                    rules={[{required: true, message: "شماره سند را وارد کنید"}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    name="documentDate"
                    label="تاریخ سند"
                    rules={[{required: true, message: "تاریخ سند الزامی است"}]}
                >
                    <DatePicker
                        size="small"
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
                        placeholder="انتخاب تاریخ سند"
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="شرح"
                    style={{marginBottom: 4}}
                >
                    <AutoComplete
                        options={descriptions.map((desc) => ({value: desc}))}
                        filterOption={(inputValue, option) =>
                            option?.value?.toLowerCase().includes(inputValue?.toLowerCase()) ||
                            option?.value?.toLowerCase().startsWith(inputValue?.toLowerCase())
                        }
                        onChange={(val) => form.setFieldsValue({description: val})}
                        placeholder="شرح را وارد یا انتخاب کنید"
                        style={{width: "100%"}}
                    >
                        <Input.TextArea rows={3} readOnly={false}/>
                    </AutoComplete>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DocumentFormModal;
