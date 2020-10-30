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

  const refreshChart = () => {
    if (!myAccount) {
      return;
    }
    const keyConditionFrom = '2020-09-01_AM';
    const keyConditionTo = '2020-12-31-PM';
    let history = firebase.firestore().collection('users').doc(myAccount.uid).collection('kabuka')
      .where('key', '>=', keyConditionFrom)
      .where('key', '<', keyConditionTo)
      .orderBy('key', 'desc');
      history.get().then(snapshot => {
        var docs = snapshot.docs.reverse();
        docs.forEach(doc => {
          var data = doc.data();
          console.log(data);
        });
      });
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
            ログイン済み<br />
            <a onClick={refreshChart}>Refresh chart</a>
          </p>
        }
      </header>
    </div>
  );
}

export default App;