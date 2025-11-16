import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	logout,
	fetchUserProfile,
	selectAuth,
	updateUserProfile,
} from "../../store/authSlice";
import type { AppDispatch } from "../../store/store";

const UserProfile: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { user, isLoading, error } = useSelector(selectAuth);

	const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState({
		firstName: "",
		lastName: "",
	});

	useEffect(() => {
		// Only fetch profile if user data is missing
		if (!user) {
			dispatch(fetchUserProfile());
		}
	}, [dispatch, user]);

	useEffect(() => {
		// Update edit form when user data changes
		if (user) {
			setEditData({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
			});
		}
	}, [user]);

	const handleLogout = () => {
		if (window.confirm("Are you sure you want to logout?")) {
			dispatch(logout());
		}
	};

	const handleEditToggle = () => {
		setIsEditing(!isEditing);
		// Reset form data when cancelling
		if (isEditing && user) {
			setEditData({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
			});
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setEditData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSaveProfile = async () => {
		if (!editData.firstName.trim() || !editData.lastName.trim()) {
			alert("First name and last name are required!");
			return;
		}

		try {
			await dispatch(updateUserProfile(editData)).unwrap();
			setIsEditing(false);
			alert("✅ Profile updated successfully!");
		} catch (error) {
			alert(`❌ Failed to update profile: ${error}`);
		}
	};

	if (isLoading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "50vh",
					flexDirection: "column",
				}}
			>
				<div
					style={{
						border: "4px solid #f3f3f3",
						borderTop: "4px solid #2196f3",
						borderRadius: "50%",
						width: "40px",
						height: "40px",
						animation: "spin 1s linear infinite",
						marginBottom: "1rem",
					}}
				></div>
				<p>Loading profile...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div
				style={{
					maxWidth: "600px",
					margin: "2rem auto",
					padding: "2rem",
					backgroundColor: "#ffebee",
					color: "#c62828",
					borderRadius: "8px",
					textAlign: "center",
				}}
			>
				<h2>❌ Profile Error</h2>
				<p>{error}</p>
				<button
					onClick={() => dispatch(fetchUserProfile())}
					style={{
						padding: "0.5rem 1rem",
						backgroundColor: "#2196f3",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
					}}
				>
					🔄 Retry
				</button>
			</div>
		);
	}

	if (!user) {
		return (
			<div
				style={{
					maxWidth: "600px",
					margin: "2rem auto",
					padding: "2rem",
					textAlign: "center",
				}}
			>
				<h2>👤 No User Data</h2>
				<p>Unable to load user profile.</p>
			</div>
		);
	}

	return (
		<div
			style={{
				maxWidth: "600px",
				margin: "2rem auto",
				padding: "2rem",
				border: "1px solid #ddd",
				borderRadius: "8px",
				fontFamily: "Arial, sans-serif",
			}}
		>
			{/* Header */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "2rem",
					paddingBottom: "1rem",
					borderBottom: "2px solid #f0f0f0",
				}}
			>
				<h1 style={{ margin: 0, color: "#333" }}>👤 User Profile</h1>
				<button
					onClick={handleLogout}
					style={{
						padding: "0.5rem 1rem",
						backgroundColor: "#f44336",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
						fontSize: "0.9rem",
					}}
				>
					🚪 Logout
				</button>
			</div>

			{/* Profile Information */}
			<div
				style={{
					backgroundColor: "#f9f9f9",
					padding: "1.5rem",
					borderRadius: "8px",
					marginBottom: "2rem",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "1rem",
					}}
				>
					<h3 style={{ margin: 0, color: "#555" }}>
						📧 Account Information
					</h3>
					<button
						onClick={handleEditToggle}
						style={{
							padding: "0.5rem 1rem",
							backgroundColor: isEditing ? "#9e9e9e" : "#ff9800",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
							fontSize: "0.875rem",
						}}
					>
						{isEditing ? "✖️ Cancel" : "✏️ Edit"}
					</button>
				</div>

				<div style={{ marginBottom: "1rem" }}>
					<strong style={{ color: "#333" }}>Email:</strong>
					<span style={{ marginLeft: "0.5rem", color: "#666" }}>
						{user.email}
					</span>
				</div>

				{isEditing ? (
					<>
						<div style={{ marginBottom: "1rem" }}>
							<strong
								style={{
									color: "#333",
									display: "block",
									marginBottom: "0.5rem",
								}}
							>
								First Name:
							</strong>
							<input
								type='text'
								name='firstName'
								value={editData.firstName}
								onChange={handleInputChange}
								style={{
									width: "100%",
									padding: "0.5rem",
									border: "1px solid #ccc",
									borderRadius: "4px",
									fontSize: "1rem",
									boxSizing: "border-box",
								}}
							/>
						</div>

						<div style={{ marginBottom: "1rem" }}>
							<strong
								style={{
									color: "#333",
									display: "block",
									marginBottom: "0.5rem",
								}}
							>
								Last Name:
							</strong>
							<input
								type='text'
								name='lastName'
								value={editData.lastName}
								onChange={handleInputChange}
								style={{
									width: "100%",
									padding: "0.5rem",
									border: "1px solid #ccc",
									borderRadius: "4px",
									fontSize: "1rem",
									boxSizing: "border-box",
								}}
							/>
						</div>

						<button
							onClick={handleSaveProfile}
							disabled={isLoading}
							style={{
								padding: "0.75rem 1.5rem",
								backgroundColor: "#4caf50",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: isLoading ? "not-allowed" : "pointer",
								width: "100%",
								marginTop: "1rem",
								fontSize: "1rem",
								opacity: isLoading ? 0.6 : 1,
							}}
						>
							{isLoading ? "💾 Saving..." : "💾 Save Changes"}
						</button>
					</>
				) : (
					<>
						<div style={{ marginBottom: "1rem" }}>
							<strong style={{ color: "#333" }}>
								First Name:
							</strong>
							<span
								style={{ marginLeft: "0.5rem", color: "#666" }}
							>
								{user.firstName || "Not provided"}
							</span>
						</div>

						<div style={{ marginBottom: "1rem" }}>
							<strong style={{ color: "#333" }}>
								Last Name:
							</strong>
							<span
								style={{ marginLeft: "0.5rem", color: "#666" }}
							>
								{user.lastName || "Not provided"}
							</span>
						</div>

						<div style={{ marginBottom: "1rem" }}>
							<strong style={{ color: "#333" }}>
								Full Name:
							</strong>
							<span
								style={{ marginLeft: "0.5rem", color: "#666" }}
							>
								{user.fullName ||
									`${user.firstName} ${user.lastName}`}
							</span>
						</div>
					</>
				)}

				<div style={{ marginBottom: "1rem" }}>
					<strong style={{ color: "#333" }}>Member Since:</strong>
					<span style={{ marginLeft: "0.5rem", color: "#666" }}>
						{new Date(user.createdAt).toLocaleDateString()}
					</span>
				</div>

				<div>
					<strong style={{ color: "#333" }}>Last Updated:</strong>
					<span style={{ marginLeft: "0.5rem", color: "#666" }}>
						{new Date(user.updatedAt).toLocaleDateString()}
					</span>
				</div>
			</div>

			{/* Favorites Section */}
			<div
				style={{
					backgroundColor: "#f0f8ff",
					padding: "1.5rem",
					borderRadius: "8px",
					marginBottom: "2rem",
				}}
			>
				<h3 style={{ margin: "0 0 1rem 0", color: "#555" }}>
					⭐ Favorite Countries
				</h3>

				{user.favorites && user.favorites.length > 0 ? (
					<div>
						<p style={{ margin: "0 0 1rem 0", color: "#666" }}>
							You have {user.favorites.length} favorite countries:
						</p>
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: "0.5rem",
							}}
						>
							{user.favorites.map((country, index) => (
								<span
									key={index}
									style={{
										backgroundColor: "#2196f3",
										color: "white",
										padding: "0.25rem 0.75rem",
										borderRadius: "12px",
										fontSize: "0.875rem",
									}}
								>
									🌍 {country}
								</span>
							))}
						</div>
					</div>
				) : (
					<p
						style={{
							margin: 0,
							color: "#666",
							fontStyle: "italic",
						}}
					>
						No favorite countries yet. Start exploring to add some!
					</p>
				)}
			</div>

			{/* Account Actions */}
			<div
				style={{
					display: "flex",
					gap: "1rem",
					justifyContent: "center",
				}}
			>
				<button
					onClick={() => dispatch(fetchUserProfile())}
					style={{
						padding: "0.75rem 1.5rem",
						backgroundColor: "#4caf50",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
					}}
				>
					🔄 Refresh Profile
				</button>

				<button
					onClick={() => (window.location.href = "/countries")}
					style={{
						padding: "0.75rem 1.5rem",
						backgroundColor: "#2196f3",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
					}}
				>
					🌍 Explore Countries
				</button>
			</div>

			<style>
				{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
			</style>
		</div>
	);
};

export default UserProfile;
