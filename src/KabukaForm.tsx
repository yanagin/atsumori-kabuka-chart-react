import React, { useState, useEffect } from 'react';

// firebase functions
import firebase from './firebase';

// form
import { useForm } from 'react-hook-form';

import { formatDate } from './Utils';

type Props = {
    user: firebase.User
    onKabukaAdd: any
};

type FormData = {
    kabuka: number
}

type ChartData = {
    data: any;
    options: any;
}

const KabukaForm = (props: Props) => {
    const { register, handleSubmit } = useForm<FormData>();
    const [offsetDays, setOffsetDays] = useState(0);

    const date = new Date();
    const kabukaDateKey = formatDate(date) + '_' + (date.getHours() < 12 ? 'AM' : 'PM ');
    const displayKabukaDate = formatDate(date) + ' ' + (date.getHours() < 12 ? '午前' : '午後 ');
    const onSubmit = (form: FormData) => {
        //console.log('kabukaDateKey->' + kabukaDateKey);
        const kabuka = form.kabuka;
        const key = kabukaDateKey;
        firebase.firestore().collection('users').doc(props.user.uid).collection('kabuka').doc(key).set({
            key: key,
            kabuka: kabuka
        })
        .then(function () {
            console.log("Document successfully written!");
            setOffsetDays(0);
            props.onKabukaAdd();
        })
        .catch(function (error) {
            console.error("Error writing document: ", error);
        });
    }

    return (
        <div className="form-group">
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>{displayKabukaDate}のカブ価は？</label>
                <input className="form-control kabuka" type="number" name="kabuka" ref={register({ required: true, maxLength: 5 })} />
                <input className="btn btn-primary" type="submit" value="記録" />
            </form>
        </div>
    );
};

export default KabukaForm;
