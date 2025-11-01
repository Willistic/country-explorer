import { useState, useEffect, type ReactNode } from "react";
import { CountryContext, type Country } from "./countryContextOnly";

type Props = { children: ReactNode };

const CountryProvider = ({ children }: Props) => {
	const [countries, setCountries] = useState<Country[]>([]);
	console.log("countries", countries);

	useEffect(() => {
		const fetchCountries = async () => {
			try {
                const data = await fetch(
					"https://restcountries.com/v3.1/all?fields=name,capital,population,flags"
				);
				const response = await data.json();
				setCountries(response);
            } catch (error) {
                console.log('Error while fetching data', error);
                
            }
		};
		fetchCountries();
	}, []);
	return (
		<CountryContext.Provider
			value={{
				countries,
				setCountries,
			}}
		>
			{children}
		</CountryContext.Provider>
	);
};

export default CountryProvider;
