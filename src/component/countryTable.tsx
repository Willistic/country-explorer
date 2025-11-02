import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCountries } from "../store/countriesSlice";
import Pagination from "./Pagination";
import styles from "./CountryTable.module.css";

const CountryTable = () => {
	const dispatch = useAppDispatch();
	const { countries, loading, error, currentPage, itemsPerPage } =
		useAppSelector((state) => state.countries);

	// No client-side pagination needed - server handles pagination
	const paginatedCountries = countries;

	useEffect(() => {
		console.log("CountryTable: Fetching countries with:", {
			page: currentPage,
			limit: itemsPerPage,
		});
		dispatch(fetchCountries({ page: currentPage, limit: itemsPerPage }));
	}, [dispatch, currentPage, itemsPerPage]);

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
						<th className={styles.headerCell}>Region</th>
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
							<td
								className={`${styles.bodyCell} ${styles.region}`}
							>
								{country.region}
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
