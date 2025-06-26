import ClientManager from "../components/ClientManager";
import UnitManager from "../components/UnitManager";
import PeriodManager from "../components/PeriodManager";
import ServiceManager from "../components/ServiceManager";

const boxStyle = {
    border: "1px solid #eee",
    borderRadius: 8,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    height: "100%",
};

function ReferenceManagement() {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                height: "100vh",
                gap: 24,
                padding: 24,
                boxSizing: "border-box",
            }}
        >
            <div style={boxStyle}>
                <ClientManager />
            </div>
            <div style={boxStyle}>
                <UnitManager />
            </div>
            <div style={boxStyle}>
                <PeriodManager />
            </div>
            <div style={boxStyle}>
                <ServiceManager />
            </div>
        </div>
    );
}

export default ReferenceManagement;
