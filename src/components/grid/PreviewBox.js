import React from "react";
import { Image } from "antd";

const PreviewBox = ({ file }) => {
    const url = URL.createObjectURL(file);

    return (
        <div
            style={{
                width: 160,
                height: 160,
                border: "1px solid #ccc",
                borderRadius: 8,
                overflow: "hidden",
                background: "#fafafa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {file.type.startsWith("image/") ? (
                <Image
                    src={url}
                    preview={false}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            ) : file.type === "application/pdf" ? (
                <iframe
                    src={url}
                    title="PDF Preview"
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                />
            ) : (
                <span style={{ fontSize: 32 }}>📁</span>
            )}
        </div>
    );
};

export default PreviewBox;
