import { useState } from 'react';
import { Typography, Button, Input, Row, Col } from 'antd';
import './Home.css';
import { Redirect, useHistory } from 'react-router-dom';
import { queryByKey, registerVoter } from "../../services/apiService";
import { useCookies } from 'react-cookie';

const { Title, Text } = Typography;
const { Search } = Input;

function Home() {
    const [displayError, setDisplayError] = useState(false);
    const [redirect, setRedirect] = useState(null);
    const [cookies, setCookie] = useCookies(['voterData']);
    const history = useHistory();

    if (redirect) {
        return <Redirect  to={{
            pathname: "/profile",
          }} />
    }
    if (cookies['voterdata'] && cookies['voterdata'].voterId) {
        return <Redirect  to={{
            pathname: "/profile",
          }} /> 
    }
    const onSearch = value => {
        queryByKey(value).then(function (value) {
            if (value.data.error) {
                setDisplayError(true);
            } else {
                setCookie('voterdata', value.data);
                setRedirect(true);
            }
        });
    };
    async function createNewUser() {
        let user = await registerVoter();
        setCookie('voterdata', user.data);
        history.push("/profile");
    } 
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
                    <div>
                        <Search placeholder="ID" className="inputID" size="large" onSearch={onSearch} />
                    </div>
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
                    <Button type="primary" shape="round" size={'large'} onClick={() => {createNewUser()}}>
                        Create a new profil
            </Button>
                </Col>
                <Col span={8} />
            </Row>
        </div>
    );
}

export default Home;