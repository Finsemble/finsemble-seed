import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import { NotificationsToasts } from "@finsemble/finsemble-ui/react/components/notifications";
import "../../../public/assets/css/theme.css";

// Example custom notification card import
// import {CustomNotificationCard} from "../notificationsCenter/CustomNotificationComponentsExample";

ReactDOM.render(
	<FinsembleProvider>
		<NotificationsToasts
		// notificationCard={CustomNotificationCard}
		/>
	</FinsembleProvider>,
	document.getElementById("notifications-toasts")
);
