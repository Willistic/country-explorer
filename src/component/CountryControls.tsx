import { useAppSelector, useAppDispatch } from "../store/hooks";
import { clearCountries, fetchCountries } from "../store/countriesSlice";
import styles from "./CountryControls.module.css";

const CountryControls = () => {
	const dispatch = useAppDispatch();
	const { countries, loading, currentPage, totalPages, itemsPerPage } =
		useAppSelector((state) => state.countries);

	const handleRefresh = () => {
		dispatch(fetchCountries());
	};

	const handleClear = () => {
		dispatch(clearCountries());
	};

	return (
		<div className={styles.controlsContainer}>
			<div className={styles.statsSection}>
				<h3 className={styles.title}>📊 Statistics</h3>
				<p className={styles.statsText}>
					<span className={styles.statsNumber}>
						{countries.length}
					</span>
					{countries.length === 1 ? " Country" : " Countries"} Total
				</p>
				{totalPages > 0 && (
					<p className={styles.paginationStats}>
						Page {currentPage} of {totalPages} • {itemsPerPage} per
						page
					</p>
				)}
			</div>

			<div className={styles.buttonsSection}>
				<button
					onClick={handleRefresh}
					disabled={loading}
					className={`${styles.button} ${styles.refreshButton}`}
				>
					{loading ? (
						<>
							<span className={styles.spinner}></span>
							Loading...
						</>
					) : (
						<>🔄 Refresh Countries</>
					)}
				</button>

				<button
					onClick={handleClear}
					className={`${styles.button} ${styles.clearButton}`}
					disabled={loading}
				>
					🗑️ Clear All
				</button>
			</div>
		</div>
	);
};

export default CountryControls;
