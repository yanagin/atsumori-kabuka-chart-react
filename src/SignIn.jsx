import * as React from "react";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

// firebase functions
import firebase from './firebase';

const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
};

const SignIn = (props) => {
    return (
        <div>
          ログインが必要です<br />
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        </div>
    );
};

export default SignIn;
