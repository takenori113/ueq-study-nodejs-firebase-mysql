const inputNameRef = document.querySelector("#name");
const inputBirthDateRef = document.querySelector("#birthdate");
const inputNoteRef = document.querySelector("#note");
const inputPhotoRef = document.querySelector("#photo");
const submitButtonRef = document.querySelector("#submit");
const peopleListRef = document.querySelector("#people-list");

//テストデータ、サーバーから取得することを想定
const people = [
  { name: "taro", gender: "male" },
  { name: "yuki", gender: "girl" },
];

const handleSubmit = (e) => {
  e.preventDefault();
  const inputGenderRef = document.querySelector("input[name='gender']:checked");
  const person = {
    name: inputNameRef.value,
    gender: inputGenderRef ? inputGenderRef.value : "未選択",
    birthDate: inputBirthDateRef.value,
    note: inputNoteRef.value,
    photo: inputPhotoRef.files[0]
      ? inputPhotoRef.files[0].name
      : "データがありません",
  };
  console.log(person);
};

const showPeopleList = () => {
  for (const person of people) {
    const peopleListItemRef = document.createElement("div");
    peopleListItemRef.className = "people-list-item";
    peopleListItemRef.textContent = `name:${person.name}gender:${person.gender}`;
    peopleListRef.appendChild(peopleListItemRef);
  }
};

window.addEventListener("load", showPeopleList);
//登録ボタンにイベントを追加
submitButtonRef.addEventListener("click", handleSubmit);
