window.quitFinsemble = function quitFinsemble() {
	FSBL.shutdownApplication();
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}

/**
 * Wire up click handlers for mouse and keyboard interactions
 *
 * @param {HTMLElement} element - the element that should have the click handlers
 * @param {Function} clickEventCallback - the function called when clicked
 */
function a11yClick(element, clickEventCallback) {
	// Mouse event
	element.addEventListener("click", (e) => {
		clickEventCallback(e);
	});

	// Keyboard event
	element.addEventListener("keydown", (e) => {
		if (["Enter", "Space"].includes(e.code)) {
			clickEventCallback(e);
		}
	});
}

function init() {
	// Track which stop/slide the carousel is on
	let carousel_counter = 1; // indexing on 1 and not 0 because the CSS nth-child psuedo-class indexes on 1

	// Number of slides in the carousel
	let slide_length = document.querySelectorAll(".slide, .slide-active").length;

	// Swap out the slides
	function updateTextBlocks() {
		// Make the previously active stop look inactive. Or, turn the filled-in dot into an empty dot.
		document.querySelector("#carousel .stop-active").className = "stop";

		// Set the newly active stop to look active. Or, turn an empty dot into a filled-in dot.
		document.querySelector(`#carousel .stop:nth-child(${carousel_counter})`).className = "stop-active";

		// Hide the previously active slide
		document.querySelector(".slide-active").className = "slide";

		// Show the newly active slide
		document.querySelector(`.slide:nth-child(${carousel_counter})`).className = "slide-active";
	}

	function manageButtonDisplayed() {
		// When the carousel is on its last stop, show the "Close" button.
		// Otherwise, show the "Next" button.
		if (carousel_counter === slide_length) {
			document.getElementById("next").style.display = "none";
			document.getElementById("close").style.display = "block";
		} else {
			document.getElementById("next").style.display = "block";
			document.getElementById("close").style.display = "none";
		}
	}

	window.next = function next() {
		// Add 1, but don't go over the number of slides
		carousel_counter = Math.min(carousel_counter + 1, slide_length);

		// Update the rest of the page to reflect the new content
		updateTextBlocks();
		manageButtonDisplayed();
	};

	window.close = function close() {
		(async function () {
			await FSBL.Clients.WindowClient.close({
				removeFromWorkspace: true,
				closeWindow: true,
			});
		})();
	};

	function openUserGuide() {
		FSBL.Clients.DialogManager.spawnDialog(
			{
				name: "User Guide",
				width: 750,
				url: "https://documentation.finsemble.com/tutorial-finsemble-user-guide.html",
				left: "adjacent",
			},
			{},
			() => {}
		);
	}

	/**
	 * Go directly to a particular page
	 * @param {Integer} index - the page number to jump to, starts at 1
	 **/
	function jumpTo(index) {
		carousel_counter = index;
		updateTextBlocks();
		manageButtonDisplayed();
	}

	// Wire up the carousel stops
	Array.from(document.querySelectorAll("#carousel span")).forEach((element) => {
		a11yClick(element, () => {
			jumpTo(Number(element.getAttribute("data-index")));
		});
	});

	// Wire up User Guide button
	a11yClick(document.querySelector(".landing_rectangle"), openUserGuide);
}
