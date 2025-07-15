import AppButton from "../../../button/Button.js";
import { LuTrash2 } from "react-icons/lu";
import { TbSitemap } from "react-icons/tb";
import { BsPrinter } from "react-icons/bs";
import { FiEdit2 } from "react-icons/fi";
import { FaCheck } from "react-icons/fa6";

const TabelActionBtn = ({
                            onClick = () => {},
                            title,
                            type,
                            link,
                            size = "middle"
                        }) => {
    const props = (() => {
        switch (type) {
            case "delete":
                return {
                    class: "!border !border-danger-clarity",
                    color: "danger",
                    icon: <span className="text-base translate-y-[3px]"><LuTrash2 /></span>
                };
            case "edit":
                return {
                    class: "!border !border-success-clarity",
                    color: "green",
                    icon: <span className="text-base translate-y-[3px]"><FiEdit2 /></span>
                };
            case "print":
                return {
                    class: "!border !border-purple-200",
                    color: "purple",
                    icon: <span className="text-base translate-y-[3px]"><BsPrinter /></span>
                };
            case "print-2":
                return {
                    class: "!border !border-primary-clarity",
                    color: "blue",
                    icon: <span className="text-base translate-y-[3px]"><BsPrinter /></span>
                };
            case "subset":
                return {
                    class: "!border !border-primary-clarity",
                    color: "blue",
                    icon: <span className="text-base translate-y-[3px]"><TbSitemap /></span>
                };
            case "checkbox":
                return {
                    class: "!border !border-primary-clarity",
                    color: "blue",
                    icon: <span className="text-base translate-y-[3px]"><FaCheck /></span>
                };
            default:
                return {
                    class: "",
                    color: "default",
                    icon: null
                };
        }
    })();

    return (
        <AppButton
            className={props.class}
            color={props.color}
            onClick={onClick}
            size={size}
            link={link}
            icon={props.icon}
            tooltip
            tooltipTitle={title}
            style={{ scale: "0.9" }}
        />
    );
};

export default TabelActionBtn;
