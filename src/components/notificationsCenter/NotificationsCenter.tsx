/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import { NotificationsCenter } from "@finsemble/finsemble-ui/react/components/notifications";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../public/assets/css/theme.css";

// Example custom notification card import
// import {CustomNotificationCard, CustomNotificationCenterRow} from "./CustomNotificationComponentsExample";

ReactDOM.render(
	<FinsembleProvider>
		<NotificationsCenter
		// notificationCard={CustomNotificationCard}
		// notificationListRow={CustomNotificationCenterRow}
		/>
	</FinsembleProvider>,
	document.getElementById("notifications-center")
);
