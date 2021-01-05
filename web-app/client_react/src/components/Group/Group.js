import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import moment from 'moment';
import { Typography, Card, Row, Col, List, Button, Form, Input, DatePicker } from 'antd';
import { queryByKey, addGroupMember, triggerActionsElection } from "../../services/apiService";
import { Redirect, useParams, useHistory } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

import './Group.css';
import { useState } from 'react';

const { Title } = Typography;
const { RangePicker } = DatePicker;

function Group() {
    const [cookies] = useCookies(['voterdata']);
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
    }, [elections, cookies, groupId]);


    function disabledDate(current) {
        // Can not select days before today and today
        return current && current < moment().subtract(1, 'days').endOf('day');
    }

    const goToElection = electionId => {
        history.push("/election/" + electionId);
    }

    const goToElectionResults = electionId => {
        history.push("/election_results/" + electionId);
    }

    if (!cookies['voterdata'] || !cookies['voterdata'].voterId) {
        return <Redirect to={{
            pathname: "/",
        }} />
    }

    async function onFinish(values) {
        if (!values.newMemberId) {
            return;
        }
        console.log(values);
        console.log(values.electionRange[0].toDate());
        console.log(await addGroupMember(groupId, values.newMemberId, values.electionRange[0].toDate(), values.electionRange[1].toDate()));
    };


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
                        gutter: 3,
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
                                {item.triggered ? <div>Actions already been taken                             <Button type="primary" shape="round" size={'large'} onClick={() => { goToElectionResults(item.electionId) }}>
                                    Results
                            </Button></div> : <div><Button type="primary" shape="round" size={'large'} onClick={() => { goToElection(item.electionId) }}>
                                        Vote !
                            </Button>
                                        <Button type="primary" shape="round" size={'large'} onClick={() => { goToElectionResults(item.electionId) }}>
                                            Results
                            </Button>
                                        <Button type="primary" shape="round" size={'large'} onClick={() => { triggerActionsElection(item.electionId) }}>
                                            Trigger Actions
                            </Button></div>}
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
                        gutter: 3,
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
                        gutter: 3,
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
            <Row align="middle" justify="center" className="rowTitle">
                <Col span={6} className="colTitle">
                </Col>
                <Col span={12} className="colTitle">
                    <Typography>
                        <Title level={3}> Create election to add a new member to the group : </Title>
                    </Typography>
                    <Form
                        name="form"
                        onFinish={onFinish}
                    >
                        <Form.Item
                            label="ID to add"
                            name="newMemberId"
                            rules={[{ required: true, message: 'Please input the id!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Range Date of the election"
                            name="electionRange"
                            rules={[{ required: true, message: 'Please input start and end date!' }]}
                        >
                            <RangePicker
                                disabledDate={disabledDate}
                                showTime={{
                                    hideDisabledOptions: true,
                                    defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                                }}
                                format="YYYY-MM-DD HH:mm:ss"
                            />
                        </Form.Item>
                        <Form.Item >
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
                <Col span={6} className="colTitle">
                </Col>
            </Row>
        </div>
    )
}

export default Group;