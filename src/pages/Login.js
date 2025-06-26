import { Button, Form, Input, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { login } from "../api/api";
import { AuthContext } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login: loginContext } = useContext(AuthContext);

    const onFinish = async (values) => {
        try {
            const res = await login(values);
            loginContext(res.data.token);

            // ذخیره نقش از response
            localStorage.setItem("role", res.data.role);

            message.success("ورود موفق");
            navigate("/");
        } catch {
            message.error("نام کاربری یا رمز اشتباه است");
        }
    };

    return (
        <Card
            title="ورود به سامانه"
            style={{ maxWidth: 400, margin: "5rem auto" }}
        >
            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="username"
                    label="نام کاربری"
                    rules={[{ required: true, message: "نام کاربری الزامی است" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="رمز عبور"
                    rules={[{ required: true, message: "رمز عبور الزامی است" }]}
                >
                    <Input.Password />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>
                    ورود
                </Button>
                <Button type="link" block onClick={() => navigate("/register")}>
                    حساب ندارید؟ ثبت‌نام کنید
                </Button>
            </Form>
        </Card>
    );
}

export default Login;
