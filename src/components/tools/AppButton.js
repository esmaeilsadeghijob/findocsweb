import { Tooltip } from "antd";
import { Link } from "react-router-dom";
import classNames from "classnames";

const AppButton = ({
                       title,
                       icon,
                       onClick = () => {},
                       color = "blue",
                       size = "middle",
                       variant = "solid",
                       tooltip = false,
                       tooltipTitle,
                       className = "",
                       link,
                       style
                   }) => {
    const baseClasses = classNames(
        "flex items-center justify-center gap-2 rounded px-3 py-1.5 text-sm transition-all",
        {
            "bg-blue-500 text-white hover:bg-blue-600": color === "blue" && variant === "solid",
            "bg-green-500 text-white hover:bg-green-600": color === "green" && variant === "solid",
            "bg-red-500 text-white hover:bg-red-600": color === "danger" && variant === "solid",
            "bg-purple-500 text-white hover:bg-purple-600": color === "purple" && variant === "solid",
            "text-gray-700 hover:text-black": color === "default" && variant === "text",
            "border border-gray-300 text-gray-700 hover:border-gray-500": variant === "outline",
        },
        {
            "text-xs px-2 py-1": size === "small",
            "text-sm px-3 py-1.5": size === "middle",
            "text-base px-4 py-2": size === "large"
        },
        className
    );

    const ButtonContent = (
        <div style={style} className={baseClasses} onClick={onClick}>
            {icon && <span>{icon}</span>}
            {title && <span>{title}</span>}
        </div>
    );

    return tooltip && tooltipTitle ? (
        <Tooltip title={tooltipTitle}>
            {link ? <Link to={link}>{ButtonContent}</Link> : ButtonContent}
        </Tooltip>
    ) : link ? (
        <Link to={link}>{ButtonContent}</Link>
    ) : (
        ButtonContent
    );
};

export default AppButton;
