import { Button, Form, Input, message } from "antd";
import { register } from "../api/api";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

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
        <div className="auth-container">
            {/* 📋 فرم ثبت‌نام سمت چپ */}
            <div className="auth-left">
                <div className="form-wrapper">
                    <h1 className="auth-title">بایگانی اسناد</h1>
                    <p className="auth-subtitle">سامانه بایگانی اسناد</p>

                    <Form layout="vertical" onFinish={onFinish} className="auth-form">
                        <Form.Item
                            name="username"
                            label="نام کاربری"
                            rules={[{ required: true, message: "نام کاربری الزامی است" }]}
                        >
                            <Input
                                className="auth-input small-input"
                                style={{ textAlign: "left" }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="رمز عبور"
                            rules={[{ required: true, message: "رمز عبور الزامی است" }]}
                        >
                            <Input.Password
                                className="auth-input small-input"
                                style={{ textAlign: "left" }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="fullName"
                            label="نام کامل"
                            rules={[{ required: true, message: "نام کامل الزامی است" }]}
                        >
                            <Input
                                className="auth-input small-input"
                                style={{ textAlign: "left" }}
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            className="auth-button small-button"
                        >
                            ثبت‌نام
                        </Button>

                        <Button
                            type="link"
                            block
                            onClick={() => navigate("/login")}
                            className="auth-link"
                        >
                            قبلاً حساب ساخته‌اید؟ وارد شوید
                        </Button>
                    </Form>
                </div>
            </div>

            {/* 🖼 تصویر متحرک سمت راست */}
            <div className="auth-right">
                <img
                    src={require("../assets/img/doc.gif")}
                    alt="Document animation"
                    className="auth-gif"
                />
            </div>
        </div>
    );
}

export default Register;
