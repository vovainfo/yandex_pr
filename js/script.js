const apiOptions = {
    baseUrl: 'http://95.216.175.5/cohort1',
    headers: {
        authorization: 'a4937801-d36e-4ddf-94b5-e4bb4d55a7f9',
        'Content-Type': 'application/json'
    }
}

class Card{
    constructor(cardFromServer){
        this.cardFromServer = cardFromServer;
/*
        this.name = name;
        this.link = link;
        this.likeCount = likeCount;
        this._id = _id;
 */
        this.cardElement = this.create();
        this.updateLike();
    }
    create(){
        //формируем все элементы
        const oneCard = document.createElement("div");
        oneCard.classList.add("place-card");

        const imgCard = document.createElement("div");
        imgCard.classList.add("place-card__image");
        imgCard.style.backgroundImage = `url(${this.cardFromServer.link})`;

        const btnImgCard = document.createElement("button");
        btnImgCard.classList.add("place-card__delete-icon");

        const descCard = document.createElement("div");
        descCard.classList.add("place-card__description");

        const h3Card = document.createElement("h3");
        h3Card.classList.add("place-card__name");
        h3Card.textContent = this.cardFromServer.name;

        const likeAndCount = document.createElement("div");
        likeAndCount.classList.add("place-card__like-and-count");

        const btnLike = document.createElement("button");
        btnLike.classList.add("place-card__like-icon");

        const countLike = document.createElement("p");
        countLike.classList.add("place-card__like-count");
        countLike.textContent = this.cardFromServer.likes.length;

        //сливаем их в один
        oneCard.appendChild(imgCard);
        if(this.cardFromServer.owner._id===user._id){ //это я создал карточку. показать иконку удаления;
            imgCard.appendChild(btnImgCard);
        }
        oneCard.appendChild(descCard);
        descCard.appendChild(h3Card);
        descCard.appendChild(likeAndCount);
        likeAndCount.appendChild(btnLike);
        likeAndCount.appendChild(countLike);

        //возвращаем элемент для встраивания в страницу
        return oneCard;
    }
    like(){
        const api = new Api(apiOptions);
        if(this.isLiked()){
            api.deleteLike(this, this.updateCardFromServerAndLike.bind(this));
        }else{
            api.setLike(this, this.updateCardFromServerAndLike.bind(this));
        }

        //this.cardElement.querySelector('.place-card__like-icon').classList.toggle("place-card__like-icon_liked");
    }
    updateCardFromServerAndLike(cardFromServer){
        this.cardFromServer = cardFromServer;
        this.updateLike();
    }
    updateLike(){
        if(this.isLiked()){
            this.cardElement.querySelector('.place-card__like-icon').classList.add("place-card__like-icon_liked");
        }else{
            this.cardElement.querySelector('.place-card__like-icon').classList.remove("place-card__like-icon_liked");
        }
        const countLike = this.cardElement.querySelector(".place-card__like-count");
        countLike.textContent = this.cardFromServer.likes.length;

    }
    isLiked(){
        for (let i = 0; i < this.cardFromServer.likes.length; i++) {
            if(this.cardFromServer.likes[i]._id===user._id){
                return true;
            }
        }
        return false;
    }
    remove(){
        this.cardElement.parentNode.removeChild(this.cardElement);
    }
}

class CardList{
    constructor(domRoot){
        this.domRoot = domRoot;
        this.cards = [];
        this.initCallback();
    }
    loadInitialCards(){
        const api = new Api(apiOptions);
        api.getInitialCards(this.addOneCard.bind(this));
    }
    /*
    render(){
        for (let i = 0; i < this.cards.length; i++) {
            this.renderOneCard(this.cards[i]);
        }
    }
    */

    renderOneCard(card){
        this.domRoot.appendChild(card.cardElement);
    }
    renderLastCard(){
        this.renderOneCard(this.cards[this.cards.length-1]);
    }
    addOneCardNoRender(cardFromServer){
        let card = new Card(cardFromServer);
        this.cards.push(card);
    }
    addOneCard(cardFromServer){
        this.addOneCardNoRender(cardFromServer);
        this.renderLastCard();
    }

    getIndexCard(cardElement){
        for (let i = 0; i < this.cards.length; i++) {
            if(this.cards[i].cardElement===cardElement){
                return i;
            }
        }
        return -1; //не нашли. но такого не может быть, потому что не может быть никогда
    }

    initCallback() {
        this.domRoot.addEventListener("click", this.clickOnCardList.bind(this));
    }
    removeCardFromServerAndClient(idx){
        const api = new Api(apiOptions);
        api.deleteCard(this.cards[idx], idx, this.removeCardByIdx.bind(this));
    }
    removeCardByIdx(idx){
        this.cards[idx].remove();//удалили из DOM
        this.cards.splice(idx,1);//удалили из массива карточек
    }

    clickOnCardList(event){
        const cardElement = event.target.closest(".place-card");
        if (!cardElement) { //щёлкнули не по карточке
            return;
        }
        const idx = this.getIndexCard(cardElement);
        if(idx===-1){
            return;
        }
        if (event.target.classList.contains("place-card__like-icon")) {// щёлкнули по лайку
            this.cards[idx].like();
        }else{
            if (event.target.classList.contains("place-card__delete-icon")) { // щёлкнули по иконке удаления
                if(window.confirm(`Вы действительно хотите удалить карточку "${this.cards[idx].cardFromServer.name}"?`)){
                    this.removeCardFromServerAndClient(idx);
                }
            }else{
                //вся карточка за исключением иконок лайк и удаления
                if (event.target.classList.contains("place-card__image")){//картинка, а не подписи внизу
                    popupBigImage.open(this.cards[idx].cardFromServer.link);
                }
            }
        }
    }
}

class Popup{
    constructor(id, formName){
        this.element = document.querySelector(id);
        this.element.querySelector(".popup__close").addEventListener("click", this.close.bind(this));
        if(formName!==undefined){
            this.form = document.forms[formName];
            this.form.addEventListener("input", this.onInputForm.bind(this));
        }
    }
    close(){
        this.element.classList.remove("popup_is-opened");
    }
    open(){
        this.element.classList.add("popup_is-opened");
    }
    onInputForm(){
        this.validate();
    }
    enableButton(){
        this.element.querySelector(".popup__button").classList.add("popup__button_enable");
    }
    disableButton(){
        this.element.querySelector(".popup__button").classList.remove("popup__button_enable");
    }
    setButtonText(text){
        this.element.querySelector(".popup__button").textContent = text;
    }

    validate(){
        let isOk = true;
        for (let i = 0; i < this.form.elements.length; i++) {
            let errorElement = this.element.querySelector(`#error-${this.form.elements[i].id}`);
            if(this.form.elements[i].classList.contains("js-validate-2-30")){
                switch (validateLenghtStr(this.form.elements[i].value, 2, 30)) {
                    case 0: errorElement.textContent = "Это обязательное поле"; isOk = false; break;
                    case 1: errorElement.textContent = ""; break;
                    case 2: errorElement.textContent = "Должно быть от 2 до 30 символов"; isOk = false; break;
                }
            }else{
                if(this.form.elements[i].classList.contains("js-validate-url")) {
                    if (this.form.elements[i].checkValidity()) {
                        errorElement.textContent = "";
                    } else {
                        errorElement.textContent = "Здесь должна быть ссылка";
                        isOk = false;
                    }
                }
            }
        }
        if(isOk){
            this.enableButton();
        }else{
            this.disableButton();
        }
        return isOk;
    }
}

class PopupBigImage extends Popup{
    constructor(){
        super("#big-size-image");
    }
    open(url){
        this.element.querySelector('.popup__image').src = url;
        super.open();
    }
}

class PopupProfile extends Popup{
    constructor(){
        super("#profile", "profile");
        this.form.addEventListener("submit", this.onSubmitForm.bind(this));
    }
    open(){
        this.form.elements.name.value = user.userInfoName.textContent;
        this.form.elements.job.value = user.userInfoJob.textContent;
        super.open();
    }
    onSubmitForm(event){
        event.preventDefault();
        if(!this.validate())
            return;
        this.setButtonText("Сохраняется...");

        user.updateUser(this.form.elements.name.value,
                        this.form.elements.job.value,
                        this.restoreButton.bind(this),
                        this.updateMainDomAndClose.bind(this));

        /*
        userInfoName.textContent = this.form.elements.name.value;
        userInfoJob.textContent = this.form.elements.job.value;
         */
        //this.close();
    }

    updateMainDomAndClose(){
        user.renderUser({name: this.form.elements.name.value, about: this.form.elements.job.value});
        this.close();
    }
    restoreButton(){
        this.setButtonText("Сохранить");
    }
}

class PopupUpdateAvatar extends Popup{
    constructor(){
        super("#update-avatar", "update-avatar");

        this.form.addEventListener("submit", this.onSubmitForm.bind(this));
    }
    open(){
        this.form.reset();
        super.open();
    }
    onSubmitForm(event){
        event.preventDefault();
        if(!this.validate())
            return;
        this.setButtonText("Сохраняется...");
        const api = new Api(apiOptions);
        api.updateAvatar(this.form.elements.link.value,
            this.restoreButton.bind(this),
            this.updateMainDomAndClose.bind(this));
    }

    updateMainDomAndClose(link){
        user.setAvatar(link);
        this.close();
    }
    restoreButton(){
        this.setButtonText("+");
    }

}




class PopupAddCard extends Popup{
    constructor(){
        super("#add-card", "new");

        this.form.addEventListener("submit", this.onSubmitForm.bind(this));
    }
    open(){
        this.form.reset();
        super.open();
    }
    onSubmitForm(event){
        event.preventDefault();
        if(!this.validate())
            return;
        this.setButtonText("Сохраняется...");
        const api = new Api(apiOptions);
        api.addCard(this.form.elements.name.value,
                    this.form.elements.link.value,
                    this.restoreButton.bind(this),
                    this.updateMainDomAndClose.bind(this));
    }

    updateMainDomAndClose(cardFromServer){
        cardList.addOneCard(cardFromServer);
        this.close();
    }
    restoreButton(){
        this.setButtonText("+");
    }

}

class Api {
    constructor(options) {
        this.baseUrl = options.baseUrl;
        this.headers = options.headers;
    }
    getUser(callbackRender){
        fetch(`${this.baseUrl}/users/me`, {
            method: "GET",
            headers: this.headers,
        })
        .then((res) => {
            if (res.ok) {
                return res.json();
            }else{
                let error = new Error(res.statusText);
                error.response = res;
                throw error
            }
        })
        .then((res) => {
            callbackRender(res);
            return res;
        })
        .catch((err) => {
            alert(err.response);
        });
    }
    getInitialCards(callbackAddCard){
        fetch(`${this.baseUrl}/cards`, {
            method: "GET",
            headers: this.headers,
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }else{
                    let error = new Error(res.statusText);
                    error.response = res;
                    throw error
                }
            })
            .then((res) => {
                for (let i = 0; i < res.length; i++) {
                    callbackAddCard(res[i]);
                }
                return res;
            })
            .catch((err) => {
                alert(err.response);
            });
    }

    updateProfile(name, about, callbackRestoreButton, callbackUpdateDom){
        fetch(`${this.baseUrl}/users/me`, {
            method: "PATCH",
            headers: this.headers,
            body: JSON.stringify({
                name: name,
                about: about
            })
        })
            .then((res) => {
                if (res.ok) {
                    callbackUpdateDom();
                }else{
                    let error = new Error(res.statusText);
                    error.response = res;
                    throw error
                }
            })
            .catch((err) => {
                alert(err.response);
            })
            .finally( () => {
                callbackRestoreButton();                
            });
    }
    addCard(name, link, callbackRestoreButton, callbackUpdateDom){
        fetch(`${this.baseUrl}/cards`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                name: name,
                link: link
            })
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }else{
                    let error = new Error(res.statusText);
                    error.response = res;
                    throw error
                }
            })
            .then((res) => {
                callbackUpdateDom(res);
            })
            .catch((err) => {
                alert(err.response);
            })
            .finally( () => {
                callbackRestoreButton();
            });
    }
    deleteCard(card, idx, callbackRemoveCard){
        fetch(`${this.baseUrl}/cards/${card.cardFromServer._id}`, {
            method: "DELETE",
            headers: this.headers,
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }else{
                    let error = new Error(res.statusText);
                    error.response = res;
                    throw error
                }
            })
            .then((res) => {
                callbackRemoveCard(idx);
            })
            .catch((err) => {
                alert(err.response);
            })

    }
    setLike(card, callbackUpdateCardAndDOM){
        fetch(`${this.baseUrl}/cards/like/${card.cardFromServer._id}`, {
            method: "PUT",
            headers: this.headers
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }else{
                    let error = new Error(res.statusText);
                    error.response = res;
                    throw error
                }
            })
            .then((res) => {
                callbackUpdateCardAndDOM(res);
            })
            .catch((err) => {
                alert(err.response);
            })
    }
    deleteLike(card, callbackUpdateCardAndDOM){
        fetch(`${this.baseUrl}/cards/like/${card.cardFromServer._id}`, {
            method: "DELETE",
            headers: this.headers
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }else{
                    let error = new Error(res.statusText);
                    error.response = res;
                    throw error
                }
            })
            .then((res) => {
                callbackUpdateCardAndDOM(res);
            })
            .catch((err) => {
                alert(err.response);
            })
    }
    updateAvatar(link, callbackRestoreButton, callbackUpdateDom){
        fetch(`${this.baseUrl}/users/me/avatar`, {
            method: "PATCH",
            headers: this.headers,
            body: JSON.stringify({
                avatar: link
            })
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }else{
                    let error = new Error(res.statusText);
                    error.response = res;
                    throw error
                }
            })
            .then((res) => {
                callbackUpdateDom(link);
            })
            .catch((err) => {
                alert(err.response);
            })
            .finally( () => {
                callbackRestoreButton();
            });
    }

}
class User{
    constructor() {
        this.userInfoName = document.querySelector('.user-info__name');
        this.userInfoJob = document.querySelector('.user-info__job');
        this.userInfoPhoto = document.querySelector('.user-info__photo');
    };
    loadFromServer(){
        const api = new Api(apiOptions)
        api.getUser(this.renderUser.bind(this));

    }
    renderUser(userInfoFromServer){
        this.userInfoName.textContent = userInfoFromServer.name;
        this.userInfoJob.textContent = userInfoFromServer.about;
        if(userInfoFromServer._id !== undefined){
            this._id = userInfoFromServer._id;
        }
        if(userInfoFromServer.avatar !== undefined){
            this.userInfoPhoto.style.backgroundImage = `url(${userInfoFromServer.avatar})`;
        }
    }
    setAvatar(link){
        this.userInfoPhoto.style.backgroundImage = `url(${link})`;
    }
    updateUser(name, about, callbackRestoreButton, callbackUpdateMainDomAndClose){
        const api = new Api(apiOptions)
        api.updateProfile(name, about, callbackRestoreButton, callbackUpdateMainDomAndClose);
    }


}



// 0 - пустая строка
// 1 - ок
// 2 - слишком длинная или короткая
function validateLenghtStr(str, min, max) {
    let length = str.trim().length;
    if(length===0)
        return 0;
    if(length >= min && length <= max)
        return 1;
    return 2;
}

//const api = new Api(apiOptions);

const user = new User();
user.loadFromServer();

const cardList = new CardList(document.querySelector('.places-list'));
cardList.loadInitialCards();

const popupAddCard = new PopupAddCard();
const popupBigImage = new PopupBigImage();
const popupProfile = new PopupProfile();
const popupUpdateAvatar = new PopupUpdateAvatar();

document.querySelector(".button.user-info__edit").addEventListener("click", popupProfile.open.bind(popupProfile));
document.querySelector(".user-info__button").addEventListener("click", popupAddCard.open.bind(popupAddCard));
document.querySelector(".user-info__photo").addEventListener("click", popupUpdateAvatar.open.bind(popupUpdateAvatar));
