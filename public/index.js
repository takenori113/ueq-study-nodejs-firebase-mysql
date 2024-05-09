import { firestore } from "./firebase.js";
import { storage } from "./firebase.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const inputNameRef = document.querySelector("#name");
const inputBirthDateRef = document.querySelector("#birthdate");
const inputNoteRef = document.querySelector("#note");
const inputPhotoRef = document.querySelector("#photo");
const submitButtonRef = document.querySelector("#submit");
const peopleListRef = document.querySelector("#people-list");

const handleSubmit = async (e) => {
  e.preventDefault();
  const file = inputPhotoRef.files[0];
  const fileName = nameFileName(file);
  const inputGenderRef = document.querySelector("input[name='gender']:checked");
  const person = {
    name: inputNameRef.value,
    gender: inputGenderRef ? inputGenderRef.value : "未選択",
    birth_date: inputBirthDateRef.value,
    note: inputNoteRef.value,
    photo: file ? fileName : null,
  };
  console.log(person);
  await handleSubmitPhoto(fileName, file);
  await addPeopleToFirestore(person);
  location.reload();
};

const nameFileName = (file) => {
  if (file) {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    return fileName;
  } else {
    return undefined;
  }
};

const handleSubmitPhoto = async (fileName, file) => {
  if (file) {
    const filePath = `images/${fileName}`;
    const fileRef = ref(storage, filePath);
    await uploadBytes(fileRef, file);
    console.log("uploaded a blob or file!");
  } else {
    return;
  }
};

const handleFileDownLoad = async (fileName) => {
  const fileRef = ref(storage, `images/${fileName}`);
  const url = await getDownloadURL(fileRef);
  console.log(url);
  return url;
};

const showPeopleList = async () => {
  peopleListRef.innerHTML = "";
  const querySnapshot = await getDocs(collection(firestore, "people"));

  for (const person of querySnapshot.docs) {
    const personData = person.data();
    const peopleListItemRef = document.createElement("div");
    peopleListItemRef.className = "people-list-item";

    const photoUrl = personData.photo
      ? await handleFileDownLoad(personData.photo)
      : "placeholder-image-url";

    const photoItem = document.createElement("img");
    photoItem.setAttribute("src", photoUrl);
    photoItem.setAttribute("alt", "Person Photo");

    const detailsList = document.createElement("ul");

    const nameItem = document.createElement("li");
    nameItem.textContent = `Name: ${personData.name}`;
    detailsList.appendChild(nameItem);

    const genderItem = document.createElement("li");
    genderItem.textContent = `Gender: ${personData.gender}`;
    detailsList.appendChild(genderItem);

    const birthdayItem = document.createElement("li");
    birthdayItem.textContent = `Birthday: ${personData.birth_date}`;
    detailsList.appendChild(birthdayItem);

    const noteItem = document.createElement("li");
    noteItem.textContent = `Note: ${personData.note}`;
    detailsList.appendChild(noteItem);

    const buttonsRef = document.createElement("div");
    buttonsRef.className = "buttons";
    const deleteButtonRef = document.createElement("button");
    deleteButtonRef.textContent = "削除";
    const editButtonRef = document.createElement("button");
    editButtonRef.addEventListener("click", () => {
      if (detailsList.classList.contains("hidden")) {
        detailsList.classList.remove("hidden");
      } else {
        detailsList.classList.add("hidden");
      }
      if (editFormRef.classList.contains("hidden")) {
        editFormRef.classList.remove("hidden");
      } else {
        editFormRef.classList.add("hidden");
      }
    });
    editButtonRef.textContent = "編集";
    buttonsRef.appendChild(deleteButtonRef);
    buttonsRef.appendChild(editButtonRef);
    const handleDelete = async (e) => {
      e.preventDefault();
      await deleteDoc(doc(firestore, "people", person.id));
      location.reload();
    };
    deleteButtonRef.addEventListener("click", handleDelete);

    const editFormRef = document.createElement("form");
    editFormRef.classList.add("edit-form");
    editFormRef.classList.add("hidden");
    editFormRef.innerHTML = `
   <div> <input type="text" name="name" value="${
     person.data().name
   }" required> </div>
   <div> <input type="radio" name="gender" value=",male" ${
     person.data().gender === "male" ? "checked" : ""
   }>男性</div>
   <div> <input type="radio" name="gender" value="female" ${
     person.data().gender === "female" ? "checked" : ""
   }>女性</div>
   <div> <input type="radio" name="gender" value="other" ${
     person.data().gender === "other" ? "checked" : ""
   }>その他</div>
   <div> <input type="date" name="birth_date" value="${
     person.data().birth_date
   }"></div>
   <div> <textarea name="note">${person.data().note}</textarea></div>
   <div> <button type="submit">更新</button></div>
  `;
    editFormRef.onsubmit = async (e) => {
      e.preventDefault();
      const updatedPerson = {
        name: editFormRef.querySelector('[name="name"]').value,
        gender:
          editFormRef.querySelector('[name="gender"]:checked')?.value ||
          "未選択",
        birth_date: editFormRef.querySelector('[name="birth_date"]').value,
        note: editFormRef.querySelector('[name="note"]').value,
      };
      await updateDoc(doc(firestore, "people", person.id), updatedPerson);
      location.reload();
    };

    noteItem.textContent = `Note: ${personData.note}`;
    detailsList.appendChild(noteItem);

    peopleListItemRef.appendChild(photoItem);
    peopleListItemRef.appendChild(detailsList);
    peopleListItemRef.appendChild(editFormRef);
    peopleListItemRef.appendChild(buttonsRef);

    peopleListRef.appendChild(peopleListItemRef);
  }
};

const addPeopleToFirestore = async (person) => {
  await addDoc(collection(firestore, "people"), person);
};

window.addEventListener("load", showPeopleList);
//登録ボタンにイベントを追加
submitButtonRef.addEventListener("click", handleSubmit);
