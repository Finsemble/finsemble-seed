/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import { SmartDesktopDesigner } from "@finsemble/finsemble-ui/react/components/smartDesktopDesigner/SmartDesktopDesigner";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import views from "@finsemble/finsemble-ui/react/components/smartDesktopDesigner/common/views";
import "../../../public/assets/css/theme.css";

const smartDesktopClient = new FSBL.Clients.SmartDesktopClient();

ReactDOM.render(
	<FinsembleProvider>
		<SmartDesktopDesigner
			{...{
				views,
				getConfig: (params: any, callback: any) => FSBL.Clients.ConfigClient.getValues(params, callback),
				resetProject: () => smartDesktopClient.resetProject(),
				getSDServerInfo: () => smartDesktopClient.getSDServerInfo(),
				getProjectSettings: () => smartDesktopClient.getProjectSettings(),
				updateProjectSettings: (settings: any) => smartDesktopClient.updateProjectSettings(settings),
				onThemeUpdated: (callback: any) => FSBL.Clients.SmartDesktopClient.onThemeUpdated(callback),
				selectProjectPath: () => smartDesktopClient.selectProjectPath(),
				restartFinsemble: () => FSBL.restartApplication(),
			}}
		/>
	</FinsembleProvider>,
	document.getElementById("smartDesktopDesigner")
);
