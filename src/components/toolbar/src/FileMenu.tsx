import React from "react";
import { Menu } from "@finsemble/finsemble-ui/react/components/menu";
import { ToolbarIcon } from "@finsemble/finsemble-ui/react/components/toolbar";
import {
	Preferences,
	SystemLog,
	CentralLogger,
	Documentation,
	Restart,
	Reset,
	Quit,
} from "@finsemble/finsemble-ui/react/components/system";

// In the below Menu's image/icon, Date.now is added as a query string on the icon url to ensure the page is not cached
export const FileMenu = () => (
	<Menu
		id="fileMenu"
		title={
			<ToolbarIcon className="finsemble-toolbar-brand-logo" src={`../../../assets/img/Finsemble_Toolbar_Icon.png`} />
		}
	>
		<Preferences />
		<CentralLogger />
		<Documentation />
		<Restart />
		<Quit />
		{/* To add your own items to the menu, import MenuItem from
		 * "@finsemble/finsemble-ui/react/components" and add the following:
		 * <MenuItem onClick={...}>Your Item</MenuItem>
		 */}
	</Menu>
);
