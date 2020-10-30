import React, { useState, useEffect } from 'react';
import './App.css';

// firebase functions
import firebase from './firebase';

// chart.js
import Chart from "./Chart";

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

  const chartData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "My First dataset",
        fill: true,
        lineTension: 0.1,
        backgroundColor: "#FFCF78",
        borderColor: "FCC156",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "FFA809",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "FFA809",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [65, 59, 80, 81, 56, 55, 40]
      }
    ]
  };
  const chartOptions = {};

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
            <Chart data={chartData} />
          </p>
        }
      </header>
    </div>
  );
}

export default App;