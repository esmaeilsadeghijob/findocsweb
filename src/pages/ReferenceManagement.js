import { Row, Col } from "antd";
import ClientManager from "../components/ClientManager";
import UnitManager from "../components/UnitManager";

function ReferenceManagement() {
    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
                <ClientManager />
            </Col>
            <Col xs={24} md={12}>
                <UnitManager />
            </Col>
        </Row>
    );
}

export default ReferenceManagement;
