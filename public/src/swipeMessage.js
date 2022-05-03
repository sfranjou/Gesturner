


// target.addEventListener('load', () => target.style.opacity = '0');
// If you want to remove it from the page after the fadeout
// target.addEventListener('transitionend', () => target.remove());

// import { text } from "express";

export function postMessage(message)
{
    let alert = document.createElement('div');
    alert.className = "alert alert-primary"; // bootstrap styling
    alert.style = "transition: opacity 0.5s";
    alert.textContent = message;

    // alert.addEventListener('click', () => alert.style.opacity = '0'); //start fasding out after being loaded
    alert.addEventListener('click', () => alert.remove()); //start fasding out after being loaded
    alert.addEventListener('transitionend', () => { alert.remove(); console.log("removed") });



    const holder = document.getElementById('messageHolder');
    holder.appendChild(alert);
    // alert.style.opacity = '0'
    setTimeout(() => { alert.style.opacity = 0 }, 500)

}

export function updateDistorsionTextStatus(gesture)
{
    const distText = document.getElementById('distorsion-text');
    const cleanText = document.getElementById('clean-text');
    let textOn = (gesture === "swipeLeft") ? distText : cleanText;
    let textOff = (gesture === "swipeLeft") ? cleanText : distText;

    textOn.className = "h3 font-weight-bold text-success";
    // textOn.style = "green";
    textOff.className = "h3 font-weight-normal text-secondary"
    // textOff.style = "black"
}