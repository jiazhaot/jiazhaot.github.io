// search function 
// it does not work.
var els = document.querySelectorAll( '.headerright a' );
var searchForm = document.querySelector( '.headersearch' );
els.forEach( function( el ) {
  el.onclick = function() {
    if ( el.classList.contains( 'searchicon' ) ) {
      searchForm.children[0].focus(); 
      if ( searchForm.style.opacity == 0 ) { 
        searchForm.style.opacity = 1;
      } else {
        searchForm.style.opacity = 0;
      }    
    } 
   }
})


