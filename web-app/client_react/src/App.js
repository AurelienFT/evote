import './App.css';
import 'antd/dist/antd.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from './components/Home/Home'
import Profile from './components/Profile/Profile'
import Group from './components/Group/Group'
import Election from './components/Election/Election'

function App() {
	return (
		<Router>
			<Switch>
				<Route exact path="/" component={Home} />
				<Route exact path="/profile" component={Profile} />
				<Route path="/group/:groupId" component={Group} />
				<Route path="/election/:electionId" component={Election} />
			</Switch>
		</Router>

	);
}

export default App;
