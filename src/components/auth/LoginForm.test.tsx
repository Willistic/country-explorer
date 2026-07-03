import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../store/authSlice";
import LoginForm from "./LoginForm";

const renderLoginForm = () => {
	const store = configureStore({ reducer: { auth: authReducer } });
	return render(
		<Provider store={store}>
			<MemoryRouter>
				<LoginForm />
			</MemoryRouter>
		</Provider>,
	);
};

describe("LoginForm", () => {
	it("renders the email and password fields", () => {
		renderLoginForm();
		expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
	});

	it("disables the submit button until both fields are filled", () => {
		renderLoginForm();
		expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
	});
});
