import { useState } from 'react';
import { Typography, Button, Input } from 'antd';
import './Home.css';
import { Row, Col } from 'antd';
import {queryByKey} from "../../services/apiService";

const { Title, Text } = Typography;
const { Search } = Input;

function Home() {
    const [displayError, setDisplayError] = useState(false);
    const onSearch = value => {
        queryByKey(value).then(function(value) {
        if (value.data.error) {
            setDisplayError(true);
            console.log("lul")
        } else {
            console.log("ok")
        }
        });
    };
    return (
        <div>
            <Typography className="title">
                <Title>PoolVote</Title>
            </Typography>
            <Row align="middle" justify="center" className="rowInputID">
                <Col span={8} />
                <Col span={8} className="colInputID">
                    <Typography className="enterIdTitle">
                        <Title>Enter your ID</Title>
                    </Typography>
                    <Search placeholder="ID" className="inputID" size="large" onSearch={onSearch} />
                    {displayError ? <Text type="danger">No voter with this ID</Text> : <div></div>}
                </Col>
                <Col span={8} />

            </Row>
            <Row align="middle" justify="center" className="rowInputID">
                <Col span={8} />
                <Col span={8} className="colInputID">
                    <Typography className="enterIdTitle">
                        <Title>OR</Title>
                    </Typography>
                    <Button type="primary" shape="round" size={'large'}>
                        Create a new profil
            </Button>
                </Col>
                <Col span={8} />
            </Row>
        </div>
    );
}

export default Home;