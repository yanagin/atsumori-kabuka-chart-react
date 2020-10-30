import React, { useState, useEffect } from 'react';
import './App.css';

// firebase functions
import firebase from './firebase';

import KabukaChart from './KabukaChart';

type ChartData = {
  data: any;
  options: any;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [myAccount, setMyAccount] = useState<firebase.User>();

  // ログイン処理
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setLoading(false);
      if (!user) return;
      setMyAccount(user);
    });
  }, []);

  const login = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }

  return (
    <div className="App">
      <h1>あつ森カブ価チャート</h1>
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
          <KabukaChart user={myAccount} />
      }
    </div>
  );
}

export default App;