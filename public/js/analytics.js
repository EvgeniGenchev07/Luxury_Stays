import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js';
import { getPerformance } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-performance.js';

const firebaseConfig = {

    apiKey: "AIzaSyBgQlkfp_s0Z4TBagISenG1KA7-NFZUo4A",

    authDomain: "luxurystayskapanaplovdiv.firebaseapp.com",

    projectId: "luxurystayskapanaplovdiv",

    storageBucket: "luxurystayskapanaplovdiv.firebasestorage.app",

    messagingSenderId: "189672077614",

    appId: "1:189672077614:web:8d43d734c7ddf9609062bf",

    measurementId: "G-WHFW92MV10"

};


const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const perf = getPerformance(app);