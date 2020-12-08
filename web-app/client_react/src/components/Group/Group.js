import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Typography, Card, Input, Row, Col, List, Button } from 'antd';
import { queryByKey } from "../../services/apiService";
import { Redirect, useParams } from 'react-router-dom';

import './Group.css';
import { useState } from 'react';

const { Title, Text } = Typography;
const { Search } = Input;

function Group() {
    const [cookies, setCookie, removeCookie] = useCookies(['voterData']);
    const [elections, setElections] = useState([]);
    const { groupId } = useParams();
    console.log()
    //TODO : Add check if user is in group
    useEffect(() => {
        async function getElections() {
            if (!cookies['voterdata'] || !cookies['voterdata'].voterId) {
                return <Redirect to={{
                    pathname: "/",
                }} />
            }
            //TODO: Error management
            let value = await queryByKey(groupId);
            let group = value.data;
            if (elections.length === 0) {
                let index = 0;
                let electionsTemp = [];
                for (index = 0; index < group.electionsId.length; ++index) {
                    let value = await queryByKey(group.electionsId[index]);
                    electionsTemp.push(value.data);
                }
                setElections(electionsTemp);
            }
        }
        getElections();
    }, [elections, cookies]);

    if (!cookies['voterdata'] || !cookies['voterdata'].voterId) {
        return <Redirect to={{
            pathname: "/",
        }} />
    }

    return (
        <div>
            <Row align="middle" justify="center" className="rowTitle">
                <Col span={24} className="colTitle">
                    <Typography>
                        <Title>Welcome {cookies['voterdata'].voterId} to the group {groupId} </Title>
                    </Typography>
                </Col>
            </Row>
            <div style={{ margin: 25 }}>
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 2,
                        md: 4,
                        lg: 4,
                        xl: 6,
                        xxl: 5,
                    }}
                    dataSource={elections}
                    renderItem={(item) => (
                        <List.Item>
                            <Card title={item.name} style={{ border: "5px solid #7D5EFF" }}>
                                <div className="infosGroup">
                                ID: {item.electionId}
                                </div>
                            </Card>

                        </List.Item>
                    )}
                />
            </div>

        </div>
    )
}

export default Group;