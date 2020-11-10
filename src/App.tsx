import React, { useState, useEffect } from 'react';
import './App.css';

// firebase functions
import firebase from './firebase';

import KabukaForm from './KabukaForm';
import KabukaChart from './KabukaChart';
import SignIn from './SignIn';
import SignUp from './SignUp';

type IslandData = {
  name: string;
  image: string;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [myAccount, setMyAccount] = useState<firebase.User>();
  const [island, setIsland] = useState<IslandData>();
  const [kabukaAddedAt, setKabukaAddedAt] = useState<Date>(new Date());

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
      auth(user);
    });
  }, []);

  const auth = (user: firebase.User) => {
    if (!user || !user.uid) {
      return;
    }
    
    const docRef = firebase.firestore().collection('users').doc(user.uid);
    docRef.get().then((doc: any) => {
      if (doc.exists) {
        // 登録済み
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
        // 未登録
        console.log('no island');
      }
    }).catch((error: any) => {
      console.log("Error getting document:", error);
    });
  }

  // 島の登録を伝搬させるためのコールバック
  const onSignUp = () => {
    if (!myAccount) {
      return;
    }
    auth(myAccount);
  }

  // 株価の記録を伝搬させるコールバック
  const onKabukaAdd = () => {
    setKabukaAddedAt(new Date());
  }

  const render = () => {
    if (loading) {
      return (
        <div>読込中....</div>
      )
    }
    if (!myAccount) {
      return (
        <SignIn />
      )
    }
    if (!island || !island.name) {
      return (
        <SignUp user={myAccount} onSignUp={() => onSignUp()} />
      )
    }
    return (
      <div>
        <div className="island">
          <img src={island.image} width="36" height="36" /><span className="island-name">{island.name}</span>
        </div>
        <KabukaForm user={myAccount} onKabukaAdd={() => onKabukaAdd()} />
        <KabukaChart user={myAccount} kabukaAddedAt={kabukaAddedAt} />
      </div>
    )
  }

  return (
    <div className="App">
      <h1>あつ森カブ価チャート</h1>
      {render()}
    </div>
  );
}

export default App;