import React, { useState, useEffect } from 'react';
import './App.css';

// firebase functions
import firebase from './firebase';

function App() {
  const [loading, setLoading] = useState(true);
  const [myAccount, setMyAccount] = useState<firebase.User>();

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setLoading(false);
      if (!user) return;
      setMyAccount(user);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {loading ? (
          <p>
            LOADING.....
          </p>
        ) : !myAccount ? (
          <p>
            ログインが必要です
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