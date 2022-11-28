// Checks whether the registration has completed and publishes authorization
const registrationHandler = () => {
	// When the thank you message is displayed, the registration has been completed.
	const registrationComplete = !!document.getElementsByClassName("hs-form__thankyou-message").length;
	if (registrationComplete) {
		// save username to prevent having to register again.
		localStorage.setItem("username", "default");
	} else {
		// Registration hasn't completed, or the page hasn't fully rendered. Check again to make sure page has had a
		// chance to render.
		setTimeout(registrationHandler, 500);
	}

	fin.desktop.System.getEnvironmentVariable("EVAL_FORM", (env) => {
		// check whether the username has already been set
		let username = localStorage.getItem("username");
		if (username || env !== "yes") {
			// If user has already registered, or not in evaluation mode (yarn start), don't show registration form
			username = username ? username : "default";

			// User has already registered
			FSBL.Clients.AuthenticationClient.publishAuthorization(username, { username });

			// Close registration window
			finsembleWindow.close();
		} else {
			// Hiding splash screen because it can sometimes obscure the registration form.
			// (This is probably no longer necessary because hideSplashScreenTask has been moved to the "authentication" boot phase, but better safe than sorry)
			FSBL.System.hideSplashScreen();

			// Check whether form is already showing to prevent flicker
			finsembleWindow.isShowing((err, isShowing) => {
				if (err) return console.error(err);

				if (!isShowing) {
					// Show registration form for user to register.
					finsembleWindow.show();
				}
			});
		}
	});
};

// Wait briefly for page to render before looking for the submit button
setTimeout(() => {
	// Add registration handler to submit button. Need to add this to trigger another registration check after submit
	const buttons = document.getElementsByTagName("button");
	if (buttons.length === 1) {
		buttons[0].onclick = registrationHandler;
	}

	// Add close button
	const buttonRowDiv = document.getElementsByClassName("hs-form__actions")[0];
	if (buttonRowDiv !== null) {
		const nbsp = document.createTextNode("\u00A0");
		buttonRowDiv.appendChild(nbsp);

		const closeButton = document.createElement("button");
		closeButton.setAttribute("class", "hs-form__actions__submit");
		closeButton.appendChild(document.createTextNode("Close"));
		closeButton.onclick = () => FSBL.System.exit();
		buttonRowDiv.appendChild(closeButton);
	}
}, 500);

// Startup pattern for preload. Preloads can come in any order, so we need to wait on either the window event or the
// FSBL event
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", registrationHandler);
} else {
	window.addEventListener("FSBLReady", registrationHandler);
}
