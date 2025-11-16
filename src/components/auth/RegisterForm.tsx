import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { registerUser, selectAuth, clearError } from "../../store/authSlice";
import type { RegisterCredentials } from "../../types/auth";
import type { AppDispatch } from "../../store/store";

const RegisterForm: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { isAuthenticated, isLoading, error } = useSelector(selectAuth);

	const [formData, setFormData] = useState<RegisterCredentials>({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);

	// Redirect if already authenticated
	if (isAuthenticated) {
		return <Navigate to='/dashboard' replace />;
	}

	const validatePassword = (password: string): string[] => {
		const errors: string[] = [];

		if (password.length < 8) {
			errors.push("Password must be at least 8 characters long");
		}
		if (!/[A-Z]/.test(password)) {
			errors.push("Password must contain at least one uppercase letter");
		}
		if (!/[a-z]/.test(password)) {
			errors.push("Password must contain at least one lowercase letter");
		}
		if (!/[0-9]/.test(password)) {
			errors.push("Password must contain at least one number");
		}
		if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			errors.push("Password must contain at least one special character");
		}

		return errors;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear errors when user starts typing
		if (error) {
			dispatch(clearError());
		}

		// Validate password in real-time
		if (name === "password") {
			const errors = validatePassword(value);
			setValidationErrors(errors);
		}

		// Clear validation errors when typing
		if (validationErrors.length > 0) {
			setValidationErrors([]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate all fields
		if (
			!formData.username ||
			!formData.email ||
			!formData.password ||
			!formData.confirmPassword
		) {
			setValidationErrors(["All fields are required"]);
			return;
		}

		// Validate password
		const passwordErrors = validatePassword(formData.password);
		if (passwordErrors.length > 0) {
			setValidationErrors(passwordErrors);
			return;
		}

		// Check password confirmation
		if (formData.password !== formData.confirmPassword) {
			setValidationErrors(["Passwords do not match"]);
			return;
		}

		// Clear validation errors and submit
		setValidationErrors([]);
		dispatch(registerUser(formData));
	};

	const allErrors = [...validationErrors, ...(error ? [error] : [])];

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
				🌍 Join Country Explorer
			</h2>

			<form onSubmit={handleSubmit}>
				{/* Username Field */}
				<div style={{ marginBottom: "1rem" }}>
					<label
						htmlFor='username'
						style={{
							display: "block",
							marginBottom: "0.5rem",
							fontWeight: "bold",
						}}
					>
						Username
					</label>
					<input
						type='text'
						id='username'
						name='username'
						value={formData.username}
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
						placeholder='Choose a username'
					/>
				</div>

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
				<div style={{ marginBottom: "1rem" }}>
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
							placeholder='Create a strong password'
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

				{/* Confirm Password Field */}
				<div style={{ marginBottom: "1.5rem" }}>
					<label
						htmlFor='confirmPassword'
						style={{
							display: "block",
							marginBottom: "0.5rem",
							fontWeight: "bold",
						}}
					>
						Confirm Password
					</label>
					<div style={{ position: "relative" }}>
						<input
							type={showConfirmPassword ? "text" : "password"}
							id='confirmPassword'
							name='confirmPassword'
							value={formData.confirmPassword}
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
							placeholder='Confirm your password'
						/>
						<button
							type='button'
							onClick={() =>
								setShowConfirmPassword(!showConfirmPassword)
							}
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
							{showConfirmPassword ? "🙈" : "👁️"}
						</button>
					</div>
				</div>

				{/* Error Messages */}
				{allErrors.length > 0 && (
					<div
						style={{
							backgroundColor: "#ffebee",
							color: "#c62828",
							padding: "0.75rem",
							borderRadius: "4px",
							marginBottom: "1rem",
						}}
					>
						{allErrors.map((err, index) => (
							<div
								key={index}
								style={{
									marginBottom:
										index < allErrors.length - 1
											? "0.5rem"
											: 0,
								}}
							>
								❌ {err}
							</div>
						))}
					</div>
				)}

				{/* Password Requirements */}
				<div
					style={{
						backgroundColor: "#f5f5f5",
						padding: "0.75rem",
						borderRadius: "4px",
						marginBottom: "1rem",
						fontSize: "0.875rem",
					}}
				>
					<p
						style={{
							margin: "0 0 0.5rem 0",
							fontWeight: "bold",
							color: "#555",
						}}
					>
						Password Requirements:
					</p>
					<ul
						style={{
							margin: 0,
							paddingLeft: "1.2rem",
							color: "#777",
						}}
					>
						<li>At least 8 characters long</li>
						<li>One uppercase letter (A-Z)</li>
						<li>One lowercase letter (a-z)</li>
						<li>One number (0-9)</li>
						<li>One special character (!@#$%^&*)</li>
					</ul>
				</div>

				{/* Submit Button */}
				<button
					type='submit'
					disabled={
						isLoading ||
						!formData.username ||
						!formData.email ||
						!formData.password ||
						!formData.confirmPassword
					}
					style={{
						width: "100%",
						padding: "0.75rem",
						backgroundColor: isLoading ? "#ccc" : "#4caf50",
						color: "white",
						border: "none",
						borderRadius: "4px",
						fontSize: "1rem",
						cursor: isLoading ? "not-allowed" : "pointer",
						marginBottom: "1rem",
					}}
				>
					{isLoading ? "🔄 Creating Account..." : "🚀 Create Account"}
				</button>

				{/* Login Link */}
				<div style={{ textAlign: "center" }}>
					<p style={{ margin: 0, color: "#666" }}>
						Already have an account?{" "}
						<Link
							to='/login'
							style={{
								color: "#2196f3",
								textDecoration: "none",
								fontWeight: "bold",
							}}
						>
							Sign In
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
};

export default RegisterForm;
