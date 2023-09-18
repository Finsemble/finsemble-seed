/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import { ResolverContainer } from "@finsemble/finsemble-ui/react/components/fdc3Resolver/ResolverContainer";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../public/assets/css/theme.css";

ReactDOM.render(
	<FinsembleProvider>
		<ResolverContainer />
	</FinsembleProvider>,
	document.getElementById("FDC3Resolver")
);
