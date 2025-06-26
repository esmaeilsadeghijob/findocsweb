import { Button, Form, Input, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

function Login() {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const res = await login(values);
            localStorage.setItem("token", res.data.token);
            message.success("ورود موفق");
            navigate("/");
        } catch {
            message.error("نام کاربری یا رمز اشتباه است");
        }
    };

    return (
        <Card title="ورود به سامانه" style={{ maxWidth: 400, margin: "5rem auto" }}>
            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item name="username" label="نام کاربری" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="password" label="رمز عبور" rules={[{ required: true }]}>
                    <Input.Password />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>ورود</Button>
                <Button type="link" block onClick={() => navigate("/register")}>حساب ندارید؟ ثبت‌نام کنید</Button>
            </Form>
        </Card>
    );
}

export default Login;
