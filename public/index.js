import { firestore } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
} from "https://cdn.skypack.dev/firebase/firestore";
const inputNameRef = document.querySelector("#name");
const inputBirthDateRef = document.querySelector("#birthdate");
const inputNoteRef = document.querySelector("#note");
const inputPhotoRef = document.querySelector("#photo");
const submitButtonRef = document.querySelector("#submit");
const peopleListRef = document.querySelector("#people-list");

//テストデータ、サーバーから取得することを想定
// const people = [
//   { name: "taro", gender: "male" },
//   { name: "yuki", gender: "girl" },
// ];

const handleSubmit = async (e) => {
  e.preventDefault();
  const inputGenderRef = document.querySelector("input[name='gender']:checked");
  const person = {
    name: inputNameRef.value,
    gender: inputGenderRef ? inputGenderRef.value : "未選択",
    birth_date: inputBirthDateRef.value,
    note: inputNoteRef.value,
    photo: inputPhotoRef.files[0]
      ? inputPhotoRef.files[0].name
      : "データがありません",
  };
  console.log(person);
  await addPeopleToFirestore(person);
};

const showPeopleList = async () => {
  peopleListRef.innerHTML = "";
  const querySnapshot = await getDocs(collection(firestore, "people"));
  querySnapshot.forEach((person) => {
    const peopleListItemRef = document.createElement("ul");
    peopleListItemRef.className = "people-list-item";

    const nameItem = document.createElement("li");
    nameItem.textContent = `Name: ${person.data().name}`;
    peopleListItemRef.appendChild(nameItem);

    const genderItem = document.createElement("li");
    genderItem.textContent = `Gender: ${person.data().gender}`;
    peopleListItemRef.appendChild(genderItem);

    const birthdayItem = document.createElement("li");
    birthdayItem.textContent = `Birthday: ${person.data().birth_date}`;
    peopleListItemRef.appendChild(birthdayItem);

    const noteItem = document.createElement("li");
    noteItem.textContent = `Note: ${person.data().note}`;
    peopleListItemRef.appendChild(noteItem);

    peopleListRef.appendChild(peopleListItemRef);
    console.log(person.data());
  });
};

const addPeopleToFirestore = async (person) => {
  await addDoc(collection(firestore, "people"), person);
};

window.addEventListener("load", showPeopleList);
//登録ボタンにイベントを追加
submitButtonRef.addEventListener("click", handleSubmit);
submitButtonRef.addEventListener("click", showPeopleList);
