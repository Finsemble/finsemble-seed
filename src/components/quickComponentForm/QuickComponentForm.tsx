/*!
 * DEPRECATED - The Quick Components have been deprecated. The feature is no longer availble by default, and the
 * documentation has been updated to reflect this. The functionality will be fully removed in a future release.
 * The quick component is a form that will create a new component that the user can spawn from the app launcher.
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */

import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import { QuickComponentForm } from "@finsemble/finsemble-ui/react/components/quickComponentForm";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../public/assets/css/theme.css";

ReactDOM.render(
	<FinsembleProvider>
		<QuickComponentForm />
	</FinsembleProvider>,
	document.getElementById("QuickComponentForm-tsx")
);
