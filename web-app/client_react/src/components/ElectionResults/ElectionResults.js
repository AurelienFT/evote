import { useState, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { queryByKey } from "../../services/apiService";
import { XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, VerticalBarSeries} from 'react-vis';
import { Typography, Row, Col } from 'antd';

import Navbar from '../Navbar/Navbar';

const { Title } = Typography;

function ElectionResults() {
    const { electionId } = useParams();
    const [election, setElection] = useState({
        items: [],
        init: false,
    });
    const [cookies] = useCookies(['voterdata']);
    //TODO : Add check if user have access to the election and not already voted
    useEffect(() => {
        async function getElection() {
            if (!cookies['voterdata'] || !cookies['voterdata'].voterId) {
                return <Redirect to={{
                    pathname: "/",
                }} />
            }
            //TODO: Error management
            if (election.init === false) {
                let electionData = await queryByKey(electionId);
                console.log(electionData);
                let tempResult = []
                for (let index = 0; index < electionData.data.items.length; index++) {
                    let tmpResult = await queryByKey(electionData.data.items[index]);
                    let tmpObject = {};
                    if (tmpResult.data.electionId === electionId) {
                        console.log(tmpResult)
                        tmpObject.x = tmpResult.data.description
                        tmpObject.y = tmpResult.data.count
                        tempResult.push(tmpObject);
                    }
                }
                console.log(tempResult)
                setElection({
                    election: electionData.data,
                    items: tempResult,
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

    return (
        <div>
            <Navbar />
            <Row align="middle" justify="center" className="rowTitle">
                <Col span={24} className="colTitle">
                    <Typography>
                        <Title>Welcome {cookies['voterdata'].voterId} to the results of the election {election.election ? election.election.electionId : 'Loading...'} </Title>
                    </Typography>
                </Col>
            </Row>
            <XYPlot xType="ordinal" width={800} height={300} xDistance={100}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          <VerticalBarSeries data={election.items} />
        </XYPlot>
        </div>
    )
}

export default ElectionResults;