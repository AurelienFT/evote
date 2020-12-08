import './App.css';
import 'antd/dist/antd.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from './components/Home/Home'
import Profile from './components/Profile/Profile'
import Group from './components/Group/Group'

function App() {
	return (
		<Router>
			<Switch>
				<Route exact path="/" component={Home} />
				<Route exact path="/profile" component={Profile} />
				<Route path="/group/:groupId" component={Group} />
			</Switch>
		</Router>

	);
}

export default App;
