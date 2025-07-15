import {Button, Form, Input, message} from "antd";
import {useContext} from "react";
import {login} from "../api/api";
import {AuthContext} from "../context/AuthContext";
import {useNavigate} from "react-router-dom";
import "./AuthPage.css";

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
        <div className="auth-container">
            {/* 📝 فرم ورود سمت چپ */}
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

                        <Button
                            type="primary"
                            htmlType="submit"
                            className="auth-button small-button"
                        >
                            ورود به سامانه
                        </Button>

                        <Button
                            type="link"
                            block
                            onClick={() => navigate("/register")}
                            className="auth-link"
                        >
                            حساب ندارید؟ ثبت‌نام کنید
                        </Button>
                    </Form>
                </div>
            </div>

            {/* 🖼 تصویر سمت راست با ارتفاع کامل */}
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

export default Login;
