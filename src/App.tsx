import "./App.css";
import { Provider } from "react-redux";
import { store } from "./store/store";
import CountryTable from "./component/countryTable";
import WorldMapHeader from "./component/WorldMapHeader";

function App() {
	return (
		<Provider store={store}>
			<div className='app-container'>
				<WorldMapHeader />
				<CountryTable />
			</div>
		</Provider>
	);
}

export default App;
