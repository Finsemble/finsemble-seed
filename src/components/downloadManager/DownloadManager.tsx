import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import { DownloadManager } from "@finsemble/finsemble-ui/react/components/downloadManager";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../public/assets/css/theme.css";

ReactDOM.render(
	<FinsembleProvider>
		<DownloadManager />
	</FinsembleProvider>,
	document.getElementById("DownloadManager-tsx")
);
