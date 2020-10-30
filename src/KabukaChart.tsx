import React, { useState, useEffect } from 'react';

// firebase functions
import firebase from './firebase';

// form
import { useForm } from 'react-hook-form';

// chart.js
import Chart from './Chart';

type Props = {
    user: firebase.User
};

type FormData = {
    kabuka: number
}

type ChartData = {
    data: any;
    options: any;
}

const KabukaChart = (props: Props) => {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit } = useForm<FormData>();
    const [offsetDays, setOffsetDays] = useState(0);
    const [chartData, setChartData] = useState<ChartData>();

    // 共通
    
    const formatDate = (date: Date): string => {
        if (!date) {
            date = new Date();
        }
        const month = date.getMonth() + 1;
        let sMonth = month.toString();
        if (month < 10) {
            sMonth = '0' + month;
        }
        const day = date.getDate();
        let sDay = day.toString();
        if (day < 10) {
            sDay = '0' + day;
        }
        return date.getFullYear() + '-' + sMonth + '-' + sDay;
    }

    // カブ価記録

    const date = new Date();
    const kabukaDateKey = formatDate(date) + '_' + (date.getHours() < 12 ? 'AM' : 'PM ');
    const displayKabukaDate = formatDate(date) + ' ' + (date.getHours() < 12 ? '午前' : '午後 ') + 'のカブ価は？';
    const onSubmit = (form: FormData) => {
        //console.log('kabukaDateKey->' + kabukaDateKey);
        const kabuka = form.kabuka;
        const key = kabukaDateKey;
        firebase.firestore().collection('users').doc(props.user.uid).collection('kabuka').doc(key).set({
          key: key,
          kabuka: kabuka
        })
        .then(function() {
          console.log("Document successfully written!");
          setOffsetDays(0);
          setLoading(true); // 今週に反映させるため
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });
    }

    // チャート描画

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
            <div className="form-group">
                <p></p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>{displayKabukaDate}</label>
                    <input className="form-control kabuka" type="number" name="kabuka" ref={register({ required: true, maxLength: 5 })} />
                    <input className="btn btn-primary" type="submit" value="記録" />
                </form>
            </div>
            <div>
                {
                    loading
                        ? (
                            <p>
                                LOADING.....
                            </p>
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
        </div>
    );
};

export default KabukaChart;
