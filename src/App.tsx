import React, { useState, useEffect } from 'react';
import './App.css';

// firebase functions
import firebase from './firebase';

// chart.js
import Chart from './Chart';

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

  // ログインしてユーザー情報がセットされたらチャートを表示
  useEffect(() => {
    refreshChart();
  }, [myAccount])

  const login = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }

  // グラフ
  const [chartData, setChartData] = useState<ChartData>();

  const createChartData = (label) => {
    return {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: label,
          borderWidth: 1,
          data: []
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
          callbacks: {
              label: (tooltipItem, data) => {
                  return 'kabuka: ' + Math.round(tooltipItem.yLabel * 100) / 100;
              }
          }
        }
      }
    }
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
      const chart: ChartData = createChartData('test');
      history.get().then(snapshot => {
        var docs = snapshot.docs.reverse();
        docs.forEach(doc => {
          var data = doc.data();
          //console.log(data);
          if (chart.data.labels.indexOf(data.key) >= 0) {
            return;
          }
          chart.data.labels.push(data.key);
          chart.data.datasets[0].data.push(data.kabuka);
        });
        setChartData(chart);
      });
  }

  return (
    <div className="App">
      <h1>あつ森カブ値チャート</h1>
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
          {chartData ? <Chart data={chartData.data} options={chartData.options} /> : <></>}
        </p>
      }
    </div>
  );
}

export default App;