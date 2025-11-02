import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCurrentPage, fetchCountries } from "../store/countriesSlice";
import styles from "./Pagination.module.css";

const Pagination = () => {
	const dispatch = useAppDispatch();
	const { currentPage, totalPages, itemsPerPage, totalCountries } =
		useAppSelector((state) => state.countries);

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			dispatch(setCurrentPage(page));
			dispatch(fetchCountries({ page, limit: itemsPerPage }));
		}
	};

	const getPageNumbers = () => {
		const pages = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			const startPage = Math.max(1, currentPage - 2);
			const endPage = Math.min(
				totalPages,
				startPage + maxVisiblePages - 1
			);

			if (startPage > 1) {
				pages.push(1);
				if (startPage > 2) {
					pages.push("...");
				}
			}

			for (let i = startPage; i <= endPage; i++) {
				pages.push(i);
			}

			if (endPage < totalPages) {
				if (endPage < totalPages - 1) {
					pages.push("...");
				}
				pages.push(totalPages);
			}
		}

		return pages;
	};

	if (totalPages <= 1) return null;

	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalCountries);

	return (
		<div className={styles.paginationContainer}>
			<div className={styles.paginationInfo}>
				<span className={styles.infoText}>
					Showing{" "}
					<span className={styles.highlight}>{startItem}</span> to{" "}
					<span className={styles.highlight}>{endItem}</span> of{" "}
					<span className={styles.highlight}>{totalCountries}</span>{" "}
					countries
				</span>
			</div>

			<div className={styles.paginationControls}>
				<button
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className={`${styles.pageButton} ${styles.navButton}`}
				>
					← Previous
				</button>

				<div className={styles.pageNumbers}>
					{getPageNumbers().map((page, index) => (
						<button
							key={index}
							onClick={() =>
								typeof page === "number" &&
								handlePageChange(page)
							}
							disabled={page === "..."}
							className={`${styles.pageButton} ${
								page === currentPage ? styles.activePage : ""
							} ${page === "..." ? styles.ellipsis : ""}`}
						>
							{page}
						</button>
					))}
				</div>

				<button
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className={`${styles.pageButton} ${styles.navButton}`}
				>
					Next →
				</button>
			</div>
		</div>
	);
};

export default Pagination;
