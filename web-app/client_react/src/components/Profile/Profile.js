import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Typography, Card, Row, Col, List, Button } from 'antd';
import { queryByKey } from "../../services/apiService";
import Navbar from '../Navbar/Navbar';
import { Redirect, useHistory } from 'react-router-dom';

import './Profile.css';
import { useState } from 'react';

const { Title } = Typography;

function Profile() {
    const [cookies] = useCookies(['voterData']);
    const [groups, setGroups] = useState([]);
    const history = useHistory();

    useEffect(() => {
        async function getGroups() {
            if (!cookies['voterdata'] || !cookies['voterdata'].voterId) {
                return <Redirect to={{
                    pathname: "/",
                }} />
            }
            if (groups.length === 0) {
                let groupIds = cookies['voterdata'].groups;
                let index = 0;
                let groupsTemp = [];
                for (index = 0; index < groupIds.length; ++index) {
                    let value = await queryByKey(groupIds[index]);
                    groupsTemp.push(value.data);
                }
                setGroups(groupsTemp);
            }
        }
        getGroups();
    }, [groups, cookies]);

    const goToGroup = groupId => {
        history.push("/group/" + groupId);
    } 

    if (!cookies['voterdata'] || !cookies['voterdata'].voterId) {
        return <Redirect to={{
            pathname: "/",
        }} />
    }

    return (
        <div>
            <Navbar />
            <Row align="middle" justify="center" className="rowTitle">
                <Col span={24} className="colTitle">
                    <Typography>
                        <Title>Welcome {cookies['voterdata'].voterId}</Title>
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
                    dataSource={groups}
                    renderItem={(item) => (
                        <List.Item>
                            <Card title={item.name} style={{ border: "5px solid #7D5EFF" }}>
                                <div className="infosGroup">
                                ID: {item.groupId}
                                </div>
                                <Button type="primary" shape="round" size={'large'} onClick={() => {goToGroup(item.groupId)}}>
                                    Elections
                            </Button>
                            </Card>

                        </List.Item>
                    )}
                />
            </div>

        </div>
    )
}

export default Profile;