import React from "react";

const TabelActionBtn = ({ title, type, onClick }) => {
    const styles = {
        edit: "#1890ff",
        delete: "#ff4d4f",
        view: "#52c41a",
        restore: "#faad14",
    };

    return (
        <button
            onClick={onClick}
            style={{
                backgroundColor: styles[type] || "#888",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                border: "none",
                cursor: "pointer",
            }}
        >
            {title}
        </button>
    );
};

export default TabelActionBtn;
