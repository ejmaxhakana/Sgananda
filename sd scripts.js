let slideIndex = 0; 
let slideTimer;


showSlides(); 
 
function showSlides() { 
    const slides = document.getElementsByClassName("products"); 
    const dots = document.getElementsByClassName("dot");
    for (let i = 0; i < slides.length; i++) { 
        slides[i].style.display = "none"; // Hide all slides 
    } 
    
    slideIndex++; 
    if (slideIndex > slides.length) { slideIndex = 1; } // Loop back to the first slide
    
    for (let i = 0; i < dots.length; i++){
        dots[i].className = dots[i].className.replace("active", "")
    }
    slides[slideIndex - 1].style.display = "flex"; // Show the current slide 
    dots[slideIndex - 1].className += "active";

    slideTimer = setTimeout(showSlides, 3000); // Change slide every 3 seconds 
} 

function plusSlides(n) {

    clearTimeout(slideTimer);
    slideIndex += n - 1;
    showSlides();
}

function currentSlide(n) {
    clearTimeout(slideTimer);
    slideIndex = n - 1;
    showSlides();
}





   
                    

        
                    