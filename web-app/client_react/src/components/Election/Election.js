import { useCookies } from 'react-cookie';
import { Typography, Row, Col, Button, Radio, Form } from 'antd';
import { queryByKey, castBallot } from "../../services/apiService";
import { Redirect, useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

import { useState, useEffect } from 'react';

const { Title } = Typography;

function Election() {
    const { electionId } = useParams();
    const [election, setElection] = useState({
        options: [],
        init: false,
        optionSelected: 0,
    });

    const [cookies] = useCookies(['voterdata']);
    //TODO : Add check if user have access to the election and not already voted
    useEffect(() => {
        async function getElection() {
            const radioStyle = {
                display: 'block',
                height: '30px',
                lineHeight: '30px',
            };
            if (!cookies['voterdata'] || !cookies['voterdata'].voterId) {
                return <Redirect to={{
                    pathname: "/",
                }} />
            }
            //TODO: Error management
            if (election.init === false) {
                let electionData = await queryByKey(electionId);
                console.log(electionData);
                let user = await queryByKey(cookies['voterdata'].voterId);
                console.log(user);
                let ballot = undefined;
                for (let index = 0; index < user.data.ballots.length ;index++) {
                    let tmpBallot = await queryByKey(user.data.ballots[index]);
                    if (tmpBallot.data.electionId === electionId) {
                      ballot = tmpBallot;
                      break;
                    }
                }
                console.log(ballot);
                let optionsTemp = []
                for (let index = 0; index < ballot.data.votableItems.length; index++) {
                    optionsTemp.push(<Radio style={radioStyle} key={index} value={ballot.data.votableItems[index].votableId}>
                        {ballot.data.votableItems[index].description}
                    </Radio>)
                }
                setElection({
                    election: electionData.data,
                    options: optionsTemp,
                    init: true
                })
            }
        }
        getElection();
    }, [election, cookies, electionId]);

    if (!cookies['voterdata'] || !cookies['voterdata'].voterId) {
        return <Redirect to={{
            pathname: "/",
        }} />
    }

    async function onFinish(values) {
        if (!values.option) {
            return;
        }
        console.log(await castBallot(electionId, cookies['voterdata'].voterId, values.option));
        console.log('Received values of form: ', values);
    };

    return (
        <div>
            <Navbar />
            <Row align="middle" justify="center" className="rowTitle">
                <Col span={24} className="colTitle">
                    <Typography>
                        <Title>Welcome {cookies['voterdata'].voterId} to the election {election.election ? election.election.electionId : 'Loading...'} </Title>
                    </Typography>
                </Col>
            </Row>
            <Row align="middle" justify="center" className="rowTitle">
                <Col span={24} className="colTitle">
                    <Form
                        name="form"
                        onFinish={onFinish}
                    >
                        <Form.Item name="option">
                            <Radio.Group value={election.optionSelected}>
                                {election.options}
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item >
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </div>
    )
}

export default Election;