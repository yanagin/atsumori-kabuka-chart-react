import React, { useState, useEffect } from 'react';

// firebase functions
import firebase from './firebase';

// chart.js
import Chart from './Chart';

import { formatDate } from './Utils';

type Props = {
    user: firebase.User
};

type ChartData = {
    data: any;
    options: any;
}

const KabukaChart = (props: Props) => {
    const [loading, setLoading] = useState(false);
    const [offsetDays, setOffsetDays] = useState(0);
    const [chartData, setChartData] = useState<ChartData>();

    useEffect(() => {
        console.log('refresh chart');
        setLoading(true);
        const weekFirstDay = getWeekFirstDay(offsetDays);
        if (!weekFirstDay) {
            return;
        }
        //console.log(weekFirstDay);
        const keyConditionFrom = formatDate(weekFirstDay) + '_AM';
        const keyConditionTo = formatDate(addDate(weekFirstDay, 7)) + '_AM';
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
        setLoading(false);
    }, [props.user, loading, offsetDays]);

    const createChartData = (label: string): ChartData => {
        return {
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

    const getWeekFirstDay = (offsetDays: number): Date | null => {
        let date = addDate(new Date(), offsetDays);
        for (let i = 0; i < 7; i++) {
            if (date.getDay() == 0) {
                return date;
            }
            date = addDate(date, -1);
        }
        return null;
    }

    const addDate = (date: Date, days: number): Date => {
        let date2 = new Date(date.getTime());
        date2.setDate(date2.getDate() + days);
        return date2;
    }

    return (
        <div>
            {
                loading
                    ? (
                        <div>読込中....</div>
                    )
                    : (
                        <>
                            {
                                chartData
                                    ? <Chart data={chartData.data} options={chartData.options} />
                                    : <></>
                            }
                            <div className="navigator">
                                <a className="btn btn-primary" onClick={() => setOffsetDays(offsetDays - 7)}>前週</a>
                                <a className="btn btn-primary" onClick={() => setOffsetDays(0)}>今週</a>
                                <a className="btn btn-primary" onClick={() => setOffsetDays(offsetDays + 7)}>来週</a>
                            </div>
                        </>
                    )
            }
        </div>
    );
};

export default KabukaChart;
