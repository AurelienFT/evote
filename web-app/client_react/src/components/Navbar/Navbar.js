import React from "react";
import {useHistory} from "react-router-dom";
import {Row, Col, Button} from "antd";
import { useCookies } from 'react-cookie';

function Navbar() {
    const history = useHistory();
    const [cookies, setCookie, removeCookie] = useCookies(['voterData']);

	return (
		<Row style={{backgroundColor: "#7D5EFF", fontSize: "20px"}}>
			<Col span={12}>
				
			</Col>
			<Col span={12} style={{fontSize: "20px", textAlign: "right", fontFamily: "Montserrat"}} onClick={() => {
                removeCookie("voterdata");
                history.push("/");
            }}>
            <Button type="primary" shape="round" >
          Disconnect
        </Button>
			</Col>
		</Row>
	);
};

export default Navbar;
