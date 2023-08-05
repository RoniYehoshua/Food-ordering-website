/// <reference path="Restaurants.js" />
/// <reference path="dishes.js" />

var preferredRest;
var users;
var currentUser;
var commentArray;
$(document).ready(function(){
    LoadLS();
    $(document).on("click", ".heart", UpdateFav);
    setDetailsNav();

    switch ($("body").attr("id")) {
        case 'homeBody':
            homeInit(); 
            getLocation();
            $("input:reset").on("click",resetPickedTypes);
            break; 
        case 'registration':
            regestrationInit();
            break; 
        case 'fevoriteRestBody':
            printPreferred();
            $(document).on("click",".heart",removeFromFav);
            break;
        case 'shoppingBody':
            shoppingInit();
            printItemCheckout();
            $(".order-table i").click(removeFromCheckout);
            $(".pay-btn").click(submitOrder);

            break;
        case 'menuBody':
            menuInit();
            break;
        default:
            break;
    }
}

)
function LoadLS(){
    if (localStorage.cgroup54 !=undefined) {
        AllData = JSON.parse(localStorage.cgroup54);
        if (AllData.lastUserIndex!=null) {
            currentUser=AllData.users[AllData.lastUserIndex];
            preferredRest=currentUser.faivoritRests;
        } else {
            currentUser={};
            preferredRest=[];
        }
       
    }
    else{
        AllData={
            users:[],
            lastUserIndex:0,
            commentArray:[]
        }
        currentUser={};
        preferredRest=[];
    }
    users=AllData.users;
    commentArray=AllData.commentArray;

}
function UpdateLS(){
    currentUser.faivoritRests=preferredRest;
    users[AllData.lastUserIndex]=currentUser;
    AllData.users=users;
    AllData.commentArray=commentArray;
    localStorage.setItem("cgroup54",JSON.stringify(AllData));
}

function homeInit() {//בטעינת הדף
    FindResTypes();//ממצא את כל סוגי המסעדות
    initRange();//אתחל את הטווח
    FilterResturants();//הפעל סינון על המסעדות
    document.getElementById("resetButton").addEventListener("click",initRange)
    loadMoreButton.addEventListener("click", () => {//אתחל את כפתתור טען עוד
        addCards(currentPage + 1);
    });
};

var ResType = [];
var types
var filteredlist=[]; 

function FindResTypes() { //פונקציה שמביאה את כל סוגי המסעדות ומדפיסה אותם לאיזור הסינון
    for (x in Restaurants) { //run on all resturants
        let res = Restaurants[x];
        types = res["Cuisines"].split(", ");//array of all the restaurant types
        for (var i = 0; i < types.length; i++) {
            if (!ResType.includes(types[i])) {//if it is not exists insert
                ResType.push(types[i]);
            }
        }
    }
    for (var i = 0; i < 14; i++) {//מכניס את 10 הסוגים הראשונים לתפריט
        
        document.getElementById("foodtype").innerHTML += ` <input  type="button" class="tp" onclick="addActiveClass(this)" value="${ResType[i]}" />`;
    }
    for (var j = 0; j < ResType.length; j++) {//מכנסי את שאר הסוגים למודל
        document.getElementById("showAll").innerHTML+= ` <input  type="button" class="tp" onclick="addActiveClass(this)" value="${ResType[j]}" />`;     
    }
}

//----------------------------------------fillter resturants----------------------------------------

var activeTypes=[]; //משתנה שיתפוס את כל המסעדות שנבחרו
var minPrice=0;
var maxPrice=0;

function FilterResturants()
{
    $(".special-grid").hide();
    filteredlist=[];
    activeTypes=document.getElementsByClassName("tp active"); //מערך סוגי המסעדות שנבחרו
    for (let i = 0; i < Restaurants.length; i++) {
        if (deliverySort(Restaurants[i])&&restaurantType(Restaurants[i])&&restaurantPrice(Restaurants[i])) {
            filteredlist.push({rest: Restaurants[i],id: i});
        } 
      
    };

    document.getElementById("createRest").innerHTML="";

    //אתחול מחדש של כפתור טען עוד
    currentPage=1;
    cardLimit=filteredlist.length;
    cardTotalElem.innerHTML =cardLimit;
    pageCount = Math.max(Math.ceil(cardLimit / cardIncrease),1);;
    addCards(currentPage);

}
   
//מסעדות בעלות משלוח
function deliverySort(temp){
    let choice = document.getElementById("color_mode"); //לשבת זה true
    if (choice.checked) {
        return (temp["Has Table booking"]=="Yes")
    }
    return (temp["Has Online delivery"]=="Yes") //בהכרח מסומן לקחת
}

//סינון סוג מסעדה
function restaurantType(temp){
    let types = temp["Cuisines"].split(", ");
    if (activeTypes.length==0) {
        return true;
    }
    for (let i = 0; i < activeTypes.length; i++) {
        if (types.includes(activeTypes[i].value)) {
            return true;
        }     
    }
    return false   
}

//סינון טווח מחירים
function restaurantPrice(temp){
    let minAmount = document.getElementById("minAmount").value;
    let maxAmount = document.getElementById("maxAmount").value;

    return (temp["Average Cost for two"]>=minAmount && temp["Average Cost for two"]<=maxAmount)
}


$(document).on(`click`,".tp",function(){//מורידה ומוסיפה את סוגי המסעדות שנבחרו על ידי המשתמש
    $(this).toggleClass("active");
    FilterResturants();
  });

//הורדה של כל סוגי המסעדות הפעילות
     
function resetPickedTypes()  {
    this.form.reset();
    initRange();      
    let buttonsRest=document.getElementsByClassName("tp"); //מערך סוגי המסעדות שנבחרו
    for (const element of buttonsRest) {
        if (element.classList.contains('active')) {
        element.classList.remove('active');
        }
    }
    FilterResturants();  
    return false;  
}
//----------------------------------------end fillter resturants----------------------------------------

//----------------------------------------load more----------------------------------------

const cardContainer = document.getElementById("createRest");
const loadMoreButton = document.getElementById("load-more");
const cardCountElem = document.getElementById("card-count");
const cardTotalElem = document.getElementById("card-total");
const cardIncrease = 9;
var cardLimit,pageCount,currentPage ;


function createCard(temp, index) {//תבנית כרטיס מסעדה

    if (temp!=undefined) {
        let x = (temp["Has Table booking"]=="Yes" ? "√" : "X");
        let y = (temp["Has Online delivery"]=="Yes" ? "√" : "X");
        let showImg = Math.ceil(Math.random()*12);
        // preferredRest=JSON.parse(localStorage.preferredRest);
        let heartClass = (preferredRest.includes(index.toString()) ? "fas fa-heart" : "far fa-heart")

        let str =  `
        <div class="col-lg-4 col-md-6 special-grid" id="${index}" >
            <div class="gallery-single fix position-relative">

                <img src="myImages/${showImg}.jpg" class="img-fluid" alt="Image"/>
                <i class="${(checkCurrentUser()?"d-none":heartClass)} heart position-absolute"></i>
                <div class="why-text title-why">
                <h4 >${temp["Restaurant Name"]}</h4>
                </div>
                 <div class="why-text" onclick=" sendRestToMenu(this) ">
                     <h4>${temp["Restaurant Name"]}</h4>
                     <p>${temp["Address"]}</p>
                     <p>${temp["Cuisines"]}</p>
                     <p>Table booking ${x} | Online delivery ${y}</p>
                     <p>Rate: ${temp["Aggregate rating"]} | ${temp["Rating text"]}  | Average Cost for two - ${temp["Average Cost for two"]}</p>
                </div>
            </div>
         </div>
        `;
        return str;
    }
};

function sendRestToMenu(obj){
    let child = obj.children;
    let parentChild=obj.parentElement.parentElement;
    location.href=`menu.html?Rname=${child[0].innerHTML}&Rid=${parentChild.id}`;
    // document.getElementById("#restM").innerHTML=child[0].innerHTML;
    // $(document).ready($("#restM").html(child[0].innerHTML));
}

function addCards(pageIndex) {//יוצר כרטיסי מסעדות נוספים
    currentPage = pageIndex;

    handleButtonStatus();

    const startRange = (pageIndex - 1) * cardIncrease;
    const endRange = currentPage == pageCount ? cardLimit : pageIndex * cardIncrease; //מספר המסעדות המוצגות

    for (let i = startRange; i <= endRange-1; i++) {
        setTimeout(function(){
            $("#createRest").append(createCard(filteredlist[i].rest,filteredlist[i].id))
        },(i-startRange)*200);
    }

    cardCountElem.innerHTML = endRange;
}

function handleButtonStatus() {//cancel the "load more" button when end
    if (pageCount === currentPage) {
        loadMoreButton.disabled=true;
    }
    else{
        loadMoreButton.disabled=false;
    }
};

//----------------------------------------end load more----------------------------------------


//----------------------------------------double range----------------------------------------

var sliderOne = document.getElementById("slider-1");
var sliderTwo = document.getElementById("slider-2");
var displayValOne = document.getElementById("minAmount");
var displayValTwo = document.getElementById("maxAmount");
var minGap = 1;
var sliderTrack = document.querySelector(".slider-track");
var sliderMaxValue ;

function initRange(){// מאתחל את האיברים של טווחי המחירים
    getMaxPrice();
    sliderOne.setAttribute("min",minPrice);
    sliderOne.setAttribute("max",maxPrice);

    sliderTwo.setAttribute("min",minPrice);
    sliderTwo.setAttribute("max",maxPrice);

    sliderOne.value=minPrice;
    displayValOne.value = sliderOne.value;

    sliderTwo.value=maxPrice;
    displayValTwo.value = sliderTwo.value;

    sliderMaxValue=maxPrice;

    slideOne('range');
    slideTwo('range');

}

//הפונקציות שומרות על חוקיות הטווח והתאים של המחרים
function slideOne(obj){
    if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderOne.value = parseInt(sliderTwo.value) - minGap;
    }
    connectValues(obj);
    fillColor();
}
function slideTwo(obj){
    if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderTwo.value = parseInt(sliderOne.value) + minGap;
    }
    connectValues(obj);

    fillColor();
}
function fillColor(){//
    percent1 = (sliderOne.value / sliderMaxValue) * 100;
    percent2 = (sliderTwo.value / sliderMaxValue) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , var(--brown) ${percent1}% , var(--brown) ${percent2}%, #dadae5 ${percent2}%)`;
}
function connectValues(x){
   if (x=='range') {
    displayValOne.value=sliderOne.value;
    displayValTwo.value=sliderTwo.value;

   }
   else{
    sliderOne.value=displayValOne.value;
    sliderTwo.value=displayValTwo.value;
   }
}
//משיג את המחיר המקסימאלי
function getMaxPrice(){
    maxPrice=0;
    Restaurants.forEach(x => {
        if (x["Has Online delivery"]=="Yes"||x["Has Table booking"]=="Yes") {
            maxPrice= maxPrice > x["Average Cost for two"] ? maxPrice : x["Average Cost for two"];
        }
    });
}

//----------------------------------------end double range----------------------------------------



//----------------------------------------regestration----------------------------------------

    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector("#reg-container");

  function regestrationInit() {
    sign_up_btn.addEventListener("click", () => {
        container.classList.remove("sign-up-mode");
      });
      
      sign_in_btn.addEventListener("click", () => {
        container.classList.add("sign-up-mode");
      });
  
      $(document).on('submit',`form`, (event) => {
          event.preventDefault();
        });
  }
   function checkCurrentUser(){
    return Object.keys(currentUser).length === 0;
   }

    function searchUser(){
        let loginUser=$(`#sign-email`);
        let loginPass=$(`#sign-password`);
        for (let i = 0; i < users.length; i++) {
            if (users[i].Email==loginUser.val()) {
                if (users[i].password==loginPass.val()) {
                    currentUser=users[i];
                    AllData.lastUserIndex=i;
                    preferredRest=currentUser.faivoritRests;
                    UpdateLS();
                     setDetailsNav();   
                     location.href='index.html';
                     return;
                }
                else{
                    alert(`Incorect Password, try again!`);
                    loginPass.val()="";
                    return;
                }
            }
        }
        alert(`User does not exsist`);
        $(`#sign-in`).trigger("reset");

    }

    function creatUser(){
        for (let i = 0; i < users.length; i++){
            if (users[i].Email==$(`#newUserEmail`).val()){
                alert("User allready exists");
               $(`#sign-up`).trigger("reset");

                return;
            }
        }
        let newUser={
            fname:$(`#FullName`).val(),
            DateOfBirthe:$(`#dateOfBirth`).val(),
            Email:$(`#newUserEmail`).val(),
            password:$(`#NewPassword`).val(),
            phone:$(`#phoneNum`).val(),
            gender:$(`input[name="gender"]:checked`).val(),
            faivoritRests:[],
            lastOrders:[],
            activeOrder:{}
            
        }
        users.push(newUser);
        AllData.lastUserIndex=users.length-1;
        currentUser=newUser;
        UpdateLS();
        setDetailsNav();
        $(`#sign-up`).trigger("reset");
        location.href='index.html';


    }
    
    function logOut(){
        currentUser={};
        preferredRest=[];
        AllData.lastUserIndex=null;
        $("#user-pop").hide();
        setDetailsNav();
        UpdateLS();
        location.href='index.html';
    }
    function setDetailsNav(){// שם את פרטי המשתמש בתפריט למעלה
        let regLog =$(`a.connected`);
        let connectedUser =$(`#gread-user`);
        let userPop =$("#user-pop");
        let userMail =$("#user-mail");
        let userName =$("#user-name");
        if (checkCurrentUser()) {
            if(regLog.css("display")=="none"){
                regLog.removeClass("d-none");
                connectedUser.addClass("d-none");
            }
        }
        else{
            if(regLog.css("display")=="none"){
                regLog.addClass("d-none");
                connectedUser.removeClass("d-none");
            }

            connectedUser.click(function() {
                userPop.toggle(500);
            });
           

            connectedUser.find("p").html(`שלום ${currentUser.fname}`);

            userName.html(`${currentUser.fname}`);
            userMail.html(`${currentUser.Email}`);
            
            if (currentUser.gender=="נקבה") {
                $("#gread-user img").attr("src","myImages/woman.png");
                $("#user-pop div img").attr("src","myImages/woman.png");
            }
            else{
                $("#gread-user img").attr("src","myImages/man.png");
                $("#user-pop div img").attr("src","myImages/man.png");
            }
        }
        $("#log-out-user p").click(logOut);

    }

    function formValid(){
        let fname=$(`#FullName`).val();
        let DateOfBirthe=$(`#dateOfBirth`).val();
        let Email=$(`#newUserEmail`).val();
        let  password=$(`#NewPassword`).val();
        let phone=$(`#phoneNum`).val();
        let gender=$(`input[name="gender"]:checked`).val();
        if(fname==""||DateOfBirthe==""||Email==""||password==undefined||phone==""||gender==undefined){
            alert("please fill all fileds");
            return false;
        }
        else{
            return true;
        }
    }

//----------------------------------------end regestration----------------------------------------

//----------------------------------------favorites----------------------------------------
function removeFromFav()
{
    $(this).parent().parent().hide("slow");
}


function UpdateFav(){
        let x = $(this);
        let y = x.parent().parent().attr("id");
           if (x.hasClass("far fa-heart")) {
            x.removeClass("far fa-heart") ;
            x.addClass("fas fa-heart");
            preferredRest.push(y);
           }
           else{
            x.removeClass("fas fa-heart") ;
            x.addClass("far fa-heart");
            preferredRest.splice(preferredRest.indexOf(y), 1);
           }
           UpdateLS();
}



function printPreferred(){

    let preferedCont=$("#preferredRest");
    preferedCont.html(``);
    if(!checkCurrentUser()&&currentUser.faivoritRests.length!=0){
    for (let i = 0; i < preferredRest.length; i++) {
        setTimeout(function(){
            preferedCont.append(createCard(Restaurants[preferredRest[i]],preferredRest[i]))
        },i*100);
    }
}
else {
    $(`.heading-title`).html(`<h2> אין מסעדות מועדפות &#128533</h2>`)
} 
}

//----------------------------------------end favorites----------------------------------------

//----------------------------------------checkout----------------------------------------

function shoppingInit(){
    creditCardsInit();
        if (checkCurrentUser()||typeof currentUser.activeOrder.orderDishes==='undefined'||currentUser.activeOrder.orderDishes.length==0) {
            // $(`.window`).html('<h2>אין הזמנה פעילה &#128533</h2>')
            $(`.checkout-container`).addClass(`menu-box`);
            $(`.checkout-container`).html(`<div class="container" >
            <div class="row">
                <div class="col-lg-12">
                    <div class="heading-title text-center calibri">
                        <h2 >אין הזמנה פעילה &#128533</h2>
                    </div>
                </div>
            </div>`);
    }

}
function creditCardsInit(){
    var cardDrop = document.getElementById('card-dropdown');
var activeDropdown;
cardDrop.addEventListener('click',function(){
  var node;
  for (var i = 0; i < this.childNodes.length-1; i++)
    node = this.childNodes[i];
    if (node.className === 'dropdown-select') {
      node.classList.add('visible');
       activeDropdown = node; 
    };
})

window.onclick = function(e) {
  console.log(e.target.tagName)
  console.log('dropdown');
  console.log(activeDropdown)
  let imageCard= $("#credit-card-image");
  if (e.target.tagName === 'LI' && activeDropdown){
    if (e.target.innerHTML === 'Master Card') {
        imageCard.hide(1000);
        imageCard.show(1000);
        imageCard.attr("src",'https://dl.dropboxusercontent.com/s/2vbqk5lcpi7hjoc/MasterCard_Logo.svg.png');
        activeDropdown.classList.remove('visible');
      activeDropdown = null;
      e.target.innerHTML = document.getElementById('current-card').innerHTML;
      document.getElementById('current-card').innerHTML = 'Master Card';
    }
    else if (e.target.innerHTML === 'American Express') {
        imageCard.hide(1000);
        imageCard.show(1000);
        imageCard.attr("src",'https://dl.dropboxusercontent.com/s/f5hyn6u05ktql8d/amex-icon-6902.png');
        activeDropdown.classList.remove('visible');
      activeDropdown = null;
      e.target.innerHTML = document.getElementById('current-card').innerHTML;
      document.getElementById('current-card').innerHTML = 'American Express';      
    }
    else if (e.target.innerHTML === 'Visa') {
        imageCard.hide(1000);
        imageCard.show(1000);
        imageCard.attr("src",'https://dl.dropboxusercontent.com/s/ubamyu6mzov5c80/visa_logo%20%281%29.png');
          activeDropdown.classList.remove('visible');
      activeDropdown = null;
      e.target.innerHTML = document.getElementById('current-card').innerHTML;
      document.getElementById('current-card').innerHTML = 'Visa';
    }
  }
  else if (e.target.className !== 'dropdown-btn' && activeDropdown) {
    activeDropdown.classList.remove('visible');
    activeDropdown = null;
  }
}
}

function removeFromCheckout(){
    let tempMealsArr =currentUser.activeOrder.orderDishes;
    $(this).parent().hide(1000);
    $(this).parent().next().hide(1000);
    let dishId=$(this).siblings(":last").html();
    tempMealsArr.splice(tempMealsArr.indexOf(dishId),1);
    if (tempMealsArr.length==0) {
        currentUser.activeOrder.restId=undefined;
    }
    currentUser.activeOrder.orderDishes=tempMealsArr;
    updateTotalCost();
    UpdateLS();
}

function printItemCheckout(){
    let tempMealsArr =currentUser.activeOrder.orderDishes;
    let str="";
    
    for (let i = 0; i < tempMealsArr.length; i++) {
        str+=`
        <div class="order-table justify-content-between">
                        <i class="material-icons">&#xe92b;</i>
						<div>
							<img class="img-thumbnail" src='${dishes[tempMealsArr[i]].imgPath}'></img>
						</div>	
						<div class="item-details">
							<p class="thin">${dishes[tempMealsArr[i]].dname}</p>
							<p class="small">${dishes[tempMealsArr[i]].description}</p>
                        <br>
						</div>
						<div class='price'>₪ ${dishes[tempMealsArr[i]].price}</div>
                        <span class="d-none">${tempMealsArr[i]}</span>
					</div>
		<div class='line'></div>
        `   
    }
    $("#summaryOrder").html(str);

    updateTotalCost();
}

function updateTotalCost(){
    let tempMealsArr =currentUser.activeOrder.orderDishes;
    let totalCost=0;

    for (let i = 0; i < tempMealsArr.length; i++){
        totalCost+=dishes[tempMealsArr[i]].price;   
    }
    $("#middel-cost").html(`${totalCost}₪`);
    let delivery=(totalCost>300?0:30);
    
    totalCost+=delivery;
    $("#delivery-cost").html(`${(delivery==0?"!איזה כיף המשלוח עלינו":delivery+"₪")}`);
    $("#totalCost").html(`${totalCost}₪`);
}

function submitOrder(){
    currentUser.lastOrders.push(currentUser.activeOrder);
    currentUser.activeOrder={};
    UpdateLS();
    location.href='index.html';
    alert('תודה שקנית ב - YAMIFOOD');

}

//----------------------------------------end checkout----------------------------------------

//----------------------------------------menu----------------------------------------
var openDish;
var openRest;
function menuInit(){
    
    createDishes();

    $(".meal").click(createModal);

    let url = new URLSearchParams(location.search.substring(1));
    $("#restM").html(url.get("Rname"));
    openRest=url.get("Rid");

    $("#modalButton").click(updateOrder)

    $(`.h1-menu`).click(openSmallMenu);
    if (checkCurrentUser()) {
        $(".comment-respond-box").find('h3').html('הירשם על מנת להגיב').next().remove();
    }
    loadComments();
    $(`#commentrespondform .btn`).click(submitComment);

    $(document).on('submit',`form`, (event) => {
        event.preventDefault();
      });
}

function createDishes(){
    let str="";
    for (let i = 0; i < 5; i++) {
         str += `<div class="meal" id="${i}" data-toggle="modal" data-target="#myModal">
                     <img src="${dishes[i].imgPath}" alt="">
                     <p>${dishes[i].price} | ${dishes[i].dname}</p>
                    </div>`;
    }
    $("#starts").html(str);

    str="";
    for (let i = 5; i < 10; i++) {
         str += `<div class="meal" id="${i}" data-toggle="modal" data-target="#myModal">
                     <img src="${dishes[i].imgPath}" alt="">
                     <p>${dishes[i].price} | ${dishes[i].dname}</p>
                    </div>`;
    }
    $("#mainDishes").html(str); 

    str="";
   for (let i = 10; i < 15; i++) {
         str += `<div class="meal" id="${i}" data-toggle="modal" data-target="#myModal">
                     <img src="${dishes[i].imgPath}" alt="">
                     <p>${dishes[i].price} | ${dishes[i].dname}</p>
                    </div>`;
    }
    $("#deserts").html(str);
    
    str="";
    for (let i = 15; i < 20; i++) {
         str += `<div class="meal" id="${i}" data-toggle="modal" data-target="#myModal">
                     <img src="${dishes[i].imgPath}" alt="">
                     <p>${dishes[i].price} | ${dishes[i].dname}</p>
                    </div>`;
    }
    $("#drinks").html(str);
}

function createModal(){
        $("#modalImg").html(`<img src='${dishes[this.id].imgPath}' style="width:100%"> <p>${dishes[this.id].dname}</p> <p>${dishes[this.id].description}</p>`)
        if(checkCurrentUser()){
            $("#modalButton").html("אין משמש מחובר, לא ניתן להוסיף מנה").prop('disabled', true);
        }else{
            $("#modalButton").html(`להוספה להזמנה ${dishes[this.id].price} ש''ח`)
            openDish=this.id;
        }
        
}

function updateOrder(){
    if (currentUser.activeOrder.restId==openRest) {
        currentUser.activeOrder.orderDishes.push(openDish);
        currentUser.activeOrder.totalPrice+= dishes[openDish].price;
        currentUser.activeOrder.date=new Date();
    }
    else{
        if (currentUser.activeOrder.restId!==undefined) {
        alert("ההזמנה האחרונה נמחקה.");
        }
        currentUser.activeOrder.orderDishes=[];
        currentUser.activeOrder.totalPrice=0;
        currentUser.activeOrder.restId=openRest;
        currentUser.activeOrder.orderDishes.push(openDish);
        currentUser.activeOrder.totalPrice+= dishes[openDish].price;
        currentUser.activeOrder.date=new Date();
    }
    UpdateLS();
}

function loadComments() {
    $(`.blog-comment-box`).html("");
    if (typeof commentArray[openRest]!=='undefined') {
        commentArray[openRest].forEach(comm => {
            str=`		<div class="comment-item">
            <div class="comment-item-left">
                <img src="${comm.userPic}" alt="">
            </div>
            <div class="comment-item-right">
                <div class="pull-left">
                    <span>${comm.userName}<span>
                </div>
                <div class="pull-right">
                    <i class="fa fa-clock-o" aria-hidden="true"></i>Time : <span>${comm.datetime}</span>
                </div>
                <div class="des-l">
                    <p>${comm.userComment}</p>
                </div>
            </div>
        </div>`
        $(`.blog-comment-box`).append(str);
        });
    }
   
}
function submitComment(){
    const d = new Date();
    let newComm={
        userName:currentUser.fname,
        userMail:currentUser.Email,
        userPic:(currentUser.gender=='זכר'?`myImages/man.png`:`myImages/woman.png`),
        datetime: d.toLocaleString(),
        userComment:$("#textarea_com").val()
    }
    if(commentArray[openRest]==undefined){
        commentArray[openRest]=[];
    }
    commentArray[openRest].push(newComm);
    loadComments();
    UpdateLS();
    $(`#commentrespondform`).trigger("reset");
}
function openSmallMenu(){

    if(screen.width<=768)
    if($(this).next(`.hideme`).css("height")=="0px"){
        $(this).next(`.hideme`).animate({height:2000});
        $(this).find('i').animate({rotate: "180deg"});
    }
    else{
    $(this).next(`.hideme`).animate({height:0});
    $(this).find('i').animate({rotate: "0deg"});


    }
}
//----------------------------------------end menu----------------------------------------

//----------------------------------------דstart menu----------------------------------------
var uluru;

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition,errorPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {

    uluru = { lat: position.coords.latitude, lng: position.coords.longitude };
    initMap();
}
function errorPosition(error){
    uluru = { lat: 32.34238583804538,lng: 34.909220016502104 };
    initMap();
}
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: uluru,
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map
    });
    var infowindow = new google.maps.InfoWindow();

    var marker, i;
    for (let i = 0; i < filteredlist.length; i++) {
    
        uluru = { lat: filteredlist[i].rest["Latitude"], lng: filteredlist[i].rest["Longitude"] };
        var marker = new google.maps.Marker({
            position: uluru,
            map: map
        });
        // console.log(getDistanceFromLatLonInKm(element["Latitude"], element["Longitude"], latitude, longitude));
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
              infowindow.setContent(filteredlist[i].rest["Restaurant Name"]);
              infowindow.open(map, marker);
            }
          })(marker, i));
    };

}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}
