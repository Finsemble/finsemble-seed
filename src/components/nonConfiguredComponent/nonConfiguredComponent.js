import "./nonConfiguredComponent.css";

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}

function init() {
	let contentElement = document.getElementById("contentURL");
	let appType = "Unknown app";
	let spData = FSBL.Clients.WindowClient.options.customData;
	if (spData && spData.component && spData.component.type) appType = spData.component.type;
	contentElement.innerText = `App: ${appType}.`;
}
