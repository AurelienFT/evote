import { useCookies } from 'react-cookie';
import { Typography, Card, Input, Row, Col, List } from 'antd';
import { Redirect } from 'react-router-dom';

import './Profile.css';

const { Title, Text } = Typography;
const { Search } = Input;

function Profile() {
    const [cookies, setCookie, removeCookie] = useCookies(['voterData']);

    if (!cookies['voterdata'] || !cookies['voterdata'].voterId) {
        return <Redirect  to={{
            pathname: "/",
          }} /> 
    }
    return (
        <div>
            <Row align="middle" justify="center" className="rowTitle">
                <Col span={24} className="colTitle">
                    <Typography>
                        <Title>Welcome {cookies['voterdata'].voterId}</Title>
                    </Typography>
                </Col>
            </Row>
            <div style={{margin: 25}}>
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
						dataSource={cookies['voterdata'].groups}
						renderItem={(item) => (
							<List.Item>
								<Card title={item} style={{border: "5px solid #7D5EFF"}}>
                                    {item}
								</Card>
							</List.Item>
						)}
					/>
				</div>

        </div>
    )
}

export default Profile;