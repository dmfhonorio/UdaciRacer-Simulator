// @ts-check

// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
	my_racers: undefined,
	track_segment: undefined
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				store = { ...store, my_racers: racers }
				renderAt('#racers', html)
			})
	} catch (error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function (event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}
		if (target.parentNode.matches('.card.track')) {
			handleSelectTrack(target.parentNode)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}
		if (target.parentNode.matches('.card.podracer')) {
			handleSelectPodRacer(target.parentNode)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()

			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}
	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch (error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {

	// TODO - Get player_id and track_id from the store
	const { track_id, player_id } = store;

	if (!track_id || !player_id) return;

	try {
		// const race = TODO - invoke the API call to create the race, then save the result
		const race = await createRace(player_id, track_id);

		// TODO - update the store with the race id
		const race_id = race.ID - 1;
		store = { ...store, race_id: race_id, track_segment: race.Track.segments.length }

		// render starting UI
		renderAt('#race', renderRaceStartView(race.Track, race.Cars))

		// The race has been created, now start the countdown
		// TODO - call the async function runCountdown
		await runCountdown()

		// TODO - call the async function startRace
		await startRace(race_id)

		// TODO - call the async function runRace
		await runRace(race_id)
	} catch (error) {
		console.log("Error handling race creation and start", error)
	}
}

function runRace(raceID) {
	return new Promise(resolve => {
		// TODO - use Javascript's built in setInterval method to get race info every 500ms

		const raceInterval = setInterval(() => {
			getRace(raceID)
				.then((race) => {

					race.positions = race.positions.map(position => {
						const myRacer = store.my_racers.find(racer => racer.id == position.id);
						return {
							...position,
							driver_name: myRacer.driver_name,
							color: myRacer.color
						}
					})

					if (race.status == 'in-progress') {
						// TODO - if the race info status property is "in-progress", update the leaderboard by calling:
						renderAt('#leaderBoard', raceProgress(race.positions))
						// TODO - if the race info status property is "finished", run the following:
					} else if (race.status == 'finished') {
						clearInterval(raceInterval);
						renderAt('#race', resultsView(race.positions))
						resolve(race)
					}
				})
				.catch(err => console.log(err))
		}, 500)
	}).catch(err => console.log(err))
	// remember to add error handling for the Promise
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			document.getElementById('big-numbers').innerHTML = --timer
			const countdownInterval = setInterval(() => {
				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer
				// TODO - if the countdown is done, clear the interval, resolve the promise, and return
				if (timer == 0) {
					clearInterval(countdownInterval);
					resolve();
				}
			}, 1000)


		})
	} catch (error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if (selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected racer to the store
	store = { ...store, player_id: parseInt(target.id) }
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if (selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store
	store = { ...store, track_id: parseInt(target.id) }

}

function handleAccelerate(target) {
	// TODO - Invoke the API call to accelerate
	accelerate(store.race_id)
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling, photo, color } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3 style="border-color: ${color}">${driver_name}</h3>
			<p>Top Speed: ${top_speed}</p>
			<p>Acceleration: ${acceleration}</p>
			<p>Handling: ${handling}</p>
			<img src=${photo}></img>
		</li>
	`
}

function renderFormula1Car(name, color, translateY) {
	return `
		<div class="formula1-car" style="transform: translateX(${translateY}px)">
			<p class="car-name">${name}</p>
			<div style="background-color: ${color}" class="car-rear"></div>
			<div style="background-color: ${color}" class="car-rear-tires"></div>
			<div style="background-color: ${color}" class="car-body"></div>
			<div style="background-color: ${color}" class="car-front-tires"></div>
			<div style="background-color: ${color}" class="car-front"></div>
		</div>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name, photo } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
			<img src=${photo} />
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main class="main-results-view">
			${raceProgress(positions)}
			<a href="/race" class="button">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	// let userPlayer = positions.find(e => e.id === store.player_id)
	// userPlayer.driver_name += " (you)"

	const racers = positions.map(racer => {
		let driver_name = racer.driver_name.split(' ')[1].substr(0, 3);
		if (racer.id === store.player_id) {
			driver_name += " (you)"
		}
		return { ...racer, driver_name }
	})
	positions = [...racers].sort((a, b) => (a.segment > b.segment) ? -1 : 1)

	let count = 1
	const results = positions.map(p => {
		return `
			<tr class="driver-row">
				<td>
					${count++}
				</td>
				<td class="leaderboard-driver-name">
					${p.driver_name}
				</td>
				<td>
					${p.segment}
				</td>
			</tr>
		`
	})

	return `
		<main>
		<section id="leaderBoard">
			<h3>Leaderboard</h3>
				<table class="leaderboard-table">
					${results.join('')}
				</table>
			</section>
		</main>
		<main>
		<section class="race-simulator">
			<h3>Track</h3>
				${racers.map(racer => renderFormula1Car(racer.driver_name, racer.color, racer.segment / store.track_segment * 1000)).join('')}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const LOCAL_SERVER = 'http://localhost:3000'
const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	const getServerTracks = () => {
		return fetch(`${SERVER}/api/tracks`).then(res => res.json())
	}
	const getMyTracks = () => {
		return fetch(`${LOCAL_SERVER}/myTracks`).then(res => res.json())
	}
	return Promise.all([getServerTracks(), getMyTracks()])
		.then(res => {
			console.log(res)
			return res[0].map(track => {
				const myTrack = res[1].find(myR => myR.id == track.id)
				if (myTrack) {
					return {
						...track,
						photo: myTrack.photo,
						name: myTrack.name
					}
				}
				return track;
			})
		})
		.catch(err => {
			throw new Error(`There was a problem getting tracks ${err}`)
		})
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`
	const getServerRacers = () => {
		return fetch(`${SERVER}/api/cars`).then(res => res.json())
	}
	const getMyRacers = () => {
		return fetch(`${LOCAL_SERVER}/myRacers`).then(res => res.json())
	}
	return Promise.all([getServerRacers(), getMyRacers()])
		.then(res => {
			console.log(res)
			return res[0].map(racer => {
				const myRacer = res[1].find(myR => myR.id == racer.id)
				if (myRacer) {
					return {
						...racer,
						photo: myRacer.photo,
						driver_name:
							myRacer.driver_name,
						color: myRacer.color
					}
				}
				return racer;
			})
		})
		.catch(err => {
			throw new Error(`There was a problem getting racers: ${err}`);
		})
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }

	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
		.then(res => res.json())
		.catch(err => {
			throw new Error(`Problem with createRace request: ${err}`);
		})
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`)
		.then(res => res.json())
		.catch(err => {
			throw new Error(`There was a problem getting race ${id}: ${err}`);
		})
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
		.then(res => id)
		.catch(err => {
			throw new Error(`Problem with getRace request:: ${err}`)
		})
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts()
	})
		.then(res => id)
		.catch(err => {
			throw new Error(`There was a problem accelarating ${id}: ${err}`)
		})
}
