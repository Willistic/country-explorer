import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/authSlice";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requireAuth = true,
}) => {
	const { isAuthenticated, isLoading } = useSelector(selectAuth);
	const location = useLocation();

	// Show loading spinner while checking authentication
	if (isLoading) {
		return (
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
				<p style={{ color: "#666", margin: 0 }}>
					🔐 Checking authentication...
				</p>
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
	}

	// If route requires authentication but user is not authenticated
	if (requireAuth && !isAuthenticated) {
		// Redirect to login page with return URL
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	// If user is authenticated but trying to access auth pages (login/register)
	if (!requireAuth && isAuthenticated) {
		// Redirect to dashboard or intended location
		const from = location.state?.from?.pathname || "/dashboard";
		return <Navigate to={from} replace />;
	}

	// Render the protected content
	return <>{children}</>;
};

export default ProtectedRoute;
