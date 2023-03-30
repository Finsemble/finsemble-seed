import React from "react";
import {
	NotificationCardPropType,
	NotificationCardHeaderShell,
	NotificationCardShell,
	NotificationCardHeaderLogo,
	NotificationCardBodyShell,
	NotificationCardBodyContentLogo,
	NotificationListRowShell,
	NotificationListRowPropType,
} from "@finsemble/finsemble-ui/react/components/notifications";

export const CustomNotificationCard: React.FunctionComponent<NotificationCardPropType> = (props) => {
	return (
		<NotificationCardShell {...props}>
			<NotificationCardHeaderShell {...props}>
				{/* The Component children should be empty if you want the default Finsemble Notification Header */}
				<NotificationCardHeaderLogo headerLogo={props.notification.headerLogo} />
				<div className="notification-card__title">Custom</div>
				{/* NotificationCardHeaderShell will render the notification context menu */}
			</NotificationCardHeaderShell>
			<NotificationCardBodyShell {...props}>
				{/* The Component children should be empty if you want the default Finsemble Notification Header */}
				<NotificationCardBodyContentLogo contentLogo={props.notification.contentLogo} />
				<div className="notification-card__body_text">Custom</div>
				{/* NotificationCardBodyShell will render the notification Actions */}
			</NotificationCardBodyShell>
		</NotificationCardShell>
	);
};

export const CustomNotificationCenterRow: React.FunctionComponent<NotificationListRowPropType> = (props) => {
	return (
		<NotificationListRowShell {...props}>
			<div className="list-row__cell">Custom</div>
			<div className="list-row__cell">Row</div>
			<div className="list-row__cell">{props.notification.title}</div>
			{/* The NotificationListRowShell will render the Notification context menu */}
		</NotificationListRowShell>
	);
};
