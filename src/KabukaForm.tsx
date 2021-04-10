import React, { useState, useEffect } from 'react';

// firebase functions
import firebase from './firebase';

// form
import { useForm } from 'react-hook-form';

import { AMPM, getKabukaKey, getAMPM } from './Utils';

type Props = {
    user: firebase.User
    onKabukaAdd: any
};

type FormData = {
    kabuka: number
}

const KabukaForm = (props: Props) => {
    const { register, handleSubmit } = useForm<FormData>();

    const date = new Date();
    const [kabukaDateYear, setKabukaDateYear] = useState(date.getFullYear());
    const [kabukaDateMonth, setKabukaDateMonth] = useState(date.getMonth() + 1);
    const [kabukaDateDay, setKabukaDateDay] = useState(date.getDate());
    const [kabukaDateAMPM, setKabukaDateAMPM] = useState(getAMPM(date));
    const kabukaDate = new Date();
    kabukaDate.setFullYear(kabukaDateYear);
    kabukaDate.setMonth(kabukaDateMonth - 1);
    kabukaDate.setDate(kabukaDateDay);
    console.log(kabukaDateYear + '/' + kabukaDateMonth + '/' + kabukaDateDay + ' ' + (kabukaDateAMPM == AMPM.AM ? '午前' : '午後'));

    const kabukaDateKey = getKabukaKey(kabukaDate, kabukaDateAMPM);
    console.log('kabukaDateKey->' + kabukaDateKey);
    const onSubmit = (form: FormData) => {
        const kabuka = form.kabuka;
        const key = kabukaDateKey;
        firebase.firestore().collection('users').doc(props.user.uid).collection('kabuka').doc(key).set({
            key: key,
            kabuka: kabuka
        })
            .then(() => {
                console.log("Document successfully written!");
                props.onKabukaAdd();
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }

    return (
        <div className="form-group">
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>
                    <select value={kabukaDateYear} onChange={e => setKabukaDateYear(e.target.value)}>
                        {createOptions(2020, 3)}
                    </select>年
                    <select value={kabukaDateMonth} onChange={e => setKabukaDateMonth(e.target.value)}>
                        {createOptions(1, 12)}
                    </select>月
                    <select value={kabukaDateDay} onChange={e => setKabukaDateDay(e.target.value)}>
                        {createOptions(1, 31)}
                    </select>日
                    <select value={kabukaDateAMPM} onChange={e => setKabukaDateAMPM(e.target.value)}>
                        <option value={AMPM.AM}>午前</option>
                        <option value={AMPM.PM}>午後</option>
                    </select>
                    のカブ価は？
                </label>
                <input className="form-control kabuka" type="number" name="kabuka" ref={register({ required: true, maxLength: 5 })} />ベル
                <input className="btn btn-primary" type="submit" value="記録" />
            </form>
        </div>
    );
};

const createOptions = (from: number, size: number): any => {
    let result: number[] = [];
    for (let i: number = 0; i < size; i++) {
        result.push(from + i);
    }
    return result.map((ele) =>
        <option key={ele}>
            {ele}
        </option>
    );
}

export default KabukaForm;
