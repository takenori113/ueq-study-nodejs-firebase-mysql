import { firestore, storage } from "./firebase.js";
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

//人物の登録処理
const handleSubmit = async (e) => {
  e.preventDefault();
  const file = inputPhotoRef.files[0];
  const fileName = createFileName(file);
  const inputGenderRef = document.querySelector("input[name='gender']:checked");
  const person = {
    name: inputNameRef.value,
    gender: inputGenderRef ? inputGenderRef.value : "未選択",
    birth_date: inputBirthDateRef.value,
    note: inputNoteRef.value,
    photo: file ? fileName : null,
  };
  console.log(person);
  await handleSubmitPhoto(file, fileName);
  await addDoc(collection(firestore, "people"), person);
  showPeopleList();
  resetForm();
};
submitButtonRef.addEventListener("click", handleSubmit);

//写真のアップロード処理
const createFileName = (file) => {
  if (file) {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    return fileName;
  } else {
    return undefined;
  }
};

const handleSubmitPhoto = async (file, fileName) => {
  if (file) {
    const filePath = `images/${fileName}`;
    const fileRef = ref(storage, filePath);
    await uploadBytes(fileRef, file);
  } ;
};

//写真のダウンロード処理（URL発行）
const handleFileDownLoad = async (fileName) => {
  const fileRef = ref(storage, `images/${fileName}`);
  const url = await getDownloadURL(fileRef);
  console.log(url);
  return url;
};

//人物名鑑
const showPeopleList = async () => {
  peopleListRef.innerHTML = "";
  const querySnapshot = await getDocs(collection(firestore, "people"));

  for (const person of querySnapshot.docs) {
    const personData = person.data();
    const peopleListItemRef = document.createElement("div");
    peopleListItemRef.className = "people-list-item";
    const detailsList = createDetaisList(personData);
    const editFormPart = createEditFormPart(person);
    const buttonsPart = createButtonPart(person, detailsList, editFormPart);

    peopleListItemRef.appendChild(await createPhotoPart(personData));
    peopleListItemRef.appendChild(detailsList);
    peopleListItemRef.appendChild(editFormPart);
    peopleListItemRef.appendChild(buttonsPart);
    peopleListRef.appendChild(peopleListItemRef);
  }
};

const handleDelete = async (docId) => {
  await deleteDoc(doc(firestore, "people", docId));
  showPeopleList();
};

const createDetaisList = (personData) => {
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
  return detailsList;
};

//人物名鑑の写真部分
const createPhotoPart = async (personData) => {
  const photoUrl = personData.photo
    ? await handleFileDownLoad(personData.photo)
    : "placeholder-image-url";
  const photoPart = document.createElement("img");
  photoPart.setAttribute("src", photoUrl);
  photoPart.setAttribute("alt", "Person Photo");
  return photoPart;
};

//人物名鑑の削除・編集ボタン部分
const createButtonPart = (doc, detailsList, editFormRef) => {
  const buttonsPart = document.createElement("div");
  buttonsPart.className = "buttons";
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
  buttonsPart.appendChild(deleteButtonRef);
  buttonsPart.appendChild(editButtonRef);
  deleteButtonRef.addEventListener("click", () => handleDelete(doc.id));
  return buttonsPart;
};

//人物名鑑の編集フォーム
const createEditFormPart = (person) => {
  const editFormPart = document.createElement("form");
  editFormPart.classList.add("edit-form");
  editFormPart.classList.add("hidden");
  editFormPart.innerHTML = `
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
 <div> <button type="submit" name = "update-button">更新</button></div>
`;

  editFormPart.addEventListener("submit", async (e) => {
    e.preventDefault();
    updatePerson(editFormPart, person);
  });
  return editFormPart;
};

const updatePerson = async (editFormPart, person) => {
  const editedPerson = {
    name: editFormPart.querySelector('[name="name"]').value,
    gender:
      editFormPart.querySelector('[name="gender"]:checked')?.value || "未選択",
    birth_date: editFormPart.querySelector('[name="birth_date"]').value,
    note: editFormPart.querySelector('[name="note"]').value,
  };
  await updateDoc(doc(firestore, "people", person.id), editedPerson);
  showPeopleList();
};

//フォームのリセット
const resetForm = () => {
  inputNameRef.value = "";
  inputBirthDateRef.value = "";
  inputNoteRef.value = "";
  document.querySelectorAll("input[name='gender']").forEach((input) => {
    input.checked = false;
  });
};

window.addEventListener("load", showPeopleList);
