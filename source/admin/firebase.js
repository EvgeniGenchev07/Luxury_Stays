import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {data} from "./g3tZ3Mkmr.js";
const firebaseConfig = {...data};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };
