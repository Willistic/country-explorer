import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { loginUser, selectAuth, clearError } from "../../store/authSlice";
import type { LoginCredentials } from "../../types/auth";
import type { AppDispatch } from "../../store/store";

const LoginForm: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { isAuthenticated, isLoading, error } = useSelector(selectAuth);

	const [formData, setFormData] = useState<LoginCredentials>({
		email: "",
		password: "",
	});

	const [showPassword, setShowPassword] = useState(false);

	// Redirect if already authenticated
	if (isAuthenticated) {
		return <Navigate to='/dashboard' replace />;
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error when user starts typing
		if (error) {
			dispatch(clearError());
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.email || !formData.password) {
			return;
		}

		dispatch(loginUser(formData));
	};

	return (
		<div
			style={{
				maxWidth: "400px",
				margin: "2rem auto",
				padding: "2rem",
				border: "1px solid #ddd",
				borderRadius: "8px",
				fontFamily: "Arial, sans-serif",
			}}
		>
			<h2
				style={{
					textAlign: "center",
					marginBottom: "1.5rem",
					color: "#333",
				}}
			>
				🌍 Country Explorer Login
			</h2>

			<form onSubmit={handleSubmit}>
				{/* Email Field */}
				<div style={{ marginBottom: "1rem" }}>
					<label
						htmlFor='email'
						style={{
							display: "block",
							marginBottom: "0.5rem",
							fontWeight: "bold",
						}}
					>
						Email Address
					</label>
					<input
						type='email'
						id='email'
						name='email'
						value={formData.email}
						onChange={handleChange}
						required
						style={{
							width: "100%",
							padding: "0.75rem",
							border: "1px solid #ccc",
							borderRadius: "4px",
							fontSize: "1rem",
							boxSizing: "border-box",
						}}
						placeholder='Enter your email'
					/>
				</div>

				{/* Password Field */}
				<div style={{ marginBottom: "1.5rem" }}>
					<label
						htmlFor='password'
						style={{
							display: "block",
							marginBottom: "0.5rem",
							fontWeight: "bold",
						}}
					>
						Password
					</label>
					<div style={{ position: "relative" }}>
						<input
							type={showPassword ? "text" : "password"}
							id='password'
							name='password'
							value={formData.password}
							onChange={handleChange}
							required
							style={{
								width: "100%",
								padding: "0.75rem",
								paddingRight: "3rem",
								border: "1px solid #ccc",
								borderRadius: "4px",
								fontSize: "1rem",
								boxSizing: "border-box",
							}}
							placeholder='Enter your password'
						/>
						<button
							type='button'
							onClick={() => setShowPassword(!showPassword)}
							style={{
								position: "absolute",
								right: "10px",
								top: "50%",
								transform: "translateY(-50%)",
								background: "none",
								border: "none",
								cursor: "pointer",
								fontSize: "1rem",
							}}
						>
							{showPassword ? "🙈" : "👁️"}
						</button>
					</div>
				</div>

				{/* Error Message */}
				{error && (
					<div
						style={{
							backgroundColor: "#ffebee",
							color: "#c62828",
							padding: "0.75rem",
							borderRadius: "4px",
							marginBottom: "1rem",
							textAlign: "center",
						}}
					>
						❌ {error}
					</div>
				)}

				{/* Submit Button */}
				<button
					type='submit'
					disabled={
						isLoading || !formData.email || !formData.password
					}
					style={{
						width: "100%",
						padding: "0.75rem",
						backgroundColor: isLoading ? "#ccc" : "#2196f3",
						color: "white",
						border: "none",
						borderRadius: "4px",
						fontSize: "1rem",
						cursor: isLoading ? "not-allowed" : "pointer",
						marginBottom: "1rem",
					}}
				>
					{isLoading ? "🔄 Signing In..." : "🔐 Sign In"}
				</button>

				{/* Register Link */}
				<div style={{ textAlign: "center" }}>
					<p style={{ margin: 0, color: "#666" }}>
						Don't have an account?{" "}
						<Link
							to='/register'
							style={{
								color: "#2196f3",
								textDecoration: "none",
								fontWeight: "bold",
							}}
						>
							Sign Up
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
};

export default LoginForm;
