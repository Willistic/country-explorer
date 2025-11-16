import React from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/authSlice";
import UserProfile from "../components/auth/UserProfile";

const Dashboard: React.FC = () => {
	const { user, isAuthenticated } = useSelector(selectAuth);

	if (!isAuthenticated || !user) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					fontFamily: "Arial, sans-serif",
				}}
			>
				<div
					style={{
						textAlign: "center",
						padding: "2rem",
						backgroundColor: "#ffebee",
						borderRadius: "8px",
						color: "#c62828",
					}}
				>
					<h2>🚫 Access Denied</h2>
					<p>Please log in to access the dashboard.</p>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				minHeight: "100vh",
				backgroundColor: "#f5f5f5",
				paddingTop: "2rem",
				fontFamily: "Arial, sans-serif",
			}}
		>
			{/* Header */}
			<div
				style={{
					backgroundColor: "white",
					padding: "1rem 2rem",
					marginBottom: "2rem",
					boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
				}}
			>
				<h1
					style={{
						margin: 0,
						color: "#333",
						textAlign: "center",
					}}
				>
					🌍 Country Explorer Dashboard
				</h1>
				<p
					style={{
						margin: "0.5rem 0 0 0",
						textAlign: "center",
						color: "#666",
					}}
				>
					Welcome back,{" "}
					{user.fullName || `${user.firstName} ${user.lastName}`}!
				</p>
			</div>

			{/* Main Content */}
			<div
				style={{
					maxWidth: "1200px",
					margin: "0 auto",
					padding: "0 1rem",
				}}
			>
				{/* Quick Actions */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns:
							"repeat(auto-fit, minmax(250px, 1fr))",
						gap: "2rem",
						marginBottom: "3rem",
					}}
				>
					{/* Explore Countries Card */}
					<div
						style={{
							backgroundColor: "white",
							padding: "2rem",
							borderRadius: "8px",
							boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
							textAlign: "center",
							cursor: "pointer",
							transition: "transform 0.2s",
						}}
						onMouseEnter={(e) =>
							(e.currentTarget.style.transform =
								"translateY(-2px)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.transform = "translateY(0)")
						}
						onClick={() => (window.location.href = "/countries")}
					>
						<div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
							🗺️
						</div>
						<h3 style={{ margin: "0 0 1rem 0", color: "#333" }}>
							Explore Countries
						</h3>
						<p style={{ margin: 0, color: "#666" }}>
							Browse and search through countries worldwide
						</p>
					</div>

					{/* Favorites Card */}
					<div
						style={{
							backgroundColor: "white",
							padding: "2rem",
							borderRadius: "8px",
							boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
							textAlign: "center",
						}}
					>
						<div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
							⭐
						</div>
						<h3 style={{ margin: "0 0 1rem 0", color: "#333" }}>
							Favorites
						</h3>
						<p style={{ margin: "0 0 1rem 0", color: "#666" }}>
							{user.favorites?.length || 0} countries saved
						</p>
						<button
							style={{
								padding: "0.5rem 1rem",
								backgroundColor: "#2196f3",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
							}}
						>
							View Favorites
						</button>
					</div>

					{/* Profile Management Card */}
					<div
						style={{
							backgroundColor: "white",
							padding: "2rem",
							borderRadius: "8px",
							boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
							textAlign: "center",
						}}
					>
						<div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
							👤
						</div>
						<h3 style={{ margin: "0 0 1rem 0", color: "#333" }}>
							Profile
						</h3>
						<p style={{ margin: "0 0 1rem 0", color: "#666" }}>
							Manage your account settings
						</p>
						<button
							style={{
								padding: "0.5rem 1rem",
								backgroundColor: "#4caf50",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
							}}
							onClick={() => {
								const profileSection =
									document.getElementById("user-profile");
								profileSection?.scrollIntoView({
									behavior: "smooth",
								});
							}}
						>
							View Profile
						</button>
					</div>
				</div>

				{/* Recent Activity */}
				<div
					style={{
						backgroundColor: "white",
						padding: "2rem",
						borderRadius: "8px",
						boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
						marginBottom: "3rem",
					}}
				>
					<h2 style={{ margin: "0 0 1.5rem 0", color: "#333" }}>
						📊 Quick Stats
					</h2>

					<div
						style={{
							display: "grid",
							gridTemplateColumns:
								"repeat(auto-fit, minmax(150px, 1fr))",
							gap: "1rem",
							textAlign: "center",
						}}
					>
						<div
							style={{
								padding: "1rem",
								backgroundColor: "#f8f9fa",
								borderRadius: "8px",
							}}
						>
							<div
								style={{
									fontSize: "2rem",
									marginBottom: "0.5rem",
								}}
							>
								🌍
							</div>
							<div
								style={{
									fontSize: "1.5rem",
									fontWeight: "bold",
									color: "#2196f3",
								}}
							>
								195
							</div>
							<div
								style={{ fontSize: "0.875rem", color: "#666" }}
							>
								Countries Available
							</div>
						</div>

						<div
							style={{
								padding: "1rem",
								backgroundColor: "#f8f9fa",
								borderRadius: "8px",
							}}
						>
							<div
								style={{
									fontSize: "2rem",
									marginBottom: "0.5rem",
								}}
							>
								⭐
							</div>
							<div
								style={{
									fontSize: "1.5rem",
									fontWeight: "bold",
									color: "#4caf50",
								}}
							>
								{user.favorites?.length || 0}
							</div>
							<div
								style={{ fontSize: "0.875rem", color: "#666" }}
							>
								Your Favorites
							</div>
						</div>

						<div
							style={{
								padding: "1rem",
								backgroundColor: "#f8f9fa",
								borderRadius: "8px",
							}}
						>
							<div
								style={{
									fontSize: "2rem",
									marginBottom: "0.5rem",
								}}
							>
								📅
							</div>
							<div
								style={{
									fontSize: "1.5rem",
									fontWeight: "bold",
									color: "#ff9800",
								}}
							>
								{Math.floor(
									(Date.now() -
										new Date(user.createdAt).getTime()) /
										(1000 * 60 * 60 * 24)
								)}
							</div>
							<div
								style={{ fontSize: "0.875rem", color: "#666" }}
							>
								Days as Member
							</div>
						</div>

						<div
							style={{
								padding: "1rem",
								backgroundColor: "#f8f9fa",
								borderRadius: "8px",
							}}
						>
							<div
								style={{
									fontSize: "2rem",
									marginBottom: "0.5rem",
								}}
							>
								🔐
							</div>
							<div
								style={{
									fontSize: "1.5rem",
									fontWeight: "bold",
									color: "#9c27b0",
								}}
							>
								Active
							</div>
							<div
								style={{ fontSize: "0.875rem", color: "#666" }}
							>
								Account Status
							</div>
						</div>
					</div>
				</div>

				{/* User Profile Section */}
				<div id='user-profile'>
					<UserProfile />
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
