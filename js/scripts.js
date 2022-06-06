// close search bar
window.onload = function (ev){
  var close = document.querySelector('.close');

  close.onclick = function (ev1) {
    this.parentElement.style.opacity = '0';
  }
}

// open search bar
const search = document.getElementsByClassName("searchicon");
var show = document.getElementsByClassName("headersearch");
search[0].addEventListener('click', function(){
  show[0].style.opacity = "1";
})

