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

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = await createData(e);
  await handleAdd(data);
};

const showPeopleList = async () => {
  const peopleListRef = document.querySelector("#people-list");
  peopleListRef.innerHTML = "";

  const querySnapshot = await getDocs(collection(firestore, "people"));
  for (const person of querySnapshot.docs) {
    const { name, gender, birth_date, note, photo } = person.data();

    // 公開サービスならアップロード時にURLを取得・保存の方が良さそう
    let url = "";
    if (photo) {
      const filePath = `images/${photo}`;
      const fileRef = ref(storage, filePath);
      url = await getDownloadURL(fileRef);
    }

    const peopleListItemRef = document.createElement("div");
    peopleListItemRef.id = `item-${person.id}`;
    peopleListItemRef.className = "people-list-item";
    peopleListItemRef.innerHTML = `
    <img src="${url}" alt="Person Photo"></img>

    <ul>
      <li>Name: ${name}</li>
      <li>Gender: ${gender}</li>
      <li>Birthday: ${birth_date}</li>
      <li>Note: ${note}</li>
    </ul>
    
    <form class="hidden">
      <div>
        <input type="text" name="name" value="${name}" required>
      </div>
      <div>
        <input type="radio" id="male" name="gender" value="male" required>男性
      </div>
      <div>
        <input type="radio" id="female" name="gender" value="female" required>女性
      </div>
      <div>
        <input type="radio" id="other" name="gender" value="other" required>その他
      </div>
      <div>
        <input type="date" name="birth_date" value="${birth_date}" required>
      </div>
      <div>
        <textarea name="note">${note}</textarea>
      </div>
      <div>
        <label for="photo">顔写真:</label>
        <input type="file" id="photo" name="photo" accept="image/*" />
      </div>
      <div>
        <button type="submit">更新</button>
      </div>
    </form>

    <div class="buttons">
      <button id="delete">削除</button>
      <button id="edit">編集</button>
    </div>
    `;
    peopleListRef.appendChild(peopleListItemRef);

    document.querySelector(`#item-${person.id} #male`).checked =
      gender === "male";
    document.querySelector(`#item-${person.id} #female`).checked =
      gender === "female";
    document.querySelector(`#item-${person.id} #other`).checked =
      gender === "other";

    const deleteButtonRef = document.querySelector(
      `#item-${person.id} #delete`
    );
    deleteButtonRef.addEventListener("click", () => handleDelete(person.id));

    const editButtonRef = document.querySelector(`#item-${person.id} #edit`);

    editButtonRef.addEventListener("click", () => {
      const updateFormRef = document.querySelector(`#item-${person.id} form`);
      const personDetailRef = document.querySelector(`#item-${person.id} ul`);
      if (updateFormRef.className === "hidden") {
        updateFormRef.className = "";
        personDetailRef.className = "hidden";
      } else {
        updateFormRef.className = "hidden";
        personDetailRef.className = "";
      }
    });

    const updateFormRef = document.querySelector(`#item-${person.id} form`);
    updateFormRef.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = await createData(e);
      await handleUpdate(person.id, { ...data, photo: data.photo ?? photo });
    });
  }
};

const createData = async (e) => {
  let fileName = null;
  const file = e.target.photo.files[0];
  if (file) {
    fileName = await uploadPhoto(file);
  }
  const data = {
    name: e.target.name.value,
    gender: e.target.gender.value,
    birth_date: e.target.birth_date.value,
    note: e.target.note.value,
    photo: fileName,
  };
  return data;
};

const handleAdd = async (data) => {
  await addDoc(collection(firestore, "people"), data);
  await showPeopleList();
  resetForm();
};

const handleUpdate = async (personId, data) => {
  await updateDoc(doc(firestore, "people", personId), data);
  await showPeopleList();
};

const handleDelete = async (personId) => {
  await deleteDoc(doc(firestore, "people", personId));
  await showPeopleList();
};

const uploadPhoto = async (file) => {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}.${ext}`;
  const filePath = `images/${fileName}`;
  const fileRef = ref(storage, filePath);
  await uploadBytes(fileRef, file);
  return fileName;
};

const resetForm = () => {
  document.querySelector("#add-form #name").value = "";
  document.querySelector("#add-form #birth_date").value = "";
  document.querySelector("#add-form #note").value = "";
  document
    .querySelectorAll("#add-form input[name='gender']")
    .forEach((input) => {
      input.checked = false;
    });
  document.querySelector("#add-form #photo").value = "";
};

window.addEventListener("load", async () => {
  const submitButtonRef = document.querySelector("#add-form");
  submitButtonRef.addEventListener("submit", handleSubmit);

  await showPeopleList();
});
