import React, { useState, useEffect } from 'react';

// firebase functions
import firebase from './firebase';

// form
import { useForm } from 'react-hook-form';

import { formatDisplayDate, AMPM, getKabukaKey } from './Utils';

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
    const ampm = (date.getDay() == 0 || date.getHours() < 12) ? AMPM.AM : AMPM.PM;
    const kabukaDateKey = getKabukaKey(date, ampm);
    console.log('kabukaDateKey->' + kabukaDateKey);
    const displayKabukaDate = formatDisplayDate(date)  + ' ' + (ampm == AMPM.AM ? '午前' : '午後');
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
                <label>{displayKabukaDate}のカブ価は？</label>
                <input className="form-control kabuka" type="number" name="kabuka" ref={register({ required: true, maxLength: 5 })} />ベル
                <input className="btn btn-primary" type="submit" value="記録" />
            </form>
        </div>
    );
};

export default KabukaForm;
