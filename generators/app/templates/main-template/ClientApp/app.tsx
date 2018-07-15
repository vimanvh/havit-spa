import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./components/App";

const renderApp = () => {
    ReactDOM.render(
        <App />,
        document.getElementById("app")
    );
};

document.addEventListener("DOMContentLoaded", function (event) {
    renderApp();
});