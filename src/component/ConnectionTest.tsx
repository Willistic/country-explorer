import React, { useState } from "react";

type ConnectionTestProps = Record<string, never>;

interface ApiResponse {
	success: boolean;
	data?: unknown;
	error?: string;
	status?: number;
}

export const ConnectionTest: React.FC<ConnectionTestProps> = () => {
	const [testResults, setTestResults] = useState<{
		[key: string]: ApiResponse;
	}>({});
	const [isLoading, setIsLoading] = useState(false);

	const baseUrl =
		import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

	const runTest = async (testName: string, url: string) => {
		console.log(`🧪 Running test: ${testName}`);
		console.log(`📡 Testing URL: ${url}`);

		try {
			const startTime = performance.now();
			const response = await fetch(url);
			const endTime = performance.now();
			const responseTime = Math.round(endTime - startTime);

			console.log(`⏱️ Response time: ${responseTime}ms`);
			console.log(`📊 Status: ${response.status} ${response.statusText}`);

			const contentType = response.headers.get("content-type");
			let data;

			if (contentType && contentType.includes("application/json")) {
				data = await response.json();
			} else {
				data = await response.text();
			}

			const result: ApiResponse = {
				success: response.ok,
				data: data,
				status: response.status,
			};

			console.log(`✅ Test ${testName} completed:`, result);
			setTestResults((prev) => ({ ...prev, [testName]: result }));
		} catch (error) {
			console.error(`❌ Test ${testName} failed:`, error);
			const result: ApiResponse = {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
			setTestResults((prev) => ({ ...prev, [testName]: result }));
		}
	};

	const runAllTests = async () => {
		setIsLoading(true);
		setTestResults({});

		const tests = [
			{
				name: "Health Check",
				url: baseUrl.replace("/api/v1", "") + "/health",
			},
			{
				name: "Countries List",
				url: `${baseUrl}/countries?page=1&limit=5`,
			},
			{
				name: "Countries Search",
				url: `${baseUrl}/countries/search?q=united`,
			},
			{ name: "Specific Country", url: `${baseUrl}/countries/1` },
		];

		for (const test of tests) {
			await runTest(test.name, test.url);
			// Small delay between tests
			await new Promise((resolve) => setTimeout(resolve, 500));
		}

		setIsLoading(false);
	};

	const TestResult: React.FC<{ name: string; result: ApiResponse }> = ({
		name,
		result,
	}) => (
		<div
			className={`test-result ${result.success ? "success" : "error"}`}
			style={{
				border: `2px solid ${result.success ? "#4caf50" : "#f44336"}`,
				borderRadius: "8px",
				padding: "12px",
				margin: "8px 0",
				backgroundColor: result.success ? "#e8f5e9" : "#ffebee",
			}}
		>
			<h4
				style={{
					margin: "0 0 8px 0",
					color: result.success ? "#2e7d32" : "#c62828",
				}}
			>
				{result.success ? "✅" : "❌"} {name}
			</h4>

			{result.status && (
				<p>
					<strong>Status:</strong> {result.status}
				</p>
			)}

			{result.error && (
				<p style={{ color: "#c62828" }}>
					<strong>Error:</strong> {result.error}
				</p>
			)}

			{result.success && result.data != null && (
				<details style={{ marginTop: "8px" }}>
					<summary style={{ cursor: "pointer", fontWeight: "bold" }}>
						View Response Data
					</summary>
					<pre
						style={{
							background: "#f5f5f5",
							padding: "8px",
							borderRadius: "4px",
							overflow: "auto",
							fontSize: "12px",
						}}
					>
						{typeof result.data === "string"
							? result.data
							: JSON.stringify(result.data, null, 2)}
					</pre>
				</details>
			)}
		</div>
	);

	return (
		<div
			style={{
				padding: "20px",
				maxWidth: "800px",
				margin: "0 auto",
				fontFamily: "Arial, sans-serif",
			}}
		>
			<h2>🔧 Backend-Frontend Connection Test</h2>

			<div
				style={{
					marginBottom: "20px",
					padding: "16px",
					backgroundColor: "#f0f0f0",
					borderRadius: "8px",
				}}
			>
				<h3>Configuration</h3>
				<p>
					<strong>Base URL:</strong> {baseUrl}
				</p>
				<p>
					<strong>Expected Backend Port:</strong> 5001
				</p>
				<p>
					<strong>Frontend Port:</strong> 5173
				</p>
			</div>

			<button
				onClick={runAllTests}
				disabled={isLoading}
				style={{
					padding: "12px 24px",
					fontSize: "16px",
					backgroundColor: "#2196f3",
					color: "white",
					border: "none",
					borderRadius: "4px",
					cursor: isLoading ? "not-allowed" : "pointer",
					opacity: isLoading ? 0.7 : 1,
				}}
			>
				{isLoading ? "Running Tests..." : "Run Connection Tests"}
			</button>

			{Object.keys(testResults).length > 0 && (
				<div style={{ marginTop: "24px" }}>
					<h3>Test Results</h3>
					{Object.entries(testResults).map(([name, result]) => (
						<TestResult key={name} name={name} result={result} />
					))}
				</div>
			)}

			<div
				style={{
					marginTop: "24px",
					padding: "16px",
					backgroundColor: "#fff3cd",
					borderRadius: "8px",
				}}
			>
				<h3>💡 Troubleshooting Tips</h3>
				<ul>
					<li>
						Check if MongoDB is running: <code>lsof -i :27017</code>
					</li>
					<li>
						Check if backend is running: <code>lsof -i :5001</code>
					</li>
					<li>Verify environment variables in .env file</li>
					<li>Check browser console for additional error messages</li>
					<li>Ensure CORS is properly configured in backend</li>
				</ul>
			</div>
		</div>
	);
};

export default ConnectionTest;
