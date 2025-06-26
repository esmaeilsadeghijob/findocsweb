import { Button, Form, Input, Card, message } from "antd";
import { register } from "../api";
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            await register(values);
            message.success("ثبت‌نام با موفقیت انجام شد؛ منتظر تأیید مدیر بمانید");
            navigate("/login");
        } catch {
            message.error("خطا در ثبت‌نام");
        }
    };

    return (
        <Card title="ثبت‌نام کاربر جدید" style={{ maxWidth: 400, margin: "5rem auto" }}>
            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item name="username" label="نام کاربری" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="password" label="رمز عبور" rules={[{ required: true }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item name="fullName" label="نام کامل">
                    <Input />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>ثبت‌نام</Button>
            </Form>
        </Card>
    );
}

export default Register;
