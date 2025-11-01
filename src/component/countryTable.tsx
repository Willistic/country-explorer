import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCountries } from "../store/countriesSlice";
import Pagination from "./Pagination";
import styles from "./CountryTable.module.css";

const CountryTable = () => {
	const dispatch = useAppDispatch();
	const { countries, loading, error, currentPage, itemsPerPage } =
		useAppSelector((state) => state.countries);

	// Calculate the countries to display on current page
	const paginatedCountries = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return countries.slice(startIndex, endIndex);
	}, [countries, currentPage, itemsPerPage]);

	useEffect(() => {
		dispatch(fetchCountries());
	}, [dispatch]);

	if (loading) {
		return (
			<div className={styles.loadingContainer}>
				<div className={styles.loadingSpinner}></div>
				<span className={styles.loadingText}>Loading countries...</span>
			</div>
		);
	}

	if (error) {
		return <div className={styles.errorContainer}>Error: {error}</div>;
	}

	return (
		<div className={styles.tableContainer}>
			<table className={styles.table}>
				<thead className={styles.tableHeader}>
					<tr className={styles.headerRow}>
						<th className={styles.headerCell}>Flag</th>
						<th className={styles.headerCell}>Country</th>
						<th className={styles.headerCell}>Capital</th>
						<th className={styles.headerCell}>Population</th>
					</tr>
				</thead>
				<tbody className={styles.tableBody}>
					{paginatedCountries.map((country, index) => (
						<tr key={index} className={styles.bodyRow}>
							<td className={styles.flagCell}>
								<img
									src={country.flags.png}
									alt={
										country.flags.alt ||
										`Flag of ${country.name.common}`
									}
									className={styles.flag}
								/>
							</td>
							<td
								className={`${styles.bodyCell} ${styles.countryName}`}
							>
								{country.name.common}
							</td>
							<td
								className={`${styles.bodyCell} ${styles.capital}`}
							>
								{country.capital?.[0] || "N/A"}
							</td>
							<td
								className={`${styles.bodyCell} ${styles.population}`}
							>
								{country.population.toLocaleString()}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<Pagination />
		</div>
	);
};

export default CountryTable;
