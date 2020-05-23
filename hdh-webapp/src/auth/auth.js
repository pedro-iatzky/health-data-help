import React from 'react';
import './auth.css';

import * as firebase from "firebase/app";
import 'firebaseui/dist/firebaseui.css';
import * as firebaseui from 'firebaseui';
import { firebaseConfig } from './firebaseConfig';


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const ui = new firebaseui.auth.AuthUI(firebase.auth());

const uiConfig = {
	callbacks: {
		signInSuccessWithAuthResult: function (authResult, redirectUrl) {
			// User successfully signed in.
			// Return type determines whether we continue the redirect automatically
			// or whether we leave that to developer to handle.
			return true;
		},
		uiShown: function () {
			// The widget is rendered.
			// Hide the loader.
			document.getElementById('loader').style.display = 'none';
		}
	},
	// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
	signInFlow: 'popup',
	signInSuccessUrl: '/dashboard',
	signInOptions: [{
		provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
		requireDisplayName: false,
		signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD
	}, {
		provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		scopes: [],
		customParameters: {
			// Forces account selection even when one account
			// is available.
			prompt: 'select_account'
		}
	}
	],
	// // Terms of service url.
	// tosUrl: '<your-tos-url>',
	// // Privacy policy url.
	// privacyPolicyUrl: '<your-privacy-policy-url>'
};


export class UserAuthPage extends React.Component {
	componentDidMount() {
		ui.start('#firebaseui-auth-container', uiConfig);
		if (ui.isPendingRedirect()) {
			ui.start('#firebaseui-auth-container', uiConfig);
		}
	}

	render() {

		return (
			<div className="auth-page">
				<div className="auth-header">
					<h1>Welcome to Health Data Help</h1>
				</div>
				<div id="firebaseui-auth-container"></div>
				<div id="loader">Loading...</div>
			</div>
		)
	}
}


export function checkUserIsSignedIn(fnSuccess, fnFailed) {
	return firebase.auth().onAuthStateChanged(function (user) {
		if (user) {
			return fnSuccess()
		}
		return fnFailed()
	});
}

export function getIdToken(fnSuccess) {
	firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
		return fnSuccess(idToken)
	}).catch(function (error) {
		// TODO: handle error
		console.log(error)
	});
}
