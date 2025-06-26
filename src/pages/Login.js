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
            localStorage.setItem("role", res.data.role);
            message.success("ورود موفق");
            navigate("/");
        } catch {
            message.error("نام کاربری یا رمز عبور اشتباه است");
        }
    };

    return (
        <Card
            title="ورود به سامانه"
            headStyle={{ textAlign: "center", fontSize: "1.4rem" }}
            style={{
                maxWidth: 520,
                padding: "2rem",
                margin: "6rem auto",
                boxShadow: "0 0 12px rgba(0,0,0,0.08)",
            }}
        >
            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="username"
                    label="نام کاربری"
                    rules={[{ required: true, message: "نام کاربری الزامی است" }]}
                >
                    <Input
                        size="large"
                        style={{ textAlign: "left", fontSize: "1rem", height: "48px" }}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="رمز عبور"
                    rules={[{ required: true, message: "رمز عبور الزامی است" }]}
                >
                    <Input.Password
                        size="large"
                        style={{
                            direction: "ltr",
                            textAlign: "left",
                            fontSize: "1rem",
                            height: "48px",
                        }}
                        addonBefore={<span style={{ width: 0 }} />}
                    />
                </Form.Item>

                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    style={{ height: "48px", fontSize: "1rem" }}
                >
                    ورود
                </Button>

                <Button
                    type="link"
                    block
                    size="large"
                    style={{ fontSize: "1rem", paddingTop: "1rem" }}
                    onClick={() => navigate("/register")}
                >
                    حساب ندارید؟ ثبت‌نام کنید
                </Button>
            </Form>
        </Card>
    );
}

export default Login;
