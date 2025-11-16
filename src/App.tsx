import React, { useEffect } from "react";
import "./App.css";
import { Provider, useDispatch } from "react-redux";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	Link,
} from "react-router-dom";
import { store } from "./store/store";
import { loadUserFromStorage } from "./store/authSlice";
import type { AppDispatch } from "./store/store";

// Components
import CountryTable from "./component/countryTable";
import WorldMapHeader from "./component/WorldMapHeader";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

// App initialization component to handle authentication loading
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		// Load user from storage on app start
		dispatch(loadUserFromStorage());
	}, [dispatch]);

	return <>{children}</>;
};

// Navigation component
const Navigation: React.FC = () => {
	return (
		<nav
			style={{
				backgroundColor: "#2196f3",
				padding: "1rem 2rem",
				marginBottom: "2rem",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					maxWidth: "1200px",
					margin: "0 auto",
				}}
			>
				<Link
					to='/dashboard'
					style={{
						color: "white",
						textDecoration: "none",
						fontSize: "1.5rem",
						fontWeight: "bold",
					}}
				>
					🌍 Country Explorer
				</Link>

				<div style={{ display: "flex", gap: "1rem" }}>
					<Link
						to='/countries'
						style={{
							color: "white",
							textDecoration: "none",
							padding: "0.5rem 1rem",
							borderRadius: "4px",
							backgroundColor: "rgba(255,255,255,0.2)",
						}}
					>
						Browse Countries
					</Link>
					<Link
						to='/dashboard'
						style={{
							color: "white",
							textDecoration: "none",
							padding: "0.5rem 1rem",
							borderRadius: "4px",
							backgroundColor: "rgba(255,255,255,0.2)",
						}}
					>
						Dashboard
					</Link>
				</div>
			</div>
		</nav>
	);
};

function App() {
	return (
		<Provider store={store}>
			<Router>
				<AppInitializer>
					<div className='app-container'>
						<Routes>
							{/* Public routes (auth pages) */}
							<Route
								path='/login'
								element={
									<ProtectedRoute requireAuth={false}>
										<LoginForm />
									</ProtectedRoute>
								}
							/>

							<Route
								path='/register'
								element={
									<ProtectedRoute requireAuth={false}>
										<RegisterForm />
									</ProtectedRoute>
								}
							/>

							{/* Protected routes */}
							<Route
								path='/dashboard'
								element={
									<ProtectedRoute>
										<Navigation />
										<Dashboard />
									</ProtectedRoute>
								}
							/>

							<Route
								path='/countries'
								element={
									<ProtectedRoute>
										<Navigation />
										<div className='app-container'>
											<WorldMapHeader />
											<CountryTable />
										</div>
									</ProtectedRoute>
								}
							/>

							{/* Default redirect */}
							<Route
								path='/'
								element={<Navigate to='/dashboard' replace />}
							/>

							{/* 404 fallback */}
							<Route
								path='*'
								element={
									<div
										style={{
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
											height: "100vh",
											flexDirection: "column",
											fontFamily: "Arial, sans-serif",
										}}
									>
										<h1>🔍 Page Not Found</h1>
										<p>
											The page you're looking for doesn't
											exist.
										</p>
										<Link
											to='/dashboard'
											style={{
												padding: "0.75rem 1.5rem",
												backgroundColor: "#2196f3",
												color: "white",
												textDecoration: "none",
												borderRadius: "4px",
												marginTop: "1rem",
											}}
										>
											🏠 Go Home
										</Link>
									</div>
								}
							/>
						</Routes>
					</div>
				</AppInitializer>
			</Router>
		</Provider>
	);
}

export default App;
