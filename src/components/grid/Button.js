import React from "react";

const AppButton = ({ title, color = "blue", onClick, className = "" }) => {
    const bg = color === "green" ? "#52c41a" : "#1890ff";

    return (
        <button
            className={className}
            onClick={onClick}
            style={{
                backgroundColor: bg,
                color: "#fff",
                padding: "6px 12px",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                cursor: "pointer",
            }}
        >
            {title}
        </button>
    );
};

export default AppButton;
