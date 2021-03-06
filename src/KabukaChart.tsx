import React, { useState, useEffect } from 'react';

// firebase functions
import firebase from './firebase';

// chart.js
import Chart from './Chart';
import 'chartjs-plugin-annotation';

import { formatDisplayDate, AMPM, getKabukaKey, getDayOfWeek, getWeekFirstDay, addDate } from './Utils';

type Props = {
    user: firebase.User
    kabukaAddedAt: Date
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
        const weekLastDay = addDate(weekFirstDay, 7);
        const keyConditionFrom = getKabukaKey(weekFirstDay, AMPM.AM);
        const keyConditionTo = getKabukaKey(weekLastDay, AMPM.AM);
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

    const createChartData = (datetime: Date): ChartData => {
        const label = formatDisplayDate(datetime) + '週のカブ価';
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
                            return 'カブ価：' + (Math.round(tooltipItem.yLabel * 100) / 100) + 'ベル';
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
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            callback: (value: any, index: any, values: any) => {
                                return value + 'ベル';
                            }
                        }
                    }]
                }
            }
        }
    }

    const drawChart = (datetime: Date, ampm: AMPM, docs: any, chart: ChartData) => {
        const key = getKabukaKey(datetime, ampm);
        let doc: any = docs.filter((doc: any) => doc.key == key);
        let kabuka = datetime > new Date() ? Number.NaN : 0;
        if (doc && doc.length > 0) {
            kabuka = doc[0].kabuka;
        }
        // console.log(key + ' -> ' + kabuka);
        chart.data.labels.push(getDayOfWeek(datetime) + '曜日/' + (ampm == AMPM.AM ? '午前' : '午後'));
        chart.data.datasets[0].data.push(kabuka);
    }

    const drawHorizontalLine = (datetime: Date, ampm: AMPM, docs: any, chart: ChartData) => {
        const key = getKabukaKey(datetime, ampm);
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
