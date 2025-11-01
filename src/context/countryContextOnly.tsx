import { createContext, useContext } from "react";

// Define the country type based on the REST Countries API
export interface Country {
	name: {
		common: string;
		official?: string;
	};
	capital?: string[];
	population: number;
	flags: {
		png: string;
		svg: string;
		alt?: string;
	};
	// Add other fields as needed
}

// Define the context type
export interface CountryContextType {
	countries: Country[];
	setCountries: (countries: Country[]) => void;
}

// Create context with proper typing
export const CountryContext = createContext<CountryContextType | undefined>(
	undefined
);

// Custom hook to use the country context
export const useCountries = () => {
	const context = useContext(CountryContext);
	if (context === undefined) {
		throw new Error("useCountries must be used within a CountryProvider");
	}
	return context;
};
