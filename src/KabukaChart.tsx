import React, { useState, useEffect } from 'react';

// firebase functions
import firebase from './firebase';

// chart.js
import Chart from './Chart';

type Props = {
    user: firebase.User
};

type ChartData = {
    data: any;
    options: any;
}

const KabukaChart = (props: Props) => {
    const [chartData, setChartData] = useState<ChartData>();

    useEffect(() => {
        const keyConditionFrom = '2020-09-01_AM';
        const keyConditionTo = '2020-12-31-PM';
        let history = firebase.firestore().collection('users').doc(props.user.uid).collection('kabuka')
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
    }, [props.user]);

    const createChartData = (label: string) => {
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

    return (
        chartData ? <Chart data={chartData.data} options={chartData.options} />
            : <></>
    );
};

export default KabukaChart;
