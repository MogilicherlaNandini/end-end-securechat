import App from "./App";
import rootReducers from "./store/reducer/index";
import ReactDOM from "react-dom/client"; // Corrected import
import { createStore } from "redux";
import React from "react";
import { Provider } from "react-redux";
import process from 'process';

if (typeof window !== 'undefined') {
  window.process = process;
}

// Create Redux store
const store = createStore(rootReducers);

// Create root element and render app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
