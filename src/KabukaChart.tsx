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
        const keyConditionFrom = formatDate(weekFirstDay) + '_AM';
        const keyConditionTo = formatDate(weekLastDay) + '_AM';
        const chart: ChartData = createChartData(keyConditionFrom.substring(0, 10));
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

            drawHorizontalLine(formatDate(weekFirstDay) + '_AM', docs, chart);

            drawChart(formatDate(weekFirstDay) + '_AM', docs, chart);
            for (let i = 1; i < 7; i++) {
                const date = addDate(weekFirstDay, i);
                drawChart(formatDate(date) + '_AM', docs, chart);
                drawChart(formatDate(date) + '_PM', docs, chart);
            }

            setChartData(chart);
        });
        setLoading(false);
    }, [props.user, loading, offsetDays, props.kabukaAddedAt]);

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
                        borderWidth: 1
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

    const drawChart = (key: string, docs: any, chart: ChartData) => {
        let doc: any = docs.filter((doc) => doc.key == key);
        let kabuka = '0';
        if (doc && doc.length > 0) {
            kabuka = doc[0].kabuka;
        }
        // console.log(key + ' -> ' + kabuka);
        chart.data.labels.push(key);
        chart.data.datasets[0].data.push(kabuka);
    }

    const drawHorizontalLine = (key: string, docs: any, chart: ChartData) => {
        let doc: any = docs.filter((doc) => doc.key == key);
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
