import styles from "./WorldMapHeader.module.css";

const WorldMapHeader = () => {
	return (
		<div className={styles.mapContainer}>
			<svg
				className={styles.worldMap}
				viewBox='0 0 1000 500'
				xmlns='http://www.w3.org/2000/svg'
			>
				{/* Simplified world map paths */}

				{/* North America */}
				<path
					d='M 100 150 Q 80 140 60 160 Q 40 180 50 200 Q 60 220 80 210 Q 100 200 120 180 Q 140 160 160 140 Q 180 120 200 140 Q 220 160 240 180 Q 260 200 280 190 Q 300 180 280 160 Q 260 140 240 130 Q 220 120 200 110 Q 180 100 160 110 Q 140 120 120 130 Q 100 140 100 150 Z'
					className={styles.continent}
				/>

				{/* South America */}
				<path
					d='M 180 250 Q 160 240 140 260 Q 120 280 130 320 Q 140 360 160 380 Q 180 400 200 390 Q 220 380 230 360 Q 240 340 230 320 Q 220 300 210 280 Q 200 260 190 250 Q 185 245 180 250 Z'
					className={styles.continent}
				/>

				{/* Europe */}
				<path
					d='M 450 120 Q 430 110 410 130 Q 390 150 400 170 Q 410 190 430 180 Q 450 170 470 160 Q 490 150 510 160 Q 530 170 550 160 Q 570 150 560 130 Q 550 110 530 120 Q 510 130 490 125 Q 470 120 450 120 Z'
					className={styles.continent}
				/>

				{/* Africa */}
				<path
					d='M 400 200 Q 380 190 360 210 Q 340 230 350 270 Q 360 310 380 340 Q 400 370 420 360 Q 440 350 460 340 Q 480 330 490 310 Q 500 290 490 270 Q 480 250 470 230 Q 460 210 450 200 Q 425 195 400 200 Z'
					className={styles.continent}
				/>

				{/* Asia */}
				<path
					d='M 550 140 Q 530 130 510 150 Q 490 170 500 190 Q 510 210 530 220 Q 550 230 580 220 Q 610 210 640 200 Q 670 190 700 200 Q 730 210 760 200 Q 790 190 800 170 Q 810 150 800 130 Q 790 110 770 120 Q 750 130 730 125 Q 710 120 690 130 Q 670 140 650 135 Q 630 130 610 135 Q 590 140 570 138 Q 560 139 550 140 Z'
					className={styles.continent}
				/>

				{/* Australia */}
				<path
					d='M 700 320 Q 680 310 660 330 Q 640 350 650 370 Q 660 390 680 380 Q 700 370 720 360 Q 740 350 750 330 Q 760 310 750 300 Q 740 290 720 300 Q 710 305 700 320 Z'
					className={styles.continent}
				/>

				{/* Decorative dots for islands and small countries */}
				<circle cx='800' cy='280' r='3' className={styles.island} />
				<circle cx='820' cy='300' r='2' className={styles.island} />
				<circle cx='780' cy='320' r='2' className={styles.island} />
				<circle cx='150' cy='100' r='2' className={styles.island} />
				<circle cx='320' cy='140' r='2' className={styles.island} />
				<circle cx='380' cy='160' r='2' className={styles.island} />

				{/* Animated flight paths */}
				<path
					d='M 200 180 Q 350 100 500 170'
					className={styles.flightPath}
					stroke='url(#flightGradient)'
					fill='none'
					strokeWidth='2'
				/>
				<path
					d='M 500 180 Q 650 120 750 200'
					className={styles.flightPath}
					stroke='url(#flightGradient)'
					fill='none'
					strokeWidth='2'
				/>

				{/* Gradient definitions */}
				<defs>
					<linearGradient
						id='flightGradient'
						x1='0%'
						y1='0%'
						x2='100%'
						y2='0%'
					>
						<stop
							offset='0%'
							stopColor='#3b82f6'
							stopOpacity='0.8'
						/>
						<stop
							offset='50%'
							stopColor='#06b6d4'
							stopOpacity='0.6'
						/>
						<stop
							offset='100%'
							stopColor='#3b82f6'
							stopOpacity='0.3'
						/>
					</linearGradient>

					<radialGradient
						id='continentGradient'
						cx='50%'
						cy='50%'
						r='50%'
					>
						<stop
							offset='0%'
							stopColor='#10b981'
							stopOpacity='0.8'
						/>
						<stop
							offset='100%'
							stopColor='#059669'
							stopOpacity='0.6'
						/>
					</radialGradient>
				</defs>
			</svg>

			{/* Overlay text */}
			<div className={styles.mapOverlay}>
				<h1 className={styles.mapTitle}>🌍 Countries Explorer</h1>
				<p className={styles.mapSubtitle}>
					Discover the world, one country at a time
				</p>
			</div>
		</div>
	);
};

export default WorldMapHeader;
