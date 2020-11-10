import React, { useState, useEffect } from 'react';

// firebase functions
import firebase from './firebase';

// chart.js
import Chart from './Chart';
import 'chartjs-plugin-annotation';

import { formatDate } from './Utils';

type Props = {
    user: firebase.User
    kabukaAddedAt: Date
};

type ChartData = {
    data: any;
    options: any;
}

enum AMPM {
    AM,
    PM
}

var counter = 0;

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
        const weekLastDay = addDate(weekFirstDay, 7);
        const keyConditionFrom = getKey(weekFirstDay, AMPM.AM);
        const keyConditionTo = getKey(weekLastDay, AMPM.AM);
        const chart: ChartData = createChartData(weekFirstDay);
        let history = firebase.firestore().collection('users').doc(props.user.uid).collection('kabuka')
            .where('key', '>=', keyConditionFrom)
            .where('key', '<', keyConditionTo)
            .orderBy('key', 'desc');
        history.get().then(snapshot => {
            var docs: any = [];
            snapshot.docs.reverse().forEach(doc => {
                var data = doc.data();
                docs.push({ key: data.key.trim(), kabuka: data.kabuka });
            });

            drawHorizontalLine(weekFirstDay, AMPM.AM, docs, chart);

            drawChart(weekFirstDay, AMPM.AM, docs, chart);
            for (let i = 1; i < 7; i++) {
                const date = addDate(weekFirstDay, i);
                drawChart(date, AMPM.AM, docs, chart);
                drawChart(date, AMPM.PM, docs, chart);
            }

            setChartData(chart);
        });
        setLoading(false);
    }, [props.user, loading, offsetDays, props.kabukaAddedAt]);

    const createChartData = (keyConditionFrom: Date): ChartData => {
        const label = formatDate(keyConditionFrom) + '週のカブ価';
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
                        label: (tooltipItem: any, data: any) => {
                            return 'kabuka: ' + Math.round(tooltipItem.yLabel * 100) / 100;
                        }
                    }
                },
                annotation: {
                    events: ["click"],
                    annotations: [
                      {
                        drawTime: "afterDatasetsDraw",
                        id: "hline" + label,    // valueの変更を反映するためユニークな値にする
                        type: "line",
                        mode: "horizontal",
                        scaleID: "y-axis-0",
                        value: "0",
                        borderColor: "blue",
                        borderWidth: 1,
                        borderDash: [10, 10],
                        borderDashOffset: 5,
                      }
                    ]
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

    const getKey = (datetime: Date, ampm: AMPM) => {
        return formatDate(datetime) + '_' + (ampm == AMPM.AM ? 'AM' : 'PM');
    }

    const drawChart = (datetime: Date, ampm: AMPM, docs: any, chart: ChartData) => {
        const key = getKey(datetime, ampm);
        let doc: any = docs.filter((doc: any) => doc.key == key);
        let kabuka = datetime > new Date() ? Number.NaN: 0;
        if (doc && doc.length > 0) {
            kabuka = doc[0].kabuka;
        }
        // console.log(key + ' -> ' + kabuka);
        chart.data.labels.push(key);
        chart.data.datasets[0].data.push(kabuka);
    }

    const drawHorizontalLine = (datetime: Date, ampm: AMPM, docs: any, chart: ChartData) => {
        const key = getKey(datetime, ampm);
        let doc: any = docs.filter((doc: any) => doc.key == key);
        let kabuka = '0';
        if (doc && doc.length > 0) {
            kabuka = doc[0].kabuka;
        }
        chart.options.annotation.annotations[0].value = kabuka;
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
