import React, { useState, useEffect } from 'react';
import './App.css';

// firebase functions
import firebase from 'firebase';
import { fireStore } from './firebase/index'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

function App() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<firebase.firestore.DocumentData[]>([]);
  const [myAccount, setMyAccount] = useState<firebase.User>();

  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
  };

  useEffect(() => {
    const searchUsers = async () => {
      // Firestoreのコレクションを指定してデータ取得
      const res = await fireStore.collection('users').get();
      if (res.empty) return [];
      const userList: firebase.firestore.DocumentData[] = [];
      // DocumentData型にはmapメソッドが定義されていないため、forEachのループでデータを加工
      res.forEach(doc => {
        userList.push(doc.data());
      })
      setUsers(userList);
    }

    firebase.auth().onAuthStateChanged((user) => {
      setLoading(false);
      if (!user) return;
      //if (user.email !== process.env.REACT_APP_VALID_MAIL_ADDRESSES) return;
      setMyAccount(user);
      searchUsers();
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
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
          </p>
        ) :
            users.map((user, index) => {
              return <p key={index}> {user.name}</p>
            })
        }
      </header>
    </div>
  );
}

export default App;