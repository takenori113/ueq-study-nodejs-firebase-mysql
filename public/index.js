import { firestore, storage, auth, signOut } from "./firebase.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const url = "http://localhost:3000";
let uid = "";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    location.href = "/login.html";
  } else {
    uid = user.uid;
    const currentUserRef = document.getElementById("current-user");
    const currentUserEmail = document.createElement("div");
    const signOutButton = document.createElement("button");
    signOutButton.textContent = "サインアウト";
    signOutButton.addEventListener("click", () => signOut(auth));
    currentUserEmail.textContent = `${user.email}`;
    currentUserRef.appendChild(currentUserEmail);
    currentUserRef.appendChild(signOutButton);
    console.log(user);
    await showPeopleList();
  }
});

const getUser = () =>
  new Promise((resolve, reject) =>
    auth.onAuthStateChanged((user) => (user ? resolve(user) : reject()))
  );

//人物の登録処理
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Form submitted");
  const data = await createData(e);
  console.log("Data to add:", data); // デバッグ用ログ
  await handleAdd(data);
};

const showPeopleList = async () => {
  const peopleListRef = document.querySelector("#people-list");
  peopleListRef.innerHTML = "";
  const user = await getUser();
  const idToken = await user.getIdToken();
  const res = await fetch(`${url}/people`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const registeredPeople = await res.json();
  console.log(registeredPeople);

  for (const person of registeredPeople) {
    const { name, gender, birth_date, note, photo } = person;

    //公開サービスならアップロード時にURLを取得・保存の方が良さそう
    let photoUrl = "";
    if (photo) {
      const filePath = `images/${photo}`;
      const fileRef = ref(storage, filePath);
      photoUrl = await getDownloadURL(fileRef);
    }

    const peopleListItemRef = document.createElement("div");
    peopleListItemRef.id = `item-${person.id}`;
    peopleListItemRef.className = "people-list-item";
    peopleListItemRef.innerHTML = `
    <img src="${photoUrl}" alt="Person Photo"></img>

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
        <input type="radio" id="male" name="gender" value="male" >男性
      </div>
      <div>
        <input type="radio" id="female" name="gender" value="female" >女性
      </div>
      <div>
        <input type="radio" id="other" name="gender" value="other" >その他
      </div>
      <div>
        <input type="text" name="birth_date" value="${birth_date}" >
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
    uid,
  };
  return data;
};

const handleAdd = async (data) => {
  const user = await getUser();
  const idToken = await user.getIdToken();
  await fetch(`${url}/people`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(data),
  });
  await showPeopleList();
  resetForm();
};

const handleUpdate = async (id, data) => {
  const user = await getUser();
  const idToken = await user.getIdToken();
  await fetch(`${url}/people/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(data),
  });

  await showPeopleList();
};

const handleDelete = async (id) => {
  const user = await getUser();
  const idToken = await user.getIdToken();
  await fetch(`${url}/people/${id}`, {
    headers: { Authorization: `Bearer ${idToken}` },
    method: "DELETE",
  });
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
  document.querySelector("#name").value = "";
  document.querySelector("#birth_date").value = "";
  document.querySelector("#note").value = "";
  document.querySelectorAll("#input[name='gender']").forEach((input) => {
    input.checked = false;
  });
  document.querySelector("#photo").value = "";
};

window.addEventListener("load", async () => {
  const submitButtonRef = document.querySelector("#add-from");
  submitButtonRef.addEventListener("submit", handleSubmit);
});
