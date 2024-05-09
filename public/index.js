import { firestore } from "./firebase.js";
import { storage } from "./firebase.js";
import {
  ref,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import {
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const inputNameRef = document.querySelector("#name");
const inputBirthDateRef = document.querySelector("#birthdate");
const inputNoteRef = document.querySelector("#note");
const inputPhotoRef = document.querySelector("#photo");
const submitButtonRef = document.querySelector("#submit");
const peopleListRef = document.querySelector("#people-list");

const handleSubmit = async (e) => {
  e.preventDefault();
  const file =  inputPhotoRef.files[0];
  const fileName = nameFileName(file);
  const inputGenderRef = document.querySelector("input[name='gender']:checked");
  const person = {
    name: inputNameRef.value,
    gender: inputGenderRef ? inputGenderRef.value : "未選択",
    birth_date: inputBirthDateRef.value,
    note: inputNoteRef.value,
    photo: file ? fileName : "データがありません",
  };
  console.log(person);
  await handleSubmitPhoto(fileName,file);
  await addPeopleToFirestore(person);
  location.reload();
};

const nameFileName =  (file) => {
  if(file){
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    return fileName;
  }else{return undefined};
};

const handleSubmitPhoto = async (fileName,file) => {
  if(file){
    const filePath = `images/${fileName}`;
    const fileRef = ref(storage, filePath);
    await uploadBytes(fileRef, file);
    console.log("uploaded a blob or file!");
  }else{
    return;
  }

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
