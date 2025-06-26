import { Button, Form, Input, Card, message } from "antd";
import { register } from "../api/api";
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            await register(values);
            message.success("ثبت‌نام موفق بود");
            navigate("/login");
        } catch {
            message.error("خطا در ثبت‌نام");
        }
    };

    return (
        <Card
            title="ثبت‌نام کاربر جدید"
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

                <Form.Item
                    name="fullName"
                    label="نام کامل"
                    rules={[{ required: true, message: "نام کامل الزامی است" }]}
                >
                    <Input
                        size="large"
                        style={{ textAlign: "left", fontSize: "1rem", height: "48px" }}
                    />
                </Form.Item>

                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    style={{ height: "48px", fontSize: "1rem" }}
                >
                    ثبت‌نام
                </Button>

                <Button
                    type="link"
                    block
                    size="large"
                    style={{ fontSize: "1rem", paddingTop: "1rem" }}
                    onClick={() => navigate("/login")}
                >
                    قبلاً حساب ساخته‌اید؟ وارد شوید
                </Button>
            </Form>
        </Card>
    );
}

export default Register;
