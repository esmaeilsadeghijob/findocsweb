import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

function NotFound() {
    const navigate = useNavigate();

    return (
        <Result
            status="404"
            title="۴۰۴"
            subTitle="صفحه مورد نظر یافت نشد"
            extra={
                <Button type="primary" onClick={() => navigate("/")}>
                    بازگشت به صفحه اصلی
                </Button>
            }
        />
    );
}

export default NotFound;
