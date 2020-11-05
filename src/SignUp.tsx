import React, { useState, useEffect } from 'react';

// firebase functions
import firebase from './firebase';

// form
import { useForm } from 'react-hook-form';

type Props = {
    user: firebase.User
};

type FormData = {
    islandName: string
}

const SignUp = (props: Props) => {
    const { register, handleSubmit } = useForm<FormData>();

    const onSubmit = (form: FormData) => {
        const islandName = form.islandName;
        firebase.firestore().collection('users').doc(props.user.uid).set({
            islandName: islandName
        })
        .then(function () {
            console.log("Document successfully written!");
        })
        .catch(function (error) {
            console.error("Error writing document: ", error);
        });
    }

    return (
        <div>
            <div className="form-group">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>島の名前は？</label>
                    <input className="form-control kabuka" type="text" name="islandName" ref={register({ required: true })} />
                    <input className="btn btn-primary" type="submit" value="登録" />
                </form>
            </div>
        </div>
    );
};

export default SignUp;
