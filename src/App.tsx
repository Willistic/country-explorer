import "./App.css";
import { Provider } from "react-redux";
import { store } from "./store/store";
import CountryTable from "./component/countryTable";

function App() {
	return (
		<Provider store={store}>
			<div className='app-container'>
				<h1 className='app-title'>🌍 Countries Explorer</h1>
				<p className='app-subtitle'>
					Explore countries around the world with their flags,
					capitals, and populations
				</p>
				<CountryTable />
			</div>
		</Provider>
	);
}

export default App;
