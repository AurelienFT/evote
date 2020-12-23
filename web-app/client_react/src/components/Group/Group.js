import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Typography, Card, Row, Col, List, Button } from 'antd';
import { queryByKey } from "../../services/apiService";
import { Redirect, useParams, useHistory } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

import './Group.css';
import { useState } from 'react';

const { Title} = Typography;

function Group() {
    const [cookies] = useCookies(['voterData']);
    const [elections, setElections] = useState({
        upcomingElections: [],
        elections: [],
        endedElections: [],
        init: false
    });
    const history = useHistory();
    const { groupId } = useParams();
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
            if (elections.init === false) {
                let index = 0;
                let electionsTemp = [];
                let endedElectionsTemp = [];
                let upcomingElectionsTemp = [];
                let actualDate = new Date();
                for (index = 0; index < group.electionsId.length; ++index) {
                    let value = await queryByKey(group.electionsId[index]);
                    let startDate = new Date(value.data.startDate);
                    let endDate = new Date(value.data.endDate);
                    if (startDate.getTime() > actualDate.getTime()) {
                        upcomingElectionsTemp.push(value.data)
                    } else if (endDate.getTime() < actualDate.getTime()) {
                        endedElectionsTemp.push(value.data);
                    } else {
                        electionsTemp.push(value.data);
                    }
                }
                setElections({
                    upcomingElections: upcomingElectionsTemp,
                    elections: electionsTemp,
                    endedElections: endedElectionsTemp,
                    init: true
                });
            }
        }
        getElections();
    }, [elections, cookies]);

    const goToElection = electionId => {
        history.push("/election/" + electionId);
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
                        <Title>Welcome {cookies['voterdata'].voterId} to the group {groupId} </Title>
                    </Typography>
                </Col>
            </Row>
            <Row align="middle" justify="center" className="rowTitle">
                <Col span={24} className="colTitle">
                    <Typography>
                        <Title level={3}> Running elections </Title>
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
                    dataSource={elections.elections}
                    renderItem={(item) => (
                        <List.Item>
                            <Card title={item.name} style={{ border: "5px solid #7D5EFF" }}>
                                <div className="infosGroup">
                                ID: {item.electionId}
                                </div>
                                <div>
                                Start date : {item.startDate}
                                </div>
                                <div>
                                End date : {item.endDate}
                                </div>
                                <Button type="primary" shape="round" size={'large'} onClick={() => {goToElection(item.electionId)}}>
                                    Vote !
                            </Button>
                            </Card>

                        </List.Item>
                    )}
                />
            </div>
            <Row align="middle" justify="center" className="rowTitle">
                <Col span={24} className="colTitle">
                    <Typography>
                        <Title level={3}> Upcoming elections </Title>
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
                    dataSource={elections.upcomingElections}
                    renderItem={(item) => (
                        <List.Item>
                            <Card title={item.name} style={{ border: "5px solid #7D5EFF" }}>
                                <div className="infosGroup">
                                ID: {item.electionId}
                                </div>
                                <div>
                                Start date : {item.startDate}
                                </div>
                                <div>
                                End date : {item.endDate}
                                </div>
                            </Card>

                        </List.Item>
                    )}
                />
            </div>
            <Row align="middle" justify="center" className="rowTitle">
                <Col span={24} className="colTitle">
                    <Typography>
                        <Title level={3}> Ended elections </Title>
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
                    dataSource={elections.endedElections}
                    renderItem={(item) => (
                        <List.Item>
                            <Card title={item.name} style={{ border: "5px solid #7D5EFF" }}>
                                <div className="infosGroup">
                                ID: {item.electionId}
                                </div>
                                <div>
                                Start date : {item.startDate}
                                </div>
                                <div>
                                End date : {item.endDate}
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