import React, { useState, useEffect } from 'react';
import './App.css';

// firebase functions
import firebase from './firebase';

import KabukaChart from './KabukaChart';

type IslandData = {
  name: string;
  image: string;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [myAccount, setMyAccount] = useState<firebase.User>();
  const [island, setIsland] = useState<IslandData>();

  // ログイン処理
  const login = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }

  // ユーザー情報
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setLoading(false);
      if (!user) return;
      setMyAccount(user);

      const docRef = firebase.firestore().collection('users').doc(user.uid);
      docRef.get().then(function (doc) {
        if (doc.exists) {
          const data = doc.data();
          console.log("Docuient data:", data);
          const image = user.photoURL;
          if (data && image) {
            setIsland({
              name: data.islandName,
              image: image
            });
          }
        } else {
          console.log('no island');
        }
      }).catch(function (error) {
        console.log("Error getting document:", error);
      });
    });
  }, []);

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
          <>
            {
              island
                ? <div className="island"><img src={island.image} width="36" height="36" /><span className="island-name">{island.name}</span></div>
                : <></>
            }
            <KabukaChart user={myAccount} />
          </>
      }
    </div>
  );
}

export default App;