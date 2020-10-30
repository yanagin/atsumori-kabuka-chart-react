import React, { useState, useEffect } from 'react';
import './App.css';

// firebase functions
import firebase from './firebase';

function App() {
  const [loading, setLoading] = useState(true);
  const [myAccount, setMyAccount] = useState<firebase.User>();

  const provider = new firebase.auth.GoogleAuthProvider();

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setLoading(false);
      if (!user) return;
      setMyAccount(user);
    });
  }, []);

  const login = () => {
    firebase.auth().signInWithRedirect(provider);
  }

  return (
    <div className="App">
      <header className="App-header">
        {loading ? (
          <p>
            LOADING.....
          </p>
        ) : !myAccount ? (
          <p>
            ログインが必要です<br />
            <a onClick={login}>Login as google</a>
          </p>
        ) :
          <p>
            ログイン済み
          </p>
        }
      </header>
    </div>
  );
}

export default App;